import Tables from "../models/Tables.js";
import localCache from "./localCache/index.js";

export const FERMENTABLE_TYPES = [
  "Grain",
  "Sugar",
  "Extract",
  "Dry Extract",
  "Adjunct",
];

export const getFermentables = async (breweryUuid) => {
  return Tables.fermentable.select(breweryUuid && { breweryUuid });
};

export const createFermentable = async (breweryUuid, fermentableData) => {
  const { fermentableUuid } = fermentableData;
  const fermentableRow = {
    breweryUuid,
    ...fermentableData,
  };
  const { insertId } = await Tables.fermentable.insert([fermentableRow], false);
  if (fermentableUuid) {
    // if user passed a UUID for the new fermentable
    return fermentableUuid;
  }
  const [newFermentable] = await Tables.fermentable.select({
    fermentableKey: insertId,
  });
  localCache.invalidate("fermentable");
  return newFermentable.fermentableUuid;
};

export const updateFermentable = async (
  breweryUuid,
  fermentableUuid,
  updateData
) => {
  const result = await Tables.fermentable.update(updateData, {
    breweryUuid,
    fermentableUuid,
  });
  localCache.invalidate("fermentable");
  return result;
};

export const deleteFermentable = async (breweryUuid, fermentableUuid) => {
  const result = await Tables.fermentable.delete({
    breweryUuid,
    fermentableUuid,
  });
  if (!result.affectedRows) {
    throw (
      (`The brewery with the breweryUuid ${breweryUuid} has no fermentable with the fermentableUuid`,
      fermentableUuid)
    );
  }
  localCache.invalidate("fermentable");
  return result;
};

export const isExistingFermentableAttribute =
  localCache.isExistingTableAttribute("fermentable", getFermentables);
