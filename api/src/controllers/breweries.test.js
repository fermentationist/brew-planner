/*global it, describe, before, after */
import assert from "assert";
import TestAPI from "../../test/TestAPI.js";
import {
  expectError,
  expectInvalidInput,
  runDataValidationTests,
  getEntityFactory,
  deleteEntityFactory,
  createEntityFactory
} from "../../test/testHelpers.js";
import {
  randomInt,
  randomString,
  getRandomArrayMembers
} from "../utils/helpers.js";
import {v1 as uuidV1} from "uuid";
import localCache from "../services/localCache/index.js";

const api = new TestAPI();

//utility functions

const createBrewery = createEntityFactory("brewery");

const deleteBrewery = deleteEntityFactory("brewery");

const getExistingBreweries = getEntityFactory("brewery");

const verifyBreweriesData = async breweriesData => {
  const existingBreweries = await getExistingBreweries();
  const existingBreweryUuids = existingBreweries.map(brewery => brewery.brewery_uuid);
  for (const brewery of breweriesData) {
    assert(existingBreweryUuids.includes(brewery.breweryUuid));
    const [dbData] = existingBreweries.filter(
      existingBrewery => existingBrewery.brewery_uuid === brewery.breweryUuid
    );
    assert.strictEqual(brewery.name, dbData.name);
    assert.strictEqual(brewery.street, dbData.street);
    assert.strictEqual(brewery.unit, dbData.unit);
    assert.strictEqual(brewery.city, dbData.city);
    assert.strictEqual(brewery.stateOrProvince, dbData.state_or_province);
    assert.strictEqual(brewery.postalCode, dbData.postal_code);
    assert.strictEqual(brewery.country, dbData.country);
  }
};

const confirmBreweryData = async inputData => {
  const existingBreweries = await getExistingBreweries();
  const [dbData] = existingBreweries.filter(
    existingBrewery => existingBrewery.brewery_uuid === inputData.breweryUuid
  );
  assert.strictEqual(inputData.name, dbData.name);
  assert.strictEqual(inputData.breweryUuid, dbData.brewery_uuid);
  assert.strictEqual(inputData.street, dbData.street);
  assert.strictEqual(inputData.unit, dbData.unit);
  assert.strictEqual(inputData.city, dbData.city);
  assert.strictEqual(inputData.stateOrProvince, dbData.state_or_province);
  assert.strictEqual(inputData.postalCode, dbData.postal_code);
  assert.strictEqual(inputData.country, dbData.country);
};

const confirmBreweryDeletion = async breweryUuid => {
  const existingBreweries = await getExistingBreweries();
  const match = existingBreweries.filter(
    existingBrewery => existingBrewery.brewery_uuid === breweryUuid
  );
  assert.strictEqual(match.length, 0);
};

const patchBrewery = (breweryUuid, data) => {
  return api.request({
    url: `/admin/breweries/${breweryUuid}`,
    method: "patch",
    data: data
  });
};

// TESTS

