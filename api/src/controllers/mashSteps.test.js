/*global it, describe, before, after */
import assert from "assert";
import { v1 as createUuid } from "uuid";
import TestAPI from "../../test/TestAPI.js";
import {
  expectError,
  runDataValidationTests,
  deleteEntityFactory,
  createEntityFactory,
  createTestToVerifyPersistedData,
  createInsertionTest,
  createDeletionTest,
} from "../../test/testHelpers.js";
import {
  randomInt,
  randomFloat,
  randomString,
  getRandomArrayMembers,
  objectKeysToSnakeCase,
} from "../utils/helpers.js";
import * as userService from "../services/user.js";
import localCache from "../services/localCache/index.js";
import { MASH_STEP_TYPES } from "../services/mashStep.js";

const api = new TestAPI();

//utility functions
const createBrewery = createEntityFactory("brewery");
const deleteBrewery = deleteEntityFactory("brewery");

const createMash = createEntityFactory("mash");
const deleteMash = deleteEntityFactory("mash");

const createMashStep = createEntityFactory("mash_step");
const deleteMashStep = deleteEntityFactory("mash_step");

const verifyMashStepsData = createTestToVerifyPersistedData("mash_step");

const confirmMashStepInsertion = createInsertionTest("mash_step");

const confirmMashStepDeletion = createDeletionTest("mash_step");

const getMashStepTestData = async () => {
  const users = await userService.getAllUsers();
  const [randomUser] = getRandomArrayMembers(users, 1);
  return {
    name: `Test mashStep ${randomString(6)}`,
    createdBy: randomUser.uid,
    type: getRandomArrayMembers(MASH_STEP_TYPES, 1)[0],
    infuseAmount: randomFloat(10, 100),
    stepTemp: randomFloat(20, 90),
    stepTime: randomInt(5, 60),
    rampTime: randomInt(5, 60),
    endTemp: randomFloat(20, 90),
  };
};

const makeGetMashStepsRequest = (breweryUuid, mashUuid) =>
  api.request({
    url: `/breweries/${breweryUuid}/mashes/${mashUuid}/mash_steps`,
    method: "get",
  });

const makeCreateMashStepRequest = (breweryUuid, mashUuid, data) =>
  api.request({
    url: `/breweries/${breweryUuid}/mashes/${mashUuid}/mash_steps`,
    method: "post",
    data,
  });

const makeUpdateMashStepRequest = (breweryUuid, mashUuid, mashStepUuid, data) => 
  api.request({
    url: `/breweries/${breweryUuid}/mashes/${mashUuid}/mash_steps/${mashStepUuid}`,
    method: "patch",
    data,
  });

const makeDeleteMashStepRequest = (breweryUuid, mashUuid, mashStepUuid) =>
  api.request({
    url: `/breweries/${breweryUuid}/mashes/${mashUuid}/mash_steps/${mashStepUuid}`,
    method: "delete",
  });

