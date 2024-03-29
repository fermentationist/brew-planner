import "dotenv/config";

const DEFAULT_CACHE_EXPIRATION_TIME =
  process.env.DEFAULT_CACHE_EXPIRATION_TIME || 1000 * 60 * 60;

export default class LocalCache {
  constructor() {
    this._cache = new Map();
  }

  async get(key) {
    const entry = this._cache.get(key);
    if (entry) {
      if (Date.now() >= entry.expires) {
        if (entry.updateFn) {
          return entry.updateFn().then((freshData) => {
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
  }

  put(key, value, { updateFn, expirationTime } = {}) {
    const data = {
      expirationTime,
      expires: Date.now() + (expirationTime || DEFAULT_CACHE_EXPIRATION_TIME),
      value,
      updateFn,
    };
    this._cache.set(key, data);
  }

  delete(key) {
    this._cache.delete(key);
  }

  clear() {
    this._cache.clear();
  }

  get keys() {
    return Array.from(this._cache.keys());
  }

  get size() {
    return this._cache.size;
  }

  invalidate(key) {
    const keys = Array.isArray(key) ? key : [key];
    for (const cacheKey of keys) {
      const entry = this._cache.get(cacheKey);
      const invalidatedEntry = {
        ...entry,
        expires: Date.now(),
      };
      this._cache.set(cacheKey, invalidatedEntry);
    }
  }

  async getOrFetch(
    key,
    updateFn,
    expirationTime = DEFAULT_CACHE_EXPIRATION_TIME
  ) {
    let tableData = await this.get(key);
    const dataExists =
      tableData &&
      (Array.isArray(tableData)
        ? tableData.length
        : typeof tableData === "object"
        ? Object.keys(tableData).length
        : true);
    if (!dataExists) {
      const data = await updateFn();
      this.put(key, data, {
        updateFn,
        expirationTime,
      });
      tableData = data;
    }
    return tableData;
  }

  isExistingTableAttribute(
    tableName,
    updateFn,
    expirationTime = DEFAULT_CACHE_EXPIRATION_TIME
  ) {
    return async (input, tableAttribute, requiredConditionsObject = {}) => {
      const tableData = await this.getOrFetch(
        tableName,
        updateFn,
        expirationTime
      );
      const filterForConditions = !!Object.keys(requiredConditionsObject)
        .length;
      const conditionFilter = (row) => {
        for (const attr in requiredConditionsObject) {
          const value = requiredConditionsObject[attr];
          if (Array.isArray(value)) {
            if (!value.includes(row[attr])) {
              return false;
            }
          } else if (row[attr] !== value) {
            return false;
          }
        }
        return true;
      }
      const filteredData = filterForConditions ? tableData.filter(conditionFilter) : tableData;
      const attributeArray = filteredData.map((row) => row[tableAttribute]);
      return attributeArray.includes(input);
    };
  }
}
