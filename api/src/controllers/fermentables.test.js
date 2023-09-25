/*global it, describe, before, after */
import assert from "assert";
import { v1 as createUuid } from "uuid";
import TestAPI from "../../test/TestAPI.js";
import {
  expectError,
  runDataValidationTests,
  getEntityFactory,
  deleteEntityFactory,
  createEntityFactory,
  assertEqualIfCondition,
} from "../../test/testHelpers.js";
import {
  randomInt,
  randomFloat,
  randomString,
  getRandomArrayMembers,
  toSnakeCase,
  objectKeysToSnakeCase,
} from "../utils/helpers.js";
import * as userService from "../services/user.js";
import { FERMENTABLE_TYPES } from "../services/fermentable.js";
import localCache from "../services/localCache/index.js";

const api = new TestAPI();

//utility functions
const createBrewery = createEntityFactory("brewery");
const deleteBrewery = deleteEntityFactory("brewery");

const createFermentable = createEntityFactory("fermentable");
const deleteFermentable = deleteEntityFactory("fermentable");

const getExistingFermentables = getEntityFactory("fermentable");

const verifyFermentableData = async (fermentablesData) => {
  const existingFermentables = await getExistingFermentables();
  const existingFermentableUuids = existingFermentables.map(
    (fermentable) => fermentable.fermentable_uuid
  );
  for (const fermentable of fermentablesData) {
    assertEqualIfCondition(
      fermentable.fermentableUuid,
      existingFermentableUuids.includes(fermentable.fermentableUuid),
      true
    );
    const [dbData] = existingFermentables.filter(
      (existingFermentable) =>
        existingFermentable.fermentable_uuid === fermentable.fermentableUuid
    );
    for (const attr in fermentable) {
      let dbValue = dbData[toSnakeCase(attr)];
      dbValue = dbValue instanceof Date ? dbValue.getTime() : dbValue;
      assert.strictEqual(fermentable[attr], dbValue);
    }
  }
};

const confirmFermentableInsertion = async (fermentableUuid, fermentableData) => {
  const [dbData] = await getExistingFermentables(fermentableUuid);
  for (const attr in fermentableData) {
    let dbValue = dbData[toSnakeCase(attr)];
    dbValue = dbValue instanceof Date ? dbValue.getTime() : dbValue;
    assert.strictEqual(fermentableData[attr], dbValue);
  }
};

