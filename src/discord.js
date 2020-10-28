import Discord from "discord.js";
const client = new Discord.Client();

const on = (action) =>
  new Promise((resolve) => {
    client.on(action, (res) => resolve(res));
  });

const actionsFactory = (client) => ({
  getChannel: (channelId) => client.channels.fetch(channelId),
  waitMessage: async () => {
    const message = await client.on("message");
    console.log(message);
    if (message.content === "ping") {
      message.channel.send("pong");
    }
  },
});

export default {
  init: (token) => {
    client.login(token);
    return { ...client, on };
  },
  actionsFactory,
};
