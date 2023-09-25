/*global it, describe, before, after */
import assert from "assert";
import { v1 as createUuid } from "uuid";
import TestAPI from "../../test/TestAPI.js";
import {
  expectError,
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
import localCache from "../services/localCache/index.js";

const api = new TestAPI();

//utility functions
const createBrewery = createEntityFactory("brewery");
const deleteBrewery = deleteEntityFactory("brewery");

const createMash = createEntityFactory("mash");
const deleteMash = deleteEntityFactory("mash");

const getExistingMashes = getEntityFactory("mash");

const verifyMashesData = async (mashesData) => {
  const existingMashes = await getExistingMashes();
  const existingMashUuids = existingMashes.map(
    (mash) => mash.mash_uuid
  );
  for (const mash of mashesData) {
    assertEqualIfCondition(
      mash.mashUuid,
      existingMashUuids.includes(mash.mashUuid),
      true
    );
    const [dbData] = existingMashes.filter(
      (existingMash) =>
        existingMash.mash_uuid === mash.mashUuid
    );
    for (const attr in mash) {
      let dbValue = dbData[toSnakeCase(attr)];
      dbValue = dbValue instanceof Date ? dbValue.getTime() : dbValue;
      assert.strictEqual(mash[attr], dbValue);
    }
  }
};

const confirmMashInsertion = async (mashUuid, mashData) => {
  const [dbData] = await getExistingMashes(mashUuid);
  for (const attr in mashData) {
    let dbValue = dbData[toSnakeCase(attr)];
    dbValue = dbValue instanceof Date ? dbValue.getTime() : dbValue;
    assert.strictEqual(mashData[attr], dbValue);
  }
};

const getMashTestData = async () => {
  const users = await userService.getAllUsers();
  const [randomUser] = getRandomArrayMembers(users, 1);
  return {
    name: `Test mash ${randomString(6)}`,
    createdBy: randomUser.uid,
    alpha: randomFloat(1, 20),
    beta: randomFloat(0, 20),
    form: getRandomArrayMembers(HOP_FORMS, 1)[0],
    notes: randomString(256),
    origin: `Test origin ${randomString(4)}`,
    supplier: `Test supplier ${randomString(4)}`,
    humulene: randomFloat(0, 100),
    caryophyllene: randomFloat(0, 100),
    cohumulone: randomFloat(0, 100),
    myrcene: randomFloat(0, 100)
  };
};

const makeGetMashesRequest = (breweryUuid) =>
  api.request({
    url: `/breweries/${breweryUuid}/mashes`,
    method: "get",
  });

const makeCreateMashRequest = (breweryUuid, data) =>
  api.request({
    url: `/breweries/${breweryUuid}/mashes`,
    method: "post",
    data,
  });

const makeDeleteMashRequest = (breweryUuid, mashUuid) =>
  api.request({
    url: `/breweries/${breweryUuid}/mashes/${mashUuid}`,
    method: "delete",
  });

// TESTS
export default describe("mash routes", function () {
  const breweriesToDelete = [],
    mashesToDelete = [];
  let userBreweries;
  let randomMashNames;
  before(async () => {
    const randomNames = [randomString(6), randomString(6), randomString(6)];
    const randomBreweryNames = randomNames.map((rnd) => `Test brewery ${rnd}`);
    randomMashNames = randomNames.map(
      (rnd) => `Test mash ${rnd.split("").reverse().join("")}`
    );
    await api.signInAsNewUser({ role: "user" });
    // create 3 test breweries
    for (const name of randomBreweryNames) {
      const uuid = await createBrewery({ name });
      breweriesToDelete.push(uuid);
      // create 3 test mashes for each brewery
      for (const name of randomMashNames) {
        const testData = await getMashTestData();
        const mashUuid = await createMash({
          ...objectKeysToSnakeCase(testData),
          name,
          brewery_uuid: uuid,
          created_by: api.user.uid,
        });
        mashesToDelete.push(mashUuid);
      }
    }
    // now create a brewhouse with a different brewery
    localCache.invalidate(["brewery", "mash"]);
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/mashes GET", async function () {
    const [breweryUuid] = breweriesToDelete;
    await api.signInAsNewUser({ role: "user", breweries: [breweryUuid] });
    const response = await makeGetMashesRequest(breweryUuid);
    assert.strictEqual(response.status, "ok");
    await verifyMashesData(response.mashes);
    const mashUuids = response.mashes.map(
      (mash) => mash.mashUuid
    );
    for (const createdUuid of mashesToDelete.slice(0, 3)) {
      assert(mashUuids.includes(createdUuid));
    }
  });

  it("/breweries/:breweryUuid/mashes GET - input validation", async () => {
    const missingUuid = void 0;
    await expectError(makeGetMashesRequest(missingUuid));
    const invalidUuid = "invalidUuid";
    await expectError(makeGetMashesRequest(invalidUuid));
    const randomButValidUuid = createUuid();
    await expectError(makeGetMashesRequest(randomButValidUuid));
    const wrongBreweryUuid = breweriesToDelete[1];
    await expectError(makeGetMashesRequest(wrongBreweryUuid));
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/mashes POST", async () => {
    const testData = await getMashTestData();
    userBreweries = [breweriesToDelete[breweriesToDelete.length - 1]];
    await api.signInAsNewUser({ role: "user", breweries: userBreweries });
    const response = await makeCreateMashRequest(
      userBreweries[0],
      testData
    );
    assert.strictEqual(response.status, "ok");
    await confirmMashInsertion(response.uuid, testData);
    mashesToDelete.push(response.uuid);
    localCache.invalidate("mash");
  });

  it("/breweries/:breweryUuid/mashes POST - with user provided UUID", async () => {
    const testData = await getMashTestData();
    const mashUuid = createUuid();
    testData.mashUuid = mashUuid;
    const response = await makeCreateMashRequest(
      userBreweries[0],
      testData
    );
    assert.strictEqual(response.status, "ok");
    assert.strictEqual(response.uuid, mashUuid);
    await confirmMashInsertion(response.uuid, testData);
    mashesToDelete.push(response.uuid);
    localCache.invalidate("mash");
  });

  it("/breweries/:breweryUuid/mashes POST - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const testData = await getMashTestData();
    const invalidTestData = {
      name: [void 0, "", randomString(101), randomMashNames[0]],
      createdBy: [void 0, randomString(36), randomInt(999999)],
      alpha: [void 0, `${randomFloat(1, 20)}`, randomString(6), -1 * randomFloat(1, 20)],
      beta: [`${randomFloat(1, 20)}`, randomString(6), -1 * randomFloat(1, 20)],
      form: [randomString(8), randomFloat(0, 100)],
      notes: [randomFloat(0, 1000)],
      origin: [randomInt(5, 10), randomString(101)],
      supplier: [randomInt(5, 10), randomString(101)],
      humulene: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
      caryophyllene: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
      cohumulone: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
      myrcene: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)]
    }
    await runDataValidationTests(invalidTestData, testData, api, {
      url: `/breweries/${breweryUuid}/mashes`,
      method: "post",
    });
  });

  it("/breweries/:breweryUuid/mashes/:mashUuid PATCH", async () => {
    const updateData = await getMashTestData();
    delete updateData.createdBy;
    const mashUuid = mashesToDelete[mashesToDelete.length - 1];
    const response = await api.request({
      url: `/breweries/${userBreweries[0]}/mashes/${mashUuid}`,
      method: "patch",
      data: updateData,
    });
    assert.strictEqual(response.status, "ok");
    await confirmMashInsertion(mashUuid, updateData);
  });

  it("/breweries/:breweryUuid/mashes/:mashUuid PATCH - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const mashUuid = mashesToDelete[mashesToDelete.length - 1];
    const testData = await getMashTestData();
    const invalidTestData = {
      name: [randomString(101), randomMashNames[0]],
      alpha: [`${randomFloat(1, 20)}`, randomString(6), -1 * randomFloat(1, 20)],
      beta: [`${randomFloat(1, 20)}`, randomString(6), -1 * randomFloat(1, 20)],
      form: [randomString(8), randomFloat(0, 100)],
      notes: [randomFloat(0, 1000)],
      origin: [randomInt(5, 10), randomString(101)],
      supplier: [randomInt(5, 10), randomString(101)],
      humulene: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
      caryophyllene: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
      cohumulone: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)],
      myrcene: [`${randomFloat(0, 100)}`, -1 * randomFloat(0, 100), randomFloat(100.01, 1000)]
    }
    await runDataValidationTests(invalidTestData, testData, api, {
      url: `/breweries/${breweryUuid}/mashes/${mashUuid}`,
      method: "patch",
    });
  });

  it("/breweries/:breweryUuid/mashes/:mashUuid DELETE", async () => {
    const [breweryUuid] = userBreweries;
    const mashUuid = mashesToDelete.pop();
    const response = await makeDeleteMashRequest(
      breweryUuid,
      mashUuid
    );
    assert.strictEqual(response.status, "ok");
    const { mashes } = await makeGetMashesRequest(breweryUuid);
    const uuids = mashes.map((mash) => mash.mashUuid);
    assert(!uuids.includes(mashUuid));
  });

  it("/breweries/:breweryUuid/mashes/:mashUuid DELETE - input validation", async () => {
    const [validBreweryUuid] = userBreweries;
    const validmashUuid =
      mashesToDelete[mashesToDelete.length - 1];

    const missingmashUuid = void 0;
    await expectError(
      makeDeleteMashRequest(missingmashUuid, validmashUuid)
    );

    const invalidBreweryUuid = "invalidmashUuid";
    await expectError(
      makeDeleteMashRequest(invalidBreweryUuid, validmashUuid)
    );

    const validButWrongBreweryUuid = createUuid();
    await expectError(
      makeDeleteMashRequest(validButWrongBreweryUuid, validmashUuid)
    );

    const missingMashUuid = void 0;
    await expectError(
      makeDeleteMashRequest(validBreweryUuid, missingMashUuid)
    );

    const invalidmashUuid = "invalidMashUuid";
    await expectError(
      makeDeleteMashRequest(validBreweryUuid, invalidmashUuid)
    );

    const validButWrongMashUuid = createUuid();
    await expectError(
      makeDeleteMashRequest(validBreweryUuid, validButWrongMashUuid)
    );

    const realButMismatchedMashUuid = mashesToDelete[0];
    await expectError(
      makeDeleteMashRequest(
        validBreweryUuid,
        realButMismatchedMashUuid
      )
    );
  });

  after(async () => {
    await api.deleteUser();
    for (const breweryUuid of breweriesToDelete) {
      await deleteBrewery(breweryUuid);
    }
    for (const mashUuid of mashesToDelete) {
      await deleteMash(mashUuid);
    }
  });
});
