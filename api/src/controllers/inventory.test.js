/* global it, describe, before, after */
import TestAPI from "../../test/TestAPI.js";
import assert from "assert";
import {
  deleteInventory,
  deleteVariant,
  expectError,
  getExistingSKUs,
  getExistingBreweryIds,
  createTestVariant,
  getInventoryData,
  runDataValidationTests,
  assertEqualIfExists
} from "../../test/testHelpers.js";
import {
  getRandomArrayMembers,
  randomNum,
  randomString
} from "../utils/helpers.js";
import memCache from "../services/localCache.js";

const api = new TestAPI();

// helper functions

const randomButNotZero = (min, max) => {
  let num = randomNum(min, max);
  while (num === 0) {
    num = randomNum(min, max);
  }
  return num;
};

const validateInventoryArray = invArray => {
  return invArray.map(invObj => {
    assert(invObj.inventory.hasOwnProperty("allocated"));
    assert.strictEqual(typeof invObj.inventory.available, "number");
    assert(invObj.inventory.hasOwnProperty("price"));
    assert.strictEqual(typeof invObj.brewery.breweryId, "string");
    assert.strictEqual(typeof invObj.brewery.name, "string");
    assert.strictEqual(typeof invObj.brewery.addedAt, "number");
    assert.strictEqual(typeof invObj.brewery.address, "object");
    assert(invObj.brewery.address.hasOwnProperty("street"));
    assert(invObj.brewery.address.hasOwnProperty("unit"));
    assert(invObj.brewery.address.hasOwnProperty("city"));
    assert(invObj.brewery.address.hasOwnProperty("state"));
    assert(invObj.brewery.address.hasOwnProperty("zip"));
    assert(invObj.brewery.address.hasOwnProperty("country"));
    assert.strictEqual(typeof invObj.variant.variantName, "string");
    assert.strictEqual(typeof invObj.variant.fullname, "string");
    assert.strictEqual(typeof invObj.variant.sku, "string");
    assert.strictEqual(typeof invObj.variant.addedAt, "number");
    assert.strictEqual(typeof invObj.variant.productName, "string");
    assert.strictEqual(typeof invObj.variant.brandName, "string");
  });
};

const verifyInventoryData = async (reqData, inventoryId, breweryId) => {
  const [inventoryData] = await getInventoryData(inventoryId);
  assert.strictEqual(inventoryData.brewery.brewery_id, breweryId);
  assert(inventoryData.inventory.added_at instanceof Date);
  assertEqualIfExists(reqData.quantity, inventoryData.inventory.available);
  assertEqualIfExists(reqData.price, inventoryData.inventory.price);
  assertEqualIfExists(reqData.sku, inventoryData.variant.sku);
};

const confirmStockQuantityChange = async (inventoryId, newQty) => {
  const [inventoryData] = await getInventoryData(inventoryId);
  assert.strictEqual(inventoryData.inventory.available, newQty);
};

const validateInventoryChangeArray = invChangeArray => {
  return invChangeArray.map(invChange => {
    assert.strictEqual(typeof invChange.qtyDiff, "number");
    assert.strictEqual(typeof invChange.changedAt, "number");
    assertEqualIfExists(invChange.reason && typeof invChange.reason, "string");
    assertEqualIfExists(invChange.note && typeof invChange.note, "string");
    assert.strictEqual(typeof invChange.sku, "string");
  });
};

const postInventory = (breweryId, data) => {
  return api.request({
    url: `/breweries/${breweryId}/inventory`,
    method: "post",
    data
  });
};

const patchInventory = (breweryId, inventoryId, reqData) => {
  return api.request({
    url: `/breweries/${breweryId}/inventory/${inventoryId}`,
    method: "patch",
    data: reqData
  });
};

const postInventoryChange = (breweryId, changeData) => {
  return api.request({
    url: `/breweries/${breweryId}/inventoryChange`,
    method: "post",
    data: changeData
  });
};

const getInventoryChanges = (breweryId, sku) => {
  return api.request({
    url: `/breweries/${breweryId}/inventoryChange${sku ? "?sku=" + sku : ""}`,
    method: "get"
  });
}

