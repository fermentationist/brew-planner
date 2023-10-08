/* global describe, it, after */
import assert from "assert";
import { v1 as createUUID } from "uuid";
import {
  createEntityFactory,
  deleteEntityFactory,
  getEntityFactory,
} from "./testHelpers.js";
import { randomString } from "../src/utils/helpers.js";
import { getAllUsers } from "./firebase.js";

//utility functions
const createBrewery = createEntityFactory("brewery");
const deleteBrewery = deleteEntityFactory("brewery");
const createMash = createEntityFactory("mash");
const getMash = getEntityFactory("mash");
const deleteMash = deleteEntityFactory("mash");

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
    const breweryName = "Test Brewery " + randomString(4);
    const mashName = "Test Mash " + randomString(4);
    const [user] = await getAllUsers();
    const breweryUuid = await createBrewery({ name: breweryName });
    const mashUuid = await createMash({ brewery_uuid: breweryUuid, name: mashName, equip_adjust: 1, created_by: user.uid});
    const [mash] = await getMash(mashUuid);
    assert.strictEqual(mash.equip_adjust, true);
    breweriesToDelete.push(breweryUuid);
    await deleteMash(mashUuid);
  });

  after(async () => {
    for (const breweryUuid of breweriesToDelete) {
      await deleteBrewery(breweryUuid);
    }
  });
});
