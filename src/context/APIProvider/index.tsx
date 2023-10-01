import { createContext, useCallback, useState } from "react";
import {
  QueryFunction,
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import APIRequest, { API_URL, ADMIN_PATH } from "../../utils/APIRequest";
import useAuth from "../../hooks/useAuth";
import {
  UserData,
  APIError,
  BreweryData,
  BrewhouseData,
  ChildProps,
  FermentableData,
  HopData,
  WaterData,
  YeastData,
  MiscData,
  MashData,
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
  const currentBrewery = auth?.currentBrewery;
  const breweryPath = `${API_URL}/breweries/${currentBrewery}`;
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
        ["users", auth?.accessToken, auth?.user?.role], // a react-query queryKey is like the dependency array of a useEffect hook, a change in one of the elements will trigger a refetch
        apiRequest({
          baseURL: auth?.user?.role === "admin" ? ADMIN_PATH : breweryPath,
          url: "/users",
        }) as QueryFunction<UsersData, QueryKey>,
        {
          staleTime: 60 * 1000 * 5,
          enabled: Boolean(enabledQueries.users),
        }
      ),
      enable: toggleQueryFn("users", true),
      disable: toggleQueryFn("users", false),
    },

    breweries: {
      ...useQuery<BreweriesData, ErrorData>(
        ["breweries", auth?.accessToken],
        apiRequest({
          url: "/breweries",
        }) as QueryFunction<BreweriesData, QueryKey>,
        {
          staleTime: 60 * 1000 * 10,
          enabled: Boolean(enabledQueries.breweries),
        }
      ),
      enable: toggleQueryFn("breweries", true),
      disable: toggleQueryFn("breweries", false),
    },

    brewhouses: {
      ...useQuery<BrewhousesData, ErrorData>(
        ["brewhouses", currentBrewery, auth?.accessToken],
        apiRequest({
          baseURL: breweryPath,
          url: "/brewhouses",
        }) as QueryFunction<BrewhousesData, QueryKey>,
        {
          staleTime: 60 * 1000 * 10,
          enabled: Boolean(enabledQueries.brewhouses),
        }
      ),
      enable: toggleQueryFn("brewhouses", true),
      disable: toggleQueryFn("brewhouses", false),
    },

    fermentables: {
      ...useQuery<FermentableData, ErrorData>(
        ["fermentables", currentBrewery, auth?.accessToken],
        apiRequest({
          baseURL: breweryPath,
          url: "fermentables",
        }) as QueryFunction<FermentableData, QueryKey>,
        {
          staleTime: 60 * 1000 * 10,
          enabled: Boolean(enabledQueries.fermentables),
        }
      ),
      enable: toggleQueryFn("fermentables", true),
      disable: toggleQueryFn("fermentables", false),
    },

    hops: {
      ...useQuery<HopData, ErrorData>(
        ["hops", currentBrewery, auth?.accessToken],
        apiRequest({
          baseURL: breweryPath,
          url: "hops",
        }) as QueryFunction<HopData, QueryKey>,
        {
          staleTime: 60 * 1000 * 10,
          enabled: Boolean(enabledQueries.hops),
        }
      ),
      enable: toggleQueryFn("hops", true),
      disable: toggleQueryFn("hops", false),
    },

    mashes: {
      ...useQuery<MashData, ErrorData>(
        ["mashes", currentBrewery, auth?.accessToken],
        apiRequest({
          baseURL: breweryPath,
          url: "mashes",
        }) as QueryFunction<MashData, QueryKey>,
        {
          staleTime: 60 * 1000 * 10,
          enabled: Boolean(enabledQueries.mashes),
        }
      ),
      enable: toggleQueryFn("mashes", true),
      disable: toggleQueryFn("mashes", false),
    },

    waters: {
      ...useQuery<WaterData, ErrorData>(
        ["waters", currentBrewery, auth?.accessToken],
        apiRequest({
          baseURL: breweryPath,
          url: "waters",
        }) as QueryFunction<WaterData, QueryKey>,
        {
          staleTime: 60 * 1000 * 10,
          enabled: Boolean(enabledQueries.waters),
        }
      ),
      enable: toggleQueryFn("waters", true),
      disable: toggleQueryFn("waters", false),
    },

    yeasts: {
      ...useQuery<YeastData, ErrorData>(
        ["yeasts", currentBrewery, auth?.accessToken],
        apiRequest({
          baseURL: breweryPath,
          url: "yeasts",
        }) as QueryFunction<YeastData, QueryKey>,
        {
          staleTime: 60 * 1000 * 10,
          enabled: Boolean(enabledQueries.yeasts),
        }
      ),
      enable: toggleQueryFn("yeasts", true),
      disable: toggleQueryFn("yeasts", false),
    },

    miscs: {
      ...useQuery<MiscData, ErrorData>(
        ["miscs", currentBrewery, auth?.accessToken],
        apiRequest({
          baseURL: breweryPath,
          url: "miscs",
        }) as QueryFunction<MiscData, QueryKey>,
        {
          staleTime: 60 * 1000 * 10,
          enabled: Boolean(enabledQueries.miscs),
        }
      ),
      enable: toggleQueryFn("miscs", true),
      disable: toggleQueryFn("miscs", false),
    },
  };

  const resetAPI = useCallback(async () => {
    // used at logout
    await queryClient.cancelQueries();
    // remove data for all active queries, without removing them from the cache or triggering a refetch
    await queryClient.setQueriesData({ type: "active" }, (): any => null);
    console.log("API cache reset");
  }, [queryClient]);

  const invalidateAll = useCallback(async () => {
    await queryClient.cancelQueries();
    console.log("invalidating all cached API queries");
    return queryClient.invalidateQueries({ refetchType: "none" });
  }, [queryClient]);

  const refetchAll = useCallback(async () => {
    console.log("refetching all API queries");
    return queryClient.refetchQueries();
  }, [queryClient]);

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
    breweryPath,
    currentBrewery,
    ADMIN_PATH,
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
