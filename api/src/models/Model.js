/* global Buffer */
import db from "../services/db/index.js";
import { objectKeysToCamelCase, objectKeysToSnakeCase } from "../utils/helpers.js";
import {parse as uuidParse} from "uuid";

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

export const convertBooleansToIntegers = object => {
  const newObj = {};
  for (const key in object){
    let value = object[key];
    if (typeof value === "boolean") {
      value = value ? 1 : 0;
    } 
    newObj[key] = value;
  }
  return newObj;
}

// converts object keys to camelCase, converts string UUIDs to binary, converts boolean values to 1 or 0
export const prepareInputObjectForDB = object => {
  const paramsWithBinaryUuids = convertObjectUUIDsToBuffers(object);
  const snakeCaseParams = objectKeysToSnakeCase(paramsWithBinaryUuids);
  const paramsWithIntegerBooleans = convertBooleansToIntegers(snakeCaseParams);
  return paramsWithIntegerBooleans;
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
    return objectKeysToCamelCase(rowCopy);
  });
}

export default class Model {
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
    const preppedParams = prepareInputObjectForDB(params);
    const results = await db.selectProm(this.tableName, this.columns, preppedParams);
    return cleanResults(results);
  }

  async update (updates, params) {
    await this.init();
    const preppedParams = prepareInputObjectForDB(params);
    const preppedUpdates = prepareInputObjectForDB(updates);
    return db.updateProm(this.tableName, this.columns, preppedUpdates, preppedParams);
  }

  async insert (rows, ignore = true) {
    await this.init();
    const preppedRows = rows.map(row => prepareInputObjectForDB(row));
    return db.insertProm(this.tableName, this.columns, preppedRows, ignore);
  }

  async delete (params) {
    await this.init();
    const preppedParams = prepareInputObjectForDB(params);
    return db.deleteProm(this.tableName, this.columns, preppedParams);
  }
}