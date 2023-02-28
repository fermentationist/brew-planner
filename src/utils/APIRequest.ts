import axios, { AxiosInstance, AxiosError } from "axios";
import storage from "./storage";
import { firebaseAuth } from "../context/AuthProvider";
import { opError } from "./errors";
import { sleep } from "./helpers";
import { APIError } from "../types";
const { getStorage } = storage("brewPlanner");

export const API_URL = import.meta.env.VITE_API_URL;
export const ADMIN_PATH = `${API_URL}/admin`;

export default class APIRequest {
  config: Record<string, any>;
  abortController: AbortController;
  axiosInstance: AxiosInstance;
  retries: number;
  retryDelay: number;
  axiosRequestInterceptors: any;
  axiosResponseInterceptors: any;

  constructor(config: any) {
    this.config = config;
    this.abortController = new AbortController();
    this.config.signal = this.abortController.signal;
    this.config.baseURL = config.baseURL || API_URL;
    this.config.timeout = config.timeout ?? 20000;
    this.axiosInstance = axios.create();
    this.retries = config.retries ?? 3;
    this.retryDelay = config.retryDelay ?? 3000;
    // adding axios error response interceptor to retry failed requests
    this.axiosResponseInterceptors =
      this.axiosInstance.interceptors.response.use(
        config.successResponseInterceptor,
        config.errorResponseInterceptor || this.defaultErrorResponseInterceptor.bind(this)
      );
    
    this.request = this.request.bind(this);
    this.retry = this.retry.bind(this);
    this.abort = this.abort.bind(this);
  }

  defaultErrorResponseInterceptor(error: AxiosError<APIError>) {
    const axiosErrorMessage = error?.message?.toLowerCase();
    if (
      error.response?.data?.error?.message
        .toLowerCase()
        .includes("invalid token") &&
      this.retries
    ) {
      firebaseAuth.updateCurrentUser(firebaseAuth.currentUser);
      return this.retry();
    }
    if (
      (axiosErrorMessage.includes("timeout") ||
        axiosErrorMessage.includes("network error")) &&
      this.retries
    ) {
      return this.retry();
    }
    return Promise.reject(error);
  }

  async request<ResponseType>(
    additionalConfig = {}
  ): Promise<ResponseType | Error> {
    const globalState = getStorage("globalState");
    const authState = getStorage("authState");

    // accessToken check
    if (!authState?.accessToken) {
      return Promise.reject(
        opError("API Request unauthorized - access token needed")
      );
    }
    // safeMode check
    if (globalState?.safeMode && this.config?.method?.toLowerCase() !== "get") {
      return Promise.reject(opError("Safe Mode enabled - API Request blocked"));
    }

    const requestConfig = {
      ...this.config,
      headers: {
        ...this.config.headers,
        "Firebase-Token": authState?.accessToken,
      },
      ...additionalConfig,
    };

    // log request
    console.log("REQUEST: ");
    console.log(requestConfig);

    // return axios promise
    return this.axiosInstance
      .request(requestConfig)
      .then((response: any) => {
        // log response
        console.log("RESPONSE:");
        console.log(response);
        return response;
      })
      .catch((error) => {
        console.error("ERROR in APIRequest:", error);
        if (this.config?.signal?.aborted) {
          // ignore "CanceledError"
          console.log("pending request aborted by client:", requestConfig);
        } else {
          let errorOutput = opError("Request failed", { name: "bad request" });
          const realError = error.response?.data?.error;
          if (realError) {
            errorOutput = opError(realError.message, {
              name: realError.name,
              status: error.response.status,
            });
          } else if (error.message && error.response) {
            errorOutput = opError(error.message, {
              name: error.response.statusText,
              status: error.response.status,
            });
          } else if (error.message || error.code) {
            if (
              error.message.includes("timeout") &&
              error.name === "AxiosError"
            ) {
              errorOutput = opError("The server took too long to respond", {
                name: "Network error",
                status: 500,
              });
            } else {
              errorOutput = opError(error.message || "Request failed", {
                name: error.name || error.code || "bad request",
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

  async retry() {
    if (this.retries) {
      console.log(`retrying request in ${this.retryDelay} milliseconds`);
      this.retries--;
      await sleep(this.retryDelay);
      return this.request();
    }
  }

  abort() {
    this.abortController.abort();
  }
}
