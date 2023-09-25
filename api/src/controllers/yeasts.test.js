/*global it, describe, before, after */
import assert from "assert";
import { v1 as createUuid } from "uuid";
import TestAPI from "../../test/TestAPI.js";
import {
  expectError,
  expectInvalidInput,
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
import { YEAST_TYPES, FLOCCULATION_TYPES } from "../services/yeast.js";
import localCache from "../services/localCache/index.js";

const api = new TestAPI();

//utility functions
const createBrewery = createEntityFactory("brewery");
const deleteBrewery = deleteEntityFactory("brewery");

const createYeast = createEntityFactory("yeast");
const deleteYeast = deleteEntityFactory("yeast");

const getExistingYeasts = getEntityFactory("yeast");

const verifyYeastsData = async (yeastsData) => {
  const existingYeasts = await getExistingYeasts();
  const existingYeastUuids = existingYeasts.map(
    (yeast) => yeast.yeast_uuid
  );
  for (const yeast of yeastsData) {
    assertEqualIfCondition(
      yeast.yeastUuid,
      existingYeastUuids.includes(yeast.yeastUuid),
      true
    );
    const [dbData] = existingYeasts.filter(
      (existingYeast) =>
        existingYeast.yeast_uuid === yeast.yeastUuid
    );
    for (const attr in yeast) {
      let dbValue = dbData[toSnakeCase(attr)];
      dbValue = dbValue instanceof Date ? dbValue.getTime() : dbValue;
      assert.strictEqual(yeast[attr], dbValue);
    }
  }
};

const confirmYeastInsertion = async (yeastUuid, yeastData) => {
  const [dbData] = await getExistingYeasts(yeastUuid);
  for (const attr in yeastData) {
    let dbValue = dbData[toSnakeCase(attr)];
    dbValue = dbValue instanceof Date ? dbValue.getTime() : dbValue;
    assert.strictEqual(yeastData[attr], dbValue);
  }
};

const getYeastTestData = async () => {
  const users = await userService.getAllUsers();
  const [randomUser] = getRandomArrayMembers(users, 1);
  return {
    name: `Test yeast ${randomString(6)}`,
    createdBy: randomUser.uid,
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
};

const makeGetYeastsRequest = (breweryUuid) =>
  api.request({
    url: `/breweries/${breweryUuid}/yeasts`,
    method: "get",
  });

const makeCreateYeastRequest = (breweryUuid, data) =>
  api.request({
    url: `/breweries/${breweryUuid}/yeasts`,
    method: "post",
    data,
  });

const makeDeleteYeastRequest = (breweryUuid, yeastUuid) =>
  api.request({
    url: `/breweries/${breweryUuid}/yeasts/${yeastUuid}`,
    method: "delete",
  });

// TESTS
export default describe("yeast routes", function () {
  const breweriesToDelete = [],
    yeastsToDelete = [];
  let userBreweries;
  let randomYeastNames;
  before(async () => {
    const randomNames = [randomString(6), randomString(6), randomString(6)];
    const randomBreweryNames = randomNames.map((rnd) => `Test brewery ${rnd}`);
    randomYeastNames = randomNames.map(
      (rnd) => `Test yeast ${rnd.split("").reverse().join("")}`
    );
    await api.signInAsNewUser({ role: "user" });
    // create 3 test breweries
    for (const name of randomBreweryNames) {
      const uuid = await createBrewery({ name });
      breweriesToDelete.push(uuid);
      // create 3 test yeasts for each brewery
      for (const name of randomYeastNames) {
        const testData = await getYeastTestData();
        const yeastUuid = await createYeast({
          ...objectKeysToSnakeCase(testData),
          name,
          brewery_uuid: uuid,
          created_by: api.user.uid,
        });
        yeastsToDelete.push(yeastUuid);
      }
    }
    // now create a brewhouse with a different brewery
    localCache.invalidate(["brewery", "yeast"]);
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/yeasts GET", async function () {
    const [breweryUuid] = breweriesToDelete;
    await api.signInAsNewUser({ role: "user", breweries: [breweryUuid] });
    const response = await makeGetYeastsRequest(breweryUuid);
    assert.strictEqual(response.status, "ok");
    await verifyYeastsData(response.yeasts);
    const yeastUuids = response.yeasts.map(
      (yeast) => yeast.yeastUuid
    );
    for (const createdUuid of yeastsToDelete.slice(0, 3)) {
      assert(yeastUuids.includes(createdUuid));
    }
  });

  it("/breweries/:breweryUuid/yeasts GET - input validation", async () => {
    const missingUuid = void 0;
    await expectError(makeGetYeastsRequest(missingUuid));
    const invalidUuid = "invalidUuid";
    await expectError(makeGetYeastsRequest(invalidUuid));
    const randomButValidUuid = createUuid();
    await expectError(makeGetYeastsRequest(randomButValidUuid));
    const wrongBreweryUuid = breweriesToDelete[1];
    await expectError(makeGetYeastsRequest(wrongBreweryUuid));
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/yeasts POST", async () => {
    const testData = await getYeastTestData();
    userBreweries = [breweriesToDelete[breweriesToDelete.length - 1]];
    await api.signInAsNewUser({ role: "user", breweries: userBreweries });
    const response = await makeCreateYeastRequest(
      userBreweries[0],
      testData
    );
    assert.strictEqual(response.status, "ok");
    await confirmYeastInsertion(response.uuid, testData);
    yeastsToDelete.push(response.uuid);
    localCache.invalidate("yeast");
  });

  it("/breweries/:breweryUuid/yeasts POST - with user provided UUID", async () => {
    const testData = await getYeastTestData();
    const yeastUuid = createUuid();
    testData.yeastUuid = yeastUuid;
    const response = await makeCreateYeastRequest(
      userBreweries[0],
      testData
    );
    assert.strictEqual(response.status, "ok");
    assert.strictEqual(response.uuid, yeastUuid);
    await confirmYeastInsertion(response.uuid, testData);
    yeastsToDelete.push(response.uuid);
    localCache.invalidate("yeast");
  });

  it("/breweries/:breweryUuid/yeasts POST - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const testData = await getYeastTestData();
    const invalidTestData = {
      name: [void 0, "", randomString(101), randomYeastNames[0]],
      createdBy: [void 0, randomString(36), randomInt(999999)],
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
    }
    await runDataValidationTests(invalidTestData, testData, api, {
      url: `/breweries/${breweryUuid}/yeasts`,
      method: "post",
    });
  });

  it("/breweries/:breweryUuid/yeasts/:yeastUuid PATCH", async () => {
    const updateData = await getYeastTestData();
    delete updateData.createdBy;
    const yeastUuid = yeastsToDelete[yeastsToDelete.length - 1];
    const response = await api.request({
      url: `/breweries/${userBreweries[0]}/yeasts/${yeastUuid}`,
      method: "patch",
      data: updateData,
    });
    assert.strictEqual(response.status, "ok");
    await confirmYeastInsertion(yeastUuid, updateData);
  });

  it("/breweries/:breweryUuid/yeasts/:yeastUuid PATCH - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const yeastUuid = yeastsToDelete[yeastsToDelete.length - 1];
    const testData = await getYeastTestData();
    const invalidTestData = {
      name: [randomString(101), randomYeastNames[0]],
      type: [randomFloat(0, 100), randomString(8)],
      laboratory: [randomInt(0, 1000), randomString(101)],
      productId: [randomInt(0, 1000), randomString(37)],
      minTemperature: [`${randomFloat(45, 95)}`, randomString(3)],
      maxTemperature: [`${randomFloat(45, 95)}`, randomString(3)],
      flocculation: [randomFloat(0, 100), randomString(8)],
      attenuation: [`${randomFloat(0, 100)}`, randomString(3), -1 * randomFloat(1, 100), randomFloat(101, 1000)],
      notes: [randomFloat(0, 1000)],
      bestFor: [randomFloat(0, 1000)],
      maxReuse: [randomFloat(1, 12), randomString(2)]
    }
    await runDataValidationTests(invalidTestData, testData, api, {
      url: `/breweries/${breweryUuid}/yeasts/${yeastUuid}`,
      method: "patch",
    });
  });

  it("/breweries/:breweryUuid/yeasts/:yeastUuid DELETE", async () => {
    const [breweryUuid] = userBreweries;
    const yeastUuid = yeastsToDelete.pop();
    const response = await makeDeleteYeastRequest(
      breweryUuid,
      yeastUuid
    );
    assert.strictEqual(response.status, "ok");
    const { yeasts } = await makeGetYeastsRequest(breweryUuid);
    const uuids = yeasts.map((yeast) => yeast.yeastUuid);
    assert(!uuids.includes(yeastUuid));
  });

  it("/breweries/:breweryUuid/yeasts/:yeastUuid DELETE - input validation", async () => {
    const [validBreweryUuid] = userBreweries;
    const validyeastUuid =
      yeastsToDelete[yeastsToDelete.length - 1];

    const missingyeastUuid = void 0;
    await expectError(
      makeDeleteYeastRequest(missingyeastUuid, validyeastUuid)
    );

    const invalidBreweryUuid = "invalidyeastUuid";
    await expectError(
      makeDeleteYeastRequest(invalidBreweryUuid, validyeastUuid)
    );

    const validButWrongBreweryUuid = createUuid();
    await expectError(
      makeDeleteYeastRequest(validButWrongBreweryUuid, validyeastUuid)
    );

    const missingYeastUuid = void 0;
    await expectError(
      makeDeleteYeastRequest(validBreweryUuid, missingYeastUuid)
    );

    const invalidyeastUuid = "invalidYeastUuid";
    await expectError(
      makeDeleteYeastRequest(validBreweryUuid, invalidyeastUuid)
    );

    const validButWrongYeastUuid = createUuid();
    await expectError(
      makeDeleteYeastRequest(validBreweryUuid, validButWrongYeastUuid)
    );

    const realButMismatchedYeastUuid = yeastsToDelete[0];
    await expectError(
      makeDeleteYeastRequest(
        validBreweryUuid,
        realButMismatchedYeastUuid
      )
    );
  });

  after(async () => {
    await api.deleteUser();
    for (const breweryUuid of breweriesToDelete) {
      await deleteBrewery(breweryUuid);
    }
    for (const yeastUuid of yeastsToDelete) {
      await deleteYeast(yeastUuid);
    }
  });
});
