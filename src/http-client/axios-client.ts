import axios, { AxiosInstance } from 'axios';
import { HttpClient, HttpClientDefaults, HttpClientRequestConfig, HttpClientResponse } from './types';

function createAxiosClient(axiosConfig: HttpClientRequestConfig = {}): HttpClient {
  const axiosInstance: AxiosInstance = axios.create(axiosConfig);

  const instance: HttpClient = {
    get: <T = any>(url: string, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> =>
      axiosInstance.get(url, config),
    post: <T = any>(url: string, data?: any, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> =>
      axiosInstance.post(url, data, config),
    put: <T = any>(url: string, data?: any, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> =>
      axiosInstance.put(url, data, config),
    delete: <T = any>(url: string, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> =>
      axiosInstance.delete(url, config),
    interceptors: {
      request: axiosInstance.interceptors.request,
      response: axiosInstance.interceptors.response,
    },
    defaults: axiosInstance.defaults as HttpClientDefaults,
  };
  return instance;
}

export const axiosClient = createAxiosClient();

export { createAxiosClient as create };