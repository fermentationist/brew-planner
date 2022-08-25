import { Routes } from "../config/routeConfig";

export const isSubPath = (parent: string, child: string) => {
  const parentTokens = parent.split("/");
  const childTokens = child.split("/");
  return parentTokens.every((parentToken, index) => {
    return parentToken === childTokens[index];
  });
}

export const getAllowedRoles = (path: string, routes: Routes) => {
  let route = "/";
  for (const r in routes) {
    if(isSubPath(r, path)) {
      route = r.length >= route.length ? r : route;
    }
  }
  return routes[route] && routes[route].roles;
}

export const parseQueryString = (queriesToRetrieve: string[], fullQueryString: string) => {
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
      ([result, ...remaining] = keep.split("&"));
    }
    const after = remaining && remaining.join("&");
    const remainingString = (before || "") + (after || "");
    return remainingString;
  }, queryString);
  const trimmedRemainder = remainder.at(-1) === "&" ? remainder.slice(0, remainder.length - 1) : remainder;
  return [
    ...output,
    trimmedRemainder
  ];
}
