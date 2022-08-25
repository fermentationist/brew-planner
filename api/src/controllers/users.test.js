/*global it, describe, before, after */
import assert from "assert";
import TestAPI from "../../test/TestAPI.js";
import { getUser } from "../../test/firebase.js";
import { getRandomArrayMembers, randomString } from "../utils/helpers.js";
import { expectError, expectInvalidInput, getExistingBreweryIds } from "../../test/testHelpers.js";

const verifyUser = async ({ ...testData }) => {
  delete testData.password;
  const user = await getUser({ email: testData.email });
  const userWithClaims = {
    ...user,
    ...user.customClaims
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

export default describe("user routes", function () {
  const api = new TestAPI();
  let uid = null;
  let testData;

  before(async function () {
    const [breweryId] = getRandomArrayMembers(await getExistingBreweryIds(), 1)
    testData = {
      email: `${randomString(6)}@spirithub.com`,
      password: null,
      role: "user",
      breweries: [breweryId],
      displayName: "Test User"
    };
  });

  it("/admin/users GET", async function () {
    await api.signInAsNewUser({ role: "admin", breweries: [randomString(10)] });
    const response = await api.request({ url: "/admin/users", method: "get" });
    assert.strictEqual(response.status, "ok");
    assert(Array.isArray(response.users));
    const containsNewUser = response.users.some(
      user => user.uid === api.user.uid
    );
    assert(containsNewUser);
  });

  it("/admin/users POST", async function () {
    const response = await api.request({
      url: "/admin/users",
      method: "post",
      data: testData
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
      email: "invalid_email"
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
    invalidData.email = `${randomString(6)}@spirithub.com`;

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
      data: invalidData
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
      role: "admin"
    };
    await api.request({
      url: `admin/users/${uid}`,
      method: "patch",
      data: newClaims
    });
    await verifyUser({ ...testData, ...newClaims });
    const newBreweryClaims = {
      breweries: getRandomArrayMembers(await getExistingBreweryIds(), 1)
    }
    await api.request({
      url: `admin/users/${uid}`,
      method: "patch",
      data: newBreweryClaims
    });
    await verifyUser({ ...testData, ...newClaims, ...newBreweryClaims });
  });

  it("/breweries/:breweryId/users GET", async function () {
    const breweryId = api.user.breweries[0];
    const response = await api.request({
      url: `/breweries/${breweryId}/users`,
      method: "get"
    });
    assert.strictEqual(response.status, "ok");
    assert(response.users.some(user => user.uid === api.user.uid));
  });

  it("/breweries/:breweryId/users GET - input validation", async function () {
    let breweryId = "1";
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryId}/users`,
        method: "get"
      }),
      "invalid brewery ID"
    );
  });

  it("breweries/:breweryId/users POST", async function () {
    const breweryId = api.user.breweries[0];
    const data = {
      ...testData,
      email: `${randomString(6)}@spirithub.com`,
      breweries: [breweryId]
    };
    const response = await api.request({
      url: `breweries/${breweryId}/users`,
      method: "post",
      data
    });
    uid = response.uid;
    assert.strictEqual(response.status, "ok");
    assert.strictEqual(typeof response.uid, "string");
    assert.strictEqual(typeof response.resetLink, "string");
    verifyUser(data);
  });

  it("breweries/:breweryId/users POST - input validation", async function () {
    const breweryId = api.user.breweries[0];
    const invalidData = {
      ...testData,
      email: "invalid_email"
    };
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryId}/users`,
        method: "post",
        data: invalidData
      }),
      "invalid email"
    );

    invalidData.email = void 0;
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryId}/users`,
        method: "post",
        data: invalidData
      }),
      "missing email"
    );
    invalidData.email = `${randomString(6)}@spirithub.com`;

    invalidData.password = 123456789;
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryId}/users`,
        method: "post",
        data: invalidData
      }),
      "invalid password"
    );

    invalidData.password = "short";
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryId}/users`,
        method: "post",
        data: invalidData
      }),
      "invalid password"
    );
    invalidData.password = testData.password;

    invalidData.role = void 0;
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryId}/users`,
        method: "post",
        data: invalidData
      }),
      "missing role"
    );

    invalidData.role = "invalid";
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryId}/users`,
        method: "post",
        data: invalidData
      }),
      "invalid role"
    );
    invalidData.role = testData.role;

    invalidData.displayName = 12346789;
    await expectInvalidInput(
      api.request({
        url: `/breweries/${breweryId}/users`,
        method: "post",
        data: invalidData
      }),
      "invalid displayName"
    );

    invalidData.displayName = "<script>alert('!')</script>";
    await api.request({
      url: `/breweries/${breweryId}/users`,
      method: "post",
      data: invalidData
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
      method: "delete"
    });
    assert.strictEqual(response.status, "ok");
    await expectError(getUser({ uid }), "not_found");
  });

  it("breweries/:breweryId/users/:uid DELETE", async function () {
    const [breweryId] = getRandomArrayMembers(await getExistingBreweryIds(), 1);
    const data = {
      ...testData,
      breweries: [breweryId],
      email: `${randomString(6)}@spirithub.com`
    }
    const { uid: newUid } = await api.request({
      url: "/admin/users",
      method: "post",
      data: data
    });
    const response = await api.request({
      url: `/breweries/${breweryId}/users/${newUid}`,
      method: "delete"
    });

    assert.strictEqual(response.status, "ok");
    await expectError(getUser({ uid: newUid }), "not_found");
  });

  it("breweries/:breweryId/users/:uid DELETE - errors", async function () {
    const breweryId = api.user.breweries[0];
    const [wrongBrewery] = getRandomArrayMembers(await getExistingBreweryIds(), 1);
    const { uid: newUid } = await api.request({
      url: "/admin/users",
      method: "post",
      data: {
        ...testData,
        breweries: [wrongBrewery],
        email: `${randomString(6)}@spirithub.com`
      }
    });
    await expectError(
      api.request({
        url: `/breweries/${breweryId}/users/${newUid}`,
        method: "delete"
      }),
      "unauthorized"
    );

    // cleanup
    await api.request({ url: `/admin/users/${newUid}`, method: "delete" });
  });

  after(async function () {
    await api.deleteUser();
  });
});
