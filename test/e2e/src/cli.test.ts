import { expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { contracts, rpcUrl, clientFor, installContract } from "./util";

const CLI_PATH = path.resolve(__dirname, "../../../bin/stellar-js");

const runCli = (args: string) => {
  const result = spawnSync("node", [CLI_PATH, ...args.split(" ")], {
    encoding: "utf8",
    env: { ...process.env },
  });
  return {
    stdout: result.stdout?.trim() ?? "",
    stderr: result.stderr?.trim() ?? "",
    status: result.status,
  };
};

describe("CLI generate command", () => {
  const outputDir = path.resolve(__dirname, "../temp-cli-output");

  beforeAll(() => {
    // Clean up output directory if it exists
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up after tests
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true });
    }
  });

  it("shows help with --help flag", () => {
    const result = runCli("generate --help");

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Generate TypeScript bindings");
    expect(result.stdout).toContain("--wasm");
    expect(result.stdout).toContain("--wasm-hash");
    expect(result.stdout).toContain("--contract-id");
    expect(result.stdout).toContain("--output-dir");
    expect(result.stdout).toContain("--allow-http");
    expect(result.stdout).toContain("--timeout");
    expect(result.stdout).toContain("--headers");
  });

  it("generates bindings from local WASM file", () => {
    const wasmPath = contracts.customTypes.path;
    const testOutputDir = path.join(outputDir, "from-wasm");

    const result = runCli(
      `generate --wasm ${wasmPath} --output-dir ${testOutputDir} --contract-name TestContract --overwrite`,
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Successfully generated bindings");

    // Verify generated files exist (source files are in src/ subdirectory)
    expect(fs.existsSync(path.join(testOutputDir, "src/index.ts"))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, "src/client.ts"))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, "src/types.ts"))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, "package.json"))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, "tsconfig.json"))).toBe(true);

    // Verify package.json has correct contract name
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(testOutputDir, "package.json"), "utf8"),
    );
    expect(packageJson.name).toBe("testcontract");
  });

  it("generates bindings from WASM hash on network", async () => {
    await installContract("customTypes");
    const wasmHash = contracts.customTypes.hash;
    if (!wasmHash) {
      console.log("Skipping test: WASM hash not available");
      return;
    }

    const testOutputDir = path.join(outputDir, "from-hash");

    const result = runCli(
      `generate --wasm-hash ${wasmHash} --output-dir ${testOutputDir} --contract-name HashContract --rpc-url ${rpcUrl} --network localnet --allow-http --overwrite`,
    );
    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(testOutputDir, "src/client.ts"))).toBe(true);
  });

  it("generates bindings from contract ID on network", async () => {
    // Deploy a contract first to get a contract ID

    const { contractId } = await clientFor("customTypes");

    const testOutputDir = path.join(outputDir, "from-id");

    const result = runCli(
      `generate --contract-id ${contractId} --output-dir ${testOutputDir} --rpc-url ${rpcUrl} --network localnet --allow-http --overwrite`,
    );
    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(testOutputDir, "src/client.ts"))).toBe(true);
  });

  it("fails without required output-dir option", () => {
    const wasmPath = contracts.customTypes.path;
    const result = runCli(`generate --wasm ${wasmPath}`);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Output directory");
  });

  it("fails with invalid network", () => {
    const wasmPath = contracts.customTypes.path;
    const testOutputDir = path.join(outputDir, "invalid-network");

    const result = runCli(
      `generate --wasm ${wasmPath} --output-dir ${testOutputDir} --network invalid`,
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Invalid network");
  });

  it("fails without any source option", () => {
    const testOutputDir = path.join(outputDir, "no-source");

    const result = runCli(`generate --output-dir ${testOutputDir}`);

    expect(result.status).toBe(1);
  });

  it("fails with --wasm-hash but without --rpc-url", () => {
    const testOutputDir = path.join(outputDir, "hash-no-rpc");

    const result = runCli(
      `generate --wasm-hash abc123 --network testnet --output-dir ${testOutputDir}`,
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("rpc-url");
  });

  it("fails with --wasm-hash but without --network", () => {
    const testOutputDir = path.join(outputDir, "hash-no-network");

    const result = runCli(
      `generate --wasm-hash abc123 --rpc-url ${rpcUrl} --output-dir ${testOutputDir}`,
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("network");
  });

  it("fails with --contract-id but without --rpc-url", () => {
    const testOutputDir = path.join(outputDir, "id-no-rpc");

    const result = runCli(
      `generate --contract-id CABC123 --network testnet --output-dir ${testOutputDir}`,
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("rpc-url");
  });

  it("fails with --contract-id but without --network", () => {
    const testOutputDir = path.join(outputDir, "id-no-network");

    const result = runCli(
      `generate --contract-id CABC123 --rpc-url ${rpcUrl} --output-dir ${testOutputDir}`,
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("network");
  });

  it("derives contract name from WASM filename when not provided", () => {
    const wasmPath = contracts.customTypes.path;
    const testOutputDir = path.join(outputDir, "derived-name");

    const result = runCli(
      `generate --wasm ${wasmPath} --output-dir ${testOutputDir} --overwrite`,
    );

    expect(result.status).toBe(0);

    // The contract name should be derived from "custom_types.wasm"
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(testOutputDir, "package.json"), "utf8"),
    );
    // Should derive something like "custom_types" or "CustomTypes"
    expect(packageJson.name).toBe("custom-types");
    expect(packageJson.name).toBeTruthy();
  });

  it("supports testnet network option", () => {
    const wasmPath = contracts.customTypes.path;
    const testOutputDir = path.join(outputDir, "testnet");

    const result = runCli(
      `generate --wasm ${wasmPath} --output-dir ${testOutputDir} --network testnet --overwrite`,
    );

    expect(result.status).toBe(0);
  });

  it("supports mainnet network option", () => {
    const wasmPath = contracts.customTypes.path;
    const testOutputDir = path.join(outputDir, "mainnet");

    const result = runCli(
      `generate --wasm ${wasmPath} --output-dir ${testOutputDir} --network mainnet --overwrite`,
    );

    expect(result.status).toBe(0);
  });

  it("supports futurenet network option", () => {
    const wasmPath = contracts.customTypes.path;
    const testOutputDir = path.join(outputDir, "futurenet");

    const result = runCli(
      `generate --wasm ${wasmPath} --output-dir ${testOutputDir} --network futurenet --overwrite`,
    );

    expect(result.status).toBe(0);
  });

  it("generated client.ts contains expected exports", () => {
    const wasmPath = contracts.customTypes.path;
    const testOutputDir = path.join(outputDir, "check-exports");

    const result = runCli(
      `generate --wasm ${wasmPath} --output-dir ${testOutputDir} --contract-name MyContract --overwrite`,
    );

    expect(result.status).toBe(0);

    const clientContent = fs.readFileSync(
      path.join(testOutputDir, "src/client.ts"),
      "utf8",
    );
    expect(clientContent).toContain("export class Client");
    expect(clientContent).toContain("extends ContractClient");
  });

  it("generated index.ts exports Client", () => {
    const wasmPath = contracts.customTypes.path;
    const testOutputDir = path.join(outputDir, "check-index");

    const result = runCli(
      `generate --wasm ${wasmPath} --output-dir ${testOutputDir} --overwrite`,
    );

    expect(result.status).toBe(0);

    const indexContent = fs.readFileSync(
      path.join(testOutputDir, "src/index.ts"),
      "utf8",
    );
    expect(indexContent).toContain("export { Client }");
  });

  describe("server options", () => {
    it("accepts --allow-http flag with network sources", async () => {
      const { contractId } = await clientFor("customTypes");
      const testOutputDir = path.join(outputDir, "allow-http");

      const result = runCli(
        `generate --contract-id ${contractId} --rpc-url ${rpcUrl} --network localnet --output-dir ${testOutputDir} --allow-http --overwrite`,
      );

      expect(result.status).toBe(0);
      expect(fs.existsSync(path.join(testOutputDir, "src/client.ts"))).toBe(
        true,
      );
    });

    it("accepts --timeout option", async () => {
      const { contractId } = await clientFor("customTypes");
      const testOutputDir = path.join(outputDir, "with-timeout");

      const result = runCli(
        `generate --contract-id ${contractId} --rpc-url ${rpcUrl} --network localnet --output-dir ${testOutputDir} --timeout 30000 --allow-http --overwrite`,
      );

      expect(result.status).toBe(0);
      expect(fs.existsSync(path.join(testOutputDir, "src/client.ts"))).toBe(
        true,
      );
    });

    it("fails with invalid timeout value", () => {
      const wasmPath = contracts.customTypes.path;
      const testOutputDir = path.join(outputDir, "invalid-timeout");

      const result = runCli(
        `generate --wasm ${wasmPath} --output-dir ${testOutputDir} --timeout invalid`,
      );

      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Invalid timeout");
    });

    it("fails with negative timeout value", () => {
      const wasmPath = contracts.customTypes.path;
      const testOutputDir = path.join(outputDir, "negative-timeout");

      const result = runCli(
        `generate --wasm ${wasmPath} --output-dir ${testOutputDir} --timeout -1000`,
      );

      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Invalid timeout");
    });

    it("fails with invalid JSON for --headers", () => {
      const wasmPath = contracts.customTypes.path;
      const testOutputDir = path.join(outputDir, "invalid-headers");

      const result = runCli(
        `generate --wasm ${wasmPath} --output-dir ${testOutputDir} --headers not-valid-json`,
      );

      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Invalid JSON");
    });
  });
});
