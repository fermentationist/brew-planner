/*global it, describe, before, after, console */
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
import localCache from "../services/localCache/index.js";

const api = new TestAPI();

//utility functions
const createBrewery = createEntityFactory("brewery");
const deleteBrewery = deleteEntityFactory("brewery");

const createWater = createEntityFactory("water");
const deleteWater = deleteEntityFactory("water");

const getExistingWaters = getEntityFactory("water");

const verifyWatersData = async (watersData) => {
  const existingWaters = await getExistingWaters();
  const existingWaterUuids = existingWaters.map(
    (water) => water.water_uuid
  );
  for (const water of watersData) {
    assertEqualIfCondition(
      water.waterUuid,
      existingWaterUuids.includes(water.waterUuid),
      true
    );
    const [dbData] = existingWaters.filter(
      (existingWater) =>
        existingWater.water_uuid === water.waterUuid
    );
    for (const attr in water) {
      let dbValue = dbData[toSnakeCase(attr)];
      dbValue = dbValue instanceof Date ? dbValue.getTime() : dbValue;
      assert.strictEqual(water[attr], dbValue);
    }
  }
};

const confirmWaterInsertion = async (waterUuid, waterData) => {
  const [dbData] = await getExistingWaters(waterUuid);
  for (const attr in waterData) {
    let dbValue = dbData[toSnakeCase(attr)];
    dbValue = dbValue instanceof Date ? dbValue.getTime() : dbValue;
    assert.strictEqual(waterData[attr], dbValue);
  }
};

const getWaterTestData = async () => {
  const users = await userService.getAllUsers();
  const [randomUser] = getRandomArrayMembers(users, 1);
  return {
    name: `Test water ${randomString(6)}`,
    createdBy: randomUser.uid,
    calcium: randomFloat(0, 500),
    bicarbonate: randomFloat(0, 500),
    sulfate: randomFloat(0, 500),
    chloride: randomFloat(0, 500),
    sodium: randomFloat(0, 500),
    magnesium: randomFloat(0, 500),
    ph: randomFloat(6, 8),
    notes: randomString(256)
  };
};

const makeGetWatersRequest = (breweryUuid) =>
  api.request({
    url: `/breweries/${breweryUuid}/waters`,
    method: "get",
  });

const makeCreateWaterRequest = (breweryUuid, data) =>
  api.request({
    url: `/breweries/${breweryUuid}/waters`,
    method: "post",
    data,
  });

const makeDeleteWaterRequest = (breweryUuid, waterUuid) =>
  api.request({
    url: `/breweries/${breweryUuid}/waters/${waterUuid}`,
    method: "delete",
  });

