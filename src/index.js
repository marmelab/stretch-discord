import discord from "./discord.js";
import dotenv from "dotenv";
import cron from "node-cron";
dotenv.config();

const channelId = "770933237785559074";

const connect = async () => {
  const client = discord.init(process.env.TOKEN);
  await client.on("ready");

  console.log("connected");
  return client;
};

const run = async () => {
  const client = await connect();
  const actions = discord.actionsFactory(client);
  const channel = await actions.getChannel(channelId);
  cron.schedule("*/10 * * * * *", () => channel.send("Étire toi !"));
};

run();
