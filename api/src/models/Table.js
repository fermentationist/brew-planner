import db from "../services/db/index.js";
import { toCamelCase, toSnakeCase } from "../utils/helpers.js";

const camelCaseObject = object => {
  const newObject = {};
  for (const key in object) {
    newObject[toCamelCase(key)] = object[key];
  }
  return newObject;
}

const snakeCaseObject = object => {
  const newObject = {};
  for (const key in object) {
    newObject[toSnakeCase(key)] = object[key];
  }
  return newObject;
}

// removes keys containing the substring "_key", changes Date objects to Unix timestamps and camelCases keys
const cleanResults = (resultsArray) => {
  return resultsArray.map(row => {
    const rowCopy = {...row};
    for (const key in rowCopy) {
      if (key.includes("_key")) {
        delete rowCopy[key];
        continue;
      }
      const value = rowCopy[key];
      if (value instanceof Date) {
        rowCopy[key] = value.getTime();
      }
    }
    return camelCaseObject(rowCopy);
  });
}

export default class Table {
  constructor (tableName) {
    this.tableName = tableName;
    this.columns = [];
    this.isInitialized = false;
  }

  async init () {
    if (this.isInitialized) {
      return;
    }
    const results = await db.queryProm("SHOW COLUMNS FROM " + this.tableName);
    this.columns = results.map(result => result.Field);
    this.isInitialized = true;
    return;
  }

  async select (params) {
    await this.init();
    const snakeCaseParams = snakeCaseObject(params);
    const results = await db.selectProm(this.tableName, this.columns, snakeCaseParams);
    return cleanResults(results);
  }

  async update (updates, params) {
    await this.init();
    const snakeCaseParams = snakeCaseObject(params);
    const snakeCaseUpdates = snakeCaseObject(updates);
    return db.updateProm(this.tableName, this.columns, snakeCaseUpdates, snakeCaseParams);
  }

  async insert (rows) {
    await this.init();
    const snakeCaseRows = rows.map(row => snakeCaseObject(row));
    return db.insertProm(this.tableName, this.columns, snakeCaseRows);
  }

  async delete (params) {
    await this.init();
    const snakeCaseParams = snakeCaseObject(params);
    return db.deleteProm(this.tableName, this.columns, snakeCaseParams);
  }
}