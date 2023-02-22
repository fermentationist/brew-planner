import Tables from "../models/Tables.js";
import localCache from "./localCache/index.js";

export const YEAST_TYPES = [
  "Ale",
  "Lager",
  "Wheat",
  "Wine",
  "Champagne",
  "Kveik",
];
export const FLOCCULATION_TYPES = ["Low", "Medium", "High", "Very High"];

export const getYeasts = (breweryUuid) => {
  return Tables.yeast.select(breweryUuid && { breweryUuid });
};

export const createYeast = async (breweryUuid, yeastData) => {
  const { yeastUuid } = yeastData;
  const yeastRow = {
    breweryUuid,
    ...yeastData,
  };
  const { insertId } = await Tables.yeast.insert([yeastRow], false);
  if (yeastUuid) {
    // if user passed a UUID for the new yeast
    return yeastUuid;
  }
  const [newYeast] = await Tables.yeast.select({
    yeastKey: insertId,
  });
  localCache.invalidate("yeast");
  return newYeast.yeastUuid;
};

export const updateYeast = async (breweryUuid, yeastUuid, updateData) => {
  const result = await Tables.yeast.update(updateData, {
    breweryUuid,
    yeastUuid,
  });
  localCache.invalidate("yeast");
  return result;
};

export const deleteYeast = async (breweryUuid, yeastUuid) => {
  const result = await Tables.yeast.delete({
    breweryUuid,
    yeastUuid,
  });
  if (!result.affectedRows) {
    throw (
      (`The brewery with the breweryUuid ${breweryUuid} has no yeast with the yeastUuid`,
      yeastUuid)
    );
  }
  localCache.invalidate("yeast");
  return result;
};

export const isExistingYeastAttribute = localCache.isExistingTableAttribute(
  "yeast",
  getYeasts
);
