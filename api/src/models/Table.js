import db from "../services/db/index.js";
import { toCamelCase, toSnakeCase } from "../utils/helpers.js";
import {parse as uuidParse} from "uuid";

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

export const convertUuidToBuffer = uuid => Buffer.from(uuidParse(uuid));

export const convertObjectUUIDsToBuffers = object => {
  const newObj = {};
  for (const key in object) {
    let value = object[key];
    if (key.toLowerCase().includes("uuid")) {
      value = Buffer.from(uuidParse(value));
    }
    newObj[key] = value;
  }
  return newObj;
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
    const paramsWithBinaryUuids = convertObjectUUIDsToBuffers(params);
    const snakeCaseParams = snakeCaseObject(paramsWithBinaryUuids);
    const results = await db.selectProm(this.tableName, this.columns, snakeCaseParams);
    return cleanResults(results);
  }

  async update (updates, params) {
    await this.init();
    const paramsWithBinaryUuids = convertObjectUUIDsToBuffers(params);
    const snakeCaseParams = snakeCaseObject(paramsWithBinaryUuids);
    const updatesWithBinaryUuids = convertObjectUUIDsToBuffers(updates);
    const snakeCaseUpdates = snakeCaseObject(updatesWithBinaryUuids);
    return db.updateProm(this.tableName, this.columns, snakeCaseUpdates, snakeCaseParams);
  }

  async insert (rows, ignore = true) {
    await this.init();
    const snakeCaseRows = rows.map(row => {
      const rowWithBinaryUuids = convertObjectUUIDsToBuffers(row);
      return snakeCaseObject(rowWithBinaryUuids);
    });
    return db.insertProm(this.tableName, this.columns, snakeCaseRows, ignore);
  }

  async delete (params) {
    await this.init();
    const paramsWithBinaryUuids = convertObjectUUIDsToBuffers(params);
    const snakeCaseParams = snakeCaseObject(paramsWithBinaryUuids);
    return db.deleteProm(this.tableName, this.columns, snakeCaseParams);
  }
}