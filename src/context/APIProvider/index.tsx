import { createContext, useCallback, useState } from "react";
import { ChildProps } from "../../types";
import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import APIRequest, { API_URL } from "../../utils/APIRequest";
import useAuth from "../../hooks/useAuth";
import { UserData, APIError, BreweryData, BrewhouseData } from "../../types";

export const APIContext = createContext({} as any);

export type ReactQueryResult = UseQueryResult<any, any> & {
  enable?: () => void;
  disable?: () => void;
};

const APIProvider = function (props: ChildProps) {
  const { auth } = useAuth();
  const CURRENT_BREWERY = auth?.currentBrewery;
  const BREWERY_ROUTE = `${API_URL}/breweries/${CURRENT_BREWERY}`;
  const [enabledQueries, setEnabledQueries] = useState(
    {} as Record<string, boolean>
  );
  const queryClient = useQueryClient();

  type UsersData = { data: UserData[]; status: string };
  type ErrorData = { error: APIError; status: string };
  type BreweriesData = { data: BreweryData[]; status: string };
  type BrewhousesData = { data: BrewhouseData[]; status: string };

  const toggleQueryFn = (queryName: string, boolean: boolean) => () =>
    setEnabledQueries((prevState) => {
      console.log(`"${queryName}" query ${boolean ? "enabled" : "disabled"}`);
      return {
        ...prevState,
        [queryName]: boolean,
      };
    });

  const apiRequest =
    ({ url, baseURL }: { url: string; baseURL?: string }) =>
    ({ signal }: { signal?: AbortSignal }) => {
      return new APIRequest({
        baseURL,
        url,
        method: "get",
        signal,
      }).request();
    };

  const apiRequests: Record<string, ReactQueryResult> = {
    // API Requests
    users: {
      ...useQuery<UsersData, ErrorData>({
        queryKey: ["users", auth?.accessToken], // a react-query queryKey is like the dependency array of a useEffect hook, a change in one of the elements will trigger a refetch
        queryFn: apiRequest({ url: "/users" }),
        staleTime: 60 * 1000 * 5,
        enabled: Boolean(enabledQueries.users),
      }),
      enable: useCallback(toggleQueryFn("users", true), []),
      disable: useCallback(toggleQueryFn("users", false), []),
    },

    breweries: {
      ...useQuery<BreweriesData, ErrorData>({
        queryKey: ["breweries", auth?.accessToken],
        queryFn: apiRequest({
          baseURL: API_URL,
          url: "/breweries",
        }),
        staleTime: 60 * 1000 * 10,
        enabled: Boolean(enabledQueries.breweries),
      }),
      enable: useCallback(toggleQueryFn("breweries", true), []),
      disable: useCallback(toggleQueryFn("breweries", false), []),
    },

    brewhouses: {
      ...useQuery<BrewhousesData, ErrorData>({
        queryKey: ["brewhouses", auth?.currentBrewery, auth?.accessToken],
        queryFn: apiRequest({
          baseURL: BREWERY_ROUTE,
          url: "/brewhouses",
        }),
        staleTime: 60 * 1000 * 10,
        enabled: Boolean(enabledQueries.brewhouses),
      }),
      enable: useCallback(toggleQueryFn("brewhouses", true), []),
      disable: useCallback(toggleQueryFn("brewhouses", false), []),
    },
  };

  console.log("\nAPI_REQUESTS:", apiRequests);

  const resetAPI = useCallback(async () => {
    // used at logout
    await queryClient.cancelQueries();
    // remove data for all active queries, without removing them from the cache or triggering a refetch
    await queryClient.setQueriesData({ type: "active" }, (): any => null);
    console.log("API cache reset");
  }, []);

  const invalidateAll = useCallback(async () => {
    await queryClient.cancelQueries();
    console.log("invalidating all cached API queries");
    return queryClient.invalidateQueries({ refetchType: "none" });
  }, []);

  const refetchAll = useCallback(async () => {
    console.log("refetching all API queries");
    return queryClient.refetchQueries();
  }, []);

  const disableAll = useCallback(() => {
    setEnabledQueries({});
    console.log("all API queries disabled");
  }, []);

  return (
    <APIContext.Provider
      value={{
        ...apiRequests,
        resetAPI,
        refetchAll,
        invalidateAll,
        disableAll,
        queryClient,
        API_URL,
        BREWERY_ROUTE,
        CURRENT_BREWERY,
        APIRequest,
      }}
    >
      {props.children}
    </APIContext.Provider>
  );
};

export default APIProvider;
