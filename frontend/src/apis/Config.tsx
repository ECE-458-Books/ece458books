import axios from "axios";
import { stringify } from "qs";
import { logger } from "../util/Logger";
import { AUTH_API } from "./AuthAPI";
import createAuthRefreshInterceptor from "axios-auth-refresh";

const TEST_ENDPOINT = "https://books-test.colab.duke.edu/api/v1/";
export const BACKEND_ENDPOINT = TEST_ENDPOINT;
export const JSON_HEADER = { "Content-Type": "application/json" };
export const METHOD_POST = "POST";
export const METHOD_GET = "GET";
export const METHOD_DELETE = "DELETE";
export const METHOD_PATCH = "PATCH";
export const METHOD_PUT = "PUT";

export const API = axios.create({
  paramsSerializer: {
    serialize: (params) => stringify(params, { arrayFormat: "brackets" }),
  },
  baseURL: BACKEND_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Runs Auth api token refresh whenever 401 error is received
createAuthRefreshInterceptor(API, AUTH_API.tokenRefresh);

// Every outgoing request is logged, as well as setting the token to the most
// up to date version
API.interceptors.request.use((request) => {
  request.headers["Authorization"] = `Bearer ${sessionStorage.getItem(
    "accessToken"
  )}`;
  logger.debug("Making API Request", request);
  return request;
});

// Every incoming response is logged
API.interceptors.response.use((response) => {
  logger.debug("API Response Data", response.status, response.data);
  return Promise.resolve(response.data);
});

// Every incoming error is logged
API.interceptors.response.use(undefined, (error) => {
  logger.error("API Error", error.response.status, error.response.data);
  return Promise.reject(error.response);
});
