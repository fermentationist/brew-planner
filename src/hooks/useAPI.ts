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

  /* expample of output:
  {
    status: string,
    fetchStatus: string,
    isLoading: boolean,
    isSuccess: boolean,
    isError: boolean,
    data: null | object,
    dataUpdatedAt: timestamp,
    error: null | object,
    errorUpdatedAt: number,
    failureCount: number,
    errorUpdateCount: number,
    isFetched: boolean,
    isFetchedAfterMount: boolean,
    isFetching: boolean,
    isRefetching: boolean,
    isLoadingError: boolean,
    isPaused: boolean,
    isPlaceholderData: boolean,
    isPreviousData: boolean,
    isRefetchError: boolean,
    isStale: boolean,
    remove: function,
    resetAPI: function,
    refetch: function,
    refetchAll: function,
    invalidateAll: function,
    queryClient: null | object,
    breweryPath: string,
    currentBrewery: string,
    ADMIN_PATH:string,
    API_URL: string,
    APIRequest: object,
  }
  
  */
  return deepMemoize(output, "useAPI", {keysToExclude: ["queryClient"]});
}

export default useAPI;