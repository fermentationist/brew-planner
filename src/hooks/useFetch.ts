import APIRequest from "../utils/APIRequest";
import {useState, useEffect, useMemo, useCallback} from "react";
import useAuth from "../hooks/useAuth";

const useFetch = (url: string) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshValue, setRefreshValue] = useState(0);
  const { auth } = useAuth();

  useEffect(() => {
    const getData = new APIRequest({
      url,
      method: "get"
    });
    console.log("new APIRequest:", getData);
    if (auth?.accessToken) {
      const fetchData = async () => {
        setLoading(true);
        const response = await getData
          .request()
          .catch((err: any) => setError(err));
        setResponse(response || null);
        setData(response?.data || null);
        setLoading(false);
      };
  
      fetchData();
    } else {
      console.log(`Request to ${url} cancelled because user is not logged in.`)
    }

    return () => {
      // cleanup
      getData.abort();
    };
  }, [refreshValue]);
   
  const refresh = () => setRefreshValue(Math.random());

  return {
    loading: useMemo(() => loading, [loading]),
    response: useMemo(() => response, [response && JSON.stringify(response)]),
    data: useMemo(() => data, [data && JSON.stringify(data)]),
    error: useMemo(() => error, [error && JSON.stringify(error)]),
    refresh: useCallback(refresh, [])
  }
}

export default useFetch;
