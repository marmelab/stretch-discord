import path from "path";
import fs from "fs";

const DEFAULT_FILENAME = `${path.resolve()}/data/channels_ids`;
const DEFAULT_SUDOKU_FILENAME = `${path.resolve()}/data/sudoku_data`;

export const getStoredChannelsIds = async (filename = DEFAULT_FILENAME) => {
    const channelsRaw = fs.readFileSync(filename, {
        encoding: "utf8",
    });
    const channelsIds = channelsRaw
        .split(",")
        .filter((chanId) => chanId.length > 0);
    return channelsIds;
};

const writeChannelsIds = (channelsIds, filename = DEFAULT_FILENAME) =>
    fs.writeFileSync(filename, channelsIds.join(","));

export const addChannel = async (channelId, filename = DEFAULT_FILENAME) => {
    const channelsIds = await getStoredChannelsIds(filename);
    if (channelsIds.includes(channelId)) {
        return Promise.resolve();
    }
    const newChannelsIds = [...channelsIds, channelId].filter(
        (chanId) => chanId.length > 0,
    );
    return writeChannelsIds(newChannelsIds, filename);
};

export const removeChannel = async (channelId, filename = DEFAULT_FILENAME) => {
    const channelsIds = await getStoredChannelsIds(filename);
    const newChannelsIds = channelsIds.filter((chanId) => chanId !== channelId);
    return writeChannelsIds(newChannelsIds, filename);
};

export const addSudokuToChannel = async (
    channelId,
    sudoku,
    filename = DEFAULT_SUDOKU_FILENAME,
) => {
    let data = "";
    try {
        data = fs.readFileSync(filename, { encoding: "utf-8" });
    } catch (e) {
        if (e.code) {
            fs.writeFileSync(filename, data, { flag: "wx" });
        }
    }
    const sanitizedData = data
        .split(";")
        .filter((dataChannel) => {
            const [dataChannelId] = dataChannel.split(":");
            return dataChannelId !== channelId;
        })
        .join(";");
    fs.writeFileSync(
        filename,
        `${sanitizedData};${channelId}::${JSON.stringify(sudoku)}`,
    );
};

export const getChannelSudoku = async (
    targetChannelId,
    filename = DEFAULT_SUDOKU_FILENAME,
) => {
    const data = fs.readFileSync(filename, { encoding: "utf-8" });
    const channelData = data.split(";").find((channelData) => {
        const [channelId] = channelData.split(":");
        return channelId === targetChannelId;
    });
    return channelData ? JSON.parse(channelData.split("::")[1]) : null;
};
