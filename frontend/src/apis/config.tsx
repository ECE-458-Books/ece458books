import axios, { AxiosError } from "axios";

export const BACKEND_DEFAULT_ENDPOINT = process.env.REACT_APP_BACKEND_ENDPOINT;
export const JSON_HEADERS = { "Content-Type": "application/json" };
export const METHOD_POST = "POST";
export const METHOD_GET = "GET";

export const API = axios.create({
  baseURL: BACKEND_DEFAULT_ENDPOINT,
  headers: JSON_HEADERS,
});

function DefaultErrorHandler(error: AxiosError) {
  console.log(error);
}

API.interceptors.response.use(undefined, (error) => {
  return DefaultErrorHandler(error);
});
