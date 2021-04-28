import path from "path";
import fs from "fs";
import axios from "axios";

const DEFAULT_STACKOVERFLOW_FILENAME = `${path.resolve()}/data/stackoverflow`;

export const channelSubscribeToTag = (
    tag,
    channelId,
    filename = DEFAULT_STACKOVERFLOW_FILENAME,
) => {
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const data = fs.readFileSync(filename, { encoding: "utf-8" });
    const isAlreadySubscribed = data.split(";").some((channelSubscription) => {
        const [currentChannelId, currentTag] = channelSubscription.split(":");
        return currentChannelId === channelId && currentTag === tag;
    });
    if (isAlreadySubscribed) {
        throw new Error(`You are already subscribed to tag ${tag}`);
    }
    const newData = `${channelId}:${tag}:${timestamp}`;
    fs.writeFileSync(DEFAULT_STACKOVERFLOW_FILENAME, `${data};${newData}`);
};

export const updateTimestamp = (
    { channelId, tag },
    timestamp,
    filename = DEFAULT_STACKOVERFLOW_FILENAME,
) => {
    const data = fs.readFileSync(filename, { encoding: "utf-8" });
    const newData = data
        .split(";")
        .filter((channelData) => {
            const [currentChannelId, currentTag] = channelData.split(":");
            return currentChannelId !== channelId || currentTag !== tag;
        })
        .join(";");
    fs.writeFileSync(filename, `${newData};${channelId}:${tag}:${timestamp}`);
};

export const removeChannel = (
    channelId,
    filename = DEFAULT_STACKOVERFLOW_FILENAME,
) => {
    const data = fs.readFileSync(filename, { encoding: "utf-8" });
    const newData = data
        .split(";")
        .filter((channelData) => {
            const [currentChannelId] = channelData.split(":");
            return currentChannelId !== channelId;
        })
        .join(";");
    fs.writeFileSync(filename, newData);
};

export const getData = (filename = DEFAULT_STACKOVERFLOW_FILENAME) => {
    const data = fs.readFileSync(filename, { encoding: "utf-8" });
    return data.split(";").reduce((accData, currentData) => {
        const [channelId, tag, timestamp] = currentData.split(":");
        if (channelId && tag && timestamp) {
            return [
                ...accData,
                {
                    channelId,
                    tag,
                    timestamp,
                },
            ];
        }
        return accData;
    }, []);
};

export const fetchNewTopics = async (tag, from) => {
    try {
        const response = await axios.get(
            "https://api.stackexchange.com/2.2/questions",
            {
                params: {
                    tagged: tag,
                    site: "stackoverflow",
                    fromdate: from,
                },
            },
        );
        return response.data && response.data.items;
    } catch (e) {
        console.error(`Error during stackoverflow fetch: ${e}`);
        return Promise.resolve();
    }
};
