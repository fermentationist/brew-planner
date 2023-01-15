/*global it, describe, before, after */
import assert from "assert";
import {v1 as createUuid} from "uuid";
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
} from "../utils/helpers.js";
import * as userService from "../services/user.js";
import localCache from "../services/localCache/index.js";

const api = new TestAPI();

//utility functions
const createBrewery = createEntityFactory("brewery");
const deleteBrewery = deleteEntityFactory("brewery");
const createBrewhouse = createEntityFactory("brewhouse");
const deleteBrewhouse = deleteEntityFactory("brewhouse");
const getExistingBreweries = getEntityFactory("brewery");
const getExistingBrewhouses = getEntityFactory("brewhouse");

const verifyBrewhouseData = async (brewhousesData) => {
  const existingBrewhouses = await getExistingBrewhouses();
  const existingBrewhouseUuids = existingBrewhouses.map(
    (brewhouse) => brewhouse.brewhouse_uuid
  );
  for (const brewhouse of brewhousesData) {
    assertEqualIfCondition(
      brewhouse.brewhouseUuid,
      existingBrewhouseUuids.includes(brewhouse.brewhouseUuid),
      true
    );
    const [dbData] = existingBrewhouses.filter(
      (existingBrewhouse) =>
        existingBrewhouse.brewhouse_uuid === brewhouse.brewhouseUuid
    );
    assert.strictEqual(brewhouse.name, dbData.name);
    assert.strictEqual(brewhouse.batchSize, dbData.batch_size);
    assert.strictEqual(brewhouse.tunVolume, dbData.tun_volume);
    assert.strictEqual(brewhouse.tunWeight, dbData.tun_weight);
    assert.strictEqual(brewhouse.tunLoss, dbData.tun_loss);
    assert.strictEqual(brewhouse.tunSpecificHeat, dbData.tun_specific_heat);
    assert.strictEqual(brewhouse.lauterDeadspace, dbData.lauter_deadspace);
    assert.strictEqual(brewhouse.topUpWater, dbData.top_up_water);
    assert.strictEqual(brewhouse.trubChillerLoss, dbData.trub_chiller_loss);
    assert.strictEqual(brewhouse.evaporationRate, dbData.evaporation_rate);
    assert.strictEqual(brewhouse.kettleVol, dbData.kettle_vol);
    assert.strictEqual(brewhouse.miscLoss, dbData.misc_loss);
    assert.strictEqual(brewhouse.extractEfficiency, dbData.extract_efficiency);
    assert.strictEqual(
      brewhouse.grainAbsorptionRate,
      dbData.grain_absorption_rate
    );
    assert.strictEqual(brewhouse.hopUtilization, dbData.hop_utilization);
  }
};

const confirmBrewhouseInsertion = async (brewhouseUuid, brewhouseData) => {
  const [dbData] = await getExistingBrewhouses(brewhouseUuid);
  assert.strictEqual(brewhouseData.name, dbData.name);
  assert.strictEqual(brewhouseData.batchSize, dbData.batch_size);
  assert.strictEqual(brewhouseData.tunVolume, dbData.tun_volume);
  assert.strictEqual(brewhouseData.tunWeight, dbData.tun_weight);
  assert.strictEqual(brewhouseData.tunLoss, dbData.tun_loss);
  assert.strictEqual(brewhouseData.tunSpecificHeat, dbData.tun_specific_heat);
  assert.strictEqual(brewhouseData.lauterDeadspace, dbData.lauter_deadspace);
  assert.strictEqual(brewhouseData.topUpWater, dbData.top_up_water);
  assert.strictEqual(brewhouseData.trubChillerLoss, dbData.trub_chiller_loss);
  assert.strictEqual(brewhouseData.evaporationRate, dbData.evaporation_rate);
  assert.strictEqual(brewhouseData.kettleVol, dbData.kettle_vol);
  assert.strictEqual(brewhouseData.miscLoss, dbData.misc_loss);
  assert.strictEqual(
    brewhouseData.extractEfficiency,
    dbData.extract_efficiency
  );
  assert.strictEqual(
    brewhouseData.grainAbsorptionRate,
    dbData.grain_absorption_rate
  );
  assert.strictEqual(brewhouseData.hopUtilization, dbData.hop_utilization);
};

