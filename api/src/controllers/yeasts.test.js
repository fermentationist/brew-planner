import { randomString, randomFloat, getRandomArrayMembers, randomInt } from "../utils/helpers.js";
import entityTestFactory from "../../test/entityTestFactory.js";
import { YEAST_TYPES, FLOCCULATION_TYPES } from "../services/yeast.js";

const validPostDataThunk = async () => {
  return {
    name: `Test yeast ${randomString(6)}`,
    type: getRandomArrayMembers(YEAST_TYPES, 1)[0],
    laboratory: `Test yeast lab ${randomString(4)}`,
    productId: randomString(6),
    minTemperature: randomFloat(45, 95),
    maxTemperature: randomFloat(45, 95),
    flocculation: getRandomArrayMembers(FLOCCULATION_TYPES, 1)[0],
    attenuation: randomFloat(50, 90),
    notes: randomString(256),
    bestFor: randomString(24),
    maxReuse: randomInt(1, 12)
  };
}

const invalidPostDataThunk = async (existingYeast) => {
  return {
    name: [void 0, "", randomString(101), existingYeast.name],
    type: [void 0, "", randomFloat(0, 100), randomString(8)],
    laboratory: [randomInt(0, 1000), randomString(101)],
    productId: [randomInt(0, 1000), randomString(37)],
    minTemperature: [`${randomFloat(45, 95)}`, randomString(3)],
    maxTemperature: [`${randomFloat(45, 95)}`, randomString(3)],
    flocculation: [randomFloat(0, 100), randomString(8)],
    attenuation: [`${randomFloat(0, 100)}`, randomString(3), -1 * randomFloat(1, 100), randomFloat(101, 1000)],
    notes: [randomFloat(0, 1000)],
    bestFor: [randomFloat(0, 1000)],
    maxReuse: [randomFloat(1, 12), randomString(2)]
  };
}

const validPatchDataThunk = validPostDataThunk;

const invalidPatchDataThunk = async (existingYeast) => {
  const invalidPostData = await invalidPostDataThunk(existingYeast);
  invalidPostData.name.splice(0, 1); // remove void 0 from name
  invalidPostData.type.splice(0, 1); // remove void 0 from type
  return invalidPostData;
}

export default entityTestFactory("yeast", "yeasts", validPostDataThunk, invalidPostDataThunk, validPatchDataThunk, invalidPatchDataThunk);