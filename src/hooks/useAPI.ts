import { useContext, useMemo, useRef } from "react";
import { APIContext } from "../context/APIProvider";

const useAPI = (apisToInclude?: string | string[]) => {
  /* 
  if invoked without arguments, will return an object with all registered API queries
  if invoked with a string, will return the API query corresponding to that name
  if invoked with an array, will return multiple API queries
  */
  const memoizedOutputRef = useRef(null);
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

  
  const memoizeAPIData: any = (objToMemoize: any) => {
    const getDepString = (obj: any) => {
      const objCopy = {...obj};
      delete objCopy.queryClient; // queryClient it is circular
      return JSON.stringify(objCopy);
    }
    const oldDeps = getDepString(memoizedOutputRef.current);
    const newDeps = getDepString(objToMemoize);
    if(oldDeps === newDeps) {
      return memoizedOutputRef.current;
    }
    memoizedOutputRef.current = objToMemoize;
    return objToMemoize;
  }

  const output = {
    ...apiRequests,
    resetAPI: api.resetAPI,
    refetchAll: api.refetchAll,
    invalidateAll: api.invalidateAll,
    queryClient: api.queryClient,
    BREWERY_ROUTE: api.BREWERY_ROUTE,
    CURRENT_BREWERY: api.CURRENT_BREWERY,
    API_URL: api.API_URL,
    APIRequest: api.APIRequest,
  }
  return memoizeAPIData(output);
}

export default useAPI;