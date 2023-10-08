import db from "../src/services/db/index.js";
import {convertObjectUUIDsToBuffers, convertUuidToBuffer} from "../src/models/Model.js";
import {toCamelCase, toSnakeCase, objectKeysToSnakeCase} from "../src/utils/helpers.js";
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

export const createEntityFactory = entityType => async params => {
  const snakeCaseParams = objectKeysToSnakeCase(params);
  const paramsWithBinaryUuids = convertObjectUUIDsToBuffers(snakeCaseParams);
  const cols = Object.keys(paramsWithBinaryUuids);
  const colString = cols.join(", ");
  const valString = Array(cols.length).fill("?").join(", ");
  const insertQuery = `
    INSERT INTO ${entityType} (${colString})
    VALUES (${valString})
  `;
  const values = Object.values(paramsWithBinaryUuids);
  const { insertId } = await db.queryProm(insertQuery, values);
  const selectQuery = `
    SELECT ${entityType}_uuid FROM ${entityType}
    WHERE ${entityType}_key = ?
  `;
  const [entity] = await db.queryProm(selectQuery, [insertId]);
  return entity[`${entityType}_uuid`];
}

export const getEntityFactory = entityType => uuid => {
  const whereClause = uuid ? `WHERE ${entityType}_uuid = ?` : "";
  const values = uuid ? [convertUuidToBuffer(uuid)] : [];
  const sqlString = `
    SELECT * FROM ${entityType} 
    ${whereClause}
  `;
  return db.queryProm(sqlString, values);
}

export const deleteEntityFactory = entityType => uuid => {
  const sqlString =
    `DELETE FROM ${entityType} WHERE ${entityType}_uuid = ? LIMIT 1`;
  return db.queryProm(sqlString, [convertUuidToBuffer(uuid)]);
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

export const createTestToVerifyPersistedData = (tableName) => async (data) => {
  const test = createInsertionTest(tableName);
  for (const row of data) {
    test(row[`${toCamelCase(tableName)}Uuid`], row);
  }
};

export const createInsertionTest = tableName => async (entityUuid, data) => {
  const getExistingEntities = getEntityFactory(tableName);
  const [dbData] = await getExistingEntities(entityUuid);
  for (const attr in data) {
    let dbValue = dbData[toSnakeCase(attr)];
    dbValue = dbValue instanceof Date ? dbValue.getTime() : dbValue;
    assert.strictEqual(data[attr], dbValue, `Data mismatch for ${attr}`);
  }
};

export const createDeletionTest = tableName => async entityUuid => {
  const getExistingEntities = getEntityFactory(tableName);
  const [dbData] = await getExistingEntities(entityUuid);
  assert.strictEqual(dbData, void 0, "Entity not deleted");
}