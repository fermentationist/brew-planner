/* global it, describe, after */
import TestAPI from "../../test/TestAPI.js";
import assert from "assert";
import {
  assertEqualOrNull,
  deleteVariant as deleteVariantHelper,
  expectInvalidInput,
  getExistingSKUs,
  getExistingVariant,
  runDataValidationTests,
  expectError
} from "../../test/testHelpers.js";
import { randomString, toSnakeCase, randomNum } from "../utils/helpers.js";
import memCache from "../services/localCache.js";

const api = new TestAPI();

// helper functions
const validateVariantsArray = variantsArray => {
  for (const variant of variantsArray) {
    assert.strictEqual(typeof variant.sku, "string");
    assert.strictEqual(typeof variant.fullname, "string");
    assert.strictEqual(typeof variant.variantName, "string");
    assert.strictEqual(typeof variant.brandName, "string");
    assert.strictEqual(typeof variant.productName, "string");
    assert.strictEqual(typeof variant.addedAt, "number");
    assertEqualOrNull(
      (variant.length && typeof variant.length) || null,
      "number"
    );
    assertEqualOrNull(
      (variant.width && typeof variant.width) || null,
      "number"
    );
    assertEqualOrNull(
      (variant.height && typeof variant.height) || null,
      "number"
    );
    assertEqualOrNull(
      (variant.weight && typeof variant.weight) || null,
      "number"
    );
    assertEqualOrNull((variant.upc && typeof variant.upc) || null, "string");
  }
};

const verifyVariantData = async (sku, variantData) => {
  const dbData = await getExistingVariant(sku);
  for (const key in variantData) {
    const dbKey = toSnakeCase(key);
    assert.strictEqual(dbData[dbKey], variantData[key]);
  }
};

const postVariant = variantData => {
  return api.request({
    url: "/admin/variants",
    method: "post",
    data: variantData
  });
};

const patchVariant = (sku, variantData) => {
  return api.request({
    url: `/admin/variants/${sku}`,
    method: "patch",
    data: variantData
  });
};

const deleteVariant = sku => {
  return api.request({
    url: `/admin/variants/${sku}`,
    method: "delete"
  });
}

