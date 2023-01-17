/* global describe, it, after */
import assert from "assert";
import { v1 as createUUID } from "uuid";
import {
  createEntityFactory,
  deleteEntityFactory,
  getEntityFactory,
} from "./testHelpers.js";
import { randomString } from "../src/utils/helpers.js";

//utility functions
const createBrewery = createEntityFactory("brewery");
const deleteBrewery = deleteEntityFactory("brewery");
const getBrewery = getEntityFactory("brewery");

export default describe("typecasting", () => {
  let breweriesToDelete = [];
  it("uuids stored as BINARY(16) are typecast as hex strings", async () => {
    const uuid = createUUID();
    const name = "Test Brewery " + randomString(4);
    const actualId = await createBrewery({ name, brewery_uuid: uuid });
    assert.strictEqual(actualId, uuid);
    breweriesToDelete.push(uuid);
  });

  it("TINYINT are typecast as boolean", async () => {
    const name = "Test Brewery " + randomString(4);
    const isPrivate = false;
    const breweryUuid = await createBrewery({ name, is_private: isPrivate });
    const [brewery] = await getBrewery(breweryUuid);
    assert.strictEqual(brewery.is_private, false);
    breweriesToDelete.push(breweryUuid);
  });

  after(async () => {
    for (const breweryUuid of breweriesToDelete) {
      await deleteBrewery(breweryUuid);
    }
  });
});
