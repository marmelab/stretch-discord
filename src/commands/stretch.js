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
      console.log("Already Stretching !");
    } else {
      const newChannelsIds = [...channelsIds, newChannelId].filter(
        (chanId) => chanId.length > 0
      );
      fs.writeFileSync("./channels_ids", newChannelsIds.join(","));
      onSubscribe(newChannelId);
    }
  },
};
