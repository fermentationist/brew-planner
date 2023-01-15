/* global describe, before, it, after */
import assert from "assert";
import { randomString } from "../../../utils/helpers.js";
import LocalCache from "../lib/localCache.js";

// utility functions
const createUpdateFnMock = (value) => () => Promise.resolve(value);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// TESTS
describe("localCache", () => {
  let localCache;
  const someKey = randomString(6),
    someOtherKey = randomString(6);
  const someValue = randomString(12),
    someOtherValue = randomString(12);
  before(() => {
    localCache = new LocalCache();
  });

  it("get - returns null if key does not exist", async () => {
    const result = await localCache.get(someKey);
    assert.strictEqual(result, null);
  });

  it("get - returns expected value for existing key", async () => {
    localCache._cache.set(someKey, {
      value: someValue,
      expires: Date.now() + 10000,
    });
    const result = await localCache.get(someKey);
    assert.strictEqual(result, someValue);
  });

  it("put - stores data for later retrieval", async () => {
    localCache.put(someOtherKey, someOtherValue);
    const result = await localCache.get(someOtherKey);
    assert.strictEqual(result, someOtherValue);
  });

  it("size - returns correct number of keys in cache", () => {
    assert.strictEqual(localCache.size, 2);
  });

  it("keys - returns all existing keys in cache", () => {
    assert.strictEqual(localCache.keys.length, 2);
    assert(localCache.keys.includes(someKey));
    assert(localCache.keys.includes(someOtherKey));
  });

  it("delete - removes data for specified key", async () => {
    const value = await localCache.get(someKey);
    assert.strictEqual(value, someValue);
    localCache.delete(someKey);
    const newValue = await localCache.get(someKey);
    assert.strictEqual(newValue, null);
  });

  it("clear - empties cache", async () => {
    localCache.clear();
    assert.strictEqual(localCache.size, 0);
    assert.strictEqual(localCache.keys.length, 0);
    const result = await localCache.get(someOtherKey);
    assert.strictEqual(result, null);
  });

  it("data expires when expirationTime is over", async () => {
    localCache.put(someKey, someValue, { expirationTime: 500 });
    const beforeExpiry = await localCache.get(someKey);
    assert.strictEqual(beforeExpiry, someValue);
    await sleep(501);
    const afterExpiry = await localCache.get(someKey);
    assert.strictEqual(afterExpiry, null);
    localCache.clear();
  });

  it("if updateFn is passed to put method, it will be called to refresh data when expirationTime is reached", async () => {
    const updateFn = createUpdateFnMock(someOtherValue);
    localCache.put(someKey, someValue, { expirationTime: 500, updateFn });
    const beforeExpiry = await localCache.get(someKey);
    assert.strictEqual(beforeExpiry, someValue);
    await sleep(501);
    const afterExpiry = await localCache.get(someKey);
    assert.strictEqual(afterExpiry, someOtherValue);
    localCache.clear();
  });

  it("invalidate - will cause updateFn to be called next time key is retrieved", async () => {
    const updateFn = createUpdateFnMock(someOtherValue);
    const twentyMins = 1000 * 60 * 20;
    localCache.put(someKey, someValue, {
      updateFn,
      expirationTime: twentyMins,
    });
    const beforeExpiry = await localCache.get(someKey);
    assert.strictEqual(beforeExpiry, someValue);
    localCache.invalidate(someKey);
    const afterInvalidation = await localCache.get(someKey);
    assert.strictEqual(afterInvalidation, someOtherValue);
    localCache.clear();
  });

  it("getOrFetch - will return value if key is present, else will call passed updateFn", async () => {
    const updateFn = createUpdateFnMock(someOtherValue);
    localCache.put(someKey, someValue);
    const existingValue = await localCache.getOrFetch(someKey);
    assert.strictEqual(existingValue, someValue);
    const fetchedValue = await localCache.getOrFetch(someOtherKey, updateFn);
    assert.strictEqual(fetchedValue, someOtherValue);
    localCache.clear();
  });

  it("isExistingTableAttribute - returns a function that checks if a value already exists in a specified column of a (cached) table", async () => {
    let callCount = 0;
    const mockTable = [
      { id: 1, val: "a" },
      { id: 2, val: "b" },
      { id: 3, val: "c" },
    ];
    const spyUpdateFn = async () => {
      callCount++;
      return Promise.resolve([...mockTable]);
    };
    const isExistingMockTableAttribute = localCache.isExistingTableAttribute(
      "mockTable",
      spyUpdateFn
    );
    const isExistingVal = (input) => isExistingMockTableAttribute(input, "val");
    const isExistingId = (input) => isExistingMockTableAttribute(input, "id");

    // table has not yet been cached, updateFn not yet called
    assert.strictEqual(callCount, 0);
    assert.strictEqual(await isExistingVal("a"), true);
    // updateFn has been called once
    assert.strictEqual(callCount, 1);
    // the results of updateFn have already been cached
    assert.strictEqual(await isExistingVal("b"), true);
    assert.strictEqual(await isExistingVal("c"), true);
    assert.strictEqual(await isExistingId(1), true);
    assert.strictEqual(await isExistingId(2), true);
    assert.strictEqual(await isExistingId(3), true);

    assert.strictEqual(await isExistingVal("d"), false);
    assert.strictEqual(await isExistingVal(1), false);
    assert.strictEqual(await isExistingId(4), false);
    assert.strictEqual(await isExistingId("a"), false);
    // so updateFn will not have been called again
    assert.strictEqual(callCount, 1);

    // update table
    mockTable.push({ id: 4, val: "d" });
    // old state of table is still cached
    assert.strictEqual(await isExistingVal("d"), false);
    assert.strictEqual(await isExistingId(4), false);
    // so updateFn will not have been called again
    assert.strictEqual(callCount, 1);

    localCache.invalidate("mockTable");
    // cache invalidated - now changes should be refelcted
    assert.strictEqual(await isExistingVal("d"), true);
    assert.strictEqual(await isExistingId(4), true);
    // updateFn was called again because of cache invalidation
    assert.strictEqual(callCount, 2);
  });
});
