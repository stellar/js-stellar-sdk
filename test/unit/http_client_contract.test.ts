// Contract tests for the HttpClient interface. Runs against whichever
// underlying implementation is wired in by the build: axios on the default
// build, the fetch-based adapter on the no-axios build. These tests
// document behavior both paths must satisfy — a regression on either side
// fails these tests.
//
// Tests run in Node only (they spin up real HTTP servers to exercise
// wire-level behavior rather than mocking the adapter). Browser tests are
// covered separately.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import http, { IncomingMessage, ServerResponse } from "http";
import { AddressInfo } from "net";
import { httpClient } from "../test-utils/stellar-sdk-import";

type RequestRecord = {
  method: string;
  url: string;
  headers: http.IncomingHttpHeaders;
  body: string;
};

type Handler = (
  req: IncomingMessage,
  res: ServerResponse,
  recorded: RequestRecord,
) => void | Promise<void> | ServerResponse | Promise<ServerResponse>;

function startServer(handler: Handler): Promise<{
  server: http.Server;
  url: string;
  requests: RequestRecord[];
}> {
  return new Promise((resolve) => {
    const requests: RequestRecord[] = [];
    const server = http.createServer((req, res) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        const rec: RequestRecord = {
          method: req.method || "",
          url: req.url || "",
          headers: req.headers,
          body,
        };
        requests.push(rec);
        // Re-throw handler errors on the next tick so vitest sees them as a
        // test failure rather than silently ending the response. Previously
        // we swallowed the error, which could let a broken handler produce
        // a green test.
        Promise.resolve()
          .then(() => handler(req, res, rec))
          .catch((error) => {
            if (!res.writableEnded) res.end();
            setImmediate(() => {
              throw error;
            });
          });
      });
    });
    server.listen(0, () => {
      const port = (server.address() as AddressInfo).port;
      resolve({ server, url: `http://localhost:${port}`, requests });
    });
  });
}

