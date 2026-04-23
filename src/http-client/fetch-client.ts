import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosStatic,
  CreateAxiosDefaults,
} from "feaxios";
import axios from "feaxios";
import {
  CancelToken,
  type HttpClient,
  type HttpClientRequestConfig,
  type HttpClientResponse,
  type Interceptor,
} from "./types.js";

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

// Marker used so `isCancel` can identify cancellations by tag rather than
// message text. Without this, a caller that passed a custom reason via
// `cancel("timeout of 1000ms exceeded")` would see `isCancel(err) === false`.
const CANCELED_MARKER = Symbol.for("@stellar/stellar-sdk.canceled");

function makeCanceledError(reason?: string): Error {
  const err = new Error(reason || "Request canceled") as Error & {
    [CANCELED_MARKER]?: true;
  };
  err[CANCELED_MARKER] = true;
  return err;
}

class InterceptorManager<V> {
  handlers: Array<Interceptor<V> | null> = [];

  use(
    fulfilled: InterceptorFulfilled<V>,
    rejected?: InterceptorRejected,
  ): number {
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
function getFormConfig(
  config?: HttpClientRequestConfig,
): HttpClientRequestConfig {
  const formConfig = config || {};
  formConfig.headers = new Headers(formConfig.headers || {});
  formConfig.headers.set("Content-Type", "application/x-www-form-urlencoded");
  return formConfig;
}

// Deep-merges instance defaults with a per-call config so defaults.headers
// and defaults.params aren't wiped out when the caller supplies their own.
// The feaxios path merges internally, but the bounded adapter uses the
// config directly — without this, `create({headers: X}).get(url, {headers: Y})`
// sent only Y whenever the call also set maxContentLength/maxRedirects.
function mergeWithDefaults(
  defaults: any,
  config?: HttpClientRequestConfig,
): HttpClientRequestConfig {
  if (!config) return { ...defaults };
  const merged: any = { ...defaults, ...config };
  if (defaults?.headers !== undefined || config.headers !== undefined) {
    const headers = new Headers((defaults?.headers as any) || {});
    new Headers((config.headers as any) || {}).forEach((v, k) => {
      headers.set(k, v);
    });
    merged.headers = headers;
  }
  if (defaults?.params !== undefined || config.params !== undefined) {
    merged.params = { ...(defaults?.params || {}), ...(config.params || {}) };
  }
  return merged;
}

function buildBoundedUrl(config: HttpClientRequestConfig): string {
  let url = config.url || "";
  if (config.baseURL && url && !/^https?:\/\//i.test(url)) {
    url = url.replace(/^\/?/, `${config.baseURL.replace(/\/$/, "")}/`);
  }
  if (config.params && Object.keys(config.params).length > 0) {
    const qs = new URLSearchParams(
      config.params as Record<string, string>,
    ).toString();
    url += (url.includes("?") ? "&" : "?") + qs;
  }
  return url;
}

// Mirrors feaxios's defaultTransformer: serialize request bodies based on
// their JS type and set an appropriate Content-Type when one isn't already
// present. Without this, a caller using the bounded adapter on POST/PUT with
// an object body would send [object Object] instead of JSON.
function encodeRequestBody(data: any, headers: Headers): BodyInit | undefined {
  if (data === undefined || data === null) return undefined;
  if (typeof data === "string") return data;
  if (data instanceof URLSearchParams) {
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/x-www-form-urlencoded");
    }
    return data;
  }
  if (
    data instanceof Blob ||
    data instanceof ArrayBuffer ||
    ArrayBuffer.isView(data)
  ) {
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/octet-stream");
    }
    return data as BodyInit;
  }
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    // Let fetch set the multipart boundary.
    return data;
  }
  // Default: JSON-encode plain objects.
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  return JSON.stringify(data);
}

async function readBodyBounded(
  response: Response,
  maxContentLength?: number,
): Promise<Uint8Array> {
  if (maxContentLength !== undefined) {
    const headerLen = response.headers.get("content-length");
    if (headerLen && Number(headerLen) > maxContentLength) {
      throw new Error(`maxContentLength size of ${maxContentLength} exceeded`);
    }
  }

  if (!response.body) return new Uint8Array(0);

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  // Streamed enforcement: abort as soon as running total exceeds the cap,
  // before the full body reaches memory.
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (maxContentLength !== undefined && total > maxContentLength) {
        await reader.cancel();
        throw new Error(
          `maxContentLength size of ${maxContentLength} exceeded`,
        );
      }
      chunks.push(value);
    }
  }

  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}
