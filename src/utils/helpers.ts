import { Routes } from "../config/routeConfig";

export const isSubPath = (parent: string, child: string) => {
  const parentTokens = parent.split("/");
  const childTokens = child.split("/");
  return parentTokens.every((parentToken, index) => {
    return parentToken === childTokens[index];
  });
};

export const getAllowedRoles = (path: string, routes: Routes) => {
  let route = "/";
  for (const r in routes) {
    if (isSubPath(r, path)) {
      route = r.length >= route.length ? r : route;
    }
  }
  return routes[route] && routes[route].roles;
};

export const parseQueryString = (
  queriesToRetrieve: string[],
  fullQueryString: string
) => {
  if (!fullQueryString) {
    return [];
  }
  const queryString = fullQueryString.replace("?", "");
  const output: string[] = [];
  const keyValuePairs = queryString.split("&");
  const queryMap = keyValuePairs.reduce((map: any, keyValueString) => {
    const [key, value] = keyValueString.split("=");
    if (!Object.hasOwn(map, key)) {
      map[key] = value;
    } else {
      map[key] = [...map[key], value];
    }
    return map;
  }, {});
  const remainder = queriesToRetrieve.reduce((qString, query) => {
    output.push(queryMap[query]);
    const [before, ...rest] = qString.split(query + "=");
    const keep = rest && rest.join(query + "=");
    let result, remaining;
    if (keep) {
      [result, ...remaining] = keep.split("&");
    }
    const after = remaining && remaining.join("&");
    const remainingString = (before || "") + (after || "");
    return remainingString;
  }, queryString);
  const trimmedRemainder =
    remainder.at(-1) === "&"
      ? remainder.slice(0, remainder.length - 1)
      : remainder;
  return [...output, trimmedRemainder];
};

export const stringDiff = (strA: string, strB: string) => {
  console.log("stringDiff called");
  if (!strA) {
    return strB;
  }
  if (!strB) {
    return strA;
  }
  const [longer, shorter] =
    strA.length > strB.length ? [strA, strB] : [strB, strA];
  const emptyDiffArray = () => Array(longer.length).fill("");
  const diffs = longer.split("").reduce(
    (diffArrays: string[][], char, index) => {
      if (char !== shorter[index]) {
        diffArrays[0][index] = char;
        diffArrays[1][index] = shorter[index];
      }
      return diffArrays;
    },
    [emptyDiffArray(), emptyDiffArray()]
  );
  return diffs.map((diffArray) => diffArray.join(""));
};

// to time execution of synchronous functions
export const timeFunction = (fn: () => any, ...args: any) => {
  const start = Date.now();
  const result = fn(...(args as []));
  const end = Date.now();
  return [end - start, result];
};

// this function will only stringify functions, and objects with functions occurring at the root level of the object. More deeply nested functions will be converted to null.
export const stringifyObjectWithFunctions = (
  obj: Record<string, any>,
  { keysToExclude = [], stringifyFunctions = true } = {}
) => {
  return JSON.stringify(obj, (key: string, value: any) => {
    if (keysToExclude.includes(key)) {
      return null;
    }
    if (typeof value === "function" && stringifyFunctions) {
      return String(value);
    }
    return value;
  });
};

// without the second argument, which is either an array of string keys or the string "all", this function has no way to know which strings to evaluate as functions, and which to leave as strings.
export const parseObjectWithFunctions = (
  jsonString: string,
  keysToParseAsFunctions: string[] | "all"
) => {
  return JSON.parse(jsonString, (key: string, value: any) => {
    if (
      keysToParseAsFunctions === "all" ||
      keysToParseAsFunctions.includes(key)
    ) {
      return eval(value);
    }
    return value;
  });
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const logWithLineNumber = (message?: string) => {
  const error = new Error();
  const { stack } = error;
  const errorStackLines = stack.split("\n");
  const calledFrom = errorStackLines.slice(3, 4)[0].trim();
  console.log(`${message ?? ""}${(calledFrom && `: ${calledFrom}`) ?? ""}`);
};

export const deepEquals = (
  value1: any,
  value2: any,
  stringifyFunctions = true,
  keysToExclude?: string[]
) => {
  const value1String = stringifyObjectWithFunctions(value1, {
    keysToExclude: keysToExclude || [],
    stringifyFunctions,
  });
  const value2String = stringifyObjectWithFunctions(value2, {
    keysToExclude: keysToExclude || [],
    stringifyFunctions,
  });
  return value1String === value2String;
};
