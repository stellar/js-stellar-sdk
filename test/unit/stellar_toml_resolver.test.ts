import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import http from "http";
import { AddressInfo } from "net";
import { StellarSdk, httpClient } from "../test-utils/stellar-sdk-import";

const { Resolver, STELLAR_TOML_MAX_SIZE } = StellarSdk.StellarToml;

describe("stellar_toml_resolver.js tests", () => {
  let mockHttpClient: any;

  beforeEach(() => {
    mockHttpClient = vi.spyOn(httpClient, "get");
    StellarSdk.Config.setDefault();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Resolver.resolve", () => {
    afterEach(() => {
      StellarSdk.Config.setDefault();
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
      StellarSdk.Config.setAllowHttp(true);

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
      StellarSdk.Config.setTimeout(1000);

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
        StellarSdk.Config.setDefault();
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
  });
});
