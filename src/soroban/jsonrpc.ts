import axios from "./axios";
import { hasOwnProperty } from "./utils";

export type Id = string | number;

export interface Request<T> {
  jsonrpc: "2.0";
  id: Id;
  method: string;
  params: T;
}

export interface Notification<T> {
  jsonrpc: "2.0";
  method: string;
  params?: T;
}

export type Response<T, E = any> = {
  jsonrpc: "2.0";
  id: Id;
} & ({ error: Error<E> } | { result: T });

export interface Error<E = any> {
  code: number;
  message?: string;
  data?: E;
}

/**
 * Sends the jsonrpc 'params' as an array.
 */
export async function post<T>(
  url: string,
  method: string,
  ...params: any
): Promise<T> {
  if (params && params.length < 1) {
    params = null;
  }
  const response = await axios.post<Response<T>>(url, {
    jsonrpc: "2.0",
    // TODO: Generate a unique request id
    id: 1,
    method,
    params,
  });
  if (hasOwnProperty(response.data, "error")) {
    throw response.data.error;
  } else {
    return response.data?.result;
  }
}

/**
 * Sends the jsonrpc 'params' as the single 'param' obj, no array wrapper is applied.
 */
export async function postObject<T>(
  url: string,
  method: string,
  param: any,
): Promise<T> {
  const response = await axios.post<Response<T>>(url, {
    jsonrpc: "2.0",
    // TODO: Generate a unique request id
    id: 1,
    method,
    params: param,
  });
  if (hasOwnProperty(response.data, "error")) {
    throw response.data.error;
  } else {
    return response.data?.result;
  }
}