const getBrewhouseTestData = async () => {
  const users = await userService.getAllUsers();
  const [randomUser] = getRandomArrayMembers(users, 1);
  return {
    name: `Test brewhouse ${randomString(6)}`,
    createdBy: randomUser.uid,
    batchSize: randomInt(1, 20),
    tunVolume: randomInt(10, 20),
    tunWeight: randomInt(20, 60),
    tunLoss: randomInt(0, 5),
    tunSpecificHeat: randomInt(0, 5),
    lauterDeadspace: randomInt(0, 5),
    topUpWater: randomInt(0, 5),
    trubChillerLoss: randomInt(0, 5),
    evaporationRate: randomFloat(1, 3, 2),
    kettleVol: randomInt(5, 20),
    miscLoss: randomFloat(0, 5, 2),
    extractEfficiency: randomInt(50, 90),
    grainAbsorptionRate: randomFloat(0.1, 0.3, 2),
    hopUtilization: randomInt(50, 90),
  };
};

const makeGetBrewhousesRequest = breweryUuid => api.request({
  url: `/breweries/${breweryUuid}/brewhouses`,
  method: "get",
});

const makeCreateBrewhouseRequest = (breweryUuid, data) => api.request({
  url: `/breweries/${breweryUuid}/brewhouses`,
  method: "post",
  data
});

const makeDeleteBrewhouseRequest = (breweryUuid, brewhouseUuid) => api.request({url: `/breweries/${breweryUuid}/brewhouses/${brewhouseUuid}`, method: "delete"});

