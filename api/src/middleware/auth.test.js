/*global it, describe, before, after */
import TestAPI from "../../test/TestAPI.js";
import { expectError } from "../../test/testHelpers.js";
// import { randomString } from "../utils/helpers.js";
// import { createBrewery, deleteBrewery } from "../services/brewery.js";
import assert from "assert";

export default describe("auth tests", async function () {
  const api = new TestAPI();
  // For these tests to work, there need to be at least three test breweries created in the database
  // const breweryIds = [randomString(6), randomString(6), randomString(6)];
  // const [breweryId1, breweryId2, breweryId3] = breweryIds;

  // before(async function () {
  //   //create test breweries
  //   for (const breweryId of breweryIds) {
  //     const name = `Test Brewery ${breweryId}`;
  //     console.log("creating test brewery:", name);
  //     await createBrewery({name, breweryId});
  //   }
  // });

  it("unauthenticated request fails", async function () {
    await expectError(api.request({ url: "/test", method: "get" }), "unauthorized");
  });

  it("authenticated request succeeds", async function () {
    await api.signInAsNewUser();
    const response = await api.request({ url: "/test", method: "get" });
    assert.strictEqual(response.status, "ok");
  });

  // it("get request to breweries/ route returns user's breweries", async function () {
  //   const {breweries} = await api.request({ url: "/breweries", method: "get"});
  //   const breweryIds = breweries.map(brewery => brewery.breweryId);
  //   assert(breweryIds.includes(breweryId1));
  // })

  // it("unauthorized request to brewery route fails", async function () {
  //   await expectError(api.request({ url: `/breweries/${breweryId2}/test`, method: "get"}), "forbidden");
  //   await api.deleteUser(); // cleanup for next test
  // });

  // it("authorized request to brewery route succeeds", async function () {
  //   await api.signInAsNewUser({role: "user", breweries: [breweryId2, breweryId3]});
  //   const response = await api.request({ url: `/breweries/${breweryId2}/test`, method: "get"});
  //   assert.strictEqual(response.status, "ok");
  // });

  it("unauthorized request to admin route fails", async function () {
    await expectError(api.request({ url: "/admin/test", method: "get"}), "forbidden");
    await api.deleteUser(); // cleanup for next test
  });

  it("authorized request to admin route succeeds", async function () {
    await api.signInAsNewUser({role: "admin"});
    const response = await api.request({ url: "/admin/test", method: "get"});
    assert.strictEqual(response.status, "ok");
  });

  // after(async function () { // cleanup
  //   await api.deleteUser();
  //   for (const breweryId of breweryIds) {
  //     console.log("deleting test brewery:", breweryId);
  //     await deleteBrewery(breweryId);
  //   }
  // });
});
