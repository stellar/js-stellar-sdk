const {
  fetchWasm,
  WasmFetchError,
} = require("../../../lib/bindings/wasm_fetcher");
const fs = require("fs").promises;
const path = require("path");

describe("WASM Fetcher", function () {
  describe("fetchWasm", function () {
    it("throws error when no source is provided", function () {
      expect(() => {
        fetchWasm({});
      }).to.throw(
        WasmFetchError,
        "Must provide one of: wasm, wasmHash, or contractId",
      );
    });

    it("throws error when multiple sources are provided", function () {
      expect(() => {
        fetchWasm({
          wasm: "test.wasm",
          wasmHash: "abc123",
          contractId: "contract123",
        });
      }).to.throw(
        WasmFetchError,
        "Must provide only one of: wasm, wasmHash, or contractId",
      );
    });

    it("throws error when rpcUrl is missing for network sources", function () {
      expect(() => {
        fetchWasm({
          wasmHash: "abc123",
        });
      }).to.throw(
        WasmFetchError,
        "rpcUrl is required when fetching from network",
      );
    });

    it("throws error when networkPassphrase is missing for network sources", function () {
      expect(() => {
        fetchWasm({
          wasmHash: "abc123",
          rpcUrl: "https://rpc.example.com",
        });
      }).to.throw(
        WasmFetchError,
        "networkPassphrase is required when fetching from network",
      );
    });

    it("throws error when file does not exist", async function () {
      try {
        await fetchWasm({
          wasm: "/nonexistent/file.wasm",
        });
        expect.fail("Expected fetchWasm to throw an error");
      } catch (error) {
        expect(error).to.be.instanceOf(WasmFetchError);
        expect(error.message).to.include("Failed to read WASM file");
      }
    });
  });

  describe("WasmFetchError", function () {
    it("creates proper error with message", function () {
      const error = new WasmFetchError("Test error message");
      expect(error).to.be.instanceOf(Error);
      expect(error).to.be.instanceOf(WasmFetchError);
      expect(error.message).to.equal("Test error message");
      expect(error.name).to.equal("WasmFetchError");
    });

    it("creates proper error with cause", function () {
      const cause = new Error("Root cause");
      const error = new WasmFetchError("Test error message", cause);
      expect(error.cause).to.equal(cause);
    });

    it("maintains proper prototype chain", function () {
      const error = new WasmFetchError("Test error");
      expect(error instanceof WasmFetchError).to.be.true;
      expect(error instanceof Error).to.be.true;
    });
  });
});
