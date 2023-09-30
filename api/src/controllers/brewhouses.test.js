import { randomString, randomFloat, randomInt } from "../utils/helpers.js";
import entityTestFactory from "../../test/entityTestFactory.js";

const validPostDataThunk = async () => {
  return {
    name: `Test brewhouse ${randomString(6)}`,
    batchSize: randomInt(1, 20),
    tunVolume: randomInt(10, 20),
    tunWeight: randomInt(20, 60),
    tunLoss: randomInt(0, 5),
    tunSpecificHeat: randomInt(0, 5),
    lauterDeadspace: randomInt(0, 5),
    topUpWater: randomInt(0, 5),
    trubChillerLoss: randomInt(0, 5),
    evaporationRate: randomFloat(1, 3, 2),
    kettleVol: randomInt(5, 20),
    miscLoss: randomFloat(0, 5, 2),
    extractEfficiency: randomInt(50, 90),
    grainAbsorptionRate: randomFloat(0.1, 0.3, 2),
    hopUtilization: randomInt(50, 90),
  };
}

const invalidPostDataThunk = async (existingBrewhouse) => {
  return {
    name: [void 0, "", randomString(101), existingBrewhouse.name],
    batchSize: [void 0, `${randomInt(5, 10)}`, randomString(6)],
    tunVolume: [void 0, `${randomInt(5, 10)}`, randomString(6)],
    tunWeight: [void 0, `${randomInt(5, 10)}`, randomString(6)],
    tunLoss: [`${randomInt(5, 10)}`, randomString(6)],
    tunSpecificHeat: [void 0, `${randomInt(5, 10)}`, randomString(6)],
    lauterDeadspace: [`${randomInt(5, 10)}`, randomString(6)],
    topUpWater: [`${randomInt(5, 10)}`, randomString(6)],
    trubChillerLoss: [`${randomInt(5, 10)}`, randomString(6)],
    evaporationRate: [void 0, `${randomFloat(1, 3, 2)}`, randomString(6)],
    kettleVol: [void 0, `${randomInt(5, 10)}`, randomString(6)],
    miscLoss: [`${randomFloat(0, 5)}`, randomString(6)],
    extractEfficiency: [void 0, `${randomFloat(50, 90, 2)}`, randomString(6)],
    grainAbsorptionRate: [void 0, `${randomFloat(0.1, 0.3, 2)}`, randomString(6)],
    hopUtilization: [void 0, `${randomFloat(50, 90, 2)}`, randomString(6)],
  };
}

const validPatchDataThunk = validPostDataThunk;

const invalidPatchDataThunk = async (existingBrewhouse) => {
  const invalidPostData = await invalidPostDataThunk(existingBrewhouse);
  invalidPostData.name = ["", randomString(101)];
  invalidPostData.batchSize.splice(0, 1); // remove void 0 from batchSize
  invalidPostData.tunVolume.splice(0, 1); // remove void 0 from tunVolume
  invalidPostData.tunWeight.splice(0, 1); // remove void 0 from tunWeight
  invalidPostData.tunSpecificHeat.splice(0, 1); // remove void 0 from tunSpecificHeat
  invalidPostData.evaporationRate.splice(0, 1); // remove void 0 from evaporationRate
  invalidPostData.kettleVol.splice(0, 1); // remove void 0 from kettleVol
  invalidPostData.extractEfficiency.splice(0, 1); // remove void 0 from extractEfficiency
  invalidPostData.grainAbsorptionRate.splice(0, 1); // remove void 0 from grainAbsorptionRate
  invalidPostData.hopUtilization.splice(0, 1); // remove void 0 from hopUtilization
  return invalidPostData;
}

export default entityTestFactory("brewhouse", "brewhouses", validPostDataThunk, invalidPostDataThunk, validPatchDataThunk, invalidPatchDataThunk);