const getFermentableTestData = async () => {
  const users = await userService.getAllUsers();
  const [randomUser] = getRandomArrayMembers(users, 1);
  return {
    name: `Test fermentable ${randomString(6)}`,
    createdBy: randomUser.uid,
    type: getRandomArrayMembers(FERMENTABLE_TYPES, 1)[0],
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
};

const makeGetFermentablesRequest = (breweryUuid) =>
  api.request({
    url: `/breweries/${breweryUuid}/fermentables`,
    method: "get",
  });

const makeCreateFermentableRequest = (breweryUuid, data) =>
  api.request({
    url: `/breweries/${breweryUuid}/fermentables`,
    method: "post",
    data,
  });

const makeDeleteFermentableRequest = (breweryUuid, fermentableUuid) =>
  api.request({
    url: `/breweries/${breweryUuid}/fermentables/${fermentableUuid}`,
    method: "delete",
  });

// TESTS
export default describe("fermentable routes", function () {
  const breweriesToDelete = [],
    fermentablesToDelete = [];
  let userBreweries;
  let randomFermentableNames;
  before(async () => {
    const randomNames = [randomString(6), randomString(6), randomString(6)];
    const randomBreweryNames = randomNames.map((rnd) => `Test brewery ${rnd}`);
    randomFermentableNames = randomNames.map(
      (rnd) => `Test fermentable ${rnd.split("").reverse().join("")}`
    );
    await api.signInAsNewUser({ role: "user" });
    // create 3 test breweries
    for (const name of randomBreweryNames) {
      const uuid = await createBrewery({ name });
      breweriesToDelete.push(uuid);
      // create 3 test fermentables for each brewery
      for (const name of randomFermentableNames) {
        const testData = await getFermentableTestData();
        const fermentableUuid = await createFermentable({
          ...objectKeysToSnakeCase(testData),
          name,
          brewery_uuid: uuid,
          created_by: api.user.uid,
        });
        fermentablesToDelete.push(fermentableUuid);
      }
    }
    // now create a brewhouse with a different brewery
    localCache.invalidate(["brewery", "fermentable"]);
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/fermentables GET", async function () {
    const [breweryUuid] = breweriesToDelete;
    await api.signInAsNewUser({ role: "user", breweries: [breweryUuid] });
    const response = await makeGetFermentablesRequest(breweryUuid);
    assert.strictEqual(response.status, "ok");
    await verifyFermentableData(response.fermentables);
    const fermentableUuids = response.fermentables.map(
      (fermentable) => fermentable.fermentableUuid
    );
    for (const createdUuid of fermentablesToDelete.slice(0, 3)) {
      assert(fermentableUuids.includes(createdUuid));
    }
  });

  it("/breweries/:breweryUuid/fermentables GET - input validation", async () => {
    const missingUuid = void 0;
    await expectError(makeGetFermentablesRequest(missingUuid));
    const invalidUuid = "invalidUuid";
    await expectError(makeGetFermentablesRequest(invalidUuid));
    const randomButValidUuid = createUuid();
    await expectError(makeGetFermentablesRequest(randomButValidUuid));
    const wrongBreweryUuid = breweriesToDelete[1];
    await expectError(makeGetFermentablesRequest(wrongBreweryUuid));
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/fermentables POST", async () => {
    const testData = await getFermentableTestData();
    userBreweries = [breweriesToDelete[breweriesToDelete.length - 1]];
    await api.signInAsNewUser({ role: "user", breweries: userBreweries });
    const response = await makeCreateFermentableRequest(
      userBreweries[0],
      testData
    );
    assert.strictEqual(response.status, "ok");
    await confirmFermentableInsertion(response.uuid, testData);
    fermentablesToDelete.push(response.uuid);
    localCache.invalidate("fermentable");
  });

  it("/breweries/:breweryUuid/fermentables POST - with user provided UUID", async () => {
    const testData = await getFermentableTestData();
    const fermentableUuid = createUuid();
    testData.fermentableUuid = fermentableUuid;
    const response = await makeCreateFermentableRequest(
      userBreweries[0],
      testData
    );
    assert.strictEqual(response.status, "ok");
    assert.strictEqual(response.uuid, fermentableUuid);
    await confirmFermentableInsertion(response.uuid, testData);
    fermentablesToDelete.push(response.uuid);
    localCache.invalidate("fermentable");
  });

  it("/breweries/:breweryUuid/fermentables POST - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const testData = await getFermentableTestData();
    const invalidTestData = {
      name: [void 0, "", randomString(101), randomFermentableNames[0]],
      createdBy: [void 0, randomString(36), randomInt(999999)],
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
    await runDataValidationTests(invalidTestData, testData, api, {
      url: `/breweries/${breweryUuid}/fermentables`,
      method: "post",
    });
  });

  it("/breweries/:breweryUuid/fermentables/:fermentableUuid PATCH", async () => {
    const updateData = await getFermentableTestData();
    console.log("updateData:", updateData)
    delete updateData.createdBy;
    const fermentableUuid = fermentablesToDelete[fermentablesToDelete.length - 1];
    const response = await api.request({
      url: `/breweries/${userBreweries[0]}/fermentables/${fermentableUuid}`,
      method: "patch",
      data: updateData,
    });
    assert.strictEqual(response.status, "ok");
    await confirmFermentableInsertion(fermentableUuid, updateData);
  });

  it("/breweries/:breweryUuid/fermentables/:fermentableUuid PATCH - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const fermentableUuid = fermentablesToDelete[fermentablesToDelete.length - 1];
    const testData = await getFermentableTestData();
    const invalidTestData = {
      name: ["", randomString(101), randomFermentableNames[0]],
      yield: [`${randomFloat(0, 100)}`, randomString(6), -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
      color: [`${randomInt(0, 100)}`, randomString(6), -1 * randomFloat(0, 100)],
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
    await runDataValidationTests(invalidTestData, testData, api, {
      url: `/breweries/${breweryUuid}/fermentables/${fermentableUuid}`,
      method: "patch",
    });
  });

  it("/breweries/:breweryUuid/fermentables/:fermentableUuid DELETE", async () => {
    const [breweryUuid] = userBreweries;
    const fermentableUuid = fermentablesToDelete.pop();
    const response = await makeDeleteFermentableRequest(
      breweryUuid,
      fermentableUuid
    );
    assert.strictEqual(response.status, "ok");
    const { fermentables } = await makeGetFermentablesRequest(breweryUuid);
    const uuids = fermentables.map((fermentable) => fermentable.fermentableUuid);
    assert(!uuids.includes(fermentableUuid));
  });

  it("/breweries/:breweryUuid/fermentables/:fermentableUuid DELETE - input validation", async () => {
    const [validBreweryUuid] = userBreweries;
    const validFermentableUuid =
      fermentablesToDelete[fermentablesToDelete.length - 1];

    const missingBreweryUuid = void 0;
    await expectError(
      makeDeleteFermentableRequest(missingBreweryUuid, validFermentableUuid)
    );

    const invalidBreweryUuid = "invalidFermentableUuid";
    await expectError(
      makeDeleteFermentableRequest(invalidBreweryUuid, validFermentableUuid)
    );

    const validButWrongBreweryUuid = createUuid();
    await expectError(
      makeDeleteFermentableRequest(validButWrongBreweryUuid, validFermentableUuid)
    );

    const missingFermentableUuid = void 0;
    await expectError(
      makeDeleteFermentableRequest(validBreweryUuid, missingFermentableUuid)
    );

    const invalidFermentableUuid = "invalidBreweryUuid";
    await expectError(
      makeDeleteFermentableRequest(validBreweryUuid, invalidFermentableUuid)
    );

    const validButWrongFermentableUuid = createUuid();
    await expectError(
      makeDeleteFermentableRequest(validBreweryUuid, validButWrongFermentableUuid)
    );

    const realButMismatchedFermentableUuid = fermentablesToDelete[0];
    await expectError(
      makeDeleteFermentableRequest(
        validBreweryUuid,
        realButMismatchedFermentableUuid
      )
    );
  });

  after(async () => {
    await api.deleteUser();
    for (const breweryUuid of breweriesToDelete) {
      await deleteBrewery(breweryUuid);
    }
    for (const fermentableUuid of fermentablesToDelete) {
      await deleteFermentable(fermentableUuid);
    }
  });
});
