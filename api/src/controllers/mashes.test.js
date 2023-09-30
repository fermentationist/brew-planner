import { randomString, randomFloat, randomBool, randomInt } from "../utils/helpers.js";
import entityTestFactory from "../../test/entityTestFactory.js";

const validPostDataThunk = async () => {
  return {
    name: `Test mash ${randomString(6)}`,
    grainTemp: randomFloat(10, 30),
    tunTemp: randomFloat(10, 30),
    spargeTemp: randomFloat(60, 90),
    ph: randomFloat(5, 7),
    tunWeight: randomFloat(10, 100),
    tunSpecificHeat: randomFloat(0.1, 0.5),
    equipAdjust: randomBool(),
    notes: randomString(256),
  };
}

const invalidPostDataThunk = async (existingMash) => {
  return {
    name: [void 0, "", randomString(101), existingMash.name],
    grainTemp: [`${randomFloat(10, 30)}`, randomString(6)],
    tunTemp: [`${randomFloat(10, 30)}`, randomString(6)],
    spargeTemp: [`${randomFloat(60, 90)}`, randomString(6), -1 * randomFloat(60, 90)],
    ph: [`${randomFloat(5, 7)}`, randomString(6), -1 * randomFloat(5, 7)],
    tunWeight: [`${randomFloat(10, 100)}`, randomString(6), -1 * randomFloat(10, 100)],
    tunSpecificHeat: [`${randomFloat(0.1, 0.5)}`, randomString(6), -1 * randomFloat(0.1, 0.5)],
    equipAdjust: [randomString(6), randomInt(2, 10), "false"],
    notes: [randomFloat(0, 1000)],
  }
}

const validPatchDataThunk = validPostDataThunk;

const invalidPatchDataThunk = async (existingMash) => {
  const invalidPostData = await invalidPostDataThunk(existingMash);
  invalidPostData.name.splice(0, 1); // remove void 0 from name
  return invalidPostData;
}

export default entityTestFactory("mash", "mashes", validPostDataThunk, invalidPostDataThunk, validPatchDataThunk, invalidPatchDataThunk);