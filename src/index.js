import fs from "fs";
import cron from "node-cron";
import dotenv from "dotenv";
dotenv.config();

import {
  init,
  onReady,
  sendStretchReminder,
  actionsFactory,
} from "./discord.js";

const connect = async () => {
  const client = init(process.env.TOKEN);
  await onReady();

  console.log("connected");
  return client;
};

const getStoredChannelsIds = async (filename = "./channels_ids") => {
  const channelsRaw = await fs.readFileSync(filename, {
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
  const actions = actionsFactory(client);

  const channels = await Promise.all(
    channelsIds.map((id) => actions.getChannel(id))
  );

  // message listening
  actions.subscribeListener(async (channelId) => {
    const newChannel = await actions.getChannel(channelId);
    channels.push(newChannel);
  });
  cron.schedule(process.env.CRON_CONFIG, sendStretchReminder(channels));
};

run();
