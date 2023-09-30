import { randomString, randomFloat, getRandomArrayMembers, randomInt } from "../utils/helpers.js";
import entityTestFactory from "../../test/entityTestFactory.js";
import fermentableService from "../services/fermentable.js";

const validPostDataThunk = async () => {
  return {
    name: `Test fermentable ${randomString(6)}`,
    type: getRandomArrayMembers(fermentableService.FERMENTABLE_TYPES, 1)[0],
    yield: randomFloat(0, 100),
    color: randomFloat(0, 500),
    origin: `Test origin ${randomString(4)}`,
    supplier: `Test supplier ${randomString(4)}`,
    coarseFineDiff: randomFloat(0, 100),
    moisture: randomFloat(0, 100),
    diastaticPower: randomInt(0, 200),
    protein: randomFloat(0, 100),
    maxInBatch: randomFloat(0, 100),
    recommendedMash: Math.random >= 0.25 ? true : false,
    notes: randomString(256),
    addAfterBoil: Math.random >= 0.75 ? true : false
  };
}

const invalidPostDataThunk = async (existingFermentable) => {
  return {
    name: [void 0, "", randomString(101), existingFermentable.name],
    yield: [void 0, `${randomFloat(0, 100)}`, randomString(6), -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
    color: [void 0, `${randomInt(0, 100)}`, randomString(6), -1 * randomFloat(0, 100)],
    origin: [randomInt(5, 10), randomString(101)],
    supplier: [randomInt(5, 10), randomString(101)],
    coarseFineDiff: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
    moisture: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
    diastaticPower: [`${randomInt(0, 200)}`, -1 * randomFloat(0, 100)],
    protein: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
    maxInBatch: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
    recommendedMash: [randomInt(5, 10), randomString(6)],
    notes: [randomFloat(0, 1000)],
    addAfterBoil: [randomInt(5, 10), randomString(6)]
  };
}

const validPatchDataThunk = validPostDataThunk;

const invalidPatchDataThunk = async (existingFermentable) => {
  const invalidPostData = await invalidPostDataThunk(existingFermentable);
  invalidPostData.name.splice(0, 1); // remove void 0 from name
  invalidPostData.yield.splice(0, 1); // remove void 0 from alpha
  invalidPostData.color.splice(0, 1); // remove void 0 from color
  return invalidPostData;
}

export default entityTestFactory("fermentable", "fermentables", validPostDataThunk, invalidPostDataThunk, validPatchDataThunk, invalidPatchDataThunk);