// AbortSignal.timeout and AbortSignal.any are relatively recent (Safari 17.4,
// Firefox 124, Chrome 116; Node 20.3). Feature-detect and fall back to
// AbortController + setTimeout so the no-axios browser bundle works on older
// runtimes.
function createTimeoutSignal(ms: number): AbortSignal {
  if (
    typeof AbortSignal !== "undefined" &&
    typeof AbortSignal.timeout === "function"
  ) {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => {
    // Must set .name = "TimeoutError" (not .message), because the bounded
    // adapter's catch rewrites to the axios-shaped message based on the
    // error's name. An Error whose message happens to be "TimeoutError"
    // but whose name is "Error" silently falls through to the generic
    // rethrow branch.
    const err = new Error("Timeout") as Error;
    err.name = "TimeoutError";
    controller.abort(err);
  }, ms);
  return controller.signal;
}

function composeSignals(signals: AbortSignal[]): AbortSignal | undefined {
  if (signals.length === 0) return undefined;
  if (signals.length === 1) return signals[0];
  if (
    typeof AbortSignal !== "undefined" &&
    typeof AbortSignal.any === "function"
  ) {
    return AbortSignal.any(signals);
  }
  const controller = new AbortController();
  for (const s of signals) {
    if (s.aborted) {
      controller.abort(s.reason);
      break;
    }
    s.addEventListener("abort", () => controller.abort(s.reason), {
      once: true,
    });
  }
  return controller.signal;
}

// Node is the only environment where `redirect: "manual"` reliably exposes
// status and Location. In browsers a cross-origin manual redirect yields an
// opaqueredirect response (status 0, no Location), so hop-by-hop enforcement
// can't work. There we use `redirect: "error"` for strict zero-redirect and
// fall back to normal following otherwise — matching axios/XHR browser behavior.
function canInspectManualRedirects(): boolean {
  return (
    typeof process !== "undefined" &&
    !!process.versions &&
    !!process.versions.node
  );
}

// Per fetch spec, 301/302/303 redirects MUST switch the method to GET and
// drop the body; 307/308 preserve both. Applying the same method/body across
// every hop is a common footgun that silently POSTs to redirect targets.
function applyRedirectSemantics(
  init: RequestInit,
  status: number,
): RequestInit {
  if (status === 307 || status === 308) return init;
  const next: RequestInit = { ...init, method: "GET", body: undefined };
  // Drop body-related headers when switching to GET.
  const headers = new Headers(init.headers || {});
  headers.delete("content-type");
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  next.headers = headers;
  return next;
}

// Axios's Node adapter strips credential-bearing headers on cross-origin
// redirects so a malicious/compromised hop can't harvest bearer tokens
// intended for the original host. Without this the bounded adapter would
// happily hand "Authorization: Bearer …" to whatever URL Location points
function stripCrossOriginAuth(
  init: RequestInit,
  fromUrl: string,
  toUrl: string,
): RequestInit {
  let sameOrigin: boolean;
  try {
    sameOrigin = new URL(fromUrl).origin === new URL(toUrl).origin;
  } catch {
    // Malformed URL: treat as cross-origin (the safer default).
    sameOrigin = false;
  }
  if (sameOrigin) return init;
  const headers = new Headers(init.headers || {});
  headers.delete("authorization");
  headers.delete("proxy-authorization");
  headers.delete("cookie");
  return { ...init, headers };
}

function buildHttpError(
  response: Response,
  config: HttpClientRequestConfig,
  data?: any,
): Error {
  const err = new Error(
    `Request failed with status code ${response.status}`,
  ) as Error & {
    response: {
      status: number;
      statusText: string;
      headers: Headers;
      data: any;
      config: HttpClientRequestConfig;
    };
  };
  err.response = {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    data,
    config,
  };
  return err;
}