// TESTS
export default describe("inventory routes", function () {
  let existingBreweryIds = [];
  const inventoryToDelete = [],
    variantsToDelete = [];

  before(async function () {
    existingBreweryIds = await getExistingBreweryIds();
  });

  it("unauthorized (non-admin) request to /breweries/inventory fails", async function () {
    await api.signInAsNewUser({ role: "user" });
    await expectError(
      api.request({ url: "/breweries/inventory", method: "get" }),
      "forbidden"
    );
  });

  it("authorized (admin) request to /breweries/inventory succeeds", async function () {
    await api.updateUserAuthClaims({ role: "admin" });
    const response = await api
      .request({
        url: "/breweries/inventory",
        method: "get"
      })
      .catch(err => console.error(err));
    assert.strictEqual(response.status, "ok");
    assert(Array.isArray(response.inventory));
    await validateInventoryArray(response.inventory);
    await api.deleteUser(); // cleanup
  });

  it("/breweries/:breweryId/inventory GET", async function () {
    const [breweryId] = getRandomArrayMembers(existingBreweryIds, 1);
    await api.signInAsNewUser({ breweries: [breweryId] });
    const response = await api.request({
      url: `/breweries/${breweryId}/inventory`,
      method: "get"
    });

    assert.strictEqual(response.status, "ok");
    assert(Array.isArray(response.inventory));
    await validateInventoryArray(response.inventory);
  });

  it("/breweries/:breweryId/inventory POST", async function () {
    const [breweryId] = api.user.breweries;
    const newSKU = await createTestVariant();
    const testData = {
      sku: newSKU,
      quantity: randomNum(0, 100),
      price: randomNum(20, 100)
    };
    const response = await postInventory(breweryId, testData);
    assert.strictEqual(response.status, "ok");
    assert.strictEqual(typeof response.inventoryId, "string");
    await verifyInventoryData(testData, response.inventoryId, breweryId);
    inventoryToDelete.push(response.inventoryId);
    variantsToDelete.push(newSKU);
  });

  it("/breweries/:breweryId/inventory POST - input validation", async function () {
    const breweryId = api.user.breweries[0];
    const [existingSKU] = await getExistingSKUs();

    const validData = {
      sku: existingSKU,
      quantity: randomNum(0, 100),
      price: randomNum(20, 100)
    };

    let invalidParams = randomString(10);
    await expectError(
      postInventory(invalidParams, validData),
      null,
      "invalid breweryId"
    );

    let missingParams = void 0;
    await expectError(
      postInventory(missingParams, validData),
      null,
      "missing breweryId"
    );

    const invalidData = {
      sku: [randomNum(10), "invalid-sku", randomString(10)],
      quantity: ["invalid"],
      price: ["invalid"]
    };

    await runDataValidationTests(invalidData, validData, api, {
      url: `/breweries/${breweryId}/inventory`,
      method: "post"
    });
  });

  it("/breweries/:breweryId/inventory/:inventoryId PATCH", async function () {
    const breweryId = api.user.breweries[0];
    const inventoryId = inventoryToDelete[inventoryToDelete.length - 1];
    const testData = {
      price: randomNum(20, 100)
    };
    const response = await patchInventory(breweryId, inventoryId, testData);
    assert.strictEqual(response.status, "ok");
    await verifyInventoryData(testData, inventoryId, breweryId);
  });

  it("/breweries/:breweryId/inventory/:inventoryId PATCH - input validation", async function () {
    const [breweryId] = api.user.breweries;
    const inventoryId = inventoryToDelete[inventoryToDelete.length - 1];
    const validData = { price: randomNum(20, 100) };
    const invalidData = { price: [randomString(4), void 0] };
    await runDataValidationTests(invalidData, validData, api, {
      url: `breweries/${breweryId}/inventory/${inventoryId}`,
      method: "patch"
    });
  });

  it("/breweries/:breweryId/inventoryChange POST", async function () {
    const [breweryId] = api.user.breweries;
    // creating new variant to insert into inventory as setup for post inventory change test
    const newSKU = await createTestVariant();
    // have to invalidate skus cache, so sku passed in next test is not rejected as non-existent (as it was just created). When using the variant service to create a variant, this cache will be invalidated automatically
    memCache.invalidate("variant");
    const variantData = {
      sku: newSKU,
      quantity: randomNum(0, 100),
      price: randomNum(20, 100)
    };
    const { inventoryId } = await postInventory(breweryId, variantData);

    const qtyDiff = randomButNotZero(-1 * variantData.quantity, 100);

    const testData = {
      sku: newSKU,
      qtyDiff,
      reason: "test reason",
      note: "some notes"
    };
    await postInventoryChange(breweryId, testData);

    const newQty = variantData.quantity + qtyDiff;
    await confirmStockQuantityChange(inventoryId, newQty);

    variantsToDelete.push(newSKU);
    inventoryToDelete.push(inventoryId);
  });

  it("/breweries/:breweryId/inventoryChange GET (all)", async function () {
    const [breweryId] = api.user.breweries;
    const result = await getInventoryChanges(breweryId);
    assert.strictEqual(result.status, "ok");
    await validateInventoryChangeArray(result.inventoryChanges);
  });

  it("/breweries/:breweryId/inventoryChange GET (sku)", async function () {
    const [breweryId] = api.user.breweries;
    const existingSKU = variantsToDelete[variantsToDelete.length - 1];
    const result = await getInventoryChanges(breweryId, existingSKU);
    assert.strictEqual(result.status, "ok");
    await validateInventoryChangeArray(result.inventoryChanges);
    assert(result.inventoryChanges.every(invChange => invChange.sku === existingSKU), `should only return inventory changes for sku: ${existingSKU}`);
  });

  after(async function () {
    // cleanup
    // delete inventory before variants (foreign key constraints)
    for (const invId of inventoryToDelete) {
      await deleteInventory(invId);
    }
    for (const sku of variantsToDelete) {
      await deleteVariant(sku);
    }
    await api.deleteUser();
  });
});
