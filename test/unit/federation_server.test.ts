import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import http from "http";
import { AddressInfo } from "net";
import * as StellarSdk from "../../src/index.js";
import { httpClient } from "../../src/http-client/index.js";
import { validateFederationServer } from "../../src/federation/utils.js";

const { Federation, Config } = StellarSdk;
const { Server, FEDERATION_RESPONSE_MAX_SIZE } = Federation;

describe("federation-server.js tests", () => {
  let server: any;
  let mockHttpClient: any;

  beforeEach(() => {
    server = new Server("https://acme.com:1337/federation", "stellar.org");
    mockHttpClient = vi.spyOn(httpClient, "get");
    Config.setDefault();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("FederationServer.constructor", () => {
    it("throws error for insecure server", () => {
      expect(
        () => new Server("http://acme.com:1337/federation", "stellar.org"),
      ).toThrow(/Cannot connect to insecure federation server/);
    });

    it("throws error for invalid domain", () => {
      expect(
        () => new Server("https://acme.com:1337/federation", "-stellar.org"),
      ).toThrow(/The provided domain is invalid/);
    });

    it("allow insecure server when opts.allowHttp flag is set", () => {
      expect(
        () =>
          new Server("http://acme.com:1337/federation", "stellar.org", {
            allowHttp: true,
          }),
      ).not.toThrow();
    });

    it("allow insecure server when global Config.allowHttp flag is set", () => {
      Config.setAllowHttp(true);
      expect(
        () =>
          new Server("http://acme.com:1337/federation", "stellar.org", {
            allowHttp: true,
          }),
      ).not.toThrow();
    });

    it.each([0, 1, 20])("accepts allowedRedirects %s", (allowedRedirects) => {
      expect(
        () =>
          new Server("https://acme.com:1337/federation", "stellar.org", {
            allowedRedirects,
          }),
      ).not.toThrow();
    });

    it.each([-1, 1.5, NaN, Infinity])(
      "rejects allowedRedirects %s",
      (allowedRedirects) => {
        expect(
          () =>
            new Server("https://acme.com:1337/federation", "stellar.org", {
              allowedRedirects,
            }),
        ).toThrow(/allowedRedirects/);
      },
    );

    it("treats allowedRedirects null from a plain-JS caller as unset", () => {
      expect(() =>
        Reflect.construct(Server, [
          "https://acme.com:1337/federation",
          "stellar.org",
          { allowedRedirects: null },
        ]),
      ).not.toThrow();
    });

    it.each(["2", {}])(
      "rejects allowedRedirects %j from a plain-JS caller",
      (allowedRedirects) => {
        expect(() =>
          Reflect.construct(Server, [
            "https://acme.com:1337/federation",
            "stellar.org",
            { allowedRedirects },
          ]),
        ).toThrow(/allowedRedirects/);
      },
    );
  });

  describe("FederationServer.resolveAddress", () => {
    beforeEach(() => {
      mockHttpClient.mockImplementation((url: string) => {
        if (
          url.includes(
            "https://acme.com:1337/federation?type=name&q=bob*stellar.org",
          )
        ) {
          return Promise.resolve({
            data: {
              stellar_address: "bob*stellar.org",
              account_id:
                "GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
            },
          });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });
    });

    it("rejects with BadResponseError on HTTP errors", async () => {
      mockHttpClient.mockImplementation(() =>
        Promise.reject(
          Object.assign(new Error("Request failed with status code 404"), {
            response: {
              status: 404,
              statusText: "Not Found",
              data: { detail: "not found" },
            },
          }),
        ),
      );

      const err = await server.resolveAddress("bob*stellar.org").then(
        () => Promise.reject(new Error("expected rejection")),
        (e: any) => e,
      );

      expect(err).toBeInstanceOf(StellarSdk.BadResponseError);
      expect(err.response.status).toEqual(404);
      expect(err.response.data).toEqual({ detail: "not found" });
      expect(err.cause).toBeInstanceOf(Error);
    });

    it("requests is correct", async () => {
      const response = await server.resolveAddress("bob*stellar.org");
      expect(response.stellar_address).toEqual("bob*stellar.org");
      expect(response.account_id).toEqual(
        "GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
      );
    });

    it("requests is correct for username as stellar address", async () => {
      const response = await server.resolveAddress("bob");
      expect(response.stellar_address).toEqual("bob*stellar.org");
      expect(response.account_id).toEqual(
        "GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
      );
    });
  });

  describe("FederationServer.resolveAccountId", () => {
    beforeEach(() => {
      mockHttpClient.mockImplementation((url: string) => {
        if (
          url.includes(
            "https://acme.com:1337/federation?type=id&q=GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
          )
        ) {
          return Promise.resolve({
            data: {
              stellar_address: "bob*stellar.org",
              account_id:
                "GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
            },
          });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });
    });

    it("requests is correct", async () => {
      const response = await server.resolveAccountId(
        "GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
      );
      expect(response.stellar_address).toEqual("bob*stellar.org");
      expect(response.account_id).toEqual(
        "GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
      );
    });
  });

  describe("FederationServer.resolveTransactionId", () => {
    beforeEach(() => {
      mockHttpClient.mockImplementation((url: string) => {
        if (
          url.includes(
            "https://acme.com:1337/federation?type=txid&q=3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889",
          )
        ) {
          return Promise.resolve({
            data: {
              stellar_address: "bob*stellar.org",
              account_id:
                "GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
            },
          });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });
    });

    it("requests is correct", async () => {
      const response = await server.resolveTransactionId(
        "3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889",
      );
      expect(response.stellar_address).toEqual("bob*stellar.org");
      expect(response.account_id).toEqual(
        "GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
      );
    });
  });

  describe("FederationServer redirects", () => {
    const record = {
      stellar_address: "bob*stellar.org",
      account_id: "GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
    };

    it("refuses redirects when allowedRedirects is not specified", async () => {
      mockHttpClient.mockResolvedValue({ data: record });

      await server.resolveAddress("bob*stellar.org");

      expect(mockHttpClient.mock.calls[0][1].maxRedirects).toEqual(0);
    });

    it("passes allowedRedirects to the request", async () => {
      mockHttpClient.mockResolvedValue({ data: record });

      await new Server("https://acme.com:1337/federation", "stellar.org", {
        allowedRedirects: 2,
      }).resolveAddress("bob*stellar.org");

      expect(mockHttpClient.mock.calls[0][1].maxRedirects).toEqual(2);
    });

    it("passes allowedRedirects to the stellar.toml request", async () => {
      mockHttpClient.mockResolvedValue({
        data: 'FEDERATION_SERVER="https://api.stellar.org/federation"',
      });

      await Server.createForDomain("acme.com", { allowedRedirects: 1 });

      expect(mockHttpClient.mock.calls[0][1].maxRedirects).toEqual(1);
    });

    it("rejects redirect response when allowedRedirects is not specified", async () => {
      // Unable to create temp server in a browser
      if (typeof window !== "undefined") {
        return;
      }
      mockHttpClient.mockRestore();

      const requested: string[] = [];
      const tempServer = http
        .createServer((req, res) => {
          requested.push(req.url ?? "");
          if (req.url?.startsWith("/federation")) {
            res.writeHead(302, { location: "/redirect" });
            return res.end();
          }
          res.setHeader("Content-Type", "application/json; charset=UTF-8");
          return res.end(JSON.stringify(record));
        })
        .listen(0);

      try {
        const port = (tempServer.address() as AddressInfo).port;
        await expect(
          new Server(`http://localhost:${port}/federation`, "stellar.org", {
            allowHttp: true,
          }).resolveAddress("bob*stellar.org"),
        ).rejects.toThrow(/Server responded: 302/);
        expect(requested).not.toContain("/redirect");
      } finally {
        tempServer.close();
      }
    });

    it("returns handled redirect when allowedRedirects is specified", async () => {
      // Unable to create temp server in a browser
      if (typeof window !== "undefined") {
        return;
      }
      mockHttpClient.mockRestore();

      const tempServer = http
        .createServer((req, res) => {
          if (req.url?.startsWith("/federation")) {
            res.writeHead(302, { location: "/redirect" });
            return res.end();
          }
          res.setHeader("Content-Type", "application/json; charset=UTF-8");
          return res.end(JSON.stringify(record));
        })
        .listen(0);

      try {
        const port = (tempServer.address() as AddressInfo).port;
        const response = await new Server(
          `http://localhost:${port}/federation`,
          "stellar.org",
          { allowHttp: true, allowedRedirects: 1 },
        ).resolveAddress("bob*stellar.org");
        expect(response).toEqual(record);
      } finally {
        tempServer.close();
      }
    });
  });

  describe("FederationServer.createForDomain", () => {
    it("creates correct object", async () => {
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

      const federationServer = await Server.createForDomain("acme.com");
      expect(federationServer["serverURL"].protocol).toEqual("https:");
      expect(federationServer["serverURL"].hostname).toEqual("api.stellar.org");
      expect(federationServer["serverURL"].pathname).toEqual("/federation");
      expect(federationServer["domain"]).toEqual("acme.com");
    });

    it("fails for invalid domain before requesting stellar.toml", async () => {
      await expect(Server.createForDomain("-acme.com")).rejects.toThrow(
        /The provided domain is invalid/,
      );
      expect(mockHttpClient).not.toHaveBeenCalled();
    });

    it("fails when stellar.toml does not contain federation server info", async () => {
      mockHttpClient.mockImplementation((url: string) => {
        if (url.includes("https://acme.com/.well-known/stellar.toml")) {
          return Promise.resolve({
            data: "",
          });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      await expect(Server.createForDomain("acme.com")).rejects.toThrow(
        /stellar.toml does not contain FEDERATION_SERVER field/,
      );
    });

    describe("FEDERATION_SERVER validation", () => {
      const mockToml = (federationServer: string) =>
        mockHttpClient.mockImplementation((url: string) => {
          if (url.includes("://acme.com/.well-known/stellar.toml")) {
            return Promise.resolve({
              data: `FEDERATION_SERVER=${JSON.stringify(federationServer)}`,
            });
          }
          return Promise.reject(new Error(`Unexpected URL: ${url}`));
        });

      it.each([
        "127.0.0.1",
        "127.255.255.254",
        "0x7f.1",
        "2130706433",
        "10.0.0.5",
        "172.16.0.1",
        "172.31.255.255",
        "192.168.1.1",
        "169.254.169.254",
        "0.0.0.0",
        "0",
        "[::1]",
        "[0:0:0:0:0:0:0:1]",
        "[::]",
        "[fe80::1]",
        "[febf::1]",
        "[fc00::1]",
        "[fd12:3456::1]",
        "[::ffff:127.0.0.1]",
        "[::ffff:10.0.0.5]",
        "[::ffff:169.254.169.254]",
        "[::127.0.0.1]",
        "[::10.0.0.5]",
        "[::2]",
        "[64:ff9b::127.0.0.1]",
        "[64:ff9b::10.0.0.5]",
        "100.64.0.1",
        "100.100.100.200",
        "100.127.255.255",
        "[::ffff:100.64.0.1]",
      ])("rejects the IP address %s", async (host) => {
        mockToml(`https://${host}:8443/federation`);

        await expect(Server.createForDomain("acme.com")).rejects.toThrow(
          /Invalid FEDERATION_SERVER: .*private, shared, local or unspecified IP address/,
        );
      });

      it.each([
        "8.8.8.8",
        "11.0.0.1",
        "172.15.255.255",
        "172.32.0.1",
        "192.169.0.1",
        "169.255.0.1",
        "100.63.255.255",
        "100.128.0.1",
        "[2001:db8::1]",
        "[fec0::1]",
        "[fe00::1]",
        "[::ffff:8.8.8.8]",
        "[::8.8.8.8]",
        "[64:ff9b::8.8.8.8]",
        "api.stellar.org",
        // Only IP addresses are checked; names are not resolved.
        "localhost",
      ])("accepts the host %s", async (host) => {
        mockToml(`https://${host}/federation`);

        const federationServer = await Server.createForDomain("acme.com");

        expect(federationServer["serverURL"].href).toEqual(
          new URL(`https://${host}/federation`).href,
        );
      });

      it.each([
        "https://user:pw@api.stellar.org/federation",
        "https://user@api.stellar.org/federation",
        "https://:pw@api.stellar.org/federation",
      ])(
        "rejects the user name or password in %s",
        async (federationServer) => {
          mockToml(federationServer);

          await expect(Server.createForDomain("acme.com")).rejects.toThrow(
            /Invalid FEDERATION_SERVER: .*user name or password/,
          );
        },
      );

      it.each([
        "ftp://api.stellar.org/federation",
        "file:///etc/passwd",
        "data:application/json,{}",
      ])("rejects %s even when allowHttp is set", async (federationServer) => {
        mockToml(federationServer);

        await expect(
          Server.createForDomain("acme.com", { allowHttp: true }),
        ).rejects.toThrow(/Invalid FEDERATION_SERVER: .*Unsupported protocol/);
      });

      it("accepts http when allowHttp is set", async () => {
        mockToml("http://api.stellar.org/federation");

        const federationServer = await Server.createForDomain("acme.com", {
          allowHttp: true,
        });

        expect(federationServer["serverURL"].protocol).toEqual("http:");
      });

      it("rejects a private IP address in resolve before any federation request", async () => {
        mockToml("https://10.0.0.5/federation");

        await expect(Server.resolve("bob*acme.com")).rejects.toThrow(
          /Invalid FEDERATION_SERVER/,
        );
        expect(mockHttpClient).toHaveBeenCalledTimes(1);
      });

      it("rejects an IPv6 host that the URL parser did not normalize", () => {
        // A URL implementation that keeps the dotted IPv4 tail.
        const url = new URL("https://[::1]/federation");
        Object.defineProperty(url, "hostname", { value: "[::ffff:127.0.0.1]" });

        expect(() => validateFederationServer(url)).toThrow(
          /Cannot parse IPv6 address/,
        );
      });

      it.each([
        "127.1",
        "0x7f.1",
        "2130706433",
        "0177.0.0.1",
        "10.1",
        "256.0.0.1",
        "1.2.3.4.5",
      ])(
        "rejects the IPv4 host %s that the URL parser did not normalize",
        (hostname) => {
          const url = new URL("https://api.stellar.org/federation");
          Object.defineProperty(url, "hostname", { value: hostname });

          expect(() => validateFederationServer(url)).toThrow(
            /Cannot parse IPv4 address/,
          );
        },
      );

      it.each([
        ["127.0.0.1.", /private, shared, local or unspecified/],
        ["8.8.8.8.", undefined],
        ["1.2.3.example", undefined],
      ])(
        "checks the host %s with a trailing dot or name",
        (hostname, error) => {
          const url = new URL("https://api.stellar.org/federation");
          Object.defineProperty(url, "hostname", { value: hostname });

          if (error) {
            expect(() => validateFederationServer(url)).toThrow(error);
          } else {
            expect(() => validateFederationServer(url)).not.toThrow();
          }
        },
      );

      it("rejects a bad allowedRedirects before the stellar.toml request", async () => {
        mockToml("https://api.stellar.org/federation");

        await expect(
          Server.createForDomain("acme.com", { allowedRedirects: NaN }),
        ).rejects.toThrow(/allowedRedirects/);
        expect(mockHttpClient).not.toHaveBeenCalled();
      });

      it("does not check the URL that the caller passes to the constructor", () => {
        expect(
          () =>
            new Server("http://127.0.0.1:8000/federation", "stellar.org", {
              allowHttp: true,
            }),
        ).not.toThrow();
      });
    });
  });

  describe("FederationServer.resolve", () => {
    it("succeeds for a valid account ID", async () => {
      const result = await Server.resolve(
        "GAFSZ3VPBC2H2DVKCEWLN3PQWZW6BVDMFROWJUDAJ3KWSOKQIJ4R5W4J",
      );
      expect(result).toEqual({
        account_id: "GAFSZ3VPBC2H2DVKCEWLN3PQWZW6BVDMFROWJUDAJ3KWSOKQIJ4R5W4J",
      });
    });

    it("fails for invalid account ID", async () => {
      await expect(Server.resolve("invalid")).rejects.toThrow(
        /Invalid Account ID/,
      );
    });

    it("rejects a bad allowedRedirects for an account ID", async () => {
      await expect(
        Server.resolve(
          "GAFSZ3VPBC2H2DVKCEWLN3PQWZW6BVDMFROWJUDAJ3KWSOKQIJ4R5W4J",
          { allowedRedirects: NaN },
        ),
      ).rejects.toThrow(/allowedRedirects/);
    });

    it("succeeds for a valid Stellar address", async () => {
      // Mock the first call to get stellar.toml
      mockHttpClient.mockImplementation((url: string) => {
        if (url.includes("https://stellar.org/.well-known/stellar.toml")) {
          return Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.stellar.org/federation"
`,
          });
        }
        if (
          url.includes(
            "https://api.stellar.org/federation?type=name&q=bob*stellar.org",
          )
        ) {
          return Promise.resolve({
            data: {
              stellar_address: "bob*stellar.org",
              account_id:
                "GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
              memo_type: "id",
              memo: "100",
            },
          });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const result = await Server.resolve("bob*stellar.org");
      expect(result).toEqual({
        stellar_address: "bob*stellar.org",
        account_id: "GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
        memo_type: "id",
        memo: "100",
      });
    });

    it("fails for invalid Stellar address", async () => {
      await expect(Server.resolve("bob*stellar.org*test")).rejects.toThrow(
        /Invalid Stellar address/,
      );
    });

    it("fails when memo is not string", async () => {
      mockHttpClient.mockImplementation((url: string) => {
        if (
          url.includes(
            "https://acme.com:1337/federation?type=name&q=bob*stellar.org",
          )
        ) {
          return Promise.resolve({
            data: {
              stellar_address: "bob*stellar.org",
              account_id:
                "GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
              memo_type: "id",
              memo: 100,
            },
          });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      await expect(server.resolveAddress("bob*stellar.org")).rejects.toThrow(
        /memo value should be of type string/,
      );
    });

    it("fails when response exceeds the limit", async () => {
      // Unable to create temp server in a browser
      if (typeof window !== "undefined") {
        return;
      }
      const response = Array(FEDERATION_RESPONSE_MAX_SIZE + 10).join("a");
      const tempServer = http
        .createServer((_, res) => {
          res.setHeader("Content-Type", "application/json; charset=UTF-8");
          res.end(response);
        })
        .listen(0);

      try {
        const port = (tempServer.address() as AddressInfo).port;
        await expect(
          new Server(`http://localhost:${port}/federation`, "stellar.org", {
            allowHttp: true,
          }).resolveAddress("bob*stellar.org"),
        ).rejects.toThrow(/federation response exceeds allowed size of [0-9]+/);
      } finally {
        tempServer.close();
      }
    });
  });

  describe("FederationServer times out when response lags and timeout set", () => {
    afterEach(() => {
      Config.setDefault();
    });

    describe("with global config set", () => {
      beforeEach(() => {
        Config.setTimeout(1000);
      });

      it("resolveAddress times out with global config set", async () => {
        // Unable to create temp server in a browser
        if (typeof window !== "undefined") {
          return;
        }

        const tempServer = http
          .createServer(() => {
            setTimeout(() => {}, 10000);
          })
          .listen(0);

        try {
          const port = (tempServer.address() as AddressInfo).port;
          await expect(
            new Server(`http://localhost:${port}/federation`, "stellar.org", {
              allowHttp: true,
            }).resolveAddress("bob*stellar.org"),
          ).rejects.toThrow(/timeout of 1000ms exceeded/);
        } finally {
          tempServer.close();
        }
      });

      it("resolveAccountId times out with global config set", async () => {
        // Unable to create temp server in a browser
        if (typeof window !== "undefined") {
          return;
        }
        const tempServer = http
          .createServer(() => {
            setTimeout(() => {}, 10000);
          })
          .listen(0);

        try {
          const port = (tempServer.address() as AddressInfo).port;
          await expect(
            new Server(`http://localhost:${port}/federation`, "stellar.org", {
              allowHttp: true,
            }).resolveAccountId(
              "GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
            ),
          ).rejects.toThrow(/timeout of 1000ms exceeded/);
        } finally {
          tempServer.close();
        }
      });

      it("resolveTransactionId times out with global config set", async () => {
        // Unable to create temp server in a browser
        if (typeof window !== "undefined") {
          return;
        }
        const tempServer = http
          .createServer(() => {
            setTimeout(() => {}, 10000);
          })
          .listen(0);

        try {
          const port = (tempServer.address() as AddressInfo).port;
          await expect(
            new Server(`http://localhost:${port}/federation`, "stellar.org", {
              allowHttp: true,
            }).resolveTransactionId(
              "3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889",
            ),
          ).rejects.toThrow(/timeout of 1000ms exceeded/);
        } finally {
          tempServer.close();
        }
      });

      it("createForDomain times out with global config set", async () => {
        // Unable to create temp server in a browser
        if (typeof window !== "undefined") {
          return;
        }
        const tempServer = http
          .createServer(() => {
            setTimeout(() => {}, 10000);
          })
          .listen(0);

        try {
          const port = (tempServer.address() as AddressInfo).port;
          await expect(
            Server.createForDomain(`localhost:${port}`, { allowHttp: true }),
          ).rejects.toThrow(/timeout of 1000ms exceeded/);
        } finally {
          tempServer.close();
        }
      });

      it("resolve times out with global config set", async () => {
        // Unable to create temp server in a browser
        if (typeof window !== "undefined") {
          return;
        }

        const tempServer = http
          .createServer(() => {
            setTimeout(() => {}, 10000);
          })
          .listen(0);

        try {
          const port = (tempServer.address() as AddressInfo).port;
          await expect(
            Server.resolve(`bob*localhost:${port}`, { allowHttp: true }),
          ).rejects.toThrow(/timeout of 1000ms exceeded/);
        } finally {
          tempServer.close();
        }
      });
    });

    describe("with instance opts set", () => {
      it("resolveAddress times out with instance opts set", async () => {
        // Unable to create temp server in a browser
        if (typeof window !== "undefined") {
          return;
        }

        const tempServer = http
          .createServer(() => {
            setTimeout(() => {}, 10000);
          })
          .listen(0);

        try {
          const port = (tempServer.address() as AddressInfo).port;
          await expect(
            new Server(`http://localhost:${port}/federation`, "stellar.org", {
              allowHttp: true,
              timeout: 1000,
            }).resolveAddress("bob*stellar.org"),
          ).rejects.toThrow(/timeout of 1000ms exceeded/);
        } finally {
          tempServer.close();
        }
      });

      it("resolveAccountId times out with instance opts set", async () => {
        // Unable to create temp server in a browser
        if (typeof window !== "undefined") {
          return;
        }
        const tempServer = http
          .createServer(() => {
            setTimeout(() => {}, 10000);
          })
          .listen(0);

        try {
          const port = (tempServer.address() as AddressInfo).port;
          await expect(
            new Server(`http://localhost:${port}/federation`, "stellar.org", {
              allowHttp: true,
              timeout: 1000,
            }).resolveAccountId(
              "GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS",
            ),
          ).rejects.toThrow(/timeout of 1000ms exceeded/);
        } finally {
          tempServer.close();
        }
      });

      it("resolveTransactionId times out with instance opts set", async () => {
        // Unable to create temp server in a browser
        if (typeof window !== "undefined") {
          return;
        }
        const tempServer = http
          .createServer(() => {
            setTimeout(() => {}, 10000);
          })
          .listen(0);

        try {
          const port = (tempServer.address() as AddressInfo).port;
          await expect(
            new Server(`http://localhost:${port}/federation`, "stellar.org", {
              allowHttp: true,
              timeout: 1000,
            }).resolveTransactionId(
              "3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889",
            ),
          ).rejects.toThrow(/timeout of 1000ms exceeded/);
        } finally {
          tempServer.close();
        }
      });

      it("createForDomain times out with instance opts set", async () => {
        // Unable to create temp server in a browser
        if (typeof window !== "undefined") {
          return;
        }
        const tempServer = http
          .createServer(() => {
            setTimeout(() => {}, 10000);
          })
          .listen(0);

        try {
          const port = (tempServer.address() as AddressInfo).port;
          await expect(
            Server.createForDomain(`localhost:${port}`, {
              allowHttp: true,
              timeout: 1000,
            }),
          ).rejects.toThrow(/timeout of 1000ms exceeded/);
        } finally {
          tempServer.close();
        }
      });

      it("resolve times out with instance opts set", async () => {
        // Unable to create temp server in a browser
        if (typeof window !== "undefined") {
          return;
        }

        const tempServer = http
          .createServer(() => {
            setTimeout(() => {}, 10000);
          })
          .listen(0);

        try {
          const port = (tempServer.address() as AddressInfo).port;
          await expect(
            Server.resolve(`bob*localhost:${port}`, {
              allowHttp: true,
              timeout: 1000,
            }),
          ).rejects.toThrow(/timeout of 1000ms exceeded/);
        } finally {
          tempServer.close();
        }
      });
    });
  });
});
