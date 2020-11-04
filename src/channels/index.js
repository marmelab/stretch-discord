import path from "path";
import fs from "fs";
const DEFAULT_FILENAME = `${path.resolve()}/channels_ids`;

export const getStoredChannelsIds = async (filename = DEFAULT_FILENAME) => {
  const channelsRaw = await fs.readFileSync(filename, {
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

  const newChannelsIds = [...channelsIds, channelId].filter(
    (chanId) => chanId.length > 0
  );
  return writeChannelsIds(newChannelsIds, filename);
};

export const removeChannel = async (channelId, filename = DEFAULT_FILENAME) => {
  const channelsIds = await getStoredChannelsIds(filename);
  const newChannelsIds = channelsIds.filter((chanId) => chanId !== channelId);
  return writeChannelsIds(newChannelsIds, filename);
};
