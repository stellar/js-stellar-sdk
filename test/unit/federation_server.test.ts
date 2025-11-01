/* eslint-disable @typescript-eslint/dot-notation */
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import http from "http";
import { AddressInfo } from "net";
import { StellarSdk, httpClient } from "../test-utils/stellar-sdk-import";

const { Server, FEDERATION_RESPONSE_MAX_SIZE } = StellarSdk.Federation;

describe("federation-server.js tests", () => {
  let server: any;
  let mockHttpClient: any;

  beforeEach(() => {
    server = new Server("https://acme.com:1337/federation", "stellar.org");
    mockHttpClient = vi.spyOn(httpClient, "get");
    StellarSdk.Config.setDefault();
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

    it("allow insecure server when opts.allowHttp flag is set", () => {
      expect(
        () =>
          new Server("http://acme.com:1337/federation", "stellar.org", {
            allowHttp: true,
          }),
      ).not.toThrow();
    });

    it("allow insecure server when global Config.allowHttp flag is set", () => {
      StellarSdk.Config.setAllowHttp(true);
      expect(
        () =>
          new Server("http://acme.com:1337/federation", "stellar.org", {
            allowHttp: true,
          }),
      ).not.toThrow();
    });
  });

  describe("FederationServer.resolveAddress", () => {
    beforeEach(() => {
      mockHttpClient.mockImplementation((url: string) => {
        if (
          url.includes(
            "https://acme.com:1337/federation?type=name&q=bob%2Astellar.org",
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
      expect(federationServer["serverURL"].protocol()).toEqual("https");
      expect(federationServer["serverURL"].hostname()).toEqual(
        "api.stellar.org",
      );
      expect(federationServer["serverURL"].path()).toEqual("/federation");
      expect(federationServer["domain"]).toEqual("acme.com");
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
            "https://api.stellar.org/federation?type=name&q=bob%2Astellar.org",
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
            "https://acme.com:1337/federation?type=name&q=bob%2Astellar.org",
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
      StellarSdk.Config.setDefault();
    });

    describe("with global config set", () => {
      beforeEach(() => {
        StellarSdk.Config.setTimeout(1000);
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
