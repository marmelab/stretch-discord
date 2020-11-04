import Discord from "discord.js";
import stretching from "./stretching.json";
import commands from "./commands/index.js";
import { getStoredChannelsIds } from "./channels/index.js";

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
  const getChannels = async () => {
    const channelsIds = await getStoredChannelsIds();
    return await Promise.all(
      channelsIds.map(async (id) => {
        try {
          return await getChannel(id);
        } catch (e) {
          console.error(e);
        }
      })
    );
  };
  const listen = () => {
    client.on("message", async (message) => {
      if (!message.content.startsWith(prefix) || message.author.bot) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      if (!client.commands.has(command)) return;

      try {
        await client.commands.get(command).execute(message, args);
      } catch (error) {
        console.error(error);
        message.reply("there was an error trying to execute that command!");
      }
    });
  };
  const sendStretchReminder = async () => {
    const channels = await getChannels();
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
      })
    );
  };
  return { getChannel, getChannels, listen, sendStretchReminder };
};
