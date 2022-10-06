import Tables from "../models/Tables.js";

export const getBreweries = async breweryId => {
  let breweries = [];
  if (breweryId) {
    breweries = await Tables.brewery.select({breweryId});
  } else {
    breweries = await Tables.brewery.select();
  }
  return breweries;
}

export const createBrewery = async breweryData => {
  const {insertId} = await Tables.brewery.insert([breweryData]);
  const [newBrewery] = await Tables.brewery.select({breweryKey: insertId});
  return newBrewery.breweryId;
}

export const deleteBrewery = () => {
  
}