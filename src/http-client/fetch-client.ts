// eslint-disable-next-line max-classes-per-file
import { GaxiosOptions, GaxiosPromise, GaxiosResponse, request } from 'gaxios';
import { CancelToken, HttpClient, HttpClientDefaults, HttpClientRequestConfig, HttpClientResponse } from './types';

export interface HttpResponse<T = any> extends GaxiosResponse<T> {
  // You can add any additional properties here if needed
}

export interface FetchClientConfig extends GaxiosOptions {
  // You can add any additional configuration options here
  cancelToken?: CancelToken;
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

  const makeRequest = <T>(config: FetchClientConfig): Promise<HttpClientResponse<T>> => {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }

    return new Promise((resolve, reject) => {
      const abortController = new AbortController();
      config.signal = abortController.signal;

      if (config.cancelToken) {
        config.cancelToken.cancel = (message) => {
          abortController.abort();
          reject(new Error(message || 'Request canceled'));
        };
      }

      request<T>(config)
        .then(resolve)
        .catch(reject);
    });
  };

  function isCancel(value: any): boolean {
    return value instanceof Error && value.message === 'Request canceled';
  }

  const instance: HttpClient = {
    get: <T = any>(url: string, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> => {
      console.log(`GET request to ${url}`, config);
      return makeRequest<T>({ ...instance.defaults, ...config, url, method: 'GET' })
        .then(response => {
          console.log(`GET response from ${url}`, response);
          return response;
        });
    },
    post: <T = any>(url: string, data?: any, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> => {
      console.log(`POST request to ${url}`, data, config);
      return makeRequest<T>({ ...instance.defaults, ...config, url, method: 'POST', data })
        .then(response => {
          console.log(`POST response from ${url}`, response);
          return response;
        });
    },
    put: <T = any>(url: string, data?: any, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> => {
      console.log(`PUT request to ${url}`, data, config);
      return makeRequest<T>({ ...instance.defaults, ...config, url, method: 'PUT', data })
        .then(response => {
          console.log(`PUT response from ${url}`, response);
          return response;
        });
    },
    delete: <T = any>(url: string, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> => {
      console.log(`DELETE request to ${url}`, config);
      return makeRequest<T>({ ...instance.defaults, ...config, url, method: 'DELETE' })
        .then(response => {
          console.log(`DELETE response from ${url}`, response);
          return response;
        });
    },
    CancelToken,
    isCancel,
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
