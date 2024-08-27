
export type HttpResponseHeaders = Record<string, string | boolean | undefined> & {
  'set-cookie'?: string[];
};

export interface Headers {
  [index: string]: string;
}

export interface HttpClientDefaults extends Omit<HttpClientRequestConfig, 'headers'> {
  headers: Record<string, string | number | boolean>;
}

export interface HttpClientResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: HttpResponseHeaders;
  config: any;
}

export interface CancelToken {
  throwIfRequested(): void;
}

export interface HttpClientRequestConfig<D = any> {
  url?: string;
  method?: string;
  baseURL?: string;
  data?: D;
  timeout?: number;
  fetchOptions?: Record<string, any>;
  headers?: Headers;
  params?: Record<string, any>;
  maxContentLength?: number;
  cancelToken?: CancelToken;
}
export interface HttpClient {
  get: <T = any>(url: string, config?: HttpClientRequestConfig) => Promise<HttpClientResponse<T>>;
  post: <T = any>(url: string, data?: any, config?: HttpClientRequestConfig) => Promise<HttpClientResponse<T>>;
  put: <T = any>(url: string, data?: any, config?: HttpClientRequestConfig) => Promise<HttpClientResponse<T>>;
  delete: <T = any>(url: string, config?: HttpClientRequestConfig) => Promise<HttpClientResponse<T>>;
  interceptors: {
    request: InterceptorManager;
    response: InterceptorManager;
  };
  defaults: HttpClientDefaults;
  CancelToken: typeof CancelToken;
  isCancel: (value: any) => boolean;
}

export interface InterceptorManager {
  use: (onFulfilled?: (value: any) => any | Promise<any>, onRejected?: (error: any) => any) => number;
  eject: (id: number) => void;
}

export class CancelToken {
  cancel: ((message?: string) => void) | null = null;

  constructor(executor: (cancel: (message?: string) => void) => void) {
    executor((message?: string) => {
      if (this.cancel) {
        this.cancel(message);
      }
    });
  }

  static source() {
    let cancel: (message?: string) => void;
    const token = new CancelToken((c) => {
      cancel = c;
    });
    return { token, cancel: cancel! };
  }

  throwIfRequested() {
    if (this.cancel) {
      throw new Error('Request canceled');
    }
  }
}
