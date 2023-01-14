const DEFAULT_CACHE_EXPIRATION_TIME =
  process.env.DEFAULT_CACHE_EXPIRATION_TIME || 1000 * 60 * 15;

export const LocalCache = function () {
  return {
    _cache: new Map(),
    get: async function (key) {
      const entry = this._cache.get(key);
      if (entry) {
        if (Date.now() >= entry.expires) {
          if (entry.updateFn) {
            return entry.updateFn().then((freshData) => {
              console.log("updateFn called for key:", key);
              this.put(key, freshData, {
                updateFn: entry.updateFn,
                expirationTime: entry.expirationTime,
              });
              return freshData;
            });
          }
          this._cache.delete(key);
          return null;
        }
        return entry.value;
      }
      return null;
    },
    put: function (key, value, { updateFn, expirationTime = 0 }) {
      const data = {
        expirationTime,
        expires: Date.now() + expirationTime,
        value,
        updateFn,
      };
      this._cache.set(key, data);
    },
    clear: function () {
      this._cache.clear();
    },
    get keys() {
      return this._cache.keys();
    },
    get size() {
      return this._cache.size;
    },
    invalidate: function (key) {
      const keys = Array.isArray(key) ? key : [key];
      for (const cacheKey of keys) {
        const entry = this._cache.get(cacheKey);
        const invalidatedEntry = {
          ...entry,
          expires: Date.now(),
        };
        this._cache.set(cacheKey, invalidatedEntry);
      }
    },
  };
};

const localCache = new LocalCache();

export const getCachedTable = async (tableName, updateFn, expirationTime) => {
  console.log(
    `getCachedTable called for ${tableName}, with updateFn: ${updateFn}`
  );
  let tableData = await localCache.get(tableName);
  const dataExists =
    tableData &&
    (Array.isArray(tableData)
      ? tableData.length
      : typeof dataExists === "object"
      ? Object.keys(dataExists).length
      : true);
  if (!dataExists) {
    const data = await updateFn();
    localCache.put(tableName, data, {
      updateFn,
      expirationTime,
    });
    tableData = data;
  }
  return tableData;
};

export const isExistingTableAttribute = (
  tableName,
  updateFn,
  expirationTime = DEFAULT_CACHE_EXPIRATION_TIME
) => {
  return async (inputStr, tableAttribute) => {
    const tableData = await getCachedTable(tableName, updateFn, expirationTime);
    const attributeArray = tableData.map((row) => row[tableAttribute]);
    return attributeArray.includes(inputStr);
  };
};

export default localCache;
