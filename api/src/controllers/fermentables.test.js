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
import { FERMENTABLE_TYPES } from "../services/fermentable.js";
import localCache from "../services/localCache/index.js";

const api = new TestAPI();

//utility functions
const createBrewery = createEntityFactory("brewery");
const deleteBrewery = deleteEntityFactory("brewery");

const createFermentable = createEntityFactory("fermentable");
const deleteFermentable = deleteEntityFactory("fermentable");

const getExistingFermentables = getEntityFactory("fermentable");
const getExistingBreweries = getEntityFactory("brewery");

const verifyFermentableData = async (fermentablesData) => {
  const existingFermentables = await getExistingFermentables();
  const existingFermentableUuids = existingFermentables.map(
    (fermentable) => fermentable.fermentable_uuid
  );
  for (const fermentable of fermentablesData) {
    assertEqualIfCondition(
      fermentable.fermentableUuid,
      existingFermentableUuids.includes(fermentable.brewhouseUuid),
      true
    );
    const [dbData] = existingFermentables.filter(
      (existingBrewhouse) =>
        existingBrewhouse.fermentable_uuid === fermentable.fermentableUuid
    );
    assert.strictEqual(fermentable.name, dbData.name);
    assert.strictEqual(fermentable.type, dbData.type);
    assert.strictEqual(fermentable.yield, dbData.yield);
    assert.strictEqual(fermentable.color, dbData.color);
    assert.strictEqual(fermentable.origin, dbData.origin);
    assert.strictEqual(fermentable.supplier, dbData.supplier);
    assert.strictEqual(fermentable.coarseFineDiff, dbData.coarse_fine_diff);
    assert.strictEqual(fermentable.moisture, dbData.moisture);
    assert.strictEqual(fermentable.diastaticPower, dbData.diastatic_power);
    assert.strictEqual(fermentable.protein, dbData.protein);
    assert.strictEqual(fermentable.maxInBatch, dbData.max_in_batch);
    assert.strictEqual(fermentable.recommendedMash, dbData.recommended_mash);
    assert.strictEqual(fermentable.notes, dbData.notes);
    assert.strictEqual(fermentable.addAfterBoil, dbData.add_after_boil);
  }
};

const confirmFermentableInsertion = async (fermentableUuid, fermentableData) => {
  const [dbData] = await getExistingFermentables(fermentableUuid);
  assert.strictEqual(fermentableData.name, dbData.name);
    assert.strictEqual(fermentableData.type, dbData.type);
    assert.strictEqual(fermentableData.yield, dbData.yield);
    assert.strictEqual(fermentableData.color, dbData.color);
    assert.strictEqual(fermentableData.origin, dbData.origin);
    assert.strictEqual(fermentableData.supplier, dbData.supplier);
    assert.strictEqual(fermentableData.coarseFineDiff, dbData.coarse_fine_diff);
    assert.strictEqual(fermentableData.moisture, dbData.moisture);
    assert.strictEqual(fermentableData.diastaticPower, dbData.diastatic_power);
    assert.strictEqual(fermentableData.protein, dbData.protein);
    assert.strictEqual(fermentableData.maxInBatch, dbData.max_in_batch);
    assert.strictEqual(fermentableData.recommendedMash, dbData.recommended_mash);
    assert.strictEqual(fermentableData.notes, dbData.notes);
    assert.strictEqual(fermentableData.addAfterBoil, dbData.add_after_boil);
};

