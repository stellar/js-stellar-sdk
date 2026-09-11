import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import http from "http";
import { AddressInfo } from "net";
import * as StellarSdk from "../../src/index.js";
import { httpClient } from "../../src/http-client/index.js";

const { StellarToml, Config } = StellarSdk;
const { Resolver, STELLAR_TOML_MAX_SIZE } = StellarToml;

describe("stellar_toml_resolver.js tests", () => {
  let mockHttpClient: any;

  beforeEach(() => {
    mockHttpClient = vi.spyOn(httpClient, "get");
    Config.setDefault();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Resolver.resolve", () => {
    afterEach(() => {
      Config.setDefault();
    });

    it("returns stellar.toml object for valid request and stellar.toml file", async () => {
      mockHttpClient.mockImplementation((url: string) => {
        if (url.includes("https://acme.com/.well-known/stellar.toml")) {
          return Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.stellar.org/federation"
`,
          });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const stellarToml = await Resolver.resolve("acme.com");
      expect(stellarToml.FEDERATION_SERVER).toEqual(
        "https://api.stellar.org/federation",
      );
    });

    it("returns stellar.toml object for valid request and stellar.toml file when allowHttp is `true`", async () => {
      mockHttpClient.mockImplementation((url: string) => {
        if (url.includes("http://acme.com/.well-known/stellar.toml")) {
          return Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="http://api.stellar.org/federation"
`,
          });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const stellarToml = await Resolver.resolve("acme.com", {
        allowHttp: true,
      });
      expect(stellarToml.FEDERATION_SERVER).toEqual(
        "http://api.stellar.org/federation",
      );
    });

    it("returns stellar.toml object for valid request and stellar.toml file when global Config.allowHttp flag is set", async () => {
      Config.setAllowHttp(true);

      mockHttpClient.mockImplementation((url: string) => {
        if (url.includes("http://acme.com/.well-known/stellar.toml")) {
          return Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="http://api.stellar.org/federation"
`,
          });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const stellarToml = await Resolver.resolve("acme.com");
      expect(stellarToml.FEDERATION_SERVER).toEqual(
        "http://api.stellar.org/federation",
      );
    });

    it("rejects when stellar.toml file is invalid", async () => {
      mockHttpClient.mockImplementation((url: string) => {
        if (url.includes("https://acme.com/.well-known/stellar.toml")) {
          return Promise.resolve({
            data: `
/#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.stellar.org/federation"
`,
          });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      await expect(Resolver.resolve("acme.com")).rejects.toThrow(
        /Parsing error on line/,
      );
    });

    it("rejects when there was a connection error", async () => {
      mockHttpClient.mockImplementation((url: string) => {
        if (url.includes("https://acme.com/.well-known/stellar.toml")) {
          return Promise.reject();
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      await expect(Resolver.resolve("acme.com")).rejects.toThrow();
    });

    it("fails when response exceeds the limit", async () => {
      // Unable to create temp server in a browser
      if (typeof window !== "undefined") {
        return;
      }
      const response = Array(STELLAR_TOML_MAX_SIZE + 10).join("a");
      const tempServer = http
        .createServer((_req, res) => {
          res.setHeader("Content-Type", "text/x-toml; charset=UTF-8");
          res.end(response);
        })
        .listen(4444);

      try {
        await expect(
          Resolver.resolve("localhost:4444", {
            allowHttp: true,
          }),
        ).rejects.toThrow(/stellar.toml file exceeds allowed size of [0-9]+/);
      } finally {
        tempServer.close();
      }
    });

    it("rejects after given timeout when global Config.timeout flag is set", async () => {
      Config.setTimeout(1000);

      // Unable to create temp server in a browser
      if (typeof window !== "undefined") {
        return;
      }

      const tempServer = http
        .createServer(() => {
          setTimeout(() => {}, 10000);
        })
        .listen(4444);

      try {
        await expect(
          Resolver.resolve("localhost:4444", {
            allowHttp: true,
          }),
        ).rejects.toThrow(/timeout of 1000ms exceeded/);
      } finally {
        Config.setDefault();
        tempServer.close();
      }
    });

    it("rejects after given timeout when timeout specified in Resolver opts param", async () => {
      // Unable to create temp server in a browser
      if (typeof window !== "undefined") {
        return;
      }

      const tempServer = http
        .createServer(() => {
          setTimeout(() => {}, 10000);
        })
        .listen(4444);

      try {
        await expect(
          Resolver.resolve("localhost:4444", {
            allowHttp: true,
            timeout: 1000,
          }),
        ).rejects.toThrow(/timeout of 1000ms exceeded/);
      } finally {
        tempServer.close();
      }
    });

    it("rejects redirect response when allowedRedirects is not specified", async () => {
      // Unable to create temp server in a browser
      if (typeof window !== "undefined") {
        return;
      }

      const tempServer = http
        .createServer((req, res) => {
          if (req.url === "/.well-known/stellar.toml") {
            res.writeHead(302, { location: "/redirect" });
            return res.end();
          }
          res.writeHead(404);
          return res.end();
        })
        .listen(0); // Use random available port

      try {
        const port = (tempServer.address() as AddressInfo).port;
        await expect(
          Resolver.resolve(`localhost:${port}`, {
            allowHttp: true,
          }),
        ).rejects.toThrow(/Request failed with status code 302/);
      } finally {
        tempServer.close();
      }
    });

    it("returns handled redirect when allowedRedirects is specified", async () => {
      if (typeof window !== "undefined") {
        return;
      }

      const tempServer = http
        .createServer((req, res) => {
          if (req.url === "/.well-known/stellar.toml") {
            res.writeHead(302, { location: "/redirect" });
            return res.end();
          }
          if (req.url === "/redirect") {
            res.setHeader("Content-Type", "text/x-toml; charset=UTF-8");
            res.writeHead(200);
            return res.end(`
            FEDERATION_SERVER="https://api.stellar.org/federation"
            `);
          }
          res.writeHead(404);
          return res.end();
        })
        .listen(0); // Use random available port

      try {
        const port = (tempServer.address() as AddressInfo).port;
        const response = await Resolver.resolve(`localhost:${port}`, {
          allowHttp: true,
          allowedRedirects: 1,
        });
        expect(response.FEDERATION_SERVER).toEqual(
          "https://api.stellar.org/federation",
        );
      } finally {
        tempServer.close();
      }
    });

    describe("domain validation", () => {
      it.each([
        "legitimate-bank.com@127.0.0.1:8000",
        "legitimate-bank.com:pw@127.0.0.1:8000",
        "acme.com/evil.com",
        "acme.com\\evil.com",
        "acme.com?evil=1",
        "acme.com#evil",
        "//evil.com",
        "/evil.com",
        "\\evil.com",
        "@evil.com",
        ":@evil.com",
        "acme.com/..",
        "acme.com/%2e%2e",
        // Only trailing separators are stripped, so these still name another host.
        "/",
        "//",
        "",
        " ",
        // Whitespace inside the name survives the trim. The URL parser deletes a
        // tab from the host, so the parse alone reports no error.
        "ac\tme.com",
        "ac me.com",
        // Chromium maps this to a space inside the host, where Node and Firefox
        // refuse the URL.
        "\u00a8acme.com",
      ])("rejects %j and makes no request", async (domain) => {
        // Resolve rather than reject, so a request that slips past the guard
        // fails the assertion below instead of hitting the network.
        mockHttpClient.mockResolvedValue({ data: "" });

        await expect(Resolver.resolve(domain)).rejects.toThrow(
          /Invalid domain/,
        );
        expect(mockHttpClient).not.toHaveBeenCalled();
      });

      it.each([
        "acme.com",
        "sub.acme.com",
        "localhost:8000",
        "127.0.0.1:8000",
        "[::1]:8000",
      ])("accepts %j and requests it unchanged", async (domain) => {
        mockHttpClient.mockResolvedValue({
          data: 'FEDERATION_SERVER="https://api.stellar.org/federation"',
        });

        const stellarToml = await Resolver.resolve(domain);

        expect(stellarToml.FEDERATION_SERVER).toEqual(
          "https://api.stellar.org/federation",
        );
        expect(mockHttpClient).toHaveBeenCalledWith(
          `https://${domain}/.well-known/stellar.toml`,
          expect.anything(),
        );
      });

      it("applies to http when allowHttp is set", async () => {
        mockHttpClient.mockResolvedValue({ data: "" });

        await expect(
          Resolver.resolve("legit.com@evil.com", { allowHttp: true }),
        ).rejects.toThrow(/Invalid domain/);
        expect(mockHttpClient).not.toHaveBeenCalled();

        await Resolver.resolve("acme.com:8000", { allowHttp: true });
        expect(mockHttpClient).toHaveBeenCalledWith(
          "http://acme.com:8000/.well-known/stellar.toml",
          expect.anything(),
        );
      });

      it.each([
        ["ACME.com", "acme.com"],
        ["b\u00fccher.example", "xn--bcher-kva.example"],
        // Percent-encoded input reached these hosts before the domain check
        // existed, so it must keep working.
        ["b%C3%BCcher.example", "xn--bcher-kva.example"],
        ["acme%2Ecom", "acme.com"],
        // A trailing separator or surrounding whitespace is stripped, not rejected.
        ["acme.com/", "acme.com"],
        ["acme.com//", "acme.com"],
        ["acme.com\\", "acme.com"],
        [" acme.com", "acme.com"],
        ["acme.com\n", "acme.com"],
        ["acme.com\t", "acme.com"],
        ["  acme.com/  ", "acme.com"],
      ])("normalizes %j to %j", async (domain, expectedHost) => {
        mockHttpClient.mockResolvedValue({
          data: 'FEDERATION_SERVER="https://api.stellar.org/federation"',
        });

        await Resolver.resolve(domain);

        expect(mockHttpClient).toHaveBeenCalledWith(
          `https://${expectedHost}/.well-known/stellar.toml`,
          expect.anything(),
        );
      });
    });
  });
});
