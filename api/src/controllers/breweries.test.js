/*global it, describe, before, after */
import assert from "assert";
import TestAPI from "../../test/TestAPI.js";
import { createBrewery, deleteBrewery } from "../services/brewery.js";
import {
  getExistingBreweries,
  getExistingBreweryIds,
  expectError,
  expectInvalidInput,
  runDataValidationTests
} from "../../test/testHelpers.js";
import {
  randomNum,
  randomString,
  getRandomArrayMembers
} from "../utils/helpers.js";
import memCache from "../services/localCache.js";

const api = new TestAPI();

//utility functions

const verifyBreweriesData = async breweriesData => {
  const existingBreweries = await getExistingBreweries();
  const existingBreweryIds = await getExistingBreweryIds();
  for (const brewery of breweriesData) {
    assert(existingBreweryIds.includes(brewery.breweryId));
    const [dbData] = existingBreweries.filter(
      existingBrewery => existingBrewery.brewery_id === brewery.breweryId
    );
    assert.strictEqual(brewery.name, dbData.name);
    assert.strictEqual(brewery.address.street, dbData.street);
    assert.strictEqual(brewery.address.unit, dbData.unit);
    assert.strictEqual(brewery.address.city, dbData.city);
    assert.strictEqual(brewery.address.state, dbData.state);
    assert.strictEqual(brewery.address.zip, dbData.zip);
    assert.strictEqual(brewery.address.country, dbData.country);
  }
};

const confirmBreweryData = async inputData => {
  const existingBreweries = await getExistingBreweries();
  const [dbData] = existingBreweries.filter(
    existingBrewery => existingBrewery.brewery_id === inputData.breweryId
  );
  assert.strictEqual(inputData.name, dbData.name);
  assert.strictEqual(inputData.breweryId, dbData.brewery_id);
  assert.strictEqual(inputData.address.street, dbData.street);
  assert.strictEqual(inputData.address.unit, dbData.unit);
  assert.strictEqual(inputData.address.city, dbData.city);
  assert.strictEqual(inputData.address.state, dbData.state);
  assert.strictEqual(inputData.address.zip, dbData.zip);
  assert.strictEqual(inputData.address.country, dbData.country);
};

const confirmBreweryDeletion = async breweryId => {
  const existingBreweries = await getExistingBreweries();
  const match = existingBreweries.filter(
    existingBrewery => existingBrewery.brewery_id === breweryId
  );
  assert.strictEqual(match.length, 0);
};

const patchBrewery = (breweryId, data) => {
  return api.request({
    url: `/admin/breweries/${breweryId}`,
    method: "patch",
    data: data
  });
};

// TESTS

