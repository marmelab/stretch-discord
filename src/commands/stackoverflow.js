import {
    channelSubscribeToTag,
    removeChannel,
} from "../channels/stackoverflow.js";

export const subscribe = {
    name: "stackoverflow_subscribe",
    description: "Subscribe to a stackoverflow tag",
    async execute(message, args) {
        if (!args[0]) {
            message.channel.send("You must provide a stackoverflow tag");
        }
        const channelId = message.channel.id;
        try {
            channelSubscribeToTag(args[0], channelId);
            message.channel.send(
                `You are now subscribed to topics containg tag ${args[0]}`,
            );
        } catch (e) {
            message.channel.send(e.message);
        }
    },
};

export const unsubscribe = {
    name: "stackoverflow_unsubscribe",
    description: "Unsubscribe to stackoverflow notifications",
    async execute(message) {
        const channelId = message.channel.id;
        try {
            removeChannel(channelId);
            message.channel.send(
                `You are now unsubscribed from stackoverflow notifications`,
            );
        } catch (e) {
            message.channel.send(e.message);
        }
    },
};
