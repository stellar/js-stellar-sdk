import { axiosClient, create as createAxiosClient } from "./axios-client";
import { fetchClient, create as createFetchClient } from "./fetch-client";

export const httpClient = process.env.USE_AXIOS ? axiosClient : fetchClient;

export const create = process.env.USE_AXIOS ? createAxiosClient : createFetchClient;

export * from "./types";

