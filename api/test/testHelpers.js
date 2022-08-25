import db from "../src/services/db/index.js";
import { randomString } from "../src/utils/helpers.js";
import assert from "assert";

export const expectError = function (p, errorName, testDescription) {
  let msg;
  if (errorName) {
    msg = `${
      testDescription ? testDescription + " - " : ""
    }The error "${errorName}" should have been thrown.`;
  } else {
    msg = `${
      testDescription ? testDescription + " - " : ""
    }An error should have been thrown.`;
  }
  const namedError = new Error(msg);
  return p
    .then(() => {
      namedError.name = "no_error_thrown";
      return Promise.reject(namedError);
    })
    .catch((error) => {
      if (errorName && error.name !== errorName) {
        return Promise.reject(namedError);
      } else if (error.name == "no_error_thrown") {
        return Promise.reject(error);
      } else {
        return Promise.resolve();
      }
    });
};

export const expectInvalidInput = (promise, message) =>
  expectError(promise, "invalid_input", message);

export const getExistingBreweries = () => {
  return db.queryProm("SELECT * FROM brewery;");
};

export const getExistingBreweryIds = async () => {
  const results = await db.queryProm("SELECT brewery_id FROM brewery;");
  return results.map((result) => result.brewery_id);
};

export const getExistingSKUs = async () => {
  const results = await db.queryProm("SELECT sku FROM product_variant;");
  return results.map((result) => result.sku);
};

export const getExistingVariant = async (sku) => {
  let sqlString = `
    SELECT * FROM product_variant
  `;
  let values = [];
  if (sku) {
    sqlString += "WHERE product_variant.sku = ?";
    values = [sku];
  } else {
    sqlString += "ORDER by RAND() LIMIT 1";
  }
  const [result] = await db.queryProm(sqlString, values);
  return result;
};

export const deleteInventory = async (inventoryId, breweryId, sku) => {
  try {
    let inventoryKeyQuery;
    let values = [];
    if (inventoryId) {
      inventoryKeyQuery = `
        SELECT inventory_key FROM inventory
        WHERE inventory_id = ?
      `;
      values = [inventoryId];
    } else {
      inventoryKeyQuery = `
        SELECT inventory_key FROM inventory 
        WHERE brewery_key = (
          SELECT brewery_key FROM brewery WHERE brewery_id = ?
        ) 
        AND variant_key = (
          SELECT variant_key FROM product_variant WHERE sku = ?
        );
      `;
      values = [breweryId, sku];
    }
    const [response] = await db.queryProm(inventoryKeyQuery, values);
    const inventoryKey = response?.inventory_key;
    const deleteInvChangeQuery = `
      DELETE FROM inventory_change WHERE inventory_key = ?;
    `;
    const deleteInvQuery = `
      DELETE FROM inventory WHERE inventory_key = ?;
    `;
    const deleteQueries = deleteInvChangeQuery + deleteInvQuery;
    console.log("deleting inventory entry:", inventoryKey);
    return db.queryProm(deleteQueries, [inventoryKey, inventoryKey]);
  } catch (error) {
    console.log(error);
  }
};

export const createTestVariant = async () => {
  const sqlString = `
    INSERT INTO product_variant (fullname, variant_name, sku, product_name, brand_name)
    VALUES (?, ?, ?, ?, ?)
  `;
  const randomStr = randomString(6);
  const values = [
    `Test product ${randomStr} - default`,
    "default",
    randomStr,
    `Test product ${randomStr}`,
    "Test brand " + randomString(4),
  ];
  const result = await db.queryProm(sqlString, values);
  if (result.insertId) {
    return randomStr;
  } else {
    throw "Could not create new test variant";
  }
};

export const deleteVariant = (sku) => {
  const sqlString = "DELETE FROM product_variant WHERE sku = ? LIMIT 1";
  return db.queryProm(sqlString, [sku]);
};

export const createBrewery = async (params) => {
  const cols = Object.keys(params);
  const colString = cols.join(", ");
  const valString = Array(cols.length).fill("?").join(", ");
  const insertQuery = `
    INSERT INTO brewery (${colString})
    VALUES (${valString})
  `;
  const values = Object.values(params);
  const { insertId } = await db.queryProm(insertQuery, values);
  const selectQuery = `
    SELECT brewery_id FROM brewery
    WHERE brewery_key = ?
  `;
  const [{ brewery_id }] = await db.queryProm(selectQuery, [insertId]);
  return brewery_id;
};

export const getBrewery = async breweryId => {
  const sqlString = `
    SELECT * FROM brewery 
    WHERE brewery_id = UUID_TO_BIN(?)
  `;
  const [result] = await db.queryProm(sqlString, [breweryId]);
  return result;
}

export const deleteBrewery = (breweryId) => {
  const sqlString =
    "DELETE FROM brewery WHERE brewery_id = UUID_TO_BIN(?) LIMIT 1";
  return db.queryProm(sqlString, [breweryId]);
};

export const getInventoryData = (inventoryId) => {
  const sqlString = `
    SELECT inventory.available, inventory.allocated, inventory.price, inventory.added_at, brewery.name, brewery.brewery_id, brewery.added_at, JSON_OBJECT("street", brewery.street, "unit", brewery.unit, "city", brewery.city, "state", brewery.state, "zip", brewery.zip, "country", brewery.country) AS address, variant.* FROM inventory
    INNER JOIN brewery ON brewery.brewery_key = inventory.brewery_key
    INNER JOIN product_variant as variant ON variant.variant_key = inventory.variant_key
    WHERE inventory.inventory_id = ?
  `;
  const options = { sql: sqlString, nestTables: true };
  return db.queryProm(options, [inventoryId]);
};

/* runDataValidationTests
will run data validation tests against a series of request params, given an object (invalidFieldsObj) containing invalid values for each field to be tested.

invalidFieldsObj example:
  {
    name: [<invalid value 1>, <invalid value 2>...],
    address: {
      street: [<invalid value 1>, <invalid value 2>...]
    }
  }
*/
export const runDataValidationTests = async (
  invalidFieldsObj,
  validTestData,
  api,
  { url, method }
) => {
  const testInvalidValues = async (field, fieldData, prevKeys = []) => {
    if (!Array.isArray(fieldData)) {
      for (const key in fieldData) {
        await testInvalidValues(key, fieldData[key], [...prevKeys, field]);
      }
    } else {
      for (const invalidValue of fieldData) {
        let targetField = validTestData;
        for (const prevKey of prevKeys) {
          targetField = targetField[prevKey];
        }
        const originalValue = targetField[field];
        targetField[field] = invalidValue;
        await expectInvalidInput(
          api.request({ url, method, data: validTestData }),
          `invalid ${field}: ${invalidValue}`
        );
        targetField[field] = originalValue;
      }
    }
  };
  for (const key in invalidFieldsObj) {
    await testInvalidValues(key, invalidFieldsObj[key]);
  }
};

export const assertEqualIfExists = (expected, actual) => {
  if (expected) {
    assert.strictEqual(actual, expected);
  }
};

export const assertEqualOrNull = (actual, expected) => {
  if (actual !== null) {
    assert.strictEqual(actual, expected);
  }
};

export const assertEqualIfCondition = (condition, actual, expected) => {
  if (condition) {
    assert.strictEqual(actual, expected);
  }
};
