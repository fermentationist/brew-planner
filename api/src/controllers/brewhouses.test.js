/*global it, describe, before, after */
import assert from "assert";
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
import memCache from "../services/localCache.js";

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
    for (const name of randomBreweryNames) {
      const uuid = await createBrewery({ name });
      breweriesToDelete.push(uuid);
    }
    for (const name of randomBrewhouseNames) {
      const uuid = await createBrewhouse({
        ...snakeCaseBrewhouseData,
        name,
        brewery_uuid: breweriesToDelete[0],
        created_by: api.user.uid,
      });
      brewhousesToDelete.push(uuid);
    }
    memCache.invalidate(["brewery", "brewhouse"]);
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/brewhouses GET", async function () {
    const [breweryUuid] = breweriesToDelete;
    await api.signInAsNewUser({ role: "user", breweries: [breweryUuid] });
    const response = await api.request({
      url: `/breweries/${breweryUuid}/brewhouses`,
      method: "get",
    });
    assert.strictEqual(response.status, "ok");
    await verifyBrewhouseData(response.brewhouses);
    await api.deleteUser(); //cleanup
  });

  it("/breweries/:breweryUuid/brewhouses POST", async () => {
    const testData = await getBrewhouseTestData();
    console.log("testData:", testData)
    const existingBreweries = await getExistingBreweries();
    const existingBreweryUuids = existingBreweries.map(
      (brewery) => brewery.brewery_uuid
    );
    userBreweries = getRandomArrayMembers(existingBreweryUuids, 1);
    await api.signInAsNewUser({ role: "user", breweries: userBreweries });
    const response = await api.request({
      url: `/breweries/${userBreweries[0]}/brewhouses`,
      method: "post",
      data: testData,
    });
    assert.strictEqual(response.status, "ok");
    await confirmBrewhouseInsertion(response.brewhouseUuid, testData);
    brewhousesToDelete.push(response.brewhouseUuid);
    memCache.invalidate("brewhouse");
  });

  it("/breweries/:breweryUuid/brewhouses/:brewhouseUuid PATCH", async () => {
    const updateData = await getBrewhouseTestData();
    const brewhouseUuid = brewhousesToDelete[brewhousesToDelete.length - 1];
    console.log("brewhouseUuid:", brewhouseUuid);
    const response = await api.request({
      url: `/breweries/${userBreweries[0]}/brewhouses/${brewhouseUuid}`,
      method: "patch",
      data: updateData,
    });
    assert.strictEqual(response.status, "ok");
    await confirmBrewhouseInsertion(brewhouseUuid, updateData);
    await api.deleteUser();
  });

  // it("/breweries GET - admin", async function () {
  //   await api.signInAsNewUser({ role: "admin", breweries: [] });
  //   const response = await api.request({ url: "/breweries", method: "get" });
  //   const existingBreweryIds = await getExistingBreweryUuids();
  //   assert.strictEqual(response.breweries.length, existingBreweryIds.length); // returns all breweries
  //   await verifyBreweriesData(response.breweries);
  // });

  // it("/admin/breweries POST", async function () {
  //   const { breweryId } = await api.request({
  //     url: "/admin/breweries",
  //     method: "post",
  //     data: testData
  //   });
  //   console.log("testData.breweryId", testData.breweryId);
  //   assert.strictEqual(breweryId, testData.breweryId);
  //   await confirmBreweryData(testData);
  // });

  // it("/admin/breweries/:breweryId PATCH", async function () {
  //   const updatedData = {
  //     name: `New Test Brewery ${randomId}`,
  //     address: {
  //       street: "1060 W Addison",
  //       unit: "garden",
  //       city: "Chicago",
  //       state: "IL",
  //       zip: "60613",
  //       country: "United States"
  //     }
  //   };
  //   console.log("testData.breweryId", testData.breweryId);
  //   const response = await patchBrewery(testData.breweryId, updatedData);
  //   assert.strictEqual(response.status, "ok");
  //   await confirmBreweryData({ ...updatedData, breweryId: testData.breweryId });

  //   const singleFieldUpdate = {
  //     address: {
  //       street: "333 W 35th St"
  //     }
  //   };

  //   const singleFieldResponse = await patchBrewery(
  //     testData.breweryId,
  //     singleFieldUpdate
  //   );
  //   assert.strictEqual(singleFieldResponse.status, "ok");
  //   await confirmBreweryData({
  //     ...updatedData,
  //     address: {
  //       ...updatedData.address,
  //       street: singleFieldUpdate.address.street
  //     },
  //     breweryId: testData.breweryId
  //   });
  // });

  // it("/admin/breweries/:breweryId DELETE", async function () {
  //   const response = await api.request({
  //     url: `/admin/breweries/${testData.breweryId}`,
  //     method: "delete"
  //   });
  //   assert.strictEqual(response.status, "ok");
  //   await confirmBreweryDeletion(testData.breweryId);
  // });

  // it("/admin/breweries POST - input validation", async function () {
  //   const validationTestData = {
  //     name: testData.name,
  //     address: { ...testData.address }
  //   };

  //   const createBreweryInvalidData = {
  //     breweryId: [
  //       void 0,
  //       randomInt(11111, 99999),
  //       randomString(1),
  //       randomString(37)
  //     ],
  //     name: [void 0, randomString(31)],
  //     address: {
  //       street: [randomInt(1, 1000), randomString(101)],
  //       unit: [randomString(51)],
  //       city: [randomInt(1, 1000), randomString(51)],
  //       state: [randomInt(1, 1000), randomString(1), randomString(3)],
  //       zip: [randomInt(11111, 99999), randomString(5), "1234", "123456"],
  //       country: [randomInt(1, 1000), randomString(310)]
  //     }
  //   };

  //   await runDataValidationTests(
  //     createBreweryInvalidData,
  //     validationTestData,
  //     api,
  //     { url: "/admin/breweries", method: "post" }
  //   );
  // });

  // it("/admin/breweries/:breweryId PATCH - input validation", async function () {
  //   const validationTestData = {
  //     name: testData.name,
  //     address: { ...testData.address }
  //   };

  //   let invalidParams = "";
  //   await expectError(
  //     patchBrewery(invalidParams, validationTestData),
  //     null,
  //     "missing breweryId param"
  //   );

  //   invalidParams = 1; // too short
  //   await expectInvalidInput(
  //     patchBrewery(invalidParams, validationTestData),
  //     "invalid breweryId param"
  //   );

  //   invalidParams = randomString(37); // too long
  //   await expectInvalidInput(
  //     patchBrewery(invalidParams, validationTestData),
  //     "invalid breweryId param"
  //   );

  //   const patchBreweryInvalidData = {
  //     name: [randomString(31)],
  //     address: {
  //       street: [randomInt(1, 1000), randomString(101)],
  //       unit: [randomString(51)],
  //       city: [randomInt(1, 1000), randomString(51)],
  //       state: [randomInt(1, 1000), randomString(1), randomString(3)],
  //       zip: [randomInt(11111, 99999), randomString(5), "1234", "123456"],
  //       country: [randomInt(1, 1000), randomString(310)]
  //     }
  //   };

  //   await runDataValidationTests(
  //     patchBreweryInvalidData,
  //     validationTestData,
  //     api,
  //     {
  //       url: `/admin/breweries/${testData.breweryId}`,
  //       method: "patch"
  //     }
  //   );
  // });

  after(async () => {
    for (const breweryUuid of breweriesToDelete) {
      console.log("deleting test brewery:", breweryUuid);
      await deleteBrewery(breweryUuid);
    }
    for (const brewhouseUuid of brewhousesToDelete) {
      console.log("deleting test brewhouse:", brewhouseUuid);
      await deleteBrewhouse(brewhouseUuid);
    }
  });
});
