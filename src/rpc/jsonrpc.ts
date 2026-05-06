import type { HttpClient } from "../http-client/index.js";

/** @category Network / RPC */
export type Id = string | number;

/** @category Network / RPC */
export interface Request<T> {
  jsonrpc: "2.0";
  id: Id;
  method: string;
  params: T;
}

/** @category Network / RPC */
export interface Notification<T> {
  jsonrpc: "2.0";
  method: string;
  params?: T;
}

/** @category Network / RPC */
export type Response<T, E = any> = {
  jsonrpc: "2.0";
  id: Id;
} & ({ error: Error<E> } | { result: T });

/** @category Network / RPC */
export interface Error<E = any> {
  code: number;
  message?: string;
  data?: E;
}

// Check if the given object X has a field Y, and make that available to
// typescript typing.
function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Sends the jsonrpc 'params' as a single 'param' object (no array support).
 *
 * @param client HttpClient instance to use for the request
 * @param url URL to the RPC instance
 * @param method RPC method name that should be called
 * @param [param=null] params that should be supplied to the method
 * @returns Promise that resolves to the result of type T
 * @internal
 * @category Network / RPC
 */
export async function postObject<T>(
  client: HttpClient,
  url: string,
  method: string,
  param: any = null,
): Promise<T> {
  const response = await client.post<Response<T>>(url, {
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