function closeServer(server: http.Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

describe("HttpClient contract", () => {
  if (typeof window !== "undefined") {
    // Skip entire suite in browser — it cannot spin up a Node http server.
    it.skip("Node-only contract tests", () => undefined);
    return;
  }

  let server: http.Server;
  let baseUrl: string;
  let requests: RequestRecord[];
  let respond: Handler;

  beforeEach(async () => {
    respond = (_req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end("{}");
    };
    const started = await startServer((req, res, rec) =>
      respond(req, res, rec),
    );
    server = started.server;
    baseUrl = started.url;
    requests = started.requests;
  });

  afterEach(async () => {
    await closeServer(server);
  });

  describe("request methods", () => {
    it.each([["get"], ["delete"], ["head"], ["options"]] as const)(
      "%s sends the matching HTTP method",
      async (method) => {
        await (httpClient as any)[method](`${baseUrl}/x`);
        expect(requests[0].method.toLowerCase()).toBe(method);
        expect(requests[0].url).toBe("/x");
      },
    );

    it.each([["post"], ["put"], ["patch"]] as const)(
      "%s sends a JSON body when given an object",
      async (method) => {
        await (httpClient as any)[method](`${baseUrl}/x`, { a: 1, b: "two" });
        const rec = requests[0];
        expect(rec.method.toLowerCase()).toBe(method);
        expect(rec.body).toBe('{"a":1,"b":"two"}');
        expect(String(rec.headers["content-type"])).toMatch(
          /application\/json/,
        );
      },
    );
  });

  describe("query params", () => {
    it("serializes config.params into the URL", async () => {
      await httpClient.get(`${baseUrl}/q`, {
        params: { a: "1", b: "two" },
      });
      expect(requests[0].url).toMatch(/^\/q\?/);
      // Both key/value pairs present regardless of order.
      expect(requests[0].url).toContain("a=1");
      expect(requests[0].url).toContain("b=two");
    });
  });

  describe("request headers", () => {
    it("forwards custom headers to the server", async () => {
      await httpClient.get(`${baseUrl}/h`, {
        headers: { "X-Custom": "yes" },
      });
      expect(requests[0].headers["x-custom"]).toBe("yes");
    });
  });

  describe("response shape", () => {
    it("exposes data, status, statusText, and headers on success", async () => {
      respond = (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200, "OK");
        res.end(JSON.stringify({ hello: "world" }));
      };
      const resp = await httpClient.get(`${baseUrl}/`);
      expect(resp.data).toEqual({ hello: "world" });
      expect(resp.status).toBe(200);
      expect(resp.statusText).toBe("OK");
      expect(resp.headers).toBeDefined();
    });

    it("auto-parses a JSON response body", async () => {
      respond = (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end('{"n":42}');
      };
      const resp = await httpClient.get(`${baseUrl}/`);
      expect(resp.data).toEqual({ n: 42 });
    });

    it("returns a text response body as string when it isn't JSON", async () => {
      respond = (_req, res) => {
        res.setHeader("Content-Type", "text/plain");
        res.writeHead(200);
        res.end("hello plain text");
      };
      const resp = await httpClient.get(`${baseUrl}/`);
      expect(typeof resp.data).toBe("string");
      expect(resp.data).toBe("hello plain text");
    });
  });

  describe("error behavior on non-2xx", () => {
    it("rejects with an Error whose .response carries status and body", async () => {
      respond = (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(500);
        res.end(JSON.stringify({ error: "boom" }));
      };
      try {
        await httpClient.get(`${baseUrl}/`);
        throw new Error("expected rejection");
      } catch (err: any) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toMatch(/500|Request failed/i);
        expect(err.response?.status).toBe(500);
        expect(err.response?.data).toEqual({ error: "boom" });
      }
    });
  });

  describe("timeout", () => {
    it("rejects with a timeout-shaped error when the server exceeds the timeout", async () => {
      respond = () => {
        // never respond
      };
      // Exact message format differs across axios/feaxios/fetch paths —
      // axios uses "timeout of Nms exceeded", feaxios often uses the same,
      // our bounded adapter also emits that form. Assert on the common
      // substring rather than hardcoding a specific phrasing.
      await expect(
        httpClient.get(`${baseUrl}/`, { timeout: 200 }),
      ).rejects.toThrow(/timeout/i);
    }, 5000);
  });

  describe("cancellation", () => {
    it("isCancel recognizes a cancellation with a custom reason", async () => {
      respond = () => {
        // never respond
      };
      const cancelToken = new httpClient.CancelToken((cancel) => {
        setTimeout(() => cancel("custom reason"), 20);
      });
      try {
        await httpClient.get(`${baseUrl}/`, { cancelToken } as any);
        throw new Error("expected rejection");
      } catch (err: any) {
        expect(httpClient.isCancel(err)).toBe(true);
      }
    });

    // Paired with the positive test above: isCancel must distinguish
    // cancellations from generic rejections, otherwise callers that branch
    // on it (e.g. stellartoml's maxContentLength catch) would misclassify
    // network errors as user cancellations.
    it("isCancel returns false for non-cancellation values", () => {
      expect(httpClient.isCancel(new Error("network down"))).toBe(false);
      expect(httpClient.isCancel(null)).toBe(false);
      expect(httpClient.isCancel(undefined)).toBe(false);
      expect(httpClient.isCancel("string")).toBe(false);
      expect(httpClient.isCancel({ message: "not an Error" })).toBe(false);
    });
  });

  describe("bounded path — redirect control", () => {
    it("maxRedirects: 0 refuses any redirect (SSRF guard)", async () => {
      const visited: string[] = [];
      respond = (req, res) => {
        visited.push(req.url || "");
        if (req.url === "/start") {
          res.writeHead(302, { location: "/internal" });
          return res.end();
        }
        res.writeHead(200);
        return res.end("should not be reached");
      };
      await expect(
        httpClient.get(`${baseUrl}/start`, {
          maxRedirects: 0,
          maxContentLength: 10_000,
        }),
      ).rejects.toThrow();
      expect(visited).toEqual(["/start"]);
    });

    it("maxRedirects: N rejects an (N+1)-hop chain", async () => {
      respond = (req, res) => {
        if (req.url === "/start") {
          res.writeHead(302, { location: "/hop1" });
          return res.end();
        }
        if (req.url === "/hop1") {
          res.writeHead(302, { location: "/hop2" });
          return res.end();
        }
        res.writeHead(200);
        return res.end("ok");
      };
      await expect(
        httpClient.get(`${baseUrl}/start`, {
          maxRedirects: 1,
          maxContentLength: 10_000,
        }),
      ).rejects.toThrow();
    });

    it("follows 302 with GET and drops the body (per HTTP spec)", async () => {
      const seen: Array<{ method: string; url: string; body: string }> = [];
      respond = (req, res, rec) => {
        seen.push({ method: rec.method, url: rec.url, body: rec.body });
        if (req.url === "/start") {
          res.writeHead(302, { location: "/after" });
          return res.end();
        }
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        return res.end('{"ok":true}');
      };
      await httpClient.post(
        `${baseUrl}/start`,
        { sensitive: "payload" },
        { maxRedirects: 1, maxContentLength: 10_000 },
      );
      expect(seen[0]).toEqual({
        method: "POST",
        url: "/start",
        body: '{"sensitive":"payload"}',
      });
      // After the 302, the request must switch to GET with no body — otherwise
      // a naive re-POST would leak payload to the redirect target.
      expect(seen[1].method).toBe("GET");
      expect(seen[1].url).toBe("/after");
      expect(seen[1].body).toBe("");
    });

    it("follows 307 while preserving method and body", async () => {
      const seen: Array<{ method: string; body: string }> = [];
      respond = (req, res, rec) => {
        seen.push({ method: rec.method, body: rec.body });
        if (req.url === "/start") {
          res.writeHead(307, { location: "/after" });
          return res.end();
        }
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        return res.end('{"ok":true}');
      };
      await httpClient.post(
        `${baseUrl}/start`,
        { keep: "this" },
        { maxRedirects: 1, maxContentLength: 10_000 },
      );
      expect(seen[0]).toEqual({ method: "POST", body: '{"keep":"this"}' });
      // 307/308 must preserve the method AND body.
      expect(seen[1]).toEqual({ method: "POST", body: '{"keep":"this"}' });
    });

    it("fetchOptions cannot override the enforced redirect policy", async () => {
      const visited: string[] = [];
      respond = (req, res) => {
        visited.push(req.url || "");
        if (req.url === "/start") {
          res.writeHead(302, { location: "/hop" });
          return res.end();
        }
        res.writeHead(200);
        return res.end("nope");
      };
      await expect(
        httpClient.get(`${baseUrl}/start`, {
          maxRedirects: 0,
          maxContentLength: 10_000,
          fetchOptions: { redirect: "follow" } as any,
        }),
      ).rejects.toThrow();
      expect(visited).toEqual(["/start"]);
    });
  });

  describe("bounded path — response size cap", () => {
    it("rejects when content-length exceeds maxContentLength", async () => {
      respond = (_req, res) => {
        const body = Buffer.alloc(5000, 0x61);
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Length", String(body.length));
        res.writeHead(200);
        res.end(body);
      };
      await expect(
        httpClient.get(`${baseUrl}/`, { maxContentLength: 1000 }),
      ).rejects.toThrow(/maxContentLength size/);
    });

    it("POST with an object body serializes JSON through the bounded path", async () => {
      await httpClient.post(
        `${baseUrl}/`,
        { hello: "world", n: 42 },
        { maxContentLength: 10_000 },
      );
      expect(requests[0].method.toLowerCase()).toBe("post");
      expect(requests[0].body).toBe('{"hello":"world","n":42}');
      expect(String(requests[0].headers["content-type"])).toMatch(
        /application\/json/,
      );
    });

    // Bounded-adapter timeout rewrites the fetch TimeoutError to the
    // axios-shaped "timeout of Nms exceeded" message. The existing timeout
    // test above runs through the feaxios path (no maxContentLength), so
    // this branch has zero coverage otherwise.
    it("bounded-path timeout surfaces an axios-shaped timeout error", async () => {
      respond = () => {
        // never respond
      };
      await expect(
        httpClient.get(`${baseUrl}/`, {
          timeout: 150,
          maxContentLength: 10_000,
        }),
      ).rejects.toThrow(/timeout of 150ms exceeded/i);
    }, 5000);

    // Covers the AbortSignal.timeout-unavailable branch in createTimeoutSignal.
    // In Node 20 and modern browsers the native helper exists, so this path
    // is dead at test-time unless we unset it explicitly. Without the fix,
    // the fallback aborts with `new Error("TimeoutError")` whose .name is
    // "Error", the adapter's catch misses the rewrite, and the caller sees
    // a raw AbortError instead of the axios-shaped message.
    it("bounded-path timeout fallback produces axios-shaped error when AbortSignal.timeout is missing", async () => {
      respond = () => {
        // never respond
      };
      const original = (AbortSignal as any).timeout;
      (AbortSignal as any).timeout = undefined;
      try {
        await expect(
          httpClient.get(`${baseUrl}/`, {
            timeout: 150,
            maxContentLength: 10_000,
          }),
        ).rejects.toThrow(/timeout of 150ms exceeded/i);
      } finally {
        (AbortSignal as any).timeout = original;
      }
    }, 5000);

    it("config.adapter takes precedence even when bounded options are set", async () => {
      // eslint-disable-next-line @typescript-eslint/require-await
      const rogueAdapter = async () => ({
        data: "rogue",
        headers: {},
        status: 200,
        statusText: "OK",
        config: {},
      });
      await httpClient.get(`${baseUrl}/clamp`, {
        maxContentLength: 10_000,
        adapter: rogueAdapter as any,
      } as any);
      expect(requests).toHaveLength(0);
    });

    // baseURL joining behavior on the bounded path. Documented but untested
    // before — any regression in buildBoundedUrl would land silently.
    it("baseURL joins with url on the bounded path", async () => {
      await httpClient.get("/joined", {
        baseURL: baseUrl,
        maxContentLength: 10_000,
      } as any);
      expect(requests[0].url).toBe("/joined");
    });

    // 3xx without a Location header can't be redirected. The adapter
    // falls through the manual-redirect loop, hands the response to
    // validateStatus, which fails by default → the caller sees
    // "Request failed with status code 3xx". This test pins that
    // behavior so a future refactor doesn't silently swallow such
    // responses or convert them to 2xx successes.
    it("3xx without Location header rejects via validateStatus", async () => {
      respond = (_req, res) => {
        res.writeHead(302); // intentionally no Location header
        res.end();
      };
      await expect(
        httpClient.get(`${baseUrl}/`, {
          maxRedirects: 1,
          maxContentLength: 10_000,
        }),
      ).rejects.toThrow(/Request failed with status code 302/);
    });

    it("aborts mid-stream on a chunked response exceeding the cap", async () => {
      const chunkSize = 8 * 1024;
      const totalChunks = 32;
      let bytesWritten = 0;
      respond = async (_req, res) => {
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Transfer-Encoding", "chunked");
        const chunk = Buffer.alloc(chunkSize, 0x61);
        for (let i = 0; i < totalChunks; i += 1) {
          if (res.writableEnded || res.destroyed) break;
          const written = await new Promise<boolean>((resolve) => {
            res.write(chunk, (err) => resolve(!err));
          });
          if (!written) break;
          bytesWritten += chunkSize;
          await new Promise((r) => setTimeout(r, 5));
        }
        if (!res.writableEnded && !res.destroyed) res.end();
      };

      await expect(
        httpClient.get(`${baseUrl}/`, { maxContentLength: 10_000 }),
      ).rejects.toThrow(/maxContentLength size/);
      await new Promise((r) => setTimeout(r, 300));
      expect(bytesWritten).toBeLessThan(chunkSize * totalChunks);
    });
  });

  // These tests encode behavior the review flagged as diverging from axios.
  // They pass on the axios build but fail on the no-axios build so the
  // claims can be verified before any fix lands.
  describe("bounded path - axios/feaxios parity", () => {
    it("instance defaults merge with per-call overrides on the bounded path", async () => {
      const client = httpClient.create({
        headers: { "X-Default": "default", "X-Keep": "preserved" },
      });
      await client.get(`${baseUrl}/m`, {
        headers: { "X-Override": "yes" },
        maxContentLength: 10_000,
      });
      expect(requests[0].headers["x-default"]).toBe("default");
      expect(requests[0].headers["x-keep"]).toBe("preserved");
      expect(requests[0].headers["x-override"]).toBe("yes");
    });

    it("cross-origin redirect strips the Authorization header", async () => {
      // Axios's Node adapter strips Authorization on cross-origin
      // redirects so credentials aren't handed to an attacker-controlled
      // target. The bounded adapter rebuilds init for the next hop but
      // leaves all request headers in place,
      const secondaryRequests: RequestRecord[] = [];
      const secondary = await startServer((_req, res, rec) => {
        secondaryRequests.push(rec);
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end("{}");
      });
      try {
        respond = (_req, res) => {
          res.writeHead(302, { location: `${secondary.url}/after` });
          res.end();
        };
        await httpClient.get(`${baseUrl}/start`, {
          headers: { Authorization: "Bearer secret" },
          maxRedirects: 1,
          maxContentLength: 10_000,
        });
        expect(secondaryRequests).toHaveLength(1);
        expect(secondaryRequests[0].headers.authorization).toBeUndefined();
      } finally {
        await closeServer(secondary.server);
      }
    });
  });

  describe("form-encoded bodies", () => {
    // Note: the {post,put,patch}Form helpers actually diverge between axios
    // (multipart/form-data) and the custom fetch-client (URL-encoded). The
    // SDK doesn't call any of them internally, so rather than freezing one
    // behavior or the other, this suite covers the canonical form-encoded
    // path that both impls agree on: post(url, new URLSearchParams(...)).
    // Horizon's submitTransaction uses exactly that shape.
    it("post with URLSearchParams sends application/x-www-form-urlencoded", async () => {
      await httpClient.post(
        `${baseUrl}/f`,
        new URLSearchParams({ a: "1", b: "two & more" }),
      );
      expect(requests[0].method.toLowerCase()).toBe("post");
      expect(String(requests[0].headers["content-type"])).toMatch(
        /application\/x-www-form-urlencoded/,
      );
      expect(requests[0].body).toContain("a=1");
      // "&" in values arrives URL-encoded; "+" or "%20" for the space is acceptable.
      expect(requests[0].body).toMatch(/b=two(\+|%20)%26(\+|%20)more/);
    });
  });

  describe("interceptors", () => {
    // Use httpClient.create so ejecting and mutation are scoped — avoids
    // leaking handler state into other tests sharing the global client.
    let client: any;

    beforeEach(() => {
      client = httpClient.create();
    });

    it("request interceptor can mutate the outgoing config", async () => {
      client.interceptors.request.use((cfg: any) => {
        cfg.headers = { ...(cfg.headers || {}), "X-Injected": "yes" };
        return cfg;
      });
      await client.get(`${baseUrl}/i`);
      expect(requests[0].headers["x-injected"]).toBe("yes");
    });

    it("request interceptor may be async", async () => {
      client.interceptors.request.use(async (cfg: any) => {
        await new Promise((r) => setTimeout(r, 10));
        cfg.headers = { ...(cfg.headers || {}), "X-Async": "done" };
        return cfg;
      });
      await client.get(`${baseUrl}/i`);
      expect(requests[0].headers["x-async"]).toBe("done");
    });

    it("response interceptor can mutate the response", async () => {
      respond = (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end('{"value":1}');
      };
      client.interceptors.response.use((resp: any) => {
        resp.data = { ...resp.data, added: true };
        return resp;
      });
      const resp = await client.get(`${baseUrl}/i`);
      expect(resp.data).toEqual({ value: 1, added: true });
    });

    it("response interceptor rejection is invoked on non-2xx", async () => {
      respond = (_req, res) => {
        res.writeHead(500);
        res.end("boom");
      };
      let rejectedSeen = false;
      client.interceptors.response.use(
        (r: any) => r,
        (err: any) => {
          rejectedSeen = true;
          throw err;
        },
      );
      await expect(client.get(`${baseUrl}/i`)).rejects.toThrow();
      expect(rejectedSeen).toBe(true);
    });

    it("eject removes an interceptor", async () => {
      const id = client.interceptors.request.use((cfg: any) => {
        cfg.headers = { ...(cfg.headers || {}), "X-Ghost": "still-here" };
        return cfg;
      });
      client.interceptors.request.eject(id);
      await client.get(`${baseUrl}/i`);
      expect(requests[0].headers["x-ghost"]).toBeUndefined();
    });

    // If a request interceptor throws and nothing in the chain recovers,
    // the error must propagate out of the client call AND the network
    // request must not be made — otherwise a failing auth-injection
    // interceptor would silently let unauthenticated requests through.
    it("request interceptor rejection surfaces to the caller and aborts the request", async () => {
      const sentinel = new Error("interceptor boom");
      client.interceptors.request.use(() => {
        throw sentinel;
      });
      await expect(client.get(`${baseUrl}/i`)).rejects.toThrow(
        "interceptor boom",
      );
      expect(requests).toHaveLength(0);
    });
  });

  describe("instance defaults via create()", () => {
    it("create({headers}) applies default headers to every request", async () => {
      const client = httpClient.create({
        headers: { "X-Default": "from-create" },
      });
      await client.get(`${baseUrl}/d`);
      expect(requests[0].headers["x-default"]).toBe("from-create");
    });

    it("per-request headers merge with and can override instance defaults", async () => {
      const client = httpClient.create({
        headers: { "X-Default": "default", "X-Keep": "preserved" },
      });
      await client.get(`${baseUrl}/d`, {
        headers: { "X-Default": "overridden" },
      });
      expect(requests[0].headers["x-default"]).toBe("overridden");
      expect(requests[0].headers["x-keep"]).toBe("preserved");
    });

    it("per-request params are honored on an instance created with defaults", async () => {
      const client = httpClient.create({
        headers: { "X-Default": "yes" },
      });
      await client.get(`${baseUrl}/d`, { params: { a: "1" } });
      expect(requests[0].url).toContain("a=1");
      expect(requests[0].headers["x-default"]).toBe("yes");
    });
  });
});
