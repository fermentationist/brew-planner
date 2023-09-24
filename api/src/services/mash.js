import Models from "../models/Models.js";
import localCache from "./localCache/index.js";

export const getMashes = (breweryUuid) => {
  return Models.mash.select(breweryUuid && { breweryUuid });
};

export const createMash = async (breweryUuid, mashData) => {
  const { mashUuid } = mashData;
  const mashRow = {
    breweryUuid,
    ...mashData,
  };
  const { insertId } = await Models.mash.insert([mashRow], false);
  if (mashUuid) {
    // if user passed a UUID for the new mash
    return mashUuid;
  }
  const [newMash] = await Models.mash.select({
    mashKey: insertId,
  });
  localCache.invalidate("mash");
  return newMash.mashUuid;
};

export const updateMash = async (breweryUuid, mashUuid, updateData) => {
  const result = await Models.mash.update(updateData, {
    breweryUuid,
    mashUuid,
  });
  localCache.invalidate("mash");
  return result;
};

export const deleteMash = async (breweryUuid, mashUuid) => {
  const result = await Models.mash.delete({
    breweryUuid,
    mashUuid,
  });
  if (!result.affectedRows) {
    throw `The brewery with the breweryUuid ${breweryUuid} has no mash with the mashUuid ${mashUuid}`;
  }
  localCache.invalidate("mash");
  return result;
};

export const isExistingMashAttribute = localCache.isExistingTableAttribute(
  "mash",
  getMashes
);
