/*global it, describe */
import TestAPI from "../../test/TestAPI.js";
import { expectError } from "../../test/testHelpers.js";
import assert from "assert";

export default describe("auth tests", async function () {
  const api = new TestAPI();

  it("unauthenticated request fails", async function () {
    await expectError(api.request({ url: "/test", method: "get" }), "unauthorized");
  });

  it("authenticated request succeeds", async function () {
    await api.signInAsNewUser();
    const response = await api.request({ url: "/test", method: "get" });
    assert.strictEqual(response.status, "ok");
  });

  it("unauthorized request to admin route fails", async function () {
    await expectError(api.request({ url: "/admin/test", method: "get"}), "forbidden");
    await api.deleteUser(); // cleanup for next test
  });

  it("authorized request to admin route succeeds", async function () {
    await api.signInAsNewUser({role: "admin"});
    const response = await api.request({ url: "/admin/test", method: "get"});
    assert.strictEqual(response.status, "ok");
  });

});
