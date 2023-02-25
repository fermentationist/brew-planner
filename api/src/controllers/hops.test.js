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
import { HOP_FORMS } from "../services/hop.js";
import localCache from "../services/localCache/index.js";

const api = new TestAPI();

//utility functions
const createBrewery = createEntityFactory("brewery");
const deleteBrewery = deleteEntityFactory("brewery");

const createHop = createEntityFactory("hop");
const deleteHop = deleteEntityFactory("hop");

const getExistingHops = getEntityFactory("hop");

const verifyHopsData = async (hopsData) => {
  const existingHops = await getExistingHops();
  const existingHopUuids = existingHops.map(
    (hop) => hop.hop_uuid
  );
  for (const hop of hopsData) {
    assertEqualIfCondition(
      hop.hopUuid,
      existingHopUuids.includes(hop.hopUuid),
      true
    );
    const [dbData] = existingHops.filter(
      (existingHop) =>
        existingHop.hop_uuid === hop.hopUuid
    );
    for (const attr in hop) {
      let dbValue = dbData[toSnakeCase(attr)];
      dbValue = dbValue instanceof Date ? dbValue.getTime() : dbValue;
      assert.strictEqual(hop[attr], dbValue);
    }
  }
};

const confirmHopInsertion = async (hopUuid, hopData) => {
  const [dbData] = await getExistingHops(hopUuid);
  for (const attr in hopData) {
    let dbValue = dbData[toSnakeCase(attr)];
    dbValue = dbValue instanceof Date ? dbValue.getTime() : dbValue;
    assert.strictEqual(hopData[attr], dbValue);
  }
};

