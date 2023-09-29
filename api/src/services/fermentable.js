import Models from "../models/Models.js";
import localCache from "./localCache/index.js";

export const FERMENTABLE_TYPES = [
  "Grain",
  "Sugar",
  "Extract",
  "Dry Extract",
  "Adjunct",
];

export const getFermentables = async (breweryUuid) => {
  return Models.fermentable.select(breweryUuid && { breweryUuid });
};

export const createFermentable = async (breweryUuid, fermentableData) => {
  const { fermentableUuid } = fermentableData;
  const fermentableRow = {
    breweryUuid,
    ...fermentableData,
  };
  const { insertId } = await Models.fermentable.insert([fermentableRow], false);
  localCache.invalidate("fermentable");
  if (fermentableUuid) {
    // if user passed a UUID for the new fermentable
    return fermentableUuid;
  }
  const [newFermentable] = await Models.fermentable.select({
    fermentableKey: insertId,
  });
  return newFermentable.fermentableUuid;
};

export const updateFermentable = async (
  breweryUuid,
  fermentableUuid,
  updateData
) => {
  const result = await Models.fermentable.update(updateData, {
    breweryUuid,
    fermentableUuid,
  });
  localCache.invalidate("fermentable");
  return result;
};

export const deleteFermentable = async (breweryUuid, fermentableUuid) => {
  const result = await Models.fermentable.delete({
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
