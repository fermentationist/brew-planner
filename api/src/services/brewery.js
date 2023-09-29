import Models from "../models/Models.js";
import localCache from "./localCache/index.js";

export const getBreweries = async breweryUuid => {
  let breweries = [];
  if (breweryUuid) {
    breweries = await Models.brewery.select({breweryUuid});
  } else {
    breweries = await Models.brewery.select();
  }
  return breweries;
}

export const createBrewery = async breweryData => {
  const {breweryUuid} = breweryData;
  const {insertId} = await Models.brewery.insert([breweryData]);
  localCache.invalidate("brewery");
  if (breweryUuid) { // If user passed a UUID for the new brewery
    return breweryUuid;
  }
  const [newBrewery] = await Models.brewery.select({breweryKey: insertId});
  return newBrewery.breweryUuid;
}

export const updateBrewery = async (breweryUuid, breweryData) => {
  const result = await Models.brewery.update(breweryData, {breweryUuid});
  localCache.invalidate("brewery");
  return result;
}

export const deleteBrewery = async breweryUuid => {
  const result = await Models.brewery.delete({breweryUuid});
  localCache.invalidate("brewery");
  return result;
}

export const isExistingBreweryAttribute = localCache.isExistingTableAttribute("brewery", getBreweries);