const getFermentableTestData = async () => {
  const users = await userService.getAllUsers();
  const [randomUser] = getRandomArrayMembers(users, 1);
  return {
    name: `Test fermentable ${randomString(6)}`,
    createdBy: randomUser.uid,
    type: getRandomArrayMembers(FERMENTABLE_TYPES, 1),
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

  before(async () => {
    const randomNames = [randomString(6), randomString(6), randomString(6)];
    const randomBreweryNames = randomNames.map((rnd) => `Test brewery ${rnd}`);
    const randomFermentableNames = randomNames.map(
      (rnd) => `Test fermentable ${rnd.split("").reverse().join("")}`
    );
    await api.signInAsNewUser({ role: "user" });
    // create 3 test breweries
    for (const name of randomBreweryNames) {
      const uuid = await createBrewery({ name });
      breweriesToDelete.push(uuid);
      // create 3 test fermentables for each brewery
      for (const name of randomFermentableNames) {
        const fermentableUuid = await createFermentable({
          ...objectKeysToSnakeCase(getFermentableTestData()),
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

  it.only("/breweries/:breweryUuid/brewhouses GET", async function () {
    const [breweryUuid] = breweriesToDelete;
    await api.signInAsNewUser({ role: "user", breweries: [breweryUuid] });
    const response = await makeGetFermentablesRequest(breweryUuid);
    assert.strictEqual(response.status, "ok");
    await verifyFermentableData(response.fermentables);
    const fermentableUuids = response.fermentables.map(
      (brewhouse) => brewhouse.fermentableUuid
    );
    for (const createdUuid of fermentablesToDelete.slice(0, 3)) {
      assert(fermentableUuids.includes(createdUuid));
    }
  });

  // it("/breweries/:breweryUuid/brewhouses GET - input validation", async () => {
  //   const missingUuid = void 0;
  //   await expectError(makeGetBrewhousesRequest(missingUuid));
  //   const invalidUuid = "invalidUuid";
  //   await expectError(makeGetBrewhousesRequest(invalidUuid));
  //   const randomButValidUuid = createUuid();
  //   await expectError(makeGetBrewhousesRequest(randomButValidUuid));
  //   const wrongBreweryUuid = breweriesToDelete[1];
  //   await expectError(makeGetBrewhousesRequest(wrongBreweryUuid));
  //   await api.deleteUser();
  // });

  // it("/breweries/:breweryUuid/brewhouses POST", async () => {
  //   const testData = await getBrewhouseTestData();
  //   const existingBreweries = await getExistingBreweries();
  //   const existingBreweryUuids = existingBreweries.map(
  //     (brewery) => brewery.brewery_uuid
  //   );
  //   userBreweries = [breweriesToDelete[breweriesToDelete.length - 1]];
  //   await api.signInAsNewUser({ role: "user", breweries: userBreweries });
  //   const response = await makeCreateBrewhouseRequest(
  //     userBreweries[0],
  //     testData
  //   );
  //   assert.strictEqual(response.status, "ok");
  //   await confirmBrewhouseInsertion(response.brewhouseUuid, testData);
  //   fermentablesToDelete.push(response.brewhouseUuid);
  //   localCache.invalidate("brewhouse");
  // });

  // it("/breweries/:breweryUuid/brewhouses POST - with user provided UUID", async () => {
  //   const testData = await getBrewhouseTestData();
  //   const brewhouseUuid = createUuid();
  //   testData.brewhouseUuid = brewhouseUuid;
  //   const response = await makeCreateBrewhouseRequest(
  //     userBreweries[0],
  //     testData
  //   );
  //   assert.strictEqual(response.status, "ok");
  //   assert.strictEqual(response.brewhouseUuid, brewhouseUuid);
  //   await confirmBrewhouseInsertion(response.brewhouseUuid, testData);
  //   fermentablesToDelete.push(response.brewhouseUuid);
  //   localCache.invalidate("brewhouse");
  // });

  // it("/breweries/:breweryUuid/brewhouses POST - input validation", async () => {
  //   const [breweryUuid] = userBreweries;
  //   const testData = await getBrewhouseTestData();
  //   const invalidTestData = {
  //     name: [void 0, "", randomString(101)],
  //     createdBy: [void 0, randomString(36), randomInt(999999)],
  //     batchSize: [void 0, `${randomInt(5, 10)}`, randomString(6)],
  //     tunVolume: [void 0, `${randomInt(5, 10)}`, randomString(6)],
  //     tunWeight: [void 0, `${randomInt(5, 10)}`, randomString(6)],
  //     tunLoss: [`${randomInt(5, 10)}`, randomString(6)],
  //     tunSpecificHeat: [void 0, `${randomInt(5, 10)}`, randomString(6)],
  //     lauterDeadspace: [`${randomInt(5, 10)}`, randomString(6)],
  //     topUpWater: [`${randomInt(5, 10)}`, randomString(6)],
  //     trubChillerLoss: [`${randomInt(5, 10)}`, randomString(6)],
  //     evaporationRate: [void 0, `${randomFloat(1, 3, 2)}`, randomString(6)],
  //     kettleVol: [void 0, `${randomInt(5, 10)}`, randomString(6)],
  //     miscLoss: [`${randomFloat(0, 5)}`, randomString(6)],
  //     extractEfficiency: [void 0, `${randomFloat(50, 90, 2)}`, randomString(6)],
  //     grainAbsorptionRate: [
  //       void 0,
  //       `${randomFloat(0.1, 0.3, 2)}`,
  //       randomString(6),
  //     ],
  //     hopUtilization: [void 0, `${randomFloat(50, 90, 2)}`, randomString(6)],
  //   };
  //   await runDataValidationTests(invalidTestData, testData, api, {
  //     url: `/breweries/${breweryUuid}/brewhouses`,
  //     method: "post",
  //   });
  // });

  // it("/breweries/:breweryUuid/brewhouses/:brewhouseUuid PATCH", async () => {
  //   const updateData = await getBrewhouseTestData();
  //   const brewhouseUuid = fermentablesToDelete[fermentablesToDelete.length - 1];
  //   const response = await api.request({
  //     url: `/breweries/${userBreweries[0]}/brewhouses/${brewhouseUuid}`,
  //     method: "patch",
  //     data: updateData,
  //   });
  //   assert.strictEqual(response.status, "ok");
  //   await confirmBrewhouseInsertion(brewhouseUuid, updateData);
  // });

  // it("/breweries/:breweryUuid/brewhouses/:brewhouseUuid PATCH - input validation", async () => {
  //   const [breweryUuid] = userBreweries;
  //   const brewhouseUuid = fermentablesToDelete[fermentablesToDelete.length - 1];
  //   const testData = await getBrewhouseTestData();
  //   const invalidTestData = {
  //     name: ["", randomString(101)],
  //     // createdBy: [randomString(36), randomInt(999999)], // cannot be updated
  //     batchSize: [`${randomInt(5, 10)}`, randomString(6)],
  //     tunVolume: [`${randomInt(5, 10)}`, randomString(6)],
  //     tunWeight: [`${randomInt(5, 10)}`, randomString(6)],
  //     tunLoss: [`${randomInt(5, 10)}`, randomString(6)],
  //     tunSpecificHeat: [`${randomInt(5, 10)}`, randomString(6)],
  //     lauterDeadspace: [`${randomInt(5, 10)}`, randomString(6)],
  //     topUpWater: [`${randomInt(5, 10)}`, randomString(6)],
  //     trubChillerLoss: [`${randomInt(5, 10)}`, randomString(6)],
  //     evaporationRate: [`${randomFloat(1, 3, 2)}`, randomString(6)],
  //     kettleVol: [`${randomInt(5, 10)}`, randomString(6)],
  //     miscLoss: [`${randomFloat(0, 5)}`, randomString(6)],
  //     extractEfficiency: [`${randomFloat(50, 90, 2)}`, randomString(6)],
  //     grainAbsorptionRate: [`${randomFloat(0.1, 0.3, 2)}`, randomString(6)],
  //     hopUtilization: [`${randomFloat(50, 90, 2)}`, randomString(6)],
  //   };
  //   await runDataValidationTests(invalidTestData, testData, api, {
  //     url: `/breweries/${breweryUuid}/brewhouses/${brewhouseUuid}`,
  //     method: "patch",
  //   });
  // });

  // it("/breweries/:breweryUuid/brewhouses/:brewhouseUuid DELETE", async () => {
  //   const [breweryUuid] = userBreweries;
  //   const brewhouseUuid = fermentablesToDelete.pop();
  //   const response = await makeDeleteBrewhouseRequest(
  //     breweryUuid,
  //     brewhouseUuid
  //   );
  //   assert.strictEqual(response.status, "ok");
  //   const { brewhouses } = await makeGetBrewhousesRequest(breweryUuid);
  //   const uuids = brewhouses.map((brewhouse) => brewhouse.brewhouseUuid);
  //   assert(!uuids.includes(brewhouseUuid));
  // });

  // it("/breweries/:breweryUuid/brewhouses/:brewhouseId DELETE - input validation", async () => {
  //   const [validBreweryUuid] = userBreweries;
  //   const validBrewhouseUuid =
  //     fermentablesToDelete[fermentablesToDelete.length - 1];

  //   const missingBreweryUuid = void 0;
  //   await expectError(
  //     makeDeleteBrewhouseRequest(missingBreweryUuid, validBrewhouseUuid)
  //   );

  //   const invalidBreweryUuid = "invalidBreweryUuid";
  //   await expectError(
  //     makeDeleteBrewhouseRequest(invalidBreweryUuid, validBrewhouseUuid)
  //   );

  //   const validButWrongBreweryUuid = createUuid();
  //   await expectError(
  //     makeDeleteBrewhouseRequest(validButWrongBreweryUuid, validBrewhouseUuid)
  //   );

  //   const missingBrewhouseUuid = void 0;
  //   await expectError(
  //     makeDeleteBrewhouseRequest(validBreweryUuid, missingBrewhouseUuid)
  //   );

  //   const invalidBrewhouseUuid = "invalidBreweryUuid";
  //   await expectError(
  //     makeDeleteBrewhouseRequest(validBreweryUuid, invalidBrewhouseUuid)
  //   );

  //   const validButWrongBrewhouseUuid = createUuid();
  //   await expectError(
  //     makeDeleteBrewhouseRequest(validBreweryUuid, validButWrongBrewhouseUuid)
  //   );

  //   const realButMismatchedBrewhouseUuid = fermentablesToDelete[0];
  //   await expectError(
  //     makeDeleteBrewhouseRequest(
  //       validBreweryUuid,
  //       realButMismatchedBrewhouseUuid
  //     )
  //   );
  // });

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