// feaxios ignores maxRedirects and maxContentLength. When either is set,
// perform the request via native fetch with explicit enforcement — otherwise
// the "security" config is silently a no-op, allowing redirect-based SSRF and
// unbounded-response DoS. Keep the error message prefix "maxContentLength size"
// identical to axios's Node adapter — callers (stellartoml, federation) match
// on it in their catch blocks.
async function boundedFetchAdapter<T>(
  config: HttpClientRequestConfig,
): Promise<HttpClientResponse<T>> {
  const { maxRedirects, maxContentLength, timeout } = config;
  const signals: AbortSignal[] = [];

  if (timeout && timeout > 0) {
    signals.push(createTimeoutSignal(timeout));
  }
  const signal = composeSignals(signals);

  // Redirect policy:
  //   undefined   → let fetch follow freely (caller doesn't care)
  //   0  in Node  → "manual": read the 3xx, reject before the next hop
  //   0  in brwsr → "error":  fetch throws on the first 3xx (manual would
  //                           yield an opaqueredirect with no status/Location,
  //                           which we can't interpret)
  //   N>0 in Node → manually chain up to N hops, then refuse
  //   N>0 in brwsr → "follow": we can't count hops cross-origin, so match
  //                            axios/XHR browser behavior (follow to 20)
  const managedRedirects = maxRedirects !== undefined;
  const canManage = canInspectManualRedirects();
  let redirect: RequestInit["redirect"];
  if (!managedRedirects) {
    redirect = "follow";
  } else if (canManage) {
    redirect = "manual";
  } else if (maxRedirects === 0) {
    redirect = "error";
  } else {
    redirect = "follow";
  }

  const headers = new Headers(config.headers || {});
  const body = encodeRequestBody(config.data, headers);

  // IMPORTANT: spread fetchOptions FIRST, then overlay the enforced fields.
  // If fetchOptions came last, a caller could set `fetchOptions.redirect:
  // "follow"` and silently bypass maxRedirects — the adapter exists to make
  // these controls non-optional.
  let currentInit: RequestInit = {
    ...config.fetchOptions,
    method: (config.method || "get").toUpperCase(),
    headers,
    body,
    redirect,
    ...(signal ? { signal } : {}),
  };

  let currentUrl = buildBoundedUrl(config);
  let redirectsRemaining = maxRedirects ?? 0;
  let response: Response;

  while (true) {
    try {
      response = await fetch(currentUrl, currentInit);
    } catch (err: any) {
      if (err?.name === "TimeoutError") {
        throw new Error(`timeout of ${config.timeout}ms exceeded`);
      }
      throw err;
    }

    // Only Node's `redirect: "manual"` exposes 3xx status; browsers either
    // already followed (redirect: "follow") or threw (redirect: "error").
    const isManualRedirectResponse =
      redirect === "manual" && response.status >= 300 && response.status < 400;
    if (!isManualRedirectResponse) break;

    if (redirectsRemaining <= 0) {
      // maxRedirects === 0: "Request failed with status code 30x" (matches
      // axios's message on a refused-first-hop rejection, which stellartoml
      // tests already assert against).
      // maxRedirects > 0 exhausted: "Maximum number of redirects exceeded"
      // (matches axios's native message for the same condition).
      if (maxRedirects === 0) throw buildHttpError(response, config);
      throw new Error("Maximum number of redirects exceeded");
    }
    const location = response.headers.get("location");
    if (!location) break;
    const nextUrl = new URL(location, currentUrl).toString();
    currentInit = applyRedirectSemantics(currentInit, response.status);
    currentInit = stripCrossOriginAuth(currentInit, currentUrl, nextUrl);
    currentUrl = nextUrl;
    redirectsRemaining -= 1;
  }

  if (!response.ok) {
    // Read the (bounded) body so the thrown error carries the server's
    // payload. Axios/feaxios attach `.response.data` on non-2xx errors; we
    // preserve that contract — notably federation's caller can still inspect
    // status/body when a 4xx/5xx comes back, matching the axios-build shape.
    let errBody: any;
    // eslint-disable-next-line no-useless-catch
    try {
      const errBytes = await readBodyBounded(response, maxContentLength);
      const errText = new TextDecoder().decode(errBytes);
      try {
        errBody = JSON.parse(errText);
      } catch {
        errBody = errText;
      }
    } catch (readErr) {
      // If body reading itself violated the cap, surface that error first.
      throw readErr;
    }
    throw buildHttpError(response, config, errBody);
  }

  const bytes = await readBodyBounded(response, maxContentLength);
  const text = new TextDecoder().decode(bytes);
  let data: any = text;
  try {
    data = JSON.parse(text);
  } catch {
    // leave as string (e.g. TOML)
  }

  return {
    data,
    headers: response.headers as any,
    config,
    status: response.status,
    statusText: response.statusText,
  };
}

