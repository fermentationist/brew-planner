import Models from "../models/Models.js";
import localCache from "./localCache/index.js";

export const getBrewhouses = async breweryUuid => {
  let brewhouses = [];
  if (breweryUuid === void 0) {
    brewhouses = await Models.brewhouse.select();
  } else {
    brewhouses = await Models.brewhouse.select({breweryUuid});
  }
  return brewhouses;
}

export const createBrewhouse = async (breweryUuid, brewhouseData) => {
  const {brewhouseUuid} = brewhouseData;
  const brewhouseRow = {
    breweryUuid,
    ...brewhouseData
  }
  const {insertId} = await Models.brewhouse.insert([brewhouseRow], false);
  localCache.invalidate("brewhouse");
  if (brewhouseUuid) { // if user passed a UUID for the new brewhouse
    return brewhouseUuid;
  }
  const [newBrewhouse] = await Models.brewhouse.select({brewhouseKey: insertId});
  return newBrewhouse.brewhouseUuid;
}

export const updateBrewhouse = async (breweryUuid, brewhouseUuid, updateData) => {
  const result = await Models.brewhouse.update(updateData, {breweryUuid, brewhouseUuid});
  localCache.invalidate("brewhouse");
  return result;
};

export const deleteBrewhouse = async (breweryUuid, brewhouseUuid) => {
  const result = await Models.brewhouse.delete({breweryUuid, brewhouseUuid});
  if (!result.affectedRows) {
    throw(`The brewery with the breweryUuid ${breweryUuid} has no brewhouse with the brewhouseUuid`, brewhouseUuid);
  }
  localCache.invalidate("brewhouse");
  return result;
};

export const isExistingBrewhouseAttribute = localCache.isExistingTableAttribute("brewhouse", getBrewhouses);