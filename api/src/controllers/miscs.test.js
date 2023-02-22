/*global it, describe, before, after, console */
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
import { MISC_TYPES } from "../services/misc.js";
import localCache from "../services/localCache/index.js";

const api = new TestAPI();

//utility functions
const createBrewery = createEntityFactory("brewery");
const deleteBrewery = deleteEntityFactory("brewery");

const createMisc = createEntityFactory("misc");
const deleteMisc = deleteEntityFactory("misc");

const getExistingMiscs = getEntityFactory("misc");

const verifyMiscsData = async (miscsData) => {
  const existingMiscs = await getExistingMiscs();
  const existingMiscUuids = existingMiscs.map(
    (misc) => misc.misc_uuid
  );
  for (const misc of miscsData) {
    assertEqualIfCondition(
      misc.miscUuid,
      existingMiscUuids.includes(misc.miscUuid),
      true
    );
    const [dbData] = existingMiscs.filter(
      (existingMisc) =>
        existingMisc.misc_uuid === misc.miscUuid
    );
    for (const attr in misc) {
      let dbValue = dbData[toSnakeCase(attr)];
      dbValue = dbValue instanceof Date ? dbValue.getTime() : dbValue;
      assert.strictEqual(misc[attr], dbValue);
    }
  }
};

const confirmMiscInsertion = async (miscUuid, miscData) => {
  const [dbData] = await getExistingMiscs(miscUuid);
  for (const attr in miscData) {
    let dbValue = dbData[toSnakeCase(attr)];
    dbValue = dbValue instanceof Date ? dbValue.getTime() : dbValue;
    assert.strictEqual(miscData[attr], dbValue);
  }
};

const getMiscTestData = async () => {
  const users = await userService.getAllUsers();
  const [randomUser] = getRandomArrayMembers(users, 1);
  return {
    name: `Test misc ${randomString(6)}`,
    createdBy: randomUser.uid,
    type: getRandomArrayMembers(MISC_TYPES, 1)[0],
    useFor: randomString(24),
    notes: randomString(256)
  };
};

const makeGetMiscsRequest = (breweryUuid) =>
  api.request({
    url: `/breweries/${breweryUuid}/miscs`,
    method: "get",
  });

const makeCreateMiscRequest = (breweryUuid, data) =>
  api.request({
    url: `/breweries/${breweryUuid}/miscs`,
    method: "post",
    data,
  });

const makeDeleteMiscRequest = (breweryUuid, miscUuid) =>
  api.request({
    url: `/breweries/${breweryUuid}/miscs/${miscUuid}`,
    method: "delete",
  });