export default describe("brewery routes", function () {
  const randomId = randomString(6);
  const testData = {
    name: `Test Brewery ${randomId}`,
    breweryId: randomId,
    address: {
      street: "6428 N Ridgeway Av",
      unit: null,
      city: "Lincolnwood",
      state: "IL",
      zip: "60712",
      country: "United States"
    }
  };
  // For these tests to work, there need to be test breweries in the database
  const breweryIds = [randomString(6), randomString(6), randomString(6)];

  before(async function () {
    //create test breweries
    for (const breweryId of breweryIds) {
      const name = `Test Brewery ${breweryId}`;
      console.log("creating test brewery:", name);
      await createBrewery({ name, breweryId });
    }
    // since these are created directly through the db, need to invalidate cached table
    memCache.invalidate("brewery");
  });

  it("/breweries GET - user", async function () {
    const existingBreweryIds = await getExistingBreweryIds();
    const userBreweries = getRandomArrayMembers(
      existingBreweryIds,
      Math.min(existingBreweryIds.length, randomNum(1, 4))
    );
    await api.signInAsNewUser({ role: "user", breweries: userBreweries });
    const response = await api.request({ url: "/breweries", method: "get" });
    await verifyBreweriesData(response.breweries);
    await api.deleteUser(); //cleanup
  });

  it("/breweries GET - admin", async function () {
    await api.signInAsNewUser({ role: "admin", breweries: [] });
    const response = await api.request({ url: "/breweries", method: "get" });
    const existingBreweryIds = await getExistingBreweryIds();
    assert.strictEqual(response.breweries.length, existingBreweryIds.length); // returns all breweries
    await verifyBreweriesData(response.breweries);
  });

  it("/admin/breweries POST", async function () {
    const { breweryId } = await api.request({
      url: "/admin/breweries",
      method: "post",
      data: testData
    });
    console.log("testData.breweryId", testData.breweryId);
    assert.strictEqual(breweryId, testData.breweryId);
    await confirmBreweryData(testData);
  });

  it("/admin/breweries/:breweryId PATCH", async function () {
    const updatedData = {
      name: `New Test Brewery ${randomId}`,
      address: {
        street: "1060 W Addison",
        unit: "garden",
        city: "Chicago",
        state: "IL",
        zip: "60613",
        country: "United States"
      }
    };
    console.log("testData.breweryId", testData.breweryId);
    const response = await patchBrewery(testData.breweryId, updatedData);
    assert.strictEqual(response.status, "ok");
    await confirmBreweryData({ ...updatedData, breweryId: testData.breweryId });

    const singleFieldUpdate = {
      address: {
        street: "333 W 35th St"
      }
    };

    const singleFieldResponse = await patchBrewery(
      testData.breweryId,
      singleFieldUpdate
    );
    assert.strictEqual(singleFieldResponse.status, "ok");
    await confirmBreweryData({
      ...updatedData,
      address: {
        ...updatedData.address,
        street: singleFieldUpdate.address.street
      },
      breweryId: testData.breweryId
    });
  });

  it("/admin/breweries/:breweryId DELETE", async function () {
    const response = await api.request({
      url: `/admin/breweries/${testData.breweryId}`,
      method: "delete"
    });
    assert.strictEqual(response.status, "ok");
    await confirmBreweryDeletion(testData.breweryId);
  });

  it("/admin/breweries POST - input validation", async function () {
    const validationTestData = {
      name: testData.name,
      address: { ...testData.address }
    };

    const createBreweryInvalidData = {
      breweryId: [
        void 0,
        randomNum(11111, 99999),
        randomString(1),
        randomString(37)
      ],
      name: [void 0, randomString(31)],
      address: {
        street: [randomNum(1, 1000), randomString(101)],
        unit: [randomString(51)],
        city: [randomNum(1, 1000), randomString(51)],
        state: [randomNum(1, 1000), randomString(1), randomString(3)],
        zip: [randomNum(11111, 99999), randomString(5), "1234", "123456"],
        country: [randomNum(1, 1000), randomString(310)]
      }
    };

    await runDataValidationTests(
      createBreweryInvalidData,
      validationTestData,
      api,
      { url: "/admin/breweries", method: "post" }
    );
  });

  it("/admin/breweries/:breweryId PATCH - input validation", async function () {
    const validationTestData = {
      name: testData.name,
      address: { ...testData.address }
    };

    let invalidParams = "";
    await expectError(
      patchBrewery(invalidParams, validationTestData),
      null,
      "missing breweryId param"
    );

    invalidParams = 1; // too short
    await expectInvalidInput(
      patchBrewery(invalidParams, validationTestData),
      "invalid breweryId param"
    );

    invalidParams = randomString(37); // too long
    await expectInvalidInput(
      patchBrewery(invalidParams, validationTestData),
      "invalid breweryId param"
    );

    const patchBreweryInvalidData = {
      name: [randomString(31)],
      address: {
        street: [randomNum(1, 1000), randomString(101)],
        unit: [randomString(51)],
        city: [randomNum(1, 1000), randomString(51)],
        state: [randomNum(1, 1000), randomString(1), randomString(3)],
        zip: [randomNum(11111, 99999), randomString(5), "1234", "123456"],
        country: [randomNum(1, 1000), randomString(310)]
      }
    };

    await runDataValidationTests(
      patchBreweryInvalidData,
      validationTestData,
      api,
      {
        url: `/admin/breweries/${testData.breweryId}`,
        method: "patch"
      }
    );
  });

  after(async () => {
    for (const breweryId of breweryIds) {
      console.log("deleting test brewery:", breweryId);
      await deleteBrewery(breweryId);
    }
  });
});
