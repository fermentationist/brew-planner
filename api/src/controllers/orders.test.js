/* global it, describe, before, after */
import TestAPI from "../../test/TestAPI.js";
import assert from "assert";
import { assertEqualIfCondition } from "../../test/testHelpers.js";

const api = new TestAPI();

// test helpers
const validateOrdersArray = input => {
  for (const order of input) {
    assert.strictEqual(typeof order.orderId, "string");
    assert.strictEqual(typeof order.email, "string");
    assert.strictEqual(typeof order.subtotal, "number");
    assert.strictEqual(typeof order.tax, "number");
    assert.strictEqual(typeof order.shippingFee, "number");
    assert.strictEqual(typeof order.total, "number");
    assert.strictEqual(typeof order.isRefunded, "boolean");
    assertEqualIfCondition(order.billingStreet, typeof order.billingStreet, "string");
    assertEqualIfCondition(order.billingUnit, typeof order.billingUnit, "string");
    assertEqualIfCondition(order.billingCity, typeof order.billingCity, "string");
    assertEqualIfCondition(order.billingState, typeof order.billingState, "string");
    assertEqualIfCondition(order.billingZip, typeof order.billingZip, "string");
    assertEqualIfCondition(order.billingCountry, typeof order.billingCountry, "string");
    assert.strictEqual(typeof order.salesChannel.salesChannelId, "string");
    assert.strictEqual(typeof order.salesChannel.name, "string");
  }
}

// TESTS
export default describe("order routes", () => {
  it("/breweries/orders GET", async () => {
    await api.signInAsNewUser();
    const response = await api.request({
      url: "/breweries/orders",
      method: "get"
    });
    assert.strictEqual(response.status, "ok");
    await validateOrdersArray(response.orders);
  });

  after(async () => {
    await api.deleteUser();
  })
})
