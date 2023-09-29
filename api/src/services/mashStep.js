import Models from "../models/Models.js";
import localCache from "./localCache/index.js";

export const MASH_STEP_TYPES = [
  "Infusion",
  "Temperature",
  "Decoction"
];

export const getMashSteps = (breweryUuid, mashUuid) => {
  const selectParams = (breweryUuid && { breweryUuid }) || {};
  if (mashUuid) {
    selectParams.mashUuid = mashUuid;
  }
  return Models.mashStep.select(selectParams);
};

export const createMashStep = async (breweryUuid, mashUuid, mashStepData) => {
  const { mashStepUuid } = mashStepData;
  const mashStepRow = {
    breweryUuid,
    mashUuid,
    ...mashStepData,
  };
  const { insertId } = await Models.mashStep.insert([mashStepRow], false);
  localCache.invalidate("mashStep");
  if (mashStepUuid) {
    // if user passed a UUID for the new mashStep
    return mashStepUuid;
  }
  const [newMashStep] = await Models.mashStep.select({
    mashStepKey: insertId,
  });
  return newMashStep.mashStepUuid;
};

export const updateMashStep = async (breweryUuid, mashUuid, mashStepUuid, updateData) => {
  const result = await Models.mashStep.update(updateData, {
    breweryUuid,
    mashUuid,
    mashStepUuid,
  });
  localCache.invalidate("mashStep");
  return result;
};

export const deleteMashStep = async (breweryUuid, mashUuid, mashStepUuid) => {
  const result = await Models.mashStep.delete({
    breweryUuid,
    mashUuid,
    mashStepUuid,
  });
  if (!result.affectedRows) {
    throw `The brewery with the breweryUuid ${breweryUuid} has no mash with the mashUuid ${mashUuid}, and/or no mashStep with the mashStepUuid ${mashStepUuid}`;
  }
  localCache.invalidate("mashStep");
  return result;
};

export const isExistingMashStepAttribute = localCache.isExistingTableAttribute(
  "mashStep",
  getMashSteps
);
