import axios from 'axios';
//import axios, { AxiosInstance, AxiosResponse } from 'axios';
/*import { HttpClient, HttpClientDefaults, HttpClientRequestConfig, HttpClientResponse, HttpResponseHeaders } from './types';

const transformResponse = <T>(axiosResponse: AxiosResponse<T>): HttpClientResponse<T> => ({
  data: axiosResponse.data,
  status: axiosResponse.status,
  statusText: axiosResponse.statusText,
  headers: axiosResponse.headers as HttpResponseHeaders,
  config: axiosResponse.config as HttpClientRequestConfig,
});

function createAxiosClient(axiosConfig: HttpClientRequestConfig = {}): HttpClient {
  const axiosInstance: AxiosInstance = axios.create(axiosConfig);

  const instance: HttpClient = {
    get: <T = any>(url: string, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> => {
      console.log(`GET request to ${url}`, config);
      return axiosInstance.get(url, config).then(response => {
        console.log(`GET response from ${url}`, response);
        return transformResponse(response);
      });
    },
    post: <T = any>(url: string, data?: any, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> => {
      console.log(`POST request to ${url}`, data, config);
      return axiosInstance.post(url, data, config).then(response => {
        console.log(`POST response from ${url}`, response);
        return transformResponse(response);
      });
    },
    put: <T = any>(url: string, data?: any, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> => {
      console.log(`PUT request to ${url}`, data, config);
      return axiosInstance.put(url, data, config).then(response => {
        console.log(`PUT response from ${url}`, response);
        return transformResponse(response);
      });
    },
    delete: <T = any>(url: string, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> => {
      console.log(`DELETE request to ${url}`, config);
      return axiosInstance.delete(url, config).then(response => {
        console.log(`DELETE response from ${url}`, response);
        return transformResponse(response);
      });
    },
    interceptors: {
      request: axiosInstance.interceptors.request,
      response: axiosInstance.interceptors.response,
    },
    defaults: axiosInstance.defaults as HttpClientDefaults,
  };
  return instance;
}*/

//export const axiosClient = createAxiosClient();
export const axiosClient = axios;

//export { createAxiosClient as create };
export const create = axios.create;