import { randomString, randomFloat, getRandomArrayMembers, randomInt } from "../utils/helpers.js";
import entityTestFactory from "../../test/entityTestFactory.js";
import {MISC_TYPES} from "../services/misc.js";

const validPostDataThunk = async () => {
  return {
    name: `Test misc ${randomString(6)}`,
    type: getRandomArrayMembers(MISC_TYPES, 1)[0],
    useFor: randomString(24),
    notes: randomString(256)
  };
}

const invalidPostDataThunk = async (existingMisc) => {
  return {
    name: [void 0, "", randomString(101), existingMisc.name],
    type: [void 0, "", randomFloat(0, 100), randomString(8)],
    useFor: [randomFloat(0, 1000)],
    notes: [randomFloat(0, 1000)]
  };
}

const validPatchDataThunk = validPostDataThunk;

const invalidPatchDataThunk = async (existingMisc) => {
  const invalidPostData = await invalidPostDataThunk(existingMisc);
  invalidPostData.name.splice(0, 1); // remove void 0 from name
  invalidPostData.type.splice(0, 1); // remove void 0 from type
  return invalidPostData;
}

export default entityTestFactory("misc", "miscs", validPostDataThunk, invalidPostDataThunk, validPatchDataThunk, invalidPatchDataThunk);