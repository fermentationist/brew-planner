//test helpers

export const randomInt = (min, max, exclude = []) => {
  let output = Math.floor(Math.random() * (max - min + 1)) + min;
  while (exclude.includes(output)) {
    output = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return output;
};

export const randomFloat = (min, max, decimalPlaces, exclude=[]) => {
  let output = Math.floor(((Math.random() * (max - min + 1)) + min) * (10 ** decimalPlaces)) / (10 ** decimalPlaces);
  while (exclude.includes(output) || output > max || output < min) {
    output = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return output;
}

export const getRandomArrayMembers = (array, num) => {
  const arrayCopy = [...array];
  const outputArray = [];
  for (let i = 0; i < num; i++) {
    const randomIndex = randomInt(0, arrayCopy.length - 1);
    const item = arrayCopy.splice(randomIndex, 1);
    outputArray.push(...item);
  }
  return outputArray;
};

export const randomString = (length, lettersOnly = false) => {
  let chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  if (lettersOnly) {
    chars = chars.slice(0, chars.indexOf("0"));
  }
  return Array(length)
    .fill(null)
    .map(() => chars[randomInt(0, chars.length - 1)])
    .join("");
};

export const useTimeout = (ms = 1000) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const toCamelCase = str => {
  return str
    .replace(/([_-][a-z])/gi, captureGroup => captureGroup.toUpperCase()) // turns "snake_case" into "snake_Case"
    .replace(/[_-]/gi, ""); // turns "snake_Case" into "snakeCase"
};

export const toSnakeCase = str => {
  return str
  .replace(/(.?[A-Z])/g, captureGroup => {
    return captureGroup[0] + "_" + captureGroup[1].toLowerCase();
  }) // turns "camelCase" into "camel_case"
  .replace(/(-{1}.?)/g, captureGroup => {
    return "_" + captureGroup[1]
  }); // turns "kebab-case" into "kebab_case"
}


/* 
cleanQueryResult example
input:
{ 
  variant_key: 1,
  some_other_column: null,
  different_key: "value",
  added_at: "2022-07-25T14:10:01.000Z" (Date object)
}
output:
{
  someOtherColumn: null,
  addedAt: 1658758201000
}
*/
export const cleanQueryResult = result => {
  let cleanedResult = {};
  if (result && typeof result === "object") { // non-null objects
    if (Array.isArray(result)) { // arrays
      cleanedResult = result.map(item => cleanQueryResult(item));
    } else { // objects
      for (const key in result) {
        if (!key.includes("_key")) {
          // exclude "key" attributes, i.e. inventory_key or product_key
          const value = result[key];
          if (value instanceof Date) { // replace date output with unix timestamps
            cleanedResult[toCamelCase(key)] = new Date(value).getTime();
          } else if (value && typeof value === "object") {
            cleanedResult[toCamelCase(key)] = cleanQueryResult(value);
          } else {
            cleanedResult[toCamelCase(key)] = result[key]; // camelCase the object keys
          }
        }
      }
    }
  } else { // primitive values
    cleanedResult = result; 
  }
  return cleanedResult;
};

export const removeKeys = input => { 
  let cleanedOutput = {};
  if (input && typeof input === "object") { 
    if (Array.isArray(input)) { // arrays
      cleanedOutput = input.map(item => removeKeys(item));
    } else { // objects
      for (const key in input) {
        if (!key.toLowerCase().includes("key")) {
          // exclude "key" attributes, i.e. inventoryKey or productKey
          cleanedOutput[key] = input[key];
        }
      }
    }
  } else { // primitive values
    cleanedOutput = input;
  }
  return cleanedOutput;
}

export const rejectOnFalse = fn => {
  return async (...args) => {
    const success = await fn(...args);
    if (success) {
      return Promise.resolve(success);
    }
    return Promise.reject(false);
  }
}

export default {
  randomInt,
  getRandomArrayMembers,
  useTimeout,
  randomString,
  toCamelCase,
  cleanQueryResult,
  rejectOnFalse
};