const getHopTestData = async () => {
  const users = await userService.getAllUsers();
  const [randomUser] = getRandomArrayMembers(users, 1);
  return {
    name: `Test hop ${randomString(6)}`,
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

const makeGetHopsRequest = (breweryUuid) =>
  api.request({
    url: `/breweries/${breweryUuid}/hops`,
    method: "get",
  });

const makeCreateHopRequest = (breweryUuid, data) =>
  api.request({
    url: `/breweries/${breweryUuid}/hops`,
    method: "post",
    data,
  });

const makeDeleteHopRequest = (breweryUuid, hopUuid) =>
  api.request({
    url: `/breweries/${breweryUuid}/hops/${hopUuid}`,
    method: "delete",
  });

// TESTS
export default describe("hop routes", function () {
  const breweriesToDelete = [],
    hopsToDelete = [];
  let userBreweries;
  let randomHopNames;
  before(async () => {
    const randomNames = [randomString(6), randomString(6), randomString(6)];
    const randomBreweryNames = randomNames.map((rnd) => `Test brewery ${rnd}`);
    randomHopNames = randomNames.map(
      (rnd) => `Test hop ${rnd.split("").reverse().join("")}`
    );
    await api.signInAsNewUser({ role: "user" });
    // create 3 test breweries
    for (const name of randomBreweryNames) {
      const uuid = await createBrewery({ name });
      breweriesToDelete.push(uuid);
      // create 3 test hops for each brewery
      for (const name of randomHopNames) {
        const testData = await getHopTestData();
        const hopUuid = await createHop({
          ...objectKeysToSnakeCase(testData),
          name,
          brewery_uuid: uuid,
          created_by: api.user.uid,
        });
        hopsToDelete.push(hopUuid);
      }
    }
    // now create a brewhouse with a different brewery
    localCache.invalidate(["brewery", "hop"]);
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/hops GET", async function () {
    const [breweryUuid] = breweriesToDelete;
    await api.signInAsNewUser({ role: "user", breweries: [breweryUuid] });
    const response = await makeGetHopsRequest(breweryUuid);
    assert.strictEqual(response.status, "ok");
    await verifyHopsData(response.hops);
    const hopUuids = response.hops.map(
      (hop) => hop.hopUuid
    );
    for (const createdUuid of hopsToDelete.slice(0, 3)) {
      assert(hopUuids.includes(createdUuid));
    }
  });

  it("/breweries/:breweryUuid/hops GET - input validation", async () => {
    const missingUuid = void 0;
    await expectError(makeGetHopsRequest(missingUuid));
    const invalidUuid = "invalidUuid";
    await expectError(makeGetHopsRequest(invalidUuid));
    const randomButValidUuid = createUuid();
    await expectError(makeGetHopsRequest(randomButValidUuid));
    const wrongBreweryUuid = breweriesToDelete[1];
    await expectError(makeGetHopsRequest(wrongBreweryUuid));
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/hops POST", async () => {
    const testData = await getHopTestData();
    userBreweries = [breweriesToDelete[breweriesToDelete.length - 1]];
    await api.signInAsNewUser({ role: "user", breweries: userBreweries });
    const response = await makeCreateHopRequest(
      userBreweries[0],
      testData
    );
    assert.strictEqual(response.status, "ok");
    await confirmHopInsertion(response.hopUuid, testData);
    hopsToDelete.push(response.hopUuid);
    localCache.invalidate("hop");
  });

  it("/breweries/:breweryUuid/hops POST - with user provided UUID", async () => {
    const testData = await getHopTestData();
    const hopUuid = createUuid();
    testData.hopUuid = hopUuid;
    const response = await makeCreateHopRequest(
      userBreweries[0],
      testData
    );
    assert.strictEqual(response.status, "ok");
    assert.strictEqual(response.hopUuid, hopUuid);
    await confirmHopInsertion(response.hopUuid, testData);
    hopsToDelete.push(response.hopUuid);
    localCache.invalidate("hop");
  });

  it("/breweries/:breweryUuid/hops POST - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const testData = await getHopTestData();
    const invalidTestData = {
      name: [void 0, "", randomString(101), randomHopNames[0]],
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
      url: `/breweries/${breweryUuid}/hops`,
      method: "post",
    });
  });

  it("/breweries/:breweryUuid/hops/:hopUuid PATCH", async () => {
    const updateData = await getHopTestData();
    delete updateData.createdBy;
    const hopUuid = hopsToDelete[hopsToDelete.length - 1];
    const response = await api.request({
      url: `/breweries/${userBreweries[0]}/hops/${hopUuid}`,
      method: "patch",
      data: updateData,
    });
    assert.strictEqual(response.status, "ok");
    await confirmHopInsertion(hopUuid, updateData);
  });

  it("/breweries/:breweryUuid/hops/:hopUuid PATCH - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const hopUuid = hopsToDelete[hopsToDelete.length - 1];
    const testData = await getHopTestData();
    const invalidTestData = {
      name: [randomString(101), randomHopNames[0]],
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
      url: `/breweries/${breweryUuid}/hops/${hopUuid}`,
      method: "patch",
    });
  });

  it("/breweries/:breweryUuid/hops/:hopUuid DELETE", async () => {
    const [breweryUuid] = userBreweries;
    const hopUuid = hopsToDelete.pop();
    const response = await makeDeleteHopRequest(
      breweryUuid,
      hopUuid
    );
    assert.strictEqual(response.status, "ok");
    const { hops } = await makeGetHopsRequest(breweryUuid);
    const uuids = hops.map((hop) => hop.hopUuid);
    assert(!uuids.includes(hopUuid));
  });

  it("/breweries/:breweryUuid/hops/:hopUuid DELETE - input validation", async () => {
    const [validBreweryUuid] = userBreweries;
    const validhopUuid =
      hopsToDelete[hopsToDelete.length - 1];

    const missinghopUuid = void 0;
    await expectError(
      makeDeleteHopRequest(missinghopUuid, validhopUuid)
    );

    const invalidBreweryUuid = "invalidhopUuid";
    await expectError(
      makeDeleteHopRequest(invalidBreweryUuid, validhopUuid)
    );

    const validButWrongBreweryUuid = createUuid();
    await expectError(
      makeDeleteHopRequest(validButWrongBreweryUuid, validhopUuid)
    );

    const missingHopUuid = void 0;
    await expectError(
      makeDeleteHopRequest(validBreweryUuid, missingHopUuid)
    );

    const invalidhopUuid = "invalidHopUuid";
    await expectError(
      makeDeleteHopRequest(validBreweryUuid, invalidhopUuid)
    );

    const validButWrongHopUuid = createUuid();
    await expectError(
      makeDeleteHopRequest(validBreweryUuid, validButWrongHopUuid)
    );

    const realButMismatchedHopUuid = hopsToDelete[0];
    await expectError(
      makeDeleteHopRequest(
        validBreweryUuid,
        realButMismatchedHopUuid
      )
    );
  });

  after(async () => {
    await api.deleteUser();
    for (const breweryUuid of breweriesToDelete) {
      await deleteBrewery(breweryUuid);
    }
    for (const hopUuid of hopsToDelete) {
      await deleteHop(hopUuid);
    }
  });
});
