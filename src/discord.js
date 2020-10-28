import Discord from "discord.js";
import fs from "fs";

const discordClient = new Discord.Client();

const onReady = () =>
  new Promise((resolve) => {
    discordClient.on("ready", (res) => resolve(res));
  });

const actionsFactory = (client) => ({
  getChannel: (channelId) => client.channels.fetch(channelId),
  subscribeListener: (onSubscribe) => {
    client.on("message", async (message) => {
      if (message.content === "!stretch") {
        const newChannelId = message.channel.id;

        const channelsRaw = await fs.readFileSync("./channels_ids", {
          encoding: "utf8",
        });
        const channelsIds = channelsRaw.split(",");
        if (channelsIds.includes(newChannelId)) {
          console.log("Already Stretching !");
        } else {
          const newChannelsIds = [...channelsIds, newChannelId].filter(
            (chanId) => chanId.length > 0
          );
          fs.writeFileSync("./channels_ids", newChannelsIds.join(","));
          onSubscribe(newChannelId);
        }
      }
    });
  },
});

export default {
  init: (token) => {
    discordClient.login(token);
    return { client: discordClient, onReady };
  },
  actionsFactory,
};