// TESTS
export default describe("water routes", function () {
  const breweriesToDelete = [],
    watersToDelete = [];
  let userBreweries;
  let randomWaterNames;
  before(async () => {
    const randomNames = [randomString(6), randomString(6), randomString(6)];
    const randomBreweryNames = randomNames.map((rnd) => `Test brewery ${rnd}`);
    randomWaterNames = randomNames.map(
      (rnd) => `Test water ${rnd.split("").reverse().join("")}`
    );
    await api.signInAsNewUser({ role: "user" });
    // create 3 test breweries
    for (const name of randomBreweryNames) {
      const uuid = await createBrewery({ name });
      breweriesToDelete.push(uuid);
      // create 3 test fermentables for each brewery
      for (const name of randomWaterNames) {
        const testData = await getWaterTestData();
        const waterUuid = await createWater({
          ...objectKeysToSnakeCase(testData),
          name,
          brewery_uuid: uuid,
          created_by: api.user.uid,
        });
        watersToDelete.push(waterUuid);
      }
    }
    // now create a brewhouse with a different brewery
    localCache.invalidate(["brewery", "water"]);
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/waters GET", async function () {
    const [breweryUuid] = breweriesToDelete;
    await api.signInAsNewUser({ role: "user", breweries: [breweryUuid] });
    const response = await makeGetWatersRequest(breweryUuid);
    assert.strictEqual(response.status, "ok");
    await verifyWatersData(response.waters);
    const waterUuids = response.waters.map(
      (water) => water.waterUuid
    );
    for (const createdUuid of watersToDelete.slice(0, 3)) {
      assert(waterUuids.includes(createdUuid));
    }
  });

  it("/breweries/:breweryUuid/waters GET - input validation", async () => {
    const missingUuid = void 0;
    await expectError(makeGetWatersRequest(missingUuid));
    const invalidUuid = "invalidUuid";
    await expectError(makeGetWatersRequest(invalidUuid));
    const randomButValidUuid = createUuid();
    await expectError(makeGetWatersRequest(randomButValidUuid));
    const wrongBreweryUuid = breweriesToDelete[1];
    await expectError(makeGetWatersRequest(wrongBreweryUuid));
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/waters POST", async () => {
    const testData = await getWaterTestData();
    userBreweries = [breweriesToDelete[breweriesToDelete.length - 1]];
    await api.signInAsNewUser({ role: "user", breweries: userBreweries });
    const response = await makeCreateWaterRequest(
      userBreweries[0],
      testData
    );
    assert.strictEqual(response.status, "ok");
    await confirmWaterInsertion(response.waterUuid, testData);
    watersToDelete.push(response.waterUuid);
    localCache.invalidate("water");
  });

  it("/breweries/:breweryUuid/waters POST - with user provided UUID", async () => {
    const testData = await getWaterTestData();
    const waterUuid = createUuid();
    testData.waterUuid = waterUuid;
    const response = await makeCreateWaterRequest(
      userBreweries[0],
      testData
    );
    assert.strictEqual(response.status, "ok");
    assert.strictEqual(response.waterUuid, waterUuid);
    await confirmWaterInsertion(response.waterUuid, testData);
    watersToDelete.push(response.waterUuid);
    localCache.invalidate("water");
  });

  it("/breweries/:breweryUuid/waters POST - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const testData = await getWaterTestData();
    const invalidTestData = {
      name: [void 0, "", randomString(101), randomWaterNames[0]],
      createdBy: [void 0, randomString(36), randomInt(999999)],
      calcium: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
      bicarbonate: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
      sulfate: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
      chloride: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
      sodium: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
      magnesium: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
      ph: [`${randomFloat(1, 12)}`, randomString(6), -1 * randomFloat(1, 12)],
      notes: [randomFloat(0, 1000)],
    }
    await runDataValidationTests(invalidTestData, testData, api, {
      url: `/breweries/${breweryUuid}/waters`,
      method: "post",
    });
  });

  it("/breweries/:breweryUuid/waters/:waterUuid PATCH", async () => {
    const updateData = await getWaterTestData();
    delete updateData.createdBy;
    const waterUuid = watersToDelete[watersToDelete.length - 1];
    const response = await api.request({
      url: `/breweries/${userBreweries[0]}/waters/${waterUuid}`,
      method: "patch",
      data: updateData,
    });
    assert.strictEqual(response.status, "ok");
    await confirmWaterInsertion(waterUuid, updateData);
  });

  it("/breweries/:breweryUuid/waters/:waterUuid PATCH - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const waterUuid = watersToDelete[watersToDelete.length - 1];
    const testData = await getWaterTestData();
    const invalidTestData = {
      name: ["", randomString(101), randomWaterNames[0]],
      calcium: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
      bicarbonate: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
      sulfate: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
      chloride: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
      sodium: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
      magnesium: [`${randomFloat(0, 500)}`, randomString(6), -1 * randomFloat(1, 500)],
      ph: [`${randomFloat(1, 12)}`, randomString(6), -1 * randomFloat(1, 12)],
      notes: [randomFloat(0, 1000)],
    }
    await runDataValidationTests(invalidTestData, testData, api, {
      url: `/breweries/${breweryUuid}/waters/${waterUuid}`,
      method: "patch",
    });
  });

  it("/breweries/:breweryUuid/waters/:waterUuid DELETE", async () => {
    const [breweryUuid] = userBreweries;
    const waterUuid = watersToDelete.pop();
    const response = await makeDeleteWaterRequest(
      breweryUuid,
      waterUuid
    );
    assert.strictEqual(response.status, "ok");
    const { waters } = await makeGetWatersRequest(breweryUuid);
    const uuids = waters.map((water) => water.waterUuid);
    assert(!uuids.includes(waterUuid));
  });

  it("/breweries/:breweryUuid/waters/:waterUuid DELETE - input validation", async () => {
    const [validBreweryUuid] = userBreweries;
    const validWaterUuid =
      watersToDelete[watersToDelete.length - 1];

    const missingBreweryUuid = void 0;
    await expectError(
      makeDeleteWaterRequest(missingBreweryUuid, validWaterUuid)
    );

    const invalidBreweryUuid = "invalidBreweryUuid";
    await expectError(
      makeDeleteWaterRequest(invalidBreweryUuid, validWaterUuid)
    );

    const validButWrongBreweryUuid = createUuid();
    await expectError(
      makeDeleteWaterRequest(validButWrongBreweryUuid, validWaterUuid)
    );

    const missingWaterUuid = void 0;
    await expectError(
      makeDeleteWaterRequest(validBreweryUuid, missingWaterUuid)
    );

    const invalidWaterUuid = "invalidWaterUuid";
    await expectError(
      makeDeleteWaterRequest(validBreweryUuid, invalidWaterUuid)
    );

    const validButWrongwaterUuid = createUuid();
    await expectError(
      makeDeleteWaterRequest(validBreweryUuid, validButWrongwaterUuid)
    );

    const realButMismatchedwaterUuid = watersToDelete[0];
    await expectError(
      makeDeleteWaterRequest(
        validBreweryUuid,
        realButMismatchedwaterUuid
      )
    );
  });

  after(async () => {
    await api.deleteUser();
    for (const breweryUuid of breweriesToDelete) {
      await deleteBrewery(breweryUuid);
    }
    for (const waterUuid of watersToDelete) {
      await deleteWater(waterUuid);
    }
  });
});
