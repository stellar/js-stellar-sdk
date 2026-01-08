import { expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { contracts } from "./util";

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

describe("Bindings Generation Snapshot Tests", () => {
  const outputDir = path.resolve(__dirname, "../temp-bindings-snapshot");
  const snapshotDir = path.resolve(__dirname, "../__snapshots__");

  beforeAll(() => {
    // Ensure snapshot directory exists
    if (!fs.existsSync(snapshotDir)) {
      fs.mkdirSync(snapshotDir, { recursive: true });
    }
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

  describe("custom-types contract bindings", () => {
    const contractOutputDir = path.join(outputDir, "custom-types");

    beforeAll(() => {
      // Generate bindings for custom-types contract
      const wasmPath = contracts.customTypes.path;
      const result = runCli(
        `generate --wasm ${wasmPath} --output-dir ${contractOutputDir} --contract-name custom-types --overwrite`,
      );
      if (result.status !== 0) {
        console.error("CLI stderr:", result.stderr);
        throw new Error(`Failed to generate bindings: ${result.stderr}`);
      }
    });

    it("client.ts matches snapshot", () => {
      const clientContent = fs.readFileSync(
        path.join(contractOutputDir, "src/client.ts"),
        "utf8",
      );
      expect(clientContent).toMatchSnapshot("custom-types-client.ts");
    });

    it("types.ts matches snapshot", () => {
      const typesContent = fs.readFileSync(
        path.join(contractOutputDir, "src/types.ts"),
        "utf8",
      );
      expect(typesContent).toMatchSnapshot("custom-types-types.ts");
    });

    it("index.ts matches snapshot", () => {
      const indexContent = fs.readFileSync(
        path.join(contractOutputDir, "src/index.ts"),
        "utf8",
      );
      expect(indexContent).toMatchSnapshot("custom-types-index.ts");
    });

    it("generated types.ts contains expected struct definitions", () => {
      const typesContent = fs.readFileSync(
        path.join(contractOutputDir, "src/types.ts"),
        "utf8",
      );

      // Test struct
      expect(typesContent).toContain("export interface Test");
      expect(typesContent).toContain("a: number");
      expect(typesContent).toContain("b: boolean");
      expect(typesContent).toContain("c: string");

      // SimpleEnum
      expect(typesContent).toContain("export type SimpleEnum");
      expect(typesContent).toContain("First");
      expect(typesContent).toContain("Second");
      expect(typesContent).toContain("Third");

      // RoyalCard enum
      expect(typesContent).toContain("RoyalCard");
      expect(typesContent).toContain("Jack");
      expect(typesContent).toContain("Queen");
      expect(typesContent).toContain("King");

      // ComplexEnum union type
      expect(typesContent).toContain("ComplexEnum");

      // Error enum
      expect(typesContent).toContain("Error");
      expect(typesContent).toContain("NumberMustBeOdd");
    });

    it("generated client.ts contains expected method signatures", () => {
      const clientContent = fs.readFileSync(
        path.join(contractOutputDir, "src/client.ts"),
        "utf8",
      );

      // Check for various methods
      expect(clientContent).toContain("hello(");
      expect(clientContent).toContain("auth(");
      expect(clientContent).toContain("get_count(");
      expect(clientContent).toContain("inc(");
      expect(clientContent).toContain("woid(");
      expect(clientContent).toContain("u32_(");
      expect(clientContent).toContain("i32_(");
      expect(clientContent).toContain("i64_(");
      expect(clientContent).toContain("strukt(");
      expect(clientContent).toContain("simple(");
      expect(clientContent).toContain("complex(");
      expect(clientContent).toContain("boolean(");
      expect(clientContent).toContain("not(");
      expect(clientContent).toContain("i128(");
      expect(clientContent).toContain("u128(");
      expect(clientContent).toContain("multi_args(");
      expect(clientContent).toContain("map(");
      expect(clientContent).toContain("vec(");
      expect(clientContent).toContain("tuple(");
      expect(clientContent).toContain("option(");
      expect(clientContent).toContain("u256(");
      expect(clientContent).toContain("i256(");
      expect(clientContent).toContain("string(");
    });
  });

  describe("increment contract bindings", () => {
    const contractOutputDir = path.join(outputDir, "increment");

    beforeAll(() => {
      const wasmPath = contracts.increment.path;
      const result = runCli(
        `generate --wasm ${wasmPath} --output-dir ${contractOutputDir} --contract-name increment --overwrite`,
      );

      if (result.status !== 0) {
        throw new Error(`Failed to generate bindings: ${result.stderr}`);
      }
    });

    it("client.ts matches snapshot", () => {
      const clientContent = fs.readFileSync(
        path.join(contractOutputDir, "src/client.ts"),
        "utf8",
      );
      expect(clientContent).toMatchSnapshot("increment-client.ts");
    });

    it("index.ts matches snapshot", () => {
      const indexContent = fs.readFileSync(
        path.join(contractOutputDir, "src/index.ts"),
        "utf8",
      );
      expect(indexContent).toMatchSnapshot("increment-index.ts");
    });
  });
});

describe("Generated Bindings Compilation Check", () => {
  const outputDir = path.resolve(__dirname, "../temp-bindings-compile");

  beforeAll(() => {
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true });
    }
  });

  it("custom-types bindings compile without errors", () => {
    const contractOutputDir = path.join(outputDir, "custom-types");

    // Generate bindings
    const genResult = runCli(
      `generate --wasm ${contracts.customTypes.path} --output-dir ${contractOutputDir} --contract-name custom-types --overwrite`,
    );
    expect(genResult.status).toBe(0);

    // Create tsconfig for compilation check
    const tsconfig = {
      compilerOptions: {
        target: "ES2020",
        module: "ESNext",
        moduleResolution: "bundler",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        esModuleInterop: true,
        paths: {
          "@stellar/stellar-sdk": [
            path.resolve(__dirname, "../../../lib/index.d.ts"),
          ],
          "@stellar/stellar-sdk/contract": [
            path.resolve(__dirname, "../../../lib/contract/index.d.ts"),
          ],
        },
      },
      include: ["src/**/*.ts"],
    };
    fs.writeFileSync(
      path.join(contractOutputDir, "tsconfig.json"),
      JSON.stringify(tsconfig, null, 2),
    );

    // Run tsc
    const tscResult = spawnSync(
      "npx",
      ["tsc", "--project", path.join(contractOutputDir, "tsconfig.json")],
      {
        encoding: "utf8",
        cwd: contractOutputDir,
      },
    );

    if (tscResult.status !== 0) {
      console.error("TypeScript compilation errors:", tscResult.stdout);
    }
    expect(tscResult.status).toBe(0);
  });

  it("increment bindings compile without errors", () => {
    const contractOutputDir = path.join(outputDir, "increment");

    // Generate bindings
    const genResult = runCli(
      `generate --wasm ${contracts.increment.path} --output-dir ${contractOutputDir} --contract-name increment --overwrite`,
    );
    expect(genResult.status).toBe(0);

    // Create tsconfig for compilation check
    const tsconfig = {
      compilerOptions: {
        target: "ES2020",
        module: "ESNext",
        moduleResolution: "bundler",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        esModuleInterop: true,
        paths: {
          "@stellar/stellar-sdk": [
            path.resolve(__dirname, "../../../lib/index.d.ts"),
          ],
          "@stellar/stellar-sdk/contract": [
            path.resolve(__dirname, "../../../lib/contract/index.d.ts"),
          ],
        },
      },
      include: ["src/**/*.ts"],
    };
    fs.writeFileSync(
      path.join(contractOutputDir, "tsconfig.json"),
      JSON.stringify(tsconfig, null, 2),
    );

    // Run tsc
    const tscResult = spawnSync(
      "npx",
      ["tsc", "--project", path.join(contractOutputDir, "tsconfig.json")],
      {
        encoding: "utf8",
        cwd: contractOutputDir,
      },
    );

    if (tscResult.status !== 0) {
      console.error("TypeScript compilation errors:", tscResult.stdout);
    }
    expect(tscResult.status).toBe(0);
  });
});
