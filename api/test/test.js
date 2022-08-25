/* global describe, it, after */
import db from "../src/services/db/index.js";
import assert from "assert";
import {v1 as createUUID, parse as uuidParse} from "uuid";
import { createBrewery, deleteBrewery, getBrewery } from "./testHelpers.js";
import { randomString } from "../src/utils/helpers.js";

export default describe("typecasting", () => {
  let breweriesToDelete = [];
  it("uuids stored as BINARY(16) are typecast as hex strings", async () => {
    const uuid = createUUID();
    const breweryId = Buffer.from(uuidParse(uuid));
    const name = "Test Brewery " + randomString(4);
    const actualId = await createBrewery({name, brewery_id: breweryId});
    assert.strictEqual(actualId, uuid);
    breweriesToDelete.push(uuid);
  });

  it("TINYINT are typecast as boolean", async () => {
    const name = "Test Brewery " + randomString(4);
    const isPrivate = false;
    const breweryId = await createBrewery({name, is_private: isPrivate});
    const brewery = await getBrewery(breweryId);
    assert.strictEqual(brewery.is_private, false);
    breweriesToDelete.push(breweryId);
  });

  after(async () => {
    for (const breweryId of breweriesToDelete) {
      await deleteBrewery(breweryId);
    }
  });
});