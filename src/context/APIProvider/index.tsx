import { createContext } from "react";
import { ChildProps } from "../../types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAPI, { APIRequest, API_URL } from "../../hooks/useAPI";
import useAuth from "../../hooks/useAuth";

export const APIContext = createContext({} as any);

const APIProvider = function (props: ChildProps) {
  const { auth } = useAuth();
  const { BREWERY_ROUTE } = useAPI();
  const queryClient = useQueryClient();

  const apiRequests = {

    // API Requests
    users: useQuery(
      ["users", auth?.accessToken],// a react-query queryKey is like the dependency array of a useEffect hook, a change in one of the elements will trigger a refetch
      new APIRequest({ url: "/users", method: "get" }).request,
      { staleTime: 60 * 1000 * 5 }
    ),

    breweries: useQuery(
      ["breweries", auth?.accessToken],
      new APIRequest({ baseURL: API_URL, url: "/breweries", method: "get" })
        .request,
      { staleTime: 60 * 1000 * 10}
    ),

    brewhouses: useQuery(
      ["brewhouses", auth?.currentBrewery, auth?.accessToken],
      new APIRequest({ baseURL: BREWERY_ROUTE, url: "/brewhouses", method: "get" })
        .request,
      { staleTime: 60 * 1000 * 10}
    ),

    inventory: useQuery(
      ["inventory", auth?.currentBrewery, auth?.accessToken], 
      new APIRequest({ baseURL: BREWERY_ROUTE, url: "/inventory", method: "get" }).request,
      { staleTime: 60 * 1000}
    ),

    variants: useQuery(
      ["variants", auth?.accessToken],
      new APIRequest({ baseURL: API_URL, url: "/variants", method: "get"}).request,
      { staleTime: 60 * 1000 * 5}
    ),

    orders: useQuery(
      ["orders", auth?.accessToken],
      new APIRequest({ baseURL: API_URL, url: "/admin/orders", method: "get"}).request,
      { staleTime: 60 * 1000}
    ),

    shipments: useQuery(
      ["shipments", auth?.accessToken, auth?.currentBrewery],
      new APIRequest({ baseURL: BREWERY_ROUTE, url: "/shipments", method: "get"}).request,
      { staleTime: 60 * 1000}
    ),

    randomID: Math.floor(Math.random() * 10000000000)
  };

  const resetAPI = async () => {
    // used at logout
    await queryClient.cancelQueries();
    // remove data for all active queries, without removing them from the cache or triggering a refetch
    await queryClient.setQueriesData({ type: "active" }, (): any => null);
    console.log("API cache reset");
  };

  const invalidateAll = async () => {
    await queryClient.cancelQueries();
    return queryClient.invalidateQueries({refetchType: "none"});
  };

  const refetchAll = async () => {
    return queryClient.refetchQueries();
  };

  return (
    <APIContext.Provider
      value={{
        ...apiRequests,
        resetAPI,
        refetchAll,
        invalidateAll,
        queryClient
      }}
    >
      {props.children}
    </APIContext.Provider>
  );
};

export default APIProvider;
