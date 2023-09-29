/*global it, describe, before, after */
import assert from "assert";
import TestAPI from "../../test/TestAPI.js";
import { getUser } from "../../test/firebase.js";
import { randomString } from "../utils/helpers.js";
import {
  createEntityFactory,
  deleteEntityFactory,
  expectError,
  expectInvalidInput,
} from "../../test/testHelpers.js";
import localCache from "../services/localCache/index.js";

// utility functions
const createBrewery = createEntityFactory("brewery");
const deleteBrewery = deleteEntityFactory("brewery");

const verifyUser = async ({ ...testData }) => {
  delete testData.password;
  const user = await getUser({ email: testData.email });
  const userWithClaims = {
    ...user,
    ...user.customClaims,
  };
  for (const key in testData) {
    if (Array.isArray(testData[key])) {
      testData[key].forEach((elt, index) => {
        if (!userWithClaims[key]) {
          console.log(`failing key: ${key}`);
        }
        assert.strictEqual(elt, userWithClaims[key][index]);
      });
    } else {
      assert.strictEqual(testData[key], userWithClaims[key]);
    }
  }
};

// TESTS
export default describe("user routes", function () {
  const api = new TestAPI();
  let uid = null;
  let testData;
  let brewery1Uuid, brewery2Uuid;
  const breweriesToDelete = [];

  before(async function () {
    const brewery1Data = {
      name: `Test Brewery ${randomString(6)}`,
      street: "6428 N Ridgeway Av",
      unit: null,
      city: "Lincolnwood",
      state_or_province: "IL",
      postal_code: "60712",
      country: "United States",
    };
    brewery1Uuid = await createBrewery(brewery1Data);
    const brewery2Data = {
      ...brewery1Data,
      name: `Test Brewery ${randomString(6)}`,
    };
    brewery2Uuid = await createBrewery(brewery2Data);
    testData = {
      email: `${randomString(6)}@example.com`,
      password: null,
      role: "user",
      breweries: [brewery1Uuid],
      displayName: `Test User ${randomString(6, true)}`,
    };
    breweriesToDelete.push(brewery1Uuid, brewery2Uuid);
    localCache.invalidate("brewery");
  });

  it("/admin/users GET", async function () {
    await api.signInAsNewUser({ role: "admin", breweries: [brewery1Uuid] });
    const response = await api.request({ url: "/admin/users", method: "get" });
    assert.strictEqual(response.status, "ok");
    assert(Array.isArray(response.users));
    const containsNewUser = response.users.some(
      (user) => user.uid === api.user.uid
    );
    assert(containsNewUser);
  });

  it("/admin/users POST", async function () {
    const response = await api.request({
      url: "/admin/users",
      method: "post",
      data: testData,
    });
    uid = response.uid;
    assert.strictEqual(response.status, "ok");
    assert.strictEqual(typeof response.uid, "string");
    assert.strictEqual(typeof response.resetLink, "string");
    verifyUser(testData);
  });

  it("/admin/users POST - error - duplicate user", async function () {
    await expectError(
      api.request({ url: "/admin/users", method: "post", data: testData }),
      "duplicate_user"
    );
  });

  it("/admin/users POST - input validation", async function () {
    const invalidData = {
      ...testData,
      email: "invalid_email",
    };
    await expectInvalidInput(
      api.request({ url: "/admin/users", method: "post", data: invalidData }),
      "invalid email"
    );

    invalidData.email = void 0;
    await expectInvalidInput(
      api.request({ url: "/admin/users", method: "post", data: invalidData }),
      "missing email"
    );
    invalidData.email = `${randomString(6)}@example.com`;

    invalidData.password = 123456789;
    await expectInvalidInput(
      api.request({ url: "/admin/users", method: "post", data: invalidData }),
      "invalid password"
    );

    invalidData.password = "short";
    await expectInvalidInput(
      api.request({ url: "/admin/users", method: "post", data: invalidData }),
      "invalid password"
    );
    invalidData.password = testData.password;

    invalidData.role = void 0;
    await expectInvalidInput(
      api.request({ url: "/admin/users", method: "post", data: invalidData }),
      "missing role"
    );

    invalidData.role = "invalid";
    await expectInvalidInput(
      api.request({ url: "/admin/users", method: "post", data: invalidData }),
      "invalid role"
    );
    invalidData.role = testData.role;

    invalidData.breweries = void 0;
    await expectInvalidInput(
      api.request({ url: "/admin/users", method: "post", data: invalidData }),
      "missing breweries"
    );

    invalidData.breweries = "breweries";
    await expectInvalidInput(
      api.request({ url: "/admin/users", method: "post", data: invalidData }),
      "invalid breweries"
    );

    invalidData.breweries = [1, "currently-acceptable-brewery-id"];
    await expectInvalidInput(
      api.request({ url: "/admin/users", method: "post", data: invalidData }),
      "invalid breweries"
    );
    invalidData.breweries = testData.breweries;

    invalidData.displayName = 12346789;
    await expectInvalidInput(
      api.request({ url: "/admin/users", method: "post", data: invalidData }),
      "invalid displayName"
    );

    invalidData.displayName = "<script>alert('!')</script>";
    await api.request({
      url: "/admin/users",
      method: "post",
      data: invalidData,
    });
    const userData = await getUser({ email: invalidData.email });
    const sanitizedDisplayName = userData.displayName;
    assert.strictEqual(
      sanitizedDisplayName,
      "&lt;script&gt;alert('!')&lt;/script&gt;"
    );
  });

  it("/admin/users/:uid PATCH", async function () {
    const newClaims = {
      role: "admin",
    };
    await api.request({
      url: `admin/users/${uid}`,
      method: "patch",
      data: newClaims,
    });
    await verifyUser({ ...testData, ...newClaims });
    const newBreweryClaims = {
      breweries: [brewery2Uuid],
    };
    await api.request({
      url: `admin/users/${uid}`,
      method: "patch",
      data: newBreweryClaims,
    });
    await verifyUser({ ...testData, ...newClaims, ...newBreweryClaims });
  });

  it("/breweries/:breweryUuid/users GET", async function () {
    const breweryUuid = api.user.breweries[0];
    const response = await api.request({
      url: `/breweries/${breweryUuid}/users`,
      method: "get",
    });
    assert.strictEqual(response.status, "ok");
    assert(response.users.some((user) => user.uid === api.user.uid));
  });

  it("/breweries/:breweryUuid/users GET - input validation", async function () {
    let breweryUuid = "1";
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryUuid}/users`,
        method: "get",
      }),
      "invalid brewery ID"
    );
  });

  it("breweries/:breweryUuid/users POST", async function () {
    const breweryUuid = api.user.breweries[0];
    const data = {
      ...testData,
      email: `${randomString(6)}@example.com`,
      breweries: [breweryUuid],
    };
    const response = await api.request({
      url: `breweries/${breweryUuid}/users`,
      method: "post",
      data,
    });
    uid = response.uid;
    assert.strictEqual(response.status, "ok");
    assert.strictEqual(typeof response.uid, "string");
    assert.strictEqual(typeof response.resetLink, "string");
    verifyUser(data);
  });

  it("breweries/:breweryUuid/users POST - input validation", async function () {
    const breweryUuid = api.user.breweries[0];
    const invalidData = {
      ...testData,
      email: "invalid_email",
    };
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryUuid}/users`,
        method: "post",
        data: invalidData,
      }),
      "invalid email"
    );

    invalidData.email = void 0;
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryUuid}/users`,
        method: "post",
        data: invalidData,
      }),
      "missing email"
    );
    invalidData.email = `${randomString(6)}@example.com`;

    invalidData.password = 123456789;
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryUuid}/users`,
        method: "post",
        data: invalidData,
      }),
      "invalid password"
    );

    invalidData.password = "short";
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryUuid}/users`,
        method: "post",
        data: invalidData,
      }),
      "invalid password"
    );
    invalidData.password = testData.password;

    invalidData.role = void 0;
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryUuid}/users`,
        method: "post",
        data: invalidData,
      }),
      "missing role"
    );

    invalidData.role = "invalid";
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryUuid}/users`,
        method: "post",
        data: invalidData,
      }),
      "invalid role"
    );
    invalidData.role = testData.role;

    invalidData.displayName = 12346789;
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryUuid}/users`,
        method: "post",
        data: invalidData,
      }),
      "invalid displayName"
    );

    invalidData.displayName = "<script>alert('!')</script>";
    await api.request({
      url: `/breweries/${breweryUuid}/users`,
      method: "post",
      data: invalidData,
    });
    const userData = await getUser({ email: invalidData.email });
    const sanitizedDisplayName = userData.displayName;
    assert.strictEqual(
      sanitizedDisplayName,
      "&lt;script&gt;alert('!')&lt;/script&gt;"
    );
  });

  it("/admin/users/:uid DELETE", async function () {
    const response = await api.request({
      url: `admin/users/${uid}`,
      method: "delete",
    });
    assert.strictEqual(response.status, "ok");
    await expectError(getUser({ uid }), "not_found");
  });

  it("breweries/:breweryUuid/users/:uid DELETE", async function () {
    const data = {
      ...testData,
      breweries: [brewery1Uuid],
      email: `${randomString(6)}@example.com`,
    };
    const { uid: newUid } = await api.request({
      url: "/admin/users",
      method: "post",
      data: data,
    });
    const response = await api.request({
      url: `/breweries/${brewery1Uuid}/users/${newUid}`,
      method: "delete",
    });

    assert.strictEqual(response.status, "ok");
    await expectError(getUser({ uid: newUid }), "not_found");
  });

  it("breweries/:breweryUuid/users/:uid DELETE - errors", async function () {
    const breweryUuid = api.user.breweries[0];
    const wrongBrewery = brewery2Uuid;
    const { uid: newUid } = await api.request({
      url: "/admin/users",
      method: "post",
      data: {
        ...testData,
        breweries: [wrongBrewery],
        email: `${randomString(6)}@example.com`,
      },
    });
    await expectError(
      api.request({
        url: `/breweries/${breweryUuid}/users/${newUid}`,
        method: "delete",
      }),
      "unauthorized"
    );

    // cleanup
    await api.request({ url: `/admin/users/${newUid}`, method: "delete" });
  });

  after(async function () {
    await api.deleteUser();
    for (const uuid of breweriesToDelete) {
      await deleteBrewery(uuid);
    }
  });
});