export default describe("brewery routes", function () {
  const randomId = uuidV1();
  const randomName = randomString(6);
  const testData = {
    name: `Test Brewery ${randomName}`,
    breweryUuid: randomId,
    street: "6428 N Ridgeway Av",
    unit: null,
    city: "Lincolnwood",
    stateOrProvince: "IL",
    postalCode: "60712",
    country: "United States",
    isPrivate: false
  };
  // For these tests to work, there need to be test breweries in the database
  const breweryNames = [randomString(6), randomString(6), randomString(6)];
  const breweriesToDelete = [];
  before(async function () {
    //create test breweries
    for (const breweryName of breweryNames) {
      const name = `Test Brewery ${breweryName}`;
      console.log("creating test brewery:", name);
      const breweryUuid = await createBrewery({ name });
      breweriesToDelete.push(breweryUuid);
    }
    // since these are created directly through the db, need to invalidate cached table
    localCache.invalidate("brewery");
  });

  it("/breweries GET - user", async function () {
    const existingBreweries = await getExistingBreweries();
    const existingBreweryUuids = existingBreweries.map(brewery => brewery.brewery_uuid);
    const userBreweries = getRandomArrayMembers(
      existingBreweryUuids,
      Math.min(existingBreweryUuids.length, randomInt(1, 4))
    );
    await api.signInAsNewUser({ role: "user", breweries: userBreweries });
    const response = await api.request({ url: "/breweries", method: "get" });
    await verifyBreweriesData(response.breweries);
    await api.deleteUser(); //cleanup
  });

  it("/breweries GET - admin", async function () {
    await api.signInAsNewUser({ role: "admin", breweries: [] });
    const response = await api.request({ url: "/breweries", method: "get" });
    const existingBreweries = await getExistingBreweries();
    const existingBreweryUuids = existingBreweries.map(brewery => brewery.brewery_uuid);
    assert.strictEqual(response.breweries.length, existingBreweryUuids.length); // returns all breweries
    await verifyBreweriesData(response.breweries);
  });

  it("/admin/breweries POST", async function () {
    const { uuid } = await api.request({
      url: "/admin/breweries",
      method: "post",
      data: testData
    });
    assert.strictEqual(uuid, testData.breweryUuid);
    await confirmBreweryData(testData);
    localCache.invalidate("brewery");
  });

  it("/admin/breweries/:breweryUuid PATCH", async function () {
    const updatedData = {
      name: `New Test Brewery ${randomName}`,
      street: "1060 W Addison",
      unit: "garden",
      city: "Chicago",
      stateOrProvince: "IL",
      postalCode: "60613",
      country: "United States"
    };
    const response = await patchBrewery(testData.breweryUuid, updatedData);
    assert.strictEqual(response.status, "ok");
    await confirmBreweryData({ ...updatedData, breweryUuid: testData.breweryUuid });

    const streetUpdate = {street: "333 W 35th St"};

    const singleFieldResponse = await patchBrewery(
      testData.breweryUuid,
      streetUpdate
    );
    assert.strictEqual(singleFieldResponse.status, "ok");
    await confirmBreweryData({
      ...updatedData,
      ...streetUpdate,
      breweryUuid: testData.breweryUuid
    });
  });

  it("/admin/breweries/:breweryUuid DELETE", async function () {
    const response = await api.request({
      url: `/admin/breweries/${testData.breweryUuid}`,
      method: "delete"
    });
    assert.strictEqual(response.status, "ok");
    await confirmBreweryDeletion(testData.breweryUuid);
  });

  it("/admin/breweries POST - input validation", async function () {
    const validationTestData = {...testData};
    delete validationTestData.breweryUuid;
    const createBreweryInvalidData = {
      breweryUuid: [
        randomInt(11111, 99999),
        randomString(1),
        randomString(37)
      ],
      name: [void 0, randomString(31)],
      street: [randomInt(1, 1000), randomString(101)],
      unit: [randomString(51)],
      city: [randomInt(1, 1000), randomString(51)],
      stateOrProvince: [randomInt(1, 1000), randomString(1), randomString(3)],
      postalCode: [randomInt(11111, 99999), randomString(5, true), "1234", "123456"],
      country: [randomInt(1, 1000), randomString(310)]
    };

    await runDataValidationTests(
      createBreweryInvalidData,
      validationTestData,
      api,
      { url: "/admin/breweries", method: "post" }
    );
  });

  it("/admin/breweries/:breweryUuid PATCH - input validation", async function () {
    const validationTestData = {...testData};
    delete validationTestData.breweryUuid;

    let invalidParams = "";
    await expectError(
      patchBrewery(invalidParams, validationTestData),
      null,
      "missing breweryUuid param"
    );

    invalidParams = 1; // too short
    await expectInvalidInput(
      patchBrewery(invalidParams, validationTestData),
      "invalid breweryUuid param"
    );

    invalidParams = randomString(37); // too long
    await expectInvalidInput(
      patchBrewery(invalidParams, validationTestData),
      "invalid breweryUuid param"
    );

    const patchBreweryInvalidData = {
      name: [randomString(31)],
      street: [randomInt(1, 1000), randomString(101)],
      unit: [randomString(51)],
      city: [randomInt(1, 1000), randomString(51)],
      stateOrProvince: [randomInt(1, 1000), randomString(1), randomString(3)],
      postalCode: [randomInt(11111, 99999), randomString(5, true), "1234", "123456"],
      country: [randomInt(1, 1000), randomString(310)]
    };

    await runDataValidationTests(
      patchBreweryInvalidData,
      validationTestData,
      api,
      {
        url: `/admin/breweries/${testData.breweryUuid}`,
        method: "patch"
      }
    );
  });

  after(async () => {
    for (const breweryUuid of breweriesToDelete) {
      console.log("deleting test brewery:", breweryUuid);
      await deleteBrewery(breweryUuid);
    }
  });
});
