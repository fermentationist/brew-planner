import Models from "../models/Models.js";
import localCache from "./localCache/index.js";

export const MISC_TYPES = [
  "Spice",
  "Fining",
  "Water Agent",
  "Herb",
  "Flavor",
  "Other",
];

export const getMiscs = (breweryUuid) => {
  return Models.misc.select(breweryUuid && { breweryUuid });
};

export const createMisc = async (breweryUuid, miscData) => {
  const { miscUuid } = miscData;
  const miscRow = {
    breweryUuid,
    ...miscData,
  };
  const { insertId } = await Models.misc.insert([miscRow], false);
  if (miscUuid) {
    // if user passed a UUID for the new misc
    return miscUuid;
  }
  const [newMisc] = await Models.misc.select({
    miscKey: insertId,
  });
  localCache.invalidate("misc");
  return newMisc.miscUuid;
};

export const updateMisc = async (breweryUuid, miscUuid, updateData) => {
  const result = await Models.misc.update(updateData, {
    breweryUuid,
    miscUuid,
  });
  localCache.invalidate("misc");
  return result;
};

export const deleteMisc = async (breweryUuid, miscUuid) => {
  const result = await Models.misc.delete({
    breweryUuid,
    miscUuid,
  });
  if (!result.affectedRows) {
    throw (
      (`The brewery with the breweryUuid ${breweryUuid} has no misc with the miscUuid`,
      miscUuid)
    );
  }
  localCache.invalidate("misc");
  return result;
};

export const isExistingMiscAttribute = localCache.isExistingTableAttribute(
  "misc",
  getMiscs
);
