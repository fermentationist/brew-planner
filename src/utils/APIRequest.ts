import axios from "axios";
import storage from "./storage";
import { opError } from "./errors";
const { getStorage } = storage("shRetail");

export const API_URL = import.meta.env.VITE_API_URL;

export default class APIRequest {
  config: any;
  abortController: AbortController;

  constructor(config: any) {
    this.config = config;
    this.abortController = new AbortController();
    this.config.signal = this.abortController.signal;
    this.config.baseURL = config.baseURL;

    // so methods still work if passed as higher-order functions
    this.request = this.request.bind(this);
    this.abort = this.abort.bind(this);
  }

  async request(additionalConfig = {}) {
    const globalState = getStorage("globalState");
    const authState = getStorage("authState");

    // accessToken check
    if (!authState?.accessToken) {
      return Promise.reject(opError("API Request unauthorized - access token needed"));
    }
    // safeMode check
    if (globalState?.safeMode && this.config?.method?.toLowerCase() !== "get") {
      return Promise.reject(opError("Safe Mode enabled - API Request blocked"));
    }

    const requestConfig = {
      ...this.config,
      baseURL: this.config.baseURL || (authState?.user?.role === "admin"
          ? `${API_URL}/admin`
          : `${API_URL}/breweries/${authState?.currentBrewery}`),
      headers: {
        ...this.config.headers,
        "Firebase-Token": authState?.accessToken
      },
      timeout: 20000,
      ...additionalConfig
    };

    // log request
    console.log("REQUEST: ");
    console.log(requestConfig);

    // return axios promise
    return axios(requestConfig)
      .then((response: any) => {
        // log response
        console.log("RESPONSE:");
        console.log(response);
        return response;
      })
      .catch(error => {
        if (requestConfig?.signal?.aborted) {
          // ignore "CanceledError"
          console.log("pending request aborted by client:", requestConfig);
        } else {
          let errorOutput = opError("Request failed", { name: "bad request" });
          const realError = error.response?.data?.error;
          if (realError) {
            errorOutput = opError(realError.message, {
              name: realError.name,
              status: error.response.status
            });
          } else if (error.message && error.response) {
            errorOutput = opError(error.message, {
              name: error.response.statusText,
              status: error.response.status
            });
          } else if (error.message || error.code) {
            if (error.message.includes("timeout") && error.name === "AxiosError") {
              errorOutput = opError("The server took too long to respond", {
                name: "Network error",
                status: 500
              });
            } else {
              errorOutput = opError(error.message || "Request failed", {
                name: error.name || error.code || "bad request"
              });
            }
          } else {
            errorOutput = opError(JSON.stringify(error));
          }

          // log error
          console.log("ERROR:");
          console.log(errorOutput);
          return Promise.reject(errorOutput);
        }
      });
  }

  abort() {
    this.abortController.abort();
  }
}
