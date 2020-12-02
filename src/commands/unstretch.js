import { removeChannel } from "../channels/index.js";

export default {
  name: "unstretch",
  description: "stretch unsubscribe",
  async execute(message) {
    const channelId = message.channel.id;
    await removeChannel(channelId);
    message.channel.send("Je vous laisse tranquille :ok_hand:");
  },
};