// TESTS
export default describe("variant routes", function () {
  const variantsToDelete = [];

  it("/variants GET", async () => {
    await api.signInAsNewUser();
    const response = await api.request({
      url: "/variants",
      method: "get"
    });
    assert.strictEqual(response.status, "ok");
    await validateVariantsArray(response.variants);
  });

  it("/admin/variants POST - required fields", async () => {
    await api.updateUserAuthClaims({ role: "admin" });
    const randomBrand = randomString(4) + " Brand";
    const randomProduct = "Test product " + randomString(4);
    const testData = {
      sku: randomString(10),
      fullname: `${randomBrand} ${randomProduct} - default`,
      variantName: "default",
      brandName: randomBrand,
      productName: randomProduct
    };
    const response = await postVariant(testData);
    assert.strictEqual(response.status, "ok");
    assert.strictEqual(response.sku, testData.sku);
    await verifyVariantData(testData.sku, testData);
    // cleanup
    variantsToDelete.push(testData.sku);
  });

  it("/admin/variants POST - all fields", async () => {
    const randomBrand = randomString(4) + " Brand";
    const randomProduct = "Test product " + randomString(4);
    const testData = {
      sku: randomString(10),
      fullname: `${randomBrand} ${randomProduct} - default`,
      variantName: "default",
      brandName: randomBrand,
      productName: randomProduct,
      upc: `${randomNum(1000000000000, 9999999999999)}`,
      length: randomNum(1, 20),
      width: randomNum(1, 20),
      height: randomNum(1, 20),
      weight: randomNum(1, 10)
    };
    const response = await postVariant(testData);
    memCache.invalidate("skus");
    assert.strictEqual(response.status, "ok");
    assert.strictEqual(response.sku, testData.sku);
    await verifyVariantData(testData.sku, testData);
    // cleanup
    variantsToDelete.push(testData.sku);
  });

  it("/admin/variants POST - input validation", async () => {
    const randomBrand = randomString(4) + " Brand";
    const randomProduct = "Test product " + randomString(4);
    const validData = {
      sku: randomString(10),
      fullname: `${randomBrand} ${randomProduct} - default`,
      variantName: "default",
      brandName: randomBrand,
      productName: randomProduct,
      upc: `${randomNum(1000000000000, 9999999999999)}`,
      length: randomNum(1, 20),
      width: randomNum(1, 20),
      height: randomNum(1, 20),
      weight: randomNum(1, 10)
    };

    const [existingSKU] = await getExistingSKUs();
    const invalidData = {
      sku: [
        void 0,
        randomString(3),
        randomString(26),
        randomNum(100000, 999999),
        existingSKU
      ],
      fullname: [void 0, randomString(151), randomNum(100000, 666666)],
      variantName: [void 0, randomString(51), randomNum(100000, 999999)],
      brandName: [void 0, randomString(111), randomNum(100000, 999999)],
      productName: [void 0, randomString(111), randomNum(100000, 999999)],
      upc: [randomNum(1000000000000, 9999999999999), randomString(13), `${randomNum(10000000000000, 99999999999999)}`],
      length: [randomString(2), -1 * randomNum(1, 20)],
      width: [randomString(2), -1 * randomNum(1, 20)],
      height: [randomString(2), -1 * randomNum(1, 20)],
      weight: [randomString(2), -1 * randomNum(1, 20)]
    };
    await runDataValidationTests(invalidData, validData, api, {
      url: "/admin/variants",
      method: "post"
    });
  });

  it("/admin/variants/:sku PATCH", async () => {
    const existingSKU = variantsToDelete[variantsToDelete.length - 1];
    const randomBrand = randomString(4) + " Brand";
    const randomProduct = "Test product " + randomString(4);
    const testData = {
      fullname: `${randomBrand} ${randomProduct} - other variant`,
      variantName: "other variant",
      brandName: randomBrand,
      productName: randomProduct,
      upc: `${randomNum(1000000000000, 9999999999999)}`,
      length: randomNum(1, 20),
      width: randomNum(1, 20),
      height: randomNum(1, 20),
      weight: randomNum(1, 10)
    };
    const response = await patchVariant(existingSKU, testData);
    assert.strictEqual(response.status, "ok");
    await verifyVariantData(existingSKU, testData);
  });

  it("/admin/variants/:sku PATCH (updating sku and deleting dimensions)", async () => {
    const existingSKU = variantsToDelete.pop();
    const randomBrand = randomString(4) + " Brand";
    const randomProduct = "Test product " + randomString(4);
    const testData = {
      sku: randomString(10),
      variantName: "other variant",
      brandName: randomBrand,
      productName: randomProduct,
      upc: `${randomNum(1000000000000, 9999999999999)}`,
      length: null,
      width: null,
      height: null,
      weight: null
    };
    const response = await patchVariant(existingSKU, testData);
    assert.strictEqual(response.status, "ok");
    await verifyVariantData(testData.sku, testData);
    variantsToDelete.push(testData.sku);
  });

  it("/admin/variants/:sku PATCH - input validation", async () => {
    const randomBrand = randomString(4) + " Brand";
    const randomProduct = "Test product " + randomString(4);
    const validData = {
      sku: randomString(10),
      fullname: `${randomBrand} ${randomProduct} - default`,
      variantName: "default",
      brandName: randomBrand,
      productName: randomProduct,
      upc: `${randomNum(1000000000000, 9999999999999)}`,
      length: randomNum(1, 20),
      width: randomNum(1, 20),
      height: randomNum(1, 20),
      weight: randomNum(1, 10)
    };

    const skuToEdit = variantsToDelete[variantsToDelete.length - 1];
    const existingVariant = await getExistingVariant();
    const invalidData = {
      sku: [existingVariant.sku, randomString(26), randomString(3)],
      fullname: [randomString(151), randomNum(100000, 666666)],
      variantName: [randomString(51), randomNum(100000, 999999)],
      brandName: [randomString(111), randomNum(100000, 999999)],
      productName: [randomString(111), randomNum(100000, 999999)],
      upc: [randomNum(1000000000000, 9999999999999), randomString(13), `${randomNum(10000000000000, 99999999999999)}`],
      length: [randomString(2), -1 * randomNum(1, 20)],
      width: [randomString(2), -1 * randomNum(1, 20)],
      height: [randomString(2), -1 * randomNum(1, 20)],
      weight: [randomString(2), -1 * randomNum(1, 20)]
    };

    let invalidParam = randomString(10);
    await expectInvalidInput(
      patchVariant(invalidParam, validData),
      "invalid SKU"
    );
    invalidParam = randomNum(100000, 999999);
    await expectInvalidInput(
      patchVariant(invalidParam, validData),
      "invalid SKU"
    );
    invalidParam = void 0;
    await expectInvalidInput(
      patchVariant(invalidParam, validData),
      "missing SKU"
    );
    await expectError(
      patchVariant(skuToEdit, {
        ...validData,
        fullname: existingVariant.fullname
      }),
      null,
      "should not allow duplicate fullnames"
    );
    await runDataValidationTests(invalidData, validData, api, {
      url: `/admin/variants/${skuToEdit}`,
      method: "patch"
    });
  });

  it("/admin/variants/:sku DELETE", async () => {
    const existingSKU = variantsToDelete[variantsToDelete.length - 1];
    await deleteVariant(existingSKU);
  });

  it("/admin/variants/:sku DELETE - input validation", async () => {
    let invalidParam = randomString(10);
    await expectInvalidInput(
      deleteVariant(invalidParam),
      "invalid SKU"
    );
    invalidParam = randomNum(100000, 999999);
    await expectInvalidInput(
      deleteVariant(invalidParam),
      "invalid SKU"
    );
    invalidParam = void 0;
    await expectInvalidInput(
      deleteVariant(invalidParam),
      "missing SKU"
    );
  });

  after(async () => {
    // cleanup
    for (const sku of variantsToDelete) {
      await deleteVariantHelper(sku);
    }
    await api.deleteUser();
  });
});
