import cron from "node-cron";
import dotenv from "dotenv";

dotenv.config();

import { init, onReady, actionsFactory } from "./discord.js";

const connect = async () => {
    const client = init(process.env.TOKEN);
    await onReady();

    console.log("connected");
    return client;
};

const run = async () => {
    const client = await connect();
    const actions = actionsFactory(client);
    actions.listen();
    cron.schedule(process.env.CRON_CONFIG, actions.sendStretchReminder);
};

run();
