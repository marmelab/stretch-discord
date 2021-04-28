import Discord from "discord.js";
import stretching from "./stretching.json";
import commands from "./commands/index.js";
import { getStoredChannelsIds } from "./channels/index.js";
import * as stackoverflow from "./channels/stackoverflow.js";

const prefix = "!";
const stretchings = stretching.stretching;

const discordClient = new Discord.Client();
discordClient.commands = new Discord.Collection();

Object.keys(commands).map((key) => {
    discordClient.commands.set(commands[key].name, commands[key]);
});

export const init = (token) => {
    discordClient.login(token);
    return discordClient;
};

export const onReady = () =>
    new Promise((resolve) => {
        discordClient.on("ready", (res) => resolve(res));
    });

const getRandomStretch = () => {
    const index = Math.floor(Math.random() * Math.floor(stretchings.length));
    return stretchings[index];
};

export const actionsFactory = (client) => {
    const getChannel = (channelId) => client.channels.fetch(channelId);
    const getChannels = async (channelsIds) => {
        const channels = await Promise.all(
            channelsIds
                .filter((id) => !!id)
                .map((id) => {
                    try {
                        return getChannel(id);
                    } catch (e) {
                        console.error(e);
                    }
                }),
        );
        return channels.filter((channel) => !!channel);
    };
    const listen = () => {
        client.on("message", async (message) => {
            if (!message.content.startsWith(prefix) || message.author.bot)
                return;

            const args = message.content
                .slice(prefix.length)
                .trim()
                .split(/ +/);
            const command = args.shift().toLowerCase();

            if (!client.commands.has(command)) return;

            try {
                await client.commands.get(command).execute(message, args);
            } catch (error) {
                console.error(error);
                message.reply(
                    "there was an error trying to execute that command!",
                );
            }
        });
    };
    const sendStretchReminder = async () => {
        const channelsIds = await getStoredChannelsIds();
        const channels = await getChannels(channelsIds);
        const { title, image, url, body } = getRandomStretch();
        const formatedBody = body.map((value, index) => ({
            name: `Étape ${index + 1}`,
            value,
        }));
        const message = new Discord.MessageEmbed()
            .setTitle(title)
            .setImage(image)
            .addFields(...formatedBody)
            .setURL(url);

        channels.forEach((channel) =>
            channel.send({
                embed: message,
                content: "C'est l'heure de l'étirement !",
            }),
        );
    };
    const sendStackoverflowNewTopics = async () => {
        const stackoverflowData = stackoverflow.getData();
        stackoverflowData.forEach(async (data) => {
            console.log(data);
            const newTimestamp = Math.floor(new Date().getTime() / 1000);
            const topics = await stackoverflow.fetchNewTopics(
                data.tag,
                data.timestamp,
            );
            if (Array.isArray(topics) && topics.length > 0) {
                const channel = await getChannel(data.channelId);
                topics.forEach(async (topic) => {
                    const message = new Discord.MessageEmbed()
                        .setTitle(topic.title)
                        .setURL(topic.link)
                        .addField("View count", topic.view_count)
                        .addField("Answer count", topic.answer_count);
                    await channel.send({
                        embed: message,
                        content: `New issue about ${data.tag}`,
                    });
                });
            } else {
                console.log(`No results for tag ${data.tag}`);
            }
            stackoverflow.updateTimestamp(data, newTimestamp);
        });
    };
    return {
        getChannel,
        getChannels,
        listen,
        sendStretchReminder,
        sendStackoverflowNewTopics,
    };
};
