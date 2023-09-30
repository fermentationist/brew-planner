import { randomString, randomFloat } from "../utils/helpers.js";
import entityTestFactory from "../../test/entityTestFactory.js";

const validPostDataThunk = async () => {
  return {
    name: `Test water ${randomString(6)}`,
    calcium: randomFloat(0, 500),
    bicarbonate: randomFloat(0, 500),
    sulfate: randomFloat(0, 500),
    chloride: randomFloat(0, 500),
    sodium: randomFloat(0, 500),
    magnesium: randomFloat(0, 500),
    ph: randomFloat(6, 8),
    notes: randomString(256)
  };
}

const invalidPostDataThunk = async (existingWater) => {
  return {
    name: [void 0, "", randomString(101), existingWater.name],
    calcium: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
    bicarbonate: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
    sulfate: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
    chloride: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
    sodium: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
    magnesium: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
    ph: [`${randomFloat(1, 12)}`, randomString(6), -1 * randomFloat(1, 12)],
    notes: [randomFloat(0, 1000)],
  }
}

const validPatchDataThunk = validPostDataThunk;

const invalidPatchDataThunk = async (existingWater) => {
  const invalidPostData = await invalidPostDataThunk(existingWater);
  invalidPostData.name.splice(0, 1); // remove void 0 from name
  return invalidPostData;
}

export default entityTestFactory("water", "waters", validPostDataThunk, invalidPostDataThunk, validPatchDataThunk, invalidPatchDataThunk);