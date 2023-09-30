/*global it, describe, before, after */
import assert from "assert";
import { v1 as createUuid } from "uuid";
import TestAPI from "./TestAPI.js";
import {
  expectError,
  runDataValidationTests,
  deleteEntityFactory,
  createEntityFactory,
  createTestToVerifyPersistedData,
  createInsertionTest,
  createDeletionTest,
} from "./testHelpers.js";
import {
  randomString,
} from "../src/utils/helpers.js";
import localCache from "../src/services/localCache/index.js";

const entityTestFactory = (entityName, pluralEntityName, validPostDataThunk, invalidPostDataThunk, validPatchDataThunk, invalidPatchDataThunk) => {

  const api = new TestAPI();

  //utility functions
  const createBrewery = createEntityFactory("brewery");
  const deleteBrewery = deleteEntityFactory("brewery");

  const createEntity = createEntityFactory(entityName);
  const deleteEntity = deleteEntityFactory(entityName);

  const verifyEntitiesData = createTestToVerifyPersistedData(entityName);

  const confirmEntityInsertion = createInsertionTest(entityName);

  const confirmEntityDeletion = createDeletionTest(entityName);

  const makeGetEntitiesRequest = (breweryUuid) =>
    api.request({
      url: `/breweries/${breweryUuid}/${pluralEntityName}`,
      method: "get",
    });

  const makeCreateEntityRequest = (breweryUuid, data) =>
    api.request({
      url: `/breweries/${breweryUuid}/${pluralEntityName}`,
      method: "post",
      data,
    });

  const makeDeleteEntityRequest = (breweryUuid, entityUuid) =>
    api.request({
      url: `/breweries/${breweryUuid}/${pluralEntityName}/${entityUuid}`,
      method: "delete",
    });

  // TESTS
  return describe(`${entityName} routes`, function () {
    const breweriesToDelete = [],
      entitiesToDelete = [];
    let userBreweries;
    let existingEntity;
    before(async () => {
      const randomNames = [randomString(6), randomString(6), randomString(6)];
      const randomBreweryNames = randomNames.map((rnd) => `Test brewery ${rnd}`);
      await api.signInAsNewUser({ role: "user" });
      // create 3 test breweries
      for (const name of randomBreweryNames) {
        const uuid = await createBrewery({ name });
        breweriesToDelete.push(uuid);
        // create 3 test entities for each brewery
      }
      localCache.invalidate(["brewery"]);
      await api.deleteUser();
    });

    it(`/breweries/:breweryUuid/${pluralEntityName} GET`, async function () {
      const [breweryUuid] = breweriesToDelete;
      await api.signInAsNewUser({ role: "user", breweries: [breweryUuid] });
      const response = await makeGetEntitiesRequest(breweryUuid);
      assert.strictEqual(response.status, "ok");
      await verifyEntitiesData(response[pluralEntityName]);
      const entityUuids = response[pluralEntityName].map(
        (entity) => entity[`${entityName}Uuid}`]
      );
      for (const createdUuid of entitiesToDelete.slice(0, 3)) {
        assert(entityUuids.includes(createdUuid));
      }
    });

    it(`/breweries/:breweryUuid/${pluralEntityName} GET - input validation`, async () => {
      const missingUuid = void 0;
      await expectError(makeGetEntitiesRequest(missingUuid));
      const invalidUuid = "invalidUuid";
      await expectError(makeGetEntitiesRequest(invalidUuid));
      const randomButValidUuid = createUuid();
      await expectError(makeGetEntitiesRequest(randomButValidUuid));
      const wrongBreweryUuid = breweriesToDelete[1];
      await expectError(makeGetEntitiesRequest(wrongBreweryUuid));
      await api.deleteUser();
    });

    it(`/breweries/:breweryUuid/${pluralEntityName} POST`, async () => {
      const testData = await validPostDataThunk();
      existingEntity = testData;
      userBreweries = [breweriesToDelete[breweriesToDelete.length - 1]];
      await api.signInAsNewUser({ role: "user", breweries: userBreweries });
      const response = await makeCreateEntityRequest(
        userBreweries[0],
        testData
      );
      assert.strictEqual(response.status, "ok");
      await confirmEntityInsertion(response.uuid, testData);
      entitiesToDelete.push(response.uuid);
      localCache.invalidate(entityName);
    });

    it(`/breweries/:breweryUuid/${pluralEntityName} POST - with user provided UUID`, async () => {
      const testData = await validPostDataThunk();
      const entityUuid = createUuid();
      testData[`${entityName}Uuid`] = entityUuid;
      const response = await makeCreateEntityRequest(
        userBreweries[0],
        testData
      );
      assert.strictEqual(response.status, "ok");
      assert.strictEqual(response.uuid, entityUuid);
      await confirmEntityInsertion(response.uuid, testData);
      entitiesToDelete.push(response.uuid);
      localCache.invalidate(entityName);
    });

    it(`/breweries/:breweryUuid/${pluralEntityName} POST - input validation`, async () => {
      const [breweryUuid] = userBreweries;
      const testData = await validPostDataThunk();
      const invalidTestData = await invalidPostDataThunk(existingEntity);
      await runDataValidationTests(invalidTestData, testData, api, {
        url: `/breweries/${breweryUuid}/${pluralEntityName}`,
        method: "post",
      });
    });

    it(`/breweries/:breweryUuid/${pluralEntityName}/:${entityName}Uuid PATCH`, async () => {
      const updateData = await validPatchDataThunk(existingEntity);
      const entityUuid = entitiesToDelete[entitiesToDelete.length - 1];
      const response = await api.request({
        url: `/breweries/${userBreweries[0]}/${pluralEntityName}/${entityUuid}`,
        method: "patch",
        data: updateData,
      });
      assert.strictEqual(response.status, "ok");
      await confirmEntityInsertion(entityUuid, updateData);
    });

    it(`/breweries/:breweryUuid/${pluralEntityName}/:${entityName}Uuid PATCH - input validation`, async () => {
      const [breweryUuid] = userBreweries;
      const entityUuid = entitiesToDelete[entitiesToDelete.length - 1];
      const testData = await validPatchDataThunk(existingEntity);
      const invalidTestData = await invalidPatchDataThunk(existingEntity);
      await runDataValidationTests(invalidTestData, testData, api, {
        url: `/breweries/${breweryUuid}/${pluralEntityName}/${entityUuid}`,
        method: "patch",
      });
    });

    it(`/breweries/:breweryUuid/${pluralEntityName}/:${entityName}Uuid DELETE`, async () => {
      const [breweryUuid] = userBreweries;
      const entityUuid = entitiesToDelete.pop();
      const response = await makeDeleteEntityRequest(
        breweryUuid,
        entityUuid
      );
      assert.strictEqual(response.status, "ok");
      await confirmEntityDeletion(entityUuid);
    });

    it(`/breweries/:breweryUuid/${pluralEntityName}/:${entityName}Uuid DELETE - input validation`, async () => {
      const [validBreweryUuid] = userBreweries;
      const validEntityUuid =
        entitiesToDelete[entitiesToDelete.length - 1];

      const missingBreweryUuid = void 0;
      await expectError(
        makeDeleteEntityRequest(missingBreweryUuid, validEntityUuid)
      );

      const invalidBreweryUuid = "invalidEntityUuid";
      await expectError(
        makeDeleteEntityRequest(invalidBreweryUuid, validEntityUuid)
      );

      const validButWrongBreweryUuid = createUuid();
      await expectError(
        makeDeleteEntityRequest(validButWrongBreweryUuid, validEntityUuid)
      );

      const realButMismatchedBreweryUuid = entitiesToDelete[0];
      await expectError(
        makeDeleteEntityRequest(
          realButMismatchedBreweryUuid,
          validEntityUuid,
        )
      );

      const missingEntityUuid = void 0;
      await expectError(
        makeDeleteEntityRequest(validBreweryUuid, missingEntityUuid)
      );

      const invalidEntityUuid = "invalidEntityUuid";
      await expectError(
        makeDeleteEntityRequest(validBreweryUuid, invalidEntityUuid)
      );

      const validButWrongEntityUuid = createUuid();
      await expectError(
        makeDeleteEntityRequest(validBreweryUuid, validButWrongEntityUuid)
      );

      const realButMismatchedEntityUuid = entitiesToDelete[1];
      await expectError(
        makeDeleteEntityRequest(
          validBreweryUuid,
          realButMismatchedEntityUuid
        )
      );
    });

    after(async () => {
      await api.deleteUser();
      for (const breweryUuid of breweriesToDelete) {
        await deleteBrewery(breweryUuid);
      }
      for (const entityUuid of entitiesToDelete) {
        await deleteEntity(entityUuid);
      }
    });
  });

}

export default entityTestFactory;

