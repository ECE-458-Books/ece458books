import axios, { AxiosError } from "axios";
import { stringify } from "qs";

export const BACKEND_ENDPOINT = "http://books-dev.colab.duke.edu:8000/api/v1/";
export const JSON_HEADER = { "Content-Type": "application/json" };
export const METHOD_POST = "POST";
export const METHOD_GET = "GET";

export const API = axios.create({
  paramsSerializer: {
    serialize: (params) => stringify(params, { arrayFormat: "brackets" }),
  },
  baseURL: BACKEND_ENDPOINT,
  headers: JSON_HEADER,
});

// Will have to do more than this, but for now will just have a default
function DefaultErrorHandler(error: AxiosError) {
  console.log(error);
}

API.interceptors.response.use(undefined, (error) => {
  return DefaultErrorHandler(error);
});
