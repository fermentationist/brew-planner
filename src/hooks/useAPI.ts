import { useContext } from "react";
import { APIContext } from "../context/APIProvider";
import * as ApiRequest from "../utils/APIRequest";
import useAuth from "./useAuth";

// re-exported from this file for convenience
export const APIRequest = ApiRequest.default;
export const API_URL = ApiRequest.API_URL;

const useAPI = (apiName?: string) => {
  const { auth } = useAuth();
  const api = useContext(APIContext);
  console.log("useAPI called:", api)
  const apiRequest = api[apiName] || api;
  const BREWERY_ROUTE = `${API_URL}/breweries/${auth?.currentBrewery}`;

  const output = {
    ...apiRequest,
    resetAPI: api.resetAPI,
    refetchAll: api.refetchAll,
    invalidateAll: api.invalidateAll,
    queryClient: api.queryClient,
    BREWERY_ROUTE
  }
  return output;
}

export default useAPI;

