import { randomString, randomFloat, getRandomArrayMembers, randomInt } from "../utils/helpers.js";
import entityTestFactory from "../../test/entityTestFactory.js";
import { HOP_FORMS } from "../services/hop.js";

const validPostDataThunk = async () => {
  return {
    name: `Test hop ${randomString(6)}`,
    alpha: randomFloat(1, 20),
    beta: randomFloat(0, 20),
    form: getRandomArrayMembers(HOP_FORMS, 1)[0],
    notes: randomString(256),
    origin: `Test origin ${randomString(4)}`,
    supplier: `Test supplier ${randomString(4)}`,
    humulene: randomFloat(0, 100),
    caryophyllene: randomFloat(0, 100),
    cohumulone: randomFloat(0, 100),
    myrcene: randomFloat(0, 100)
  };
}

const invalidPostDataThunk = async (existingHop) => {
  return {
    name: [void 0, "", randomString(101), existingHop.name],
    alpha: [void 0, `${randomFloat(1, 20)}`, randomString(6), -1 * randomFloat(1, 20)],
    beta: [`${randomFloat(1, 20)}`, randomString(6), -1 * randomFloat(1, 20)],
    form: [randomString(8), randomFloat(0, 100)],
    notes: [randomFloat(0, 1000)],
    origin: [randomInt(5, 10), randomString(101)],
    supplier: [randomInt(5, 10), randomString(101)],
    humulene: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
    caryophyllene: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
    cohumulone: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
    myrcene: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)]
  }
}

const validPatchDataThunk = validPostDataThunk;

const invalidPatchDataThunk = async (existingHop) => {
  const invalidPostData = await invalidPostDataThunk(existingHop);
  invalidPostData.name.splice(0, 1); // remove void 0 from name
  invalidPostData.alpha.splice(0, 1); // remove void 0 from alpha
  return invalidPostData;
}

export default entityTestFactory("hop", "hops", validPostDataThunk, invalidPostDataThunk, validPatchDataThunk, invalidPatchDataThunk);