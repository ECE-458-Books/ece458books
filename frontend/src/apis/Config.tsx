import axios, { AxiosError } from "axios";
import { stringify } from "qs";
import { logger } from "../util/Logger";

export const BACKEND_ENDPOINT = process.env.REACT_APP_BACKEND_ENDPOINT;
export const JSON_HEADER = { "Content-Type": "application/json" };
export const METHOD_POST = "POST";
export const METHOD_GET = "GET";
export const METHOD_DELETE = "DELETE";
export const METHOD_PATCH = "PATCH";

export const API = axios.create({
  paramsSerializer: {
    serialize: (params) => stringify(params, { arrayFormat: "brackets" }),
  },
  baseURL: BACKEND_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Will have to do more than this, but for now will just have a default
function DefaultErrorHandler(error: AxiosError) {
  console.log(error);
}

// Logging all API calls
API.interceptors.request.use((request) => {
  logger.debug("Making API Request", request);
  return request;
});

API.interceptors.response.use((response) => {
  logger.debug("API Response", response);
  return response;
});

API.interceptors.response.use(undefined, (error) => {
  logger.error(error);
  return DefaultErrorHandler(error);
});
