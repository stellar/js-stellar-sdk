import { GaxiosOptions, GaxiosPromise, GaxiosResponse, request } from 'gaxios';
import { HttpClient, HttpClientDefaults, HttpClientRequestConfig, HttpClientResponse } from './types';

export interface HttpResponse<T = any> extends GaxiosResponse<T> {
  // You can add any additional properties here if needed
}

export interface FetchClientConfig extends GaxiosOptions {
  // You can add any additional configuration options here
}

export interface FetchClient {
  get: <T = any>(url: string, config?: GaxiosOptions) => GaxiosPromise<T>;
  post: <T = any>(url: string, data?: any, config?: GaxiosOptions) => GaxiosPromise<T>;
  put: <T = any>(url: string, data?: any, config?: GaxiosOptions) => GaxiosPromise<T>;
  delete: <T = any>(url: string, config?: GaxiosOptions) => GaxiosPromise<T>;
  interceptors: {
    request: InterceptorManager;
    response: InterceptorManager;
  };
  defaults: FetchClientConfig;
}

class InterceptorManager {

  private handlers: Array<{
    fulfilled: (value: any) => any | Promise<any>;
    rejected: (error: any) => any;
  }> = [];

  use(onFulfilled?: (value: any) => any | Promise<any>, onRejected?: (error: any) => any): number {
    this.handlers.push({
      fulfilled: onFulfilled || ((value) => value),
      rejected: onRejected || ((error) => Promise.reject(error)),
    });
    return this.handlers.length - 1;
  }

  eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = null as any;
    }
  }

  forEach(fn: (handler: any) => void): void {
    this.handlers.forEach((handler) => {
      if (handler !== null) {
        fn(handler);
      }
    });
  }
}

function createFetchClient(fetchConfig: HttpClientRequestConfig = {}): HttpClient {
  console.log("Creating fetch client");
  const defaults: HttpClientDefaults = {
    ...fetchConfig,
    headers: fetchConfig.headers || {}
  };
  const instance: HttpClient = {
    get: <T = any>(url: string, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> =>
      request<T>({ ...instance.defaults, ...config, url, method: 'GET' }),
    post: <T = any>(url: string, data?: any, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> =>
      request<T>({ ...instance.defaults, ...config, url, method: 'POST', data }),
    put: <T = any>(url: string, data?: any, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> =>
      request<T>({ ...instance.defaults, ...config, url, method: 'PUT', data }),
    delete: <T = any>(url: string, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> =>
      request<T>({ ...instance.defaults, ...config, url, method: 'DELETE' }),
    interceptors: {
      request: new InterceptorManager(),
      response: new InterceptorManager(),
    },
    defaults,
  };

  return instance;
}

export const fetchClient = createFetchClient();

export { createFetchClient as create };
