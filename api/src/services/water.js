import Tables from "../models/Tables.js";
import localCache from "./localCache/index.js";

export const getWaters = (breweryUuid) => {
  return Tables.water.select(breweryUuid && { breweryUuid });
};

export const createWater = async (breweryUuid, waterData) => {
  const { waterUuid } = waterData;
  const waterRow = {
    breweryUuid,
    ...waterData,
  };
  const { insertId } = await Tables.water.insert([waterRow], false);
  if (waterUuid) {
    // if user passed a UUID for the new water
    return waterUuid;
  }
  const [newWater] = await Tables.water.select({
    waterKey: insertId,
  });
  localCache.invalidate("water");
  return newWater.waterUuid;
};

export const updateWater = async (breweryUuid, waterUuid, updateData) => {
  const result = await Tables.water.update(updateData, {
    breweryUuid,
    waterUuid,
  });
  localCache.invalidate("water");
  return result;
};

export const deleteWater = async (breweryUuid, waterUuid) => {
  const result = await Tables.water.delete({
    breweryUuid,
    waterUuid,
  });
  if (!result.affectedRows) {
    throw (
      (`The brewery with the breweryUuid ${breweryUuid} has no water with the waterUuid`,
      waterUuid)
    );
  }
  localCache.invalidate("water");
  return result;
};

export const isExistingWaterAttribute = localCache.isExistingTableAttribute(
  "water",
  getWaters
);
