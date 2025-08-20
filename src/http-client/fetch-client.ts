import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults, } from 'feaxios';
import { CancelToken, HttpClient, HttpClientRequestConfig, HttpClientResponse, Interceptor, } from './types';

export interface HttpResponse<T = any> extends AxiosResponse<T> {
  // You can add any additional properties here if needed
}

export interface FetchClientConfig<T = any> extends AxiosRequestConfig {
  adapter?: (config: HttpClientRequestConfig) => Promise<HttpClientResponse<T>>;
  // You can add any additional configuration options here
  cancelToken?: CancelToken;
}


type InterceptorFulfilled<V> = (value: V) => V | Promise<V>;
type InterceptorRejected = (error: any) => any;

class InterceptorManager<V> {
  handlers: Array<Interceptor<V> | null> = [];

  use(fulfilled: InterceptorFulfilled<V>, rejected?: InterceptorRejected): number {
    this.handlers.push({
      fulfilled,
      rejected,
    });
    return this.handlers.length - 1;
  }

  eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  forEach(fn: (interceptor: Interceptor<V>) => void): void {
    this.handlers.forEach((h) => {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
function getFormConfig(config?: HttpClientRequestConfig): HttpClientRequestConfig {
  const formConfig = config || {};
  formConfig.headers = new Headers(formConfig.headers || {});
  formConfig.headers.set('Content-Type', 'application/x-www-form-urlencoded');
  return formConfig;
}

function createFetchClient(fetchConfig: HttpClientRequestConfig = {}): HttpClient {
  const defaults: CreateAxiosDefaults = {
    ...fetchConfig,
    headers: fetchConfig.headers || {}
  };

  const instance: AxiosInstance = axios.create(defaults);
  const requestInterceptors = new InterceptorManager<HttpClientRequestConfig>();
  const responseInterceptors = new InterceptorManager<HttpClientResponse>();

  const httpClient: HttpClient = {
    interceptors: {
      request: requestInterceptors,
      response: responseInterceptors
    },

    defaults: {
      ...defaults,
      adapter: (config: HttpClientRequestConfig) => instance.request(config),
    },

    create(config?: HttpClientRequestConfig): HttpClient {
      return createFetchClient({ ...this.defaults, ...config });
    },

    makeRequest<T>(config: FetchClientConfig): Promise<HttpClientResponse<T>> {
      return new Promise((resolve, reject) => {
        const abortController = new AbortController();
        config.signal = abortController.signal;

        if (config.cancelToken) {
          config.cancelToken.promise.then(() => {
            abortController.abort();
            reject(new Error('Request canceled'));
          });
        }

        // Apply request interceptors
        let modifiedConfig = config;
        if (requestInterceptors.handlers.length > 0) {
          const chain = requestInterceptors.handlers
            .filter((interceptor): interceptor is NonNullable<typeof interceptor> => interceptor !== null)
            .flatMap((interceptor) => [
              interceptor.fulfilled,
              interceptor.rejected
            ]);
          for (let i = 0, len = chain.length; i < len; i += 2) {
            const onFulfilled = chain[i];
            const onRejected = chain[i + 1];
            try {
              if (onFulfilled) modifiedConfig = onFulfilled(modifiedConfig);
            } catch (error) {
              if (onRejected) (onRejected as InterceptorRejected)?.(error);
              reject(error);
              return;
            }
          }
        }

        const adapter = modifiedConfig.adapter || this.defaults.adapter;
        if (!adapter) {
          throw new Error('No adapter available');
        }
        let responsePromise = adapter(modifiedConfig).then((axiosResponse) => {
          // Transform AxiosResponse to HttpClientResponse
          const httpClientResponse: HttpClientResponse<T> = {
            data: axiosResponse.data,
            headers: axiosResponse.headers as any, // You might want to transform headers more carefully
            config: axiosResponse.config,
            status: axiosResponse.status,
            statusText: axiosResponse.statusText,
          };
          return httpClientResponse;
        });

        // Apply response interceptors
        if (responseInterceptors.handlers.length > 0) {
          const chain = responseInterceptors.handlers
            .filter((interceptor): interceptor is NonNullable<typeof interceptor> => interceptor !== null)
            .flatMap((interceptor) => [interceptor.fulfilled, interceptor.rejected]);

          for (let i = 0, len = chain.length; i < len; i += 2) {
            responsePromise = responsePromise.then(
              (response) => {
                const fulfilledInterceptor = chain[i];
                if (typeof fulfilledInterceptor === 'function') {
                  return fulfilledInterceptor(response);
                }
                return response;
              },
              (error) => {
                const rejectedInterceptor = chain[i + 1];
                if (typeof rejectedInterceptor === 'function') {
                  return rejectedInterceptor(error);
                }
                throw error;
              }
            ).then((interceptedResponse) => interceptedResponse);
          }
        }

        // Resolve or reject the final promise
        responsePromise
        .then(resolve)
        .catch(reject);
      });
    },


    get<T = any>(url: string, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> {
      return this.makeRequest({ ...this.defaults, ...config, url, method: 'get' });
    },

    delete<T = any>(url: string, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> {
      return this.makeRequest({ ...this.defaults, ...config, url, method: 'delete' });
    },

    head<T = any>(url: string, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> {
      return this.makeRequest({ ...this.defaults, ...config, url, method: 'head' });
    },

    options<T = any>(url: string, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> {
      return this.makeRequest({ ...this.defaults, ...config, url, method: 'options' });
    },

    post<T = any>(url: string, data?: any, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> {
      return this.makeRequest({ ...this.defaults, ...config, url, method: 'post', data });
    },

    put<T = any>(url: string, data?: any, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> {
      return this.makeRequest({ ...this.defaults, ...config, url, method: 'put', data });
    },

    patch<T = any>(url: string, data?: any, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> {
      return this.makeRequest({ ...this.defaults, ...config, url, method: 'patch', data });
    },

    postForm<T = any>(url: string, data?: any, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> {
      const formConfig = getFormConfig(config);
      return this.makeRequest({ ...this.defaults, ...formConfig, url, method: 'post', data });
    },

    putForm<T = any>(url: string, data?: any, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> {
      const formConfig = getFormConfig(config);
      return this.makeRequest({ ...this.defaults, ...formConfig, url, method: 'put', data });
    },

    patchForm<T = any>(url: string, data?: any, config?: HttpClientRequestConfig): Promise<HttpClientResponse<T>> {
      const formConfig = getFormConfig(config);
      return this.makeRequest({ ...this.defaults, ...formConfig, url, method: 'patch', data });
    },

    CancelToken,
    isCancel: (value: any): boolean => value instanceof Error && value.message === 'Request canceled',
  };


  return httpClient;
}

export const fetchClient = createFetchClient();

export { createFetchClient as create };
