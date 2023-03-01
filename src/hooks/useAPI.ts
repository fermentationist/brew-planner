import { useContext } from "react";
import { APIContext } from "../context/APIProvider";
import useDeeperMemo from "./useDeeperMemo";

const useAPI = (apisToInclude?: string | string[]) => {
  /* 
  if invoked without arguments, will return an object with all registered API queries
  if invoked with a string, will return the API query corresponding to that name
  if invoked with an array, will return multiple API queries
  */
  const deepMemoize = useDeeperMemo();
  const api = useContext(APIContext);
  let apiRequests = api;
  if (Array.isArray(apisToInclude)) {
    apiRequests = apisToInclude.reduce((map: Record<string, any>, apiName) => {
      map[apiName] = api[apiName];
      return map;
    }, {});

  } else if (apisToInclude) {
    apiRequests = api[apisToInclude];
  }

  const output = {
    ...apiRequests,
    resetAPI: api.resetAPI,
    refetchAll: api.refetchAll,
    invalidateAll: api.invalidateAll,
    queryClient: api.queryClient,
    breweryPath: api.breweryPath,
    currentBrewery: api.currentBrewery,
    ADMIN_PATH: api.ADMIN_PATH,
    API_URL: api.API_URL,
    APIRequest: api.APIRequest,
  }
  return deepMemoize(output, "useAPI", {keysToExclude: ["queryClient"]});
}

export default useAPI;