// TESTS
export default describe("brewhouse routes", function () {
  const breweriesToDelete = [],
    brewhousesToDelete = [];
  let userBreweries;
  const snakeCaseBrewhouseData = {
    batch_size: 6,
    tun_volume: 10,
    tun_weight: 20,
    tun_loss: 0,
    tun_specific_heat: 0,
    lauter_deadspace: 0,
    top_up_water: 0,
    trub_chiller_loss: 0,
    evaporation_rate: 2.84,
    kettle_vol: 9,
    misc_loss: 0,
    extract_efficiency: 62,
    grain_absorption_rate: 0.27,
    hop_utilization: 75,
  };

  before(async () => {
    const randomNames = [randomString(6), randomString(6), randomString(6)];
    const randomBreweryNames = randomNames.map((rnd) => `Test brewery ${rnd}`);
    const randomBrewhouseNames = randomNames.map(
      (rnd) => `Test brewhouse ${rnd.split("").reverse().join("")}`
    );
    await api.signInAsNewUser({ role: "user" });
    // create 3 test breweries
    for (const name of randomBreweryNames) {
      const uuid = await createBrewery({ name });
      breweriesToDelete.push(uuid);
      // create 3 test brewhouses for each brewery
      for (const name of randomBrewhouseNames) {
        const brewhouseUuid = await createBrewhouse({
          ...snakeCaseBrewhouseData,
          name,
          brewery_uuid: uuid,
          created_by: api.user.uid,
        });
        brewhousesToDelete.push(brewhouseUuid);
      }
    }
    // now create a brewhouse with a different brewery
    localCache.invalidate(["brewery", "brewhouse"]);
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/brewhouses GET", async function () {
    const [breweryUuid] = breweriesToDelete;
    await api.signInAsNewUser({ role: "user", breweries: [breweryUuid] });
    const response = await makeGetBrewhousesRequest(breweryUuid);
    assert.strictEqual(response.status, "ok");
    await verifyBrewhouseData(response.brewhouses);
    const brewhouseUuids = response.brewhouses.map(brewhouse => brewhouse.brewhouseUuid);
    for (const createdUuid of brewhousesToDelete.slice(0, 3)) {
      assert(brewhouseUuids.includes(createdUuid));
    }
  });

  it("/breweries/:breweryUuid/brewhouses GET - input validation", async () => {
    const missingUuid = void 0;
    await expectError(makeGetBrewhousesRequest(missingUuid));
    const invalidUuid = "invalidUuid";
    await expectError(makeGetBrewhousesRequest(invalidUuid));
    const randomButValidUuid = createUuid();
    await expectError(makeGetBrewhousesRequest(randomButValidUuid));
    const wrongBreweryUuid = breweriesToDelete[1];
    await expectError(makeGetBrewhousesRequest(wrongBreweryUuid));
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/brewhouses POST", async () => {
    const testData = await getBrewhouseTestData();
    const existingBreweries = await getExistingBreweries();
    const existingBreweryUuids = existingBreweries.map(
      (brewery) => brewery.brewery_uuid
    );
    userBreweries = [breweriesToDelete[breweriesToDelete.length - 1]];
    await api.signInAsNewUser({ role: "user", breweries: userBreweries });
    const response = await makeCreateBrewhouseRequest(userBreweries[0], testData);
    assert.strictEqual(response.status, "ok");
    await confirmBrewhouseInsertion(response.brewhouseUuid, testData);
    brewhousesToDelete.push(response.brewhouseUuid);
    localCache.invalidate("brewhouse");
  });

  it("/breweries/:breweryUuid/brewhouses POST - with user provided UUID", async () => {
    const testData = await getBrewhouseTestData();
    const brewhouseUuid = createUuid();
    testData.brewhouseUuid = brewhouseUuid;
    const response = await makeCreateBrewhouseRequest(userBreweries[0], testData);
    assert.strictEqual(response.status, "ok");
    assert.strictEqual(response.brewhouseUuid, brewhouseUuid);
    await confirmBrewhouseInsertion(response.brewhouseUuid, testData);
    brewhousesToDelete.push(response.brewhouseUuid);
    localCache.invalidate("brewhouse");
  });

  it("/breweries/:breweryUuid/brewhouses POST - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const testData = await getBrewhouseTestData();
    const invalidTestData = {
      name: [void 0, "", randomString(101)],
      createdBy: [void 0, randomString(36), randomInt(999999)],
      batchSize: [void 0, `${randomInt(5, 10)}`, randomString(6)],
      tunVolume: [void 0, `${randomInt(5, 10)}`, randomString(6)],
      tunWeight: [void 0, `${randomInt(5, 10)}`, randomString(6)],
      tunLoss: [`${randomInt(5, 10)}`, randomString(6)],
      tunSpecificHeat: [void 0, `${randomInt(5, 10)}`, randomString(6)],
      lauterDeadspace: [`${randomInt(5, 10)}`, randomString(6)],
      topUpWater: [`${randomInt(5, 10)}`, randomString(6)],
      trubChillerLoss: [`${randomInt(5, 10)}`, randomString(6)],
      evaporationRate: [void 0, `${randomFloat(1, 3, 2)}`, randomString(6)],
      kettleVol: [void 0, `${randomInt(5, 10)}`, randomString(6)],
      miscLoss: [`${randomFloat(0, 5)}`, randomString(6)],
      extractEfficiency: [void 0, `${randomFloat(50, 90, 2)}`, randomString(6)],
      grainAbsorptionRate: [void 0, `${randomFloat(0.1, 0.3, 2)}`, randomString(6)],
      hopUtilization: [void 0, `${randomFloat(50, 90, 2)}`, randomString(6)],
    }
    await runDataValidationTests(invalidTestData, testData, api, {url: `/breweries/${breweryUuid}/brewhouses`, method: "post"});
  });

  it("/breweries/:breweryUuid/brewhouses/:brewhouseUuid PATCH", async () => {
    const updateData = await getBrewhouseTestData();
    const brewhouseUuid = brewhousesToDelete[brewhousesToDelete.length - 1];
    const response = await api.request({
      url: `/breweries/${userBreweries[0]}/brewhouses/${brewhouseUuid}`,
      method: "patch",
      data: updateData,
    });
    assert.strictEqual(response.status, "ok");
    await confirmBrewhouseInsertion(brewhouseUuid, updateData);
  });

  it("/breweries/:breweryUuid/brewhouses/:brewhouseUuid PATCH - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const brewhouseUuid = brewhousesToDelete[brewhousesToDelete.length - 1];
    const testData = await getBrewhouseTestData();
    const invalidTestData = {
      name: ["", randomString(101)],
      // createdBy: [randomString(36), randomInt(999999)], // cannot be updated
      batchSize: [`${randomInt(5, 10)}`, randomString(6)],
      tunVolume: [`${randomInt(5, 10)}`, randomString(6)],
      tunWeight: [`${randomInt(5, 10)}`, randomString(6)],
      tunLoss: [`${randomInt(5, 10)}`, randomString(6)],
      tunSpecificHeat: [`${randomInt(5, 10)}`, randomString(6)],
      lauterDeadspace: [`${randomInt(5, 10)}`, randomString(6)],
      topUpWater: [`${randomInt(5, 10)}`, randomString(6)],
      trubChillerLoss: [`${randomInt(5, 10)}`, randomString(6)],
      evaporationRate: [`${randomFloat(1, 3, 2)}`, randomString(6)],
      kettleVol: [`${randomInt(5, 10)}`, randomString(6)],
      miscLoss: [`${randomFloat(0, 5)}`, randomString(6)],
      extractEfficiency: [`${randomFloat(50, 90, 2)}`, randomString(6)],
      grainAbsorptionRate: [`${randomFloat(0.1, 0.3, 2)}`, randomString(6)],
      hopUtilization: [`${randomFloat(50, 90, 2)}`, randomString(6)],
    }
    await runDataValidationTests(invalidTestData, testData, api, {url: `/breweries/${breweryUuid}/brewhouses/${brewhouseUuid}`, method: "patch"});
  });

  it("/breweries/:breweryUuid/brewhouses/:brewhouseUuid DELETE", async () => {
    const [breweryUuid] = userBreweries;
    const brewhouseUuid = brewhousesToDelete.pop();
    const response = await makeDeleteBrewhouseRequest(breweryUuid, brewhouseUuid);
    assert.strictEqual(response.status, "ok");
    const {brewhouses} = await makeGetBrewhousesRequest(breweryUuid);
    const uuids = brewhouses.map(brewhouse => brewhouse.brewhouseUuid);
    assert(!uuids.includes(brewhouseUuid));
  });

  it("/breweries/:breweryId/brewhouses/:brewhouseId DELETE - input validation", async () => {
    const [validBreweryUuid] = userBreweries;
    const validBrewhouseUuid = brewhousesToDelete[brewhousesToDelete.length - 1];

    const missingBreweryUuid = void 0;
    await expectError(makeDeleteBrewhouseRequest(missingBreweryUuid, validBrewhouseUuid));

    const invalidBreweryUuid = "invalidBreweryUuid";
    await expectError(makeDeleteBrewhouseRequest(invalidBreweryUuid, validBrewhouseUuid));

    const validButWrongBreweryUuid = createUuid();
    await expectError(makeDeleteBrewhouseRequest(validButWrongBreweryUuid, validBrewhouseUuid));

    const missingBrewhouseUuid = void 0;
    await expectError(makeDeleteBrewhouseRequest(validBreweryUuid, missingBrewhouseUuid));

    const invalidBrewhouseUuid = "invalidBreweryUuid";
    await expectError(makeDeleteBrewhouseRequest(validBreweryUuid, invalidBrewhouseUuid));

    const validButWrongBrewhouseUuid = createUuid();
    await expectError(makeDeleteBrewhouseRequest(validBreweryUuid, validButWrongBrewhouseUuid));

    const realButMismatchedBrewhouseUuid = brewhousesToDelete[0];
    await expectError(makeDeleteBrewhouseRequest(validBreweryUuid, realButMismatchedBrewhouseUuid));
  })

  after(async () => {
    await api.deleteUser();
    for (const breweryUuid of breweriesToDelete) {
      await deleteBrewery(breweryUuid);
    }
    for (const brewhouseUuid of brewhousesToDelete) {
      await deleteBrewhouse(brewhouseUuid);
    }
  });
});