// TESTS
export default describe("misc routes", function () {
  const breweriesToDelete = [],
    miscsToDelete = [];
  let userBreweries;
  let randomMiscNames;
  before(async () => {
    const randomNames = [randomString(6), randomString(6), randomString(6)];
    const randomBreweryNames = randomNames.map((rnd) => `Test brewery ${rnd}`);
    randomMiscNames = randomNames.map(
      (rnd) => `Test misc ${rnd.split("").reverse().join("")}`
    );
    await api.signInAsNewUser({ role: "user" });
    // create 3 test breweries
    for (const name of randomBreweryNames) {
      const uuid = await createBrewery({ name });
      breweriesToDelete.push(uuid);
      // create 3 test miscs for each brewery
      for (const name of randomMiscNames) {
        const testData = await getMiscTestData();
        const miscUuid = await createMisc({
          ...objectKeysToSnakeCase(testData),
          name,
          brewery_uuid: uuid,
          created_by: api.user.uid,
        });
        miscsToDelete.push(miscUuid);
      }
    }
    // now create a brewhouse with a different brewery
    localCache.invalidate(["brewery", "misc"]);
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/miscs GET", async function () {
    const [breweryUuid] = breweriesToDelete;
    await api.signInAsNewUser({ role: "user", breweries: [breweryUuid] });
    const response = await makeGetMiscsRequest(breweryUuid);
    assert.strictEqual(response.status, "ok");
    await verifyMiscsData(response.miscs);
    const miscUuids = response.miscs.map(
      (misc) => misc.miscUuid
    );
    for (const createdUuid of miscsToDelete.slice(0, 3)) {
      assert(miscUuids.includes(createdUuid));
    }
  });

  it("/breweries/:breweryUuid/miscs GET - input validation", async () => {
    const missingUuid = void 0;
    await expectError(makeGetMiscsRequest(missingUuid));
    const invalidUuid = "invalidUuid";
    await expectError(makeGetMiscsRequest(invalidUuid));
    const randomButValidUuid = createUuid();
    await expectError(makeGetMiscsRequest(randomButValidUuid));
    const wrongBreweryUuid = breweriesToDelete[1];
    await expectError(makeGetMiscsRequest(wrongBreweryUuid));
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/miscs POST", async () => {
    const testData = await getMiscTestData();
    userBreweries = [breweriesToDelete[breweriesToDelete.length - 1]];
    await api.signInAsNewUser({ role: "user", breweries: userBreweries });
    const response = await makeCreateMiscRequest(
      userBreweries[0],
      testData
    );
    assert.strictEqual(response.status, "ok");
    await confirmMiscInsertion(response.miscUuid, testData);
    miscsToDelete.push(response.miscUuid);
    localCache.invalidate("misc");
  });

  it("/breweries/:breweryUuid/miscs POST - with user provided UUID", async () => {
    const testData = await getMiscTestData();
    const miscUuid = createUuid();
    testData.miscUuid = miscUuid;
    const response = await makeCreateMiscRequest(
      userBreweries[0],
      testData
    );
    assert.strictEqual(response.status, "ok");
    assert.strictEqual(response.miscUuid, miscUuid);
    await confirmMiscInsertion(response.miscUuid, testData);
    miscsToDelete.push(response.miscUuid);
    localCache.invalidate("misc");
  });

  it("/breweries/:breweryUuid/miscs POST - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const testData = await getMiscTestData();
    const invalidTestData = {
      name: [void 0, "", randomString(101), randomMiscNames[0]],
      createdBy: [void 0, randomString(36), randomInt(999999)],
      type: [void 0, "", randomFloat(0, 100), randomString(8)],
      useFor: [randomFloat(0, 1000)],
      notes: [randomFloat(0, 1000)]
    }
    await runDataValidationTests(invalidTestData, testData, api, {
      url: `/breweries/${breweryUuid}/miscs`,
      method: "post",
    });
  });

  it("/breweries/:breweryUuid/miscs/:miscUuid PATCH", async () => {
    const updateData = await getMiscTestData();
    delete updateData.createdBy;
    const miscUuid = miscsToDelete[miscsToDelete.length - 1];
    const response = await api.request({
      url: `/breweries/${userBreweries[0]}/miscs/${miscUuid}`,
      method: "patch",
      data: updateData,
    });
    assert.strictEqual(response.status, "ok");
    await confirmMiscInsertion(miscUuid, updateData);
  });

  it("/breweries/:breweryUuid/miscs/:miscUuid PATCH - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const miscUuid = miscsToDelete[miscsToDelete.length - 1];
    const testData = await getMiscTestData();
    const invalidTestData = {
      name: [randomString(101), randomMiscNames[0]],
      type: [randomFloat(0, 100), randomString(8), ""],
      notes: [randomFloat(0, 1000)],
      useFor: [randomFloat(0, 1000)]
    }
    await runDataValidationTests(invalidTestData, testData, api, {
      url: `/breweries/${breweryUuid}/miscs/${miscUuid}`,
      method: "patch",
    });
  });

  it("/breweries/:breweryUuid/miscs/:miscUuid DELETE", async () => {
    const [breweryUuid] = userBreweries;
    const miscUuid = miscsToDelete.pop();
    const response = await makeDeleteMiscRequest(
      breweryUuid,
      miscUuid
    );
    assert.strictEqual(response.status, "ok");
    const { miscs } = await makeGetMiscsRequest(breweryUuid);
    const uuids = miscs.map((misc) => misc.miscUuid);
    assert(!uuids.includes(miscUuid));
  });

  it("/breweries/:breweryUuid/miscs/:miscUuid DELETE - input validation", async () => {
    const [validBreweryUuid] = userBreweries;
    const validmiscUuid =
      miscsToDelete[miscsToDelete.length - 1];

    const missingmiscUuid = void 0;
    await expectError(
      makeDeleteMiscRequest(missingmiscUuid, validmiscUuid)
    );

    const invalidBreweryUuid = "invalidBreweryUuid";
    await expectError(
      makeDeleteMiscRequest(invalidBreweryUuid, validmiscUuid)
    );

    const validButWrongBreweryUuid = createUuid();
    await expectError(
      makeDeleteMiscRequest(validButWrongBreweryUuid, validmiscUuid)
    );

    const missingMiscUuid = void 0;
    await expectError(
      makeDeleteMiscRequest(validBreweryUuid, missingMiscUuid)
    );

    const invalidmiscUuid = "invalidMiscUuid";
    await expectError(
      makeDeleteMiscRequest(validBreweryUuid, invalidmiscUuid)
    );

    const validButWrongMiscUuid = createUuid();
    await expectError(
      makeDeleteMiscRequest(validBreweryUuid, validButWrongMiscUuid)
    );

    const realButMismatchedMiscUuid = miscsToDelete[0];
    await expectError(
      makeDeleteMiscRequest(
        validBreweryUuid,
        realButMismatchedMiscUuid
      )
    );
  });

  after(async () => {
    await api.deleteUser();
    for (const breweryUuid of breweriesToDelete) {
      await deleteBrewery(breweryUuid);
    }
    for (const miscUuid of miscsToDelete) {
      await deleteMisc(miscUuid);
    }
  });
});
