import Tables from "../models/Tables.js";
import localCache from "./localCache/index.js";

export const getBrewhouses = async breweryUuid => {
  let brewhouses = [];
  if (breweryUuid === void 0) {
    brewhouses = await Tables.brewhouse.select();
  } else {
    brewhouses = await Tables.brewhouse.select({breweryUuid});
  }
  return brewhouses;
}

export const createBrewhouse = async (breweryUuid, brewhouseData) => {
  const {brewhouseUuid} = brewhouseData;
  const brewhouseRow = {
    breweryUuid,
    ...brewhouseData
  }
  const {insertId} = await Tables.brewhouse.insert([brewhouseRow], false);
  if (brewhouseUuid) { // if user passed a UUID for the new brewhouse
    return brewhouseUuid;
  }
  const [newBrewhouse] = await Tables.brewhouse.select({brewhouseKey: insertId});
  localCache.invalidate("brewhouse");
  return newBrewhouse.brewhouseUuid;
}

export const updateBrewhouse = (breweryUuid, brewhouseUuid, updateData) => Tables.brewhouse.update(updateData, {breweryUuid, brewhouseUuid});

export const deleteBrewhouse = async (breweryUuid, brewhouseUuid) => {
  const result = await Tables.brewhouse.delete({breweryUuid, brewhouseUuid});
  if (!result.affectedRows) {
    throw(`The brewery with the breweryUuid ${breweryUuid} has no brewhouse with the brewhouseUuid`, brewhouseUuid);
  }
};

export const isExistingBrewhouseAttribute = localCache.isExistingTableAttribute("brewhouse", getBrewhouses);