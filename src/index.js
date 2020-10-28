import discord from "./discord.js";
import Discord from "discord.js";
import stretching from "./stretching.json";
import dotenv from "dotenv";
import cron from "node-cron";
import fs from "fs";

dotenv.config();

const stretchings = stretching.stretching;

const getRandomStretch = () => {
  const index = Math.floor(Math.random() * Math.floor(stretchings.length));
  return stretchings[index];
};

const connect = async () => {
  const { client, onReady } = discord.init(process.env.TOKEN);
  await onReady();

  console.log("connected");
  return client;
};

const sendStretchReminder = (channels) => () => {
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
    channel.send({ embed: message, content: "C'est l'heure de l'étirement !" })
  );
};

const getStoredChannelsIds = async (filename = "./channels_ids") => {
  const channelsRaw = await fs.readFileSync("./channels_ids", {
    encoding: "utf8",
  });
  const channelsIds = channelsRaw
    .split(",")
    .filter((chanId) => chanId.length > 0);
  return channelsIds;
};

const run = async () => {
  const channelsIds = await getStoredChannelsIds();
  const client = await connect();
  const actions = discord.actionsFactory(client);
  const channels = await Promise.all(
    channelsIds.map((id) => actions.getChannel(id))
  );
  actions.subscribeListener(async (channelId) => {
    const newChannel = await actions.getChannel(channelId);
    channels.push(newChannel);
  });
  cron.schedule("*/10 * * * * *", sendStretchReminder(channels));
};

run();
