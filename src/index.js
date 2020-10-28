import discord from "./discord.js";
import dotenv from "dotenv";
import cron from "node-cron";
import fs from "fs";

dotenv.config();

const connect = async () => {
  const { client, onReady } = discord.init(process.env.TOKEN);
  await onReady();

  console.log("connected");
  return client;
};

const sendStretchReminder = (channels) => () => {
  const message = `Étire toi !`;
  channels.forEach((channel) => channel.send(message));
};

const run = async () => {
  const channelsRaw = await fs.readFileSync("./channels_ids", {
    encoding: "utf8",
  });
  const channelsIds = channelsRaw
    .split(",")
    .filter((chanId) => chanId.length > 0);
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