function createFetchClient(
  fetchConfig: HttpClientRequestConfig = {},
): HttpClient {
  const defaults: CreateAxiosDefaults = {
    ...fetchConfig,
    headers: fetchConfig.headers || {},
  };

  // feaxios doesn't declare "type":"module" or ship .d.mts, so TypeScript under
  // nodenext models it as CJS — `import axios from "feaxios"` types as the
  // module namespace with a `.default` hop. At ESM runtime, Node resolves the
  // same import to `AxiosStatic` directly (no hop), and under CJS, Babel's
  // __importDefault wrapper adds its own hop, so `.default.create` doubles up.
  // Normalize both shapes here; remove once feaxios is dropped (see #1388).

  const axiosStatic: AxiosStatic = (axios as any).default ?? axios;
  const instance: AxiosInstance = axiosStatic.create(defaults);
  const requestInterceptors = new InterceptorManager<HttpClientRequestConfig>();
  const responseInterceptors = new InterceptorManager<HttpClientResponse>();

  const httpClient: HttpClient = {
    interceptors: {
      request: requestInterceptors,
      response: responseInterceptors,
    },

    defaults: {
      ...defaults,
      adapter: (config: HttpClientRequestConfig) => {
        if (
          config.maxRedirects !== undefined ||
          config.maxContentLength !== undefined
        ) {
          return boundedFetchAdapter(config);
        }
        return instance.request(config);
      },
    },

    create(config?: HttpClientRequestConfig): HttpClient {
      return createFetchClient({ ...this.defaults, ...config });
    },

    makeRequest<T>(config: FetchClientConfig): Promise<HttpClientResponse<T>> {
      return new Promise((resolve, reject) => {
        // Extracted into a helper so it can be called from two sites:
        // 1. After the async request-interceptor chain resolves.
        // 2. Directly when there are no request interceptors (fast path).
        function processRequest(
          this: HttpClient,
          finalConfig: HttpClientRequestConfig,
          res: (value: HttpClientResponse<T>) => void,
          rej: (reason?: any) => void,
        ) {
          const adapter = finalConfig.adapter || this.defaults.adapter;
          if (!adapter) {
            throw new Error("No adapter available");
          }
          let responsePromise = adapter(finalConfig).then((axiosResponse) => {
            const httpClientResponse: HttpClientResponse<T> = {
              data: axiosResponse.data,
              headers: axiosResponse.headers as any,
              config: axiosResponse.config,
              status: axiosResponse.status,
              statusText: axiosResponse.statusText,
            };
            return httpClientResponse;
          });

          // Apply response interceptors
          if (responseInterceptors.handlers.length > 0) {
            const chain = responseInterceptors.handlers
              .filter(
                (interceptor): interceptor is NonNullable<typeof interceptor> =>
                  interceptor !== null,
              )
              .flatMap((interceptor) => [
                interceptor.fulfilled,
                interceptor.rejected,
              ]);

            for (let i = 0, len = chain.length; i < len; i += 2) {
              responsePromise = responsePromise
                .then(
                  (response) => {
                    const fulfilledInterceptor = chain[i];
                    if (typeof fulfilledInterceptor === "function") {
                      return fulfilledInterceptor(response);
                    }
                    return response;
                  },
                  (error) => {
                    const rejectedInterceptor = chain[i + 1];
                    if (typeof rejectedInterceptor === "function") {
                      return rejectedInterceptor(error);
                    }
                    throw error;
                  },
                )
                .then((interceptedResponse) => interceptedResponse);
            }
          }

          // Resolve or reject the final promise
          responsePromise.then(res).catch(rej);
        }

        const abortController = new AbortController();
        config.signal = abortController.signal;

        if (config.cancelToken) {
          const { cancelToken } = config;
          cancelToken.promise.then(() => {
            abortController.abort();
            // Propagate the cancel reason so callers that pass a reason via
            // `cancel(reason)` — e.g. stellartoml's timeout wrapper — see
            // their original message rather than a generic "Request canceled".
            reject(makeCanceledError(cancelToken.reason));
          });
        }

        // Apply request interceptors using a promise chain so that async
        // interceptors (returning Promise<HttpClientRequestConfig>) are
        // properly awaited before the config is passed downstream. A previous
        // implementation used a synchronous try/catch loop which silently
        // passed unresolved promise objects as the config when an interceptor
        // was async.
        //
        // The chain is built as [fulfilled, rejected, fulfilled, rejected, ...]
        // and wired via .then(onFulfilled, onRejected) so each pair can
        // recover from an upstream error (matching Axios interceptor semantics).
        let modifiedConfig = config;
        if (requestInterceptors.handlers.length > 0) {
          const chain = requestInterceptors.handlers
            .filter(
              (interceptor): interceptor is NonNullable<typeof interceptor> =>
                interceptor !== null,
            )
            .flatMap((interceptor) => [
              interceptor.fulfilled,
              interceptor.rejected,
            ]);
          let configPromise = Promise.resolve(modifiedConfig);
          for (let i = 0, len = chain.length; i < len; i += 2) {
            configPromise = configPromise.then(
              chain[i] as
                | ((
                    val: HttpClientRequestConfig,
                  ) =>
                    | HttpClientRequestConfig
                    | Promise<HttpClientRequestConfig>)
                | undefined,
              chain[i + 1] as InterceptorRejected | undefined,
            );
          }

          configPromise
            .then((resolvedConfig) => {
              processRequest.call(this, resolvedConfig, resolve, reject);
            })
            .catch(reject);
          return;
        }

        // No request interceptors — skip the chain and process immediately.
        processRequest.call(this, modifiedConfig, resolve, reject);
      });
    },

    get<T = any>(
      url: string,
      config?: HttpClientRequestConfig,
    ): Promise<HttpClientResponse<T>> {
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, config),
        url,
        method: "get",
      });
    },

    delete<T = any>(
      url: string,
      config?: HttpClientRequestConfig,
    ): Promise<HttpClientResponse<T>> {
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, config),
        url,
        method: "delete",
      });
    },

    head<T = any>(
      url: string,
      config?: HttpClientRequestConfig,
    ): Promise<HttpClientResponse<T>> {
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, config),
        url,
        method: "head",
      });
    },

    options<T = any>(
      url: string,
      config?: HttpClientRequestConfig,
    ): Promise<HttpClientResponse<T>> {
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, config),
        url,
        method: "options",
      });
    },

    post<T = any>(
      url: string,
      data?: any,
      config?: HttpClientRequestConfig,
    ): Promise<HttpClientResponse<T>> {
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, config),
        url,
        method: "post",
        data,
      });
    },

    put<T = any>(
      url: string,
      data?: any,
      config?: HttpClientRequestConfig,
    ): Promise<HttpClientResponse<T>> {
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, config),
        url,
        method: "put",
        data,
      });
    },

    patch<T = any>(
      url: string,
      data?: any,
      config?: HttpClientRequestConfig,
    ): Promise<HttpClientResponse<T>> {
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, config),
        url,
        method: "patch",
        data,
      });
    },

    postForm<T = any>(
      url: string,
      data?: any,
      config?: HttpClientRequestConfig,
    ): Promise<HttpClientResponse<T>> {
      const formConfig = getFormConfig(config);
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, formConfig),
        url,
        method: "post",
        data,
      });
    },

    putForm<T = any>(
      url: string,
      data?: any,
      config?: HttpClientRequestConfig,
    ): Promise<HttpClientResponse<T>> {
      const formConfig = getFormConfig(config);
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, formConfig),
        url,
        method: "put",
        data,
      });
    },

    patchForm<T = any>(
      url: string,
      data?: any,
      config?: HttpClientRequestConfig,
    ): Promise<HttpClientResponse<T>> {
      const formConfig = getFormConfig(config);
      return this.makeRequest({
        ...mergeWithDefaults(this.defaults, formConfig),
        url,
        method: "patch",
        data,
      });
    },

    CancelToken,
    isCancel: (value: any): boolean =>
      value instanceof Error &&
      (value as { [CANCELED_MARKER]?: true })[CANCELED_MARKER] === true,
  };

  return httpClient;
}

export const fetchClient = createFetchClient();

export { createFetchClient as create };
