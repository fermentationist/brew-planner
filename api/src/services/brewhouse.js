import Tables from "../models/Tables.js";
import localCache from "./localCache/index.js";

export const getBrewhouses = async breweryUuid => {
  const brewhouses = await Tables.brewhouse.select({breweryUuid});
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

export const updateBrewhouse = async (breweryUuid, brewhouseUuid, updateData) => {
  const result = await Tables.brewhouse.update(updateData, {breweryUuid, brewhouseUuid});
  return result;
}

export const isExistingBrewhouseAttribute = localCache.isExistingTableAttribute("brewhouse", getBrewhouses);