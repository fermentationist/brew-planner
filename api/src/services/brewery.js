import Tables from "../models/Tables.js";
import localCache from "./localCache/index.js";

export const getBreweries = async breweryUuid => {
  let breweries = [];
  if (breweryUuid) {
    breweries = await Tables.brewery.select({breweryUuid});
  } else {
    breweries = await Tables.brewery.select();
  }
  return breweries;
}

export const createBrewery = async breweryData => {
  const {breweryUuid} = breweryData;
  const {insertId} = await Tables.brewery.insert([breweryData]);
  if (breweryUuid) { // If user passed a UUID for the new brewery
    return breweryUuid;
  }
  const [newBrewery] = await Tables.brewery.select({breweryKey: insertId});
  localCache.invalidate("brewery");
  return newBrewery.breweryUuid;
}

export const updateBrewery = async (breweryUuid, breweryData) => {
  const result = await Tables.brewery.update(breweryData, {breweryUuid});
  localCache.invalidate("brewery");
  return result;
}

export const deleteBrewery = async breweryUuid => {
  const result = await Tables.brewery.delete({breweryUuid});
  localCache.invalidate("brewery");
  return result;
}

export const isExistingBreweryAttribute = localCache.isExistingTableAttribute("brewery", getBreweries);