// TESTS
export default describe("mash_step routes", function () {
  const breweriesToDelete = [],
    mashesToDelete = [],
    mashStepsToDelete = [];
  let userBreweries;
  let randomMashStepNames;

  before(async () => {
    const randomNames = [randomString(6), randomString(6), randomString(6)];
    const randomBreweryNames = randomNames.map((rnd) => `Test brewery ${rnd}`);
    randomMashStepNames = randomNames.map(
      (rnd) => `Test mashStep ${[...rnd].reverse().join("")}`
    );
    await api.signInAsNewUser({ role: "user" });
    // create 3 test breweries
    for (const name of randomBreweryNames) {
      const breweryUuid = await createBrewery({ name });
      breweriesToDelete.push(breweryUuid);
      const mashUuid = await createMash({
        name: `Test mash ${randomString(6)}`,
        brewery_uuid: breweryUuid,
        created_by: api.user.uid,
      });
      mashesToDelete.push(mashUuid);
      // create 3 test mashSteps for each brewery
      for (const name of randomMashStepNames) {
        const testData = await getMashStepTestData();
        const mashStepUuid = await createMashStep({
          ...objectKeysToSnakeCase(testData),
          name,
          mash_uuid: mashUuid,
          created_by: api.user.uid,
        });
        mashStepsToDelete.push(mashStepUuid);
      }
    }
    localCache.invalidate(["brewery", "mash", "mashStep"]);
    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/mashes/:mashUuid/mash_steps GET", async function () {
    const [breweryUuid] = breweriesToDelete;
    const [mashUuid] = mashesToDelete;
    await api.signInAsNewUser({ role: "user", breweries: [breweryUuid] });
    const response = await makeGetMashStepsRequest(breweryUuid, mashUuid);
    assert.strictEqual(response.status, "ok");
    await verifyMashStepsData(response.mashSteps);
    const mashStepUuids = response.mashSteps.map(
      (mashStep) => mashStep.mashStepUuid
    );
    for (const createdUuid of mashStepsToDelete.slice(0, 3)) {
      assert(mashStepUuids.includes(createdUuid));
    }
  });

  it("/breweries/:breweryUuid/mashes/:mashUuid/mash_steps GET - input validation", async () => {
    const breweryUuid = breweriesToDelete[1];
    const mashUuid = mashesToDelete[1];
    const missingBreweryUuid = void 0;
    await expectError(makeGetMashStepsRequest(missingBreweryUuid, mashUuid));
    const invalidBreweryUuid = "invalidBreweryUuid";
    await expectError(makeGetMashStepsRequest(invalidBreweryUuid, mashUuid));
    const randomButValidBreweryUuid = createUuid();
    await expectError(
      makeGetMashStepsRequest(randomButValidBreweryUuid, mashUuid)
    );
    const wrongBreweryUuid = breweriesToDelete[2];
    await expectError(makeGetMashStepsRequest(wrongBreweryUuid, mashUuid));

    const missingMashUuid = void 0;
    await expectError(makeGetMashStepsRequest(breweryUuid, missingMashUuid));
    const invalidMashUuid = "invalidMashUuid";
    await expectError(makeGetMashStepsRequest(breweryUuid, invalidMashUuid));
    const randomButValidMashUuid = createUuid();
    await expectError(
      makeGetMashStepsRequest(breweryUuid, randomButValidMashUuid)
    );
    const wrongMashUuid = mashesToDelete[2];
    await expectError(makeGetMashStepsRequest(breweryUuid, wrongMashUuid));

    await api.deleteUser();
  });

  it("/breweries/:breweryUuid/mashes/:mashUuid/mash_steps POST", async () => {
    const testData = await getMashStepTestData();
    userBreweries = [breweriesToDelete[breweriesToDelete.length - 1]];
    const mashUuid = mashesToDelete[mashesToDelete.length - 1];
    await api.signInAsNewUser({ role: "user", breweries: userBreweries });
    const response = await makeCreateMashStepRequest(
      userBreweries[0],
      mashUuid,
      testData
    );
    assert.strictEqual(response.status, "ok");
    await confirmMashStepInsertion(response.uuid, testData);
    mashStepsToDelete.push(response.uuid);
    localCache.invalidate("mashStep");
  });

  it("/breweries/:breweryUuid/mashes/:mashUuid/mash_steps POST - with user provided UUID", async () => {
    const testData = await getMashStepTestData();
    const breweryUuid = breweriesToDelete[breweriesToDelete.length - 1];
    const mashUuid = mashesToDelete[mashesToDelete.length - 1];
    const mashStepUuid = createUuid();
    testData.mashStepUuid = mashStepUuid;
    const response = await makeCreateMashStepRequest(
      breweryUuid,
      mashUuid,
      testData
    );
    assert.strictEqual(response.status, "ok");
    assert.strictEqual(response.uuid, mashStepUuid);
    await confirmMashStepInsertion(response.uuid, testData);
    mashStepsToDelete.push(response.uuid);
    localCache.invalidate("mashStep");
  });

  it("/breweries/:breweryUuid/mashes/:mashUuid/mash_steps POST - input validation", async () => {
    const [breweryUuid] = userBreweries;
    const [mashUuid] = mashesToDelete;
    const testData = await getMashStepTestData();
    const invalidTestData = {
      name: [void 0, "", randomString(101), randomMashStepNames[0]],
      createdBy: [void 0, randomString(36), randomInt(0, 999999)],
      type: [void 0, "incorrect type", randomString(6)],
      infuseAmount: [
        `${randomFloat(10, 100)}`,
        randomString(6),
        -1 * randomFloat(10, 100),
      ],
      stepTemp: [void 0, `${randomFloat(60, 90)}`, randomString(6)],
      stepTime: [
        void 0,
        `${randomFloat(5, 60)}`,
        randomString(6),
        randomFloat(5, 60, 4),
        -1 * randomInt(5, 60),
      ],
      rampTime: [
        `${randomFloat(5, 60)}`,
        randomString(6),
        randomFloat(5, 60, 4),
        -1 * randomInt(5, 60),
      ],
      endTemp: [
        `${randomFloat(60, 90)}`,
        randomString(6),
        -1 * randomFloat(60, 90),
      ],
    };
    await runDataValidationTests(invalidTestData, testData, api, {
      url: `/breweries/${breweryUuid}/mashes/${mashUuid}/mash_steps`,
      method: "post",
    });
  });

  it("/breweries/:breweryUuid/mashes/:mashUuid/mash_steps/:mashStepUuid PATCH", async () => {
    const breweryUuid = breweriesToDelete[breweriesToDelete.length - 1];
    const mashUuid = mashesToDelete[mashesToDelete.length - 1];
    const updateData = await getMashStepTestData();
    delete updateData.createdBy;
    const mashStepUuid = mashStepsToDelete[mashStepsToDelete.length - 1];
    const response = await makeUpdateMashStepRequest(breweryUuid, mashUuid, mashStepUuid, updateData);
    assert.strictEqual(response.status, "ok");
    await confirmMashStepInsertion(mashStepUuid, updateData);
  });

  it("/breweries/:breweryUuid/mashSteps/:mashStepUuid PATCH - input validation", async () => {
    const breweryUuid = breweriesToDelete[breweriesToDelete.length - 1];
    const mashUuid = mashesToDelete[mashesToDelete.length - 1];
    const mashStepUuid = mashStepsToDelete[mashStepsToDelete.length - 1];
    const testData = await getMashStepTestData();
    const invalidTestData = {
      name: ["", randomString(101), randomMashStepNames[0]],
      type: ["incorrect type", randomString(6)],
      infuseAmount: [
        `${randomFloat(10, 100)}`,
        randomString(6),
        -1 * randomFloat(10, 100),
      ],
      stepTemp: [`${randomFloat(60, 90)}`, randomString(6)],
      stepTime: [
        `${randomFloat(5, 60)}`,
        randomString(6),
        randomFloat(5, 60, 4),
        -1 * randomInt(5, 60),
      ],
      rampTime: [
        `${randomFloat(5, 60)}`,
        randomString(6),
        randomFloat(5, 60, 4),
        -1 * randomInt(5, 60),
      ],
      endTemp: [
        `${randomFloat(60, 90)}`,
        randomString(6),
        -1 * randomFloat(60, 90),
      ],
    };
    await runDataValidationTests(invalidTestData, testData, api, {
      url: `/breweries/${breweryUuid}/mashes/${mashUuid}/mash_steps/${mashStepUuid}`,
      method: "patch",
    });
  });

  it("/breweries/:breweryUuid/mashes/:mashUuid/mash_steps/:mashStepUuid DELETE", async () => {
    const breweryUuid = breweriesToDelete[breweriesToDelete.length - 1];
    const mashUuid = mashesToDelete[mashesToDelete.length - 1];
    const mashStepUuid = mashStepsToDelete.pop();
    const response = await makeDeleteMashStepRequest(breweryUuid, mashUuid, mashStepUuid);
    assert.strictEqual(response.status, "ok");
    await confirmMashStepDeletion(mashStepUuid);
  });

  it("/breweries/:breweryUuid/mashes/:mashUuid/mash_steps/:mashStepUuid DELETE - input validation", async () => {
    const [breweryUuid] = breweriesToDelete;
    const [mashUuid] = mashesToDelete;
    const [mashStepUuid] = mashStepsToDelete;

    const missingBreweryUuid = void 0;
    await expectError(
      makeDeleteMashStepRequest(missingBreweryUuid, mashUuid, mashStepUuid)
    );

    const invalidBreweryUuid = "invalidBreweryUuid";
    await expectError(
      makeDeleteMashStepRequest(invalidBreweryUuid, mashUuid, mashStepUuid)
    );

    const validButWrongBreweryUuid = createUuid();
    await expectError(
      makeDeleteMashStepRequest(validButWrongBreweryUuid, mashUuid, mashStepUuid)
    );

    const realButMismatchedBreweryUuid = breweriesToDelete[1];
    await expectError(
      makeDeleteMashStepRequest(realButMismatchedBreweryUuid, mashUuid, mashStepUuid)
    );

    const missingMashUuid = void 0;
    await expectError(
      makeDeleteMashStepRequest(breweryUuid, missingMashUuid, mashStepUuid)
    );

    const invalidMashUuid = "invalidMashUuid";
    await expectError(
      makeDeleteMashStepRequest(breweryUuid, invalidMashUuid, mashStepUuid)
    );

    const validButWrongMashUuid = createUuid();
    await expectError(
      makeDeleteMashStepRequest(breweryUuid, validButWrongMashUuid, mashStepUuid)
    );

    const realButMismatchedMashUuid = mashStepsToDelete[1];
    await expectError(
      makeDeleteMashStepRequest(breweryUuid, realButMismatchedMashUuid, mashStepUuid)
    );

    const missingMashStepUuid = void 0;
    await expectError(
      makeDeleteMashStepRequest(breweryUuid, mashUuid, missingMashStepUuid)
    );

    const invalidMashStepUuid = "invalidMashUuid";
    await expectError(
      makeDeleteMashStepRequest(breweryUuid, mashUuid, invalidMashStepUuid)
    );

    const validButWrongMashStepUuid = createUuid();
    await expectError(
      makeDeleteMashStepRequest(breweryUuid, mashUuid, validButWrongMashStepUuid)
    );

    const realButMismatchedMashStepUuid = mashStepsToDelete[1];
    await expectError(
      makeDeleteMashStepRequest(breweryUuid, mashUuid, realButMismatchedMashStepUuid)
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
    for (const mashStepUuid of mashStepsToDelete) {
      await deleteMashStep(mashStepUuid);
    }
  });
});
