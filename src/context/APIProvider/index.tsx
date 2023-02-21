import { createContext, useCallback, useState } from "react";
import { ChildProps, WaterData, YeastData } from "../../types";
import {
  QueryFunction,
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import APIRequest, { API_URL } from "../../utils/APIRequest";
import useAuth from "../../hooks/useAuth";
import {
  UserData,
  APIError,
  BreweryData,
  BrewhouseData,
  FermentableData,
  HopData,
  MiscData,
} from "../../types";
import useDeeperMemo from "../../hooks/useDeeperMemo";

export const APIContext = createContext({} as any);

export type ReactQueryResult = UseQueryResult<any, any> & {
  enable?: () => void;
  disable?: () => void;
};

const APIProvider = ({ children }: { children: ChildProps }) => {
  const { auth } = useAuth();
  const deepMemoize = useDeeperMemo();
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

  const toggleQueryFn = useCallback(
    (queryName: string, boolean: boolean) => () =>
      setEnabledQueries((prevState) => {
        console.log(`"${queryName}" query ${boolean ? "enabled" : "disabled"}`);
        return {
          ...prevState,
          [queryName]: boolean,
        };
      }),
    []
  );

  const apiRequest: <T>({
    url,
    baseURL,
  }: {
    url: string;
    baseURL?: string;
  }) => (...args: any[]) => Promise<T | Error> =
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
      ...useQuery<UsersData, ErrorData>(
        ["users", auth?.accessToken], // a react-query queryKey is like the dependency array of a useEffect hook, a change in one of the elements will trigger a refetch
        apiRequest({ url: "/users" }) as QueryFunction<UsersData, QueryKey>,
        {
          staleTime: 60 * 1000 * 5,
          enabled: Boolean(enabledQueries.users),
        }
      ),
      enable: useCallback(toggleQueryFn("users", true), []),
      disable: useCallback(toggleQueryFn("users", false), []),
    },

    breweries: {
      ...useQuery<BreweriesData, ErrorData>(["breweries", auth?.accessToken],
      apiRequest({
        baseURL: API_URL,
        url: "/breweries",
      }) as QueryFunction<BreweriesData, QueryKey>,
      {
        staleTime: 60 * 1000 * 10,
        enabled: Boolean(enabledQueries.breweries),
      }),
      enable: useCallback(toggleQueryFn("breweries", true), []),
      disable: useCallback(toggleQueryFn("breweries", false), []),
    },

    brewhouses: {
      ...useQuery<BrewhousesData, ErrorData>(["brewhouses", auth?.currentBrewery, auth?.accessToken],
      apiRequest({
        baseURL: BREWERY_ROUTE,
        url: "/brewhouses",
      }) as QueryFunction<BrewhousesData, QueryKey>,
      {
        staleTime: 60 * 1000 * 10,
        enabled: Boolean(enabledQueries.brewhouses),
      }),
      enable: useCallback(toggleQueryFn("brewhouses", true), []),
      disable: useCallback(toggleQueryFn("brewhouses", false), []),
    },

    fermentables: {
      ...useQuery<FermentableData, ErrorData>(["fermentables", auth?.currentBrewery, auth?.accessToken],
      apiRequest({
        baseURL: BREWERY_ROUTE,
        url: "fermentables",
      }) as QueryFunction<FermentableData, QueryKey>,
      {
        staleTime: 60 * 1000 * 10,
        enabled: Boolean(enabledQueries.fermentables),
      }),
      enable: useCallback(toggleQueryFn("fermentables", true), []),
      disable: useCallback(toggleQueryFn("fermentables", false), []),
    },

    hops: {
      ...useQuery<HopData, ErrorData>(["hops", auth?.currentBrewery, auth?.accessToken],
      apiRequest({
        baseURL: BREWERY_ROUTE,
        url: "hops",
      }) as QueryFunction<HopData, QueryKey>,
      {
        staleTime: 60 * 1000 * 10,
        enabled: Boolean(enabledQueries.hops),
      }),
      enable: useCallback(toggleQueryFn("hops", true), []),
      disable: useCallback(toggleQueryFn("hops", false), []),
    },

    waters: {
      ...useQuery<WaterData, ErrorData>(["waters", auth?.currentBrewery, auth?.accessToken],
      apiRequest({
        baseURL: BREWERY_ROUTE,
        url: "waters",
      }) as QueryFunction<WaterData, QueryKey>,
      {
        staleTime: 60 * 1000 * 10,
        enabled: Boolean(enabledQueries.waters),
      }),
      enable: useCallback(toggleQueryFn("waters", true), []),
      disable: useCallback(toggleQueryFn("waters", false), []),
    },

    yeasts: {
      ...useQuery<YeastData, ErrorData>(["yeasts", auth?.currentBrewery, auth?.accessToken],
      apiRequest({
        baseURL: BREWERY_ROUTE,
        url: "yeasts",
      }) as QueryFunction<YeastData, QueryKey>,
      {
        staleTime: 60 * 1000 * 10,
        enabled: Boolean(enabledQueries.yeasts),
      }),
      enable: useCallback(toggleQueryFn("yeasts", true), []),
      disable: useCallback(toggleQueryFn("yeasts", false), []),
    },

    miscs: {
      ...useQuery<MiscData, ErrorData>(["miscs", auth?.currentBrewery, auth?.accessToken],
      apiRequest({
        baseURL: BREWERY_ROUTE,
        url: "miscs",
      }) as QueryFunction<MiscData, QueryKey>,
      {
        staleTime: 60 * 1000 * 10,
        enabled: Boolean(enabledQueries.miscs),
      }),
      enable: useCallback(toggleQueryFn("miscs", true), []),
      disable: useCallback(toggleQueryFn("miscs", false), []),
    },
  };

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

  const contextValue = {
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
  };

  return (
    <APIContext.Provider
      value={deepMemoize(contextValue, "APIContext", {
        keysToExclude: ["queryClient"],
      })}
    >
      {children}
    </APIContext.Provider>
  );
};

export default APIProvider;
