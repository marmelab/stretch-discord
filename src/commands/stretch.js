import fs from "fs";

export default {
  name: "stretch",
  description: "stretch subscribe",
  async execute(message, args, onSubscribe) {
    const newChannelId = message.channel.id;
    const channelsRaw = await fs.readFileSync("./channels_ids", {
      encoding: "utf8",
    });
    const channelsIds = channelsRaw.split(",");

    if (channelsIds.includes(newChannelId)) {
      message.channel.send("Je suis déjà là :wink:");
    } else {
      const newChannelsIds = [...channelsIds, newChannelId].filter(
        (chanId) => chanId.length > 0
      );
      fs.writeFileSync("./channels_ids", newChannelsIds.join(","));
      message.channel.send("Je vous rappelerai de vous étirer ici :ok_hand:");
      onSubscribe(newChannelId);
    }
  },
};
