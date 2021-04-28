import { addChannel } from "../channels/index.js";

export default {
    name: "stretch",
    description: "stretch subscribe",
    async execute(message) {
        const channelId = message.channel.id;
        await addChannel(channelId);
        message.channel.send("Je vous rappelerai de vous étirer ici :ok_hand:");
    },
};
