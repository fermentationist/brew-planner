import Models from "../models/Models.js";
import localCache from "./localCache/index.js";

export const HOP_FORMS = ["Pellet", "Plug", "Leaf"];

export const getHops = (breweryUuid) => {
  return Models.hop.select(breweryUuid && { breweryUuid });
};

export const createHop = async (breweryUuid, hopData) => {
  const { hopUuid } = hopData;
  const hopRow = {
    breweryUuid,
    ...hopData,
  };
  const { insertId } = await Models.hop.insert([hopRow], false);
  localCache.invalidate("hop");
  if (hopUuid) {
    // if user passed a UUID for the new hop
    return hopUuid;
  }
  const [newHop] = await Models.hop.select({
    hopKey: insertId,
  });
  return newHop.hopUuid;
};

export const updateHop = async (breweryUuid, hopUuid, updateData) => {
  const result = await Models.hop.update(updateData, {
    breweryUuid,
    hopUuid,
  });
  localCache.invalidate("hop");
  return result;
};

export const deleteHop = async (breweryUuid, hopUuid) => {
  const result = await Models.hop.delete({
    breweryUuid,
    hopUuid,
  });
  if (!result.affectedRows) {
    throw (
      (`The brewery with the breweryUuid ${breweryUuid} has no hop with the hopUuid`,
      hopUuid)
    );
  }
  localCache.invalidate("hop");
  return result;
};

export const isExistingHopAttribute = localCache.isExistingTableAttribute(
  "hop",
  getHops
);
