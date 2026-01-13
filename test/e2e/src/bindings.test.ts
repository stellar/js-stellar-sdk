import { expect, beforeAll, afterAll, describe, it } from "vitest";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  contracts,
  rpcUrl,
  networkPassphrase,
  generateFundedKeypair,
  installContract,
} from "./util";
import { contract } from "../../../lib";

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

describe("Generated Bindings E2E Test", () => {
  const outputDir = path.resolve(__dirname, "../temp-bindings-e2e");

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

  it("generates, compiles, deploys and interacts with custom-types contract", async () => {
    const contractOutputDir = path.join(outputDir, "custom-types");

    // Step 1: Generate bindings using CLI
    const wasmPath = contracts.customTypes.path;
    const genResult = runCli(
      `generate --wasm ${wasmPath} --output-dir ${contractOutputDir} --contract-name custom-types --overwrite`,
    );

    expect(genResult.status).toBe(0);
    expect(genResult.stdout).toContain("Successfully generated bindings");

    // Verify generated files exist
    expect(fs.existsSync(path.join(contractOutputDir, "src/index.ts"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(contractOutputDir, "src/client.ts"))).toBe(
      true,
    );

    // Step 2: Compile the generated TypeScript
    const tsconfig = {
      compilerOptions: {
        target: "ES2020",
        module: "ESNext",
        moduleResolution: "bundler",
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        declaration: true,
        outDir: "./dist",
        rootDir: "./src",
        paths: {
          "@stellar/stellar-sdk": [
            path.resolve(__dirname, "../../../lib/index.d.ts"),
          ],
          "@stellar/stellar-sdk/contract": [
            path.resolve(__dirname, "../../../lib/contract/index.d.ts"),
          ],
        },
        baseUrl: ".",
      },
      include: ["src/**/*.ts"],
    };
    fs.writeFileSync(
      path.join(contractOutputDir, "tsconfig.json"),
      JSON.stringify(tsconfig, null, 2),
    );

    const tscResult = spawnSync(
      "npx",
      ["tsc", "--project", path.join(contractOutputDir, "tsconfig.json")],
      {
        encoding: "utf8",
        cwd: contractOutputDir,
      },
    );

    if (tscResult.status !== 0) {
      console.error(
        "TypeScript compilation errors:",
        tscResult.stdout,
        tscResult.stderr,
      );
    }
    expect(tscResult.status).toBe(0);

    // Verify compiled files exist
    expect(fs.existsSync(path.join(contractOutputDir, "dist/index.js"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(contractOutputDir, "dist/client.js"))).toBe(
      true,
    );

    // Step 3: Deploy and interact with the contract using the generated library
    // We need to dynamically import the generated client
    // First, fix the import paths in the compiled JS to point to the actual SDK
    const clientJsPath = path.join(contractOutputDir, "dist/client.js");
    let clientJs = fs.readFileSync(clientJsPath, "utf8");
    clientJs = clientJs.replace(
      /from ["']@stellar\/stellar-sdk\/contract["']/g,
      `from "${path.resolve(__dirname, "../../../lib/contract/index.js")}"`,
    );
    clientJs = clientJs.replace(
      /from ["']@stellar\/stellar-sdk["']/g,
      `from "${path.resolve(__dirname, "../../../lib/index.js")}"`,
    );
    fs.writeFileSync(clientJsPath, clientJs);

    // Also fix index.js
    const indexJsPath = path.join(contractOutputDir, "dist/index.js");
    let indexJs = fs.readFileSync(indexJsPath, "utf8");
    indexJs = indexJs.replace(
      /from ["']@stellar\/stellar-sdk\/contract["']/g,
      `from "${path.resolve(__dirname, "../../../lib/contract/index.js")}"`,
    );
    indexJs = indexJs.replace(
      /from ["']@stellar\/stellar-sdk["']/g,
      `from "${path.resolve(__dirname, "../../../lib/index.js")}"`,
    );
    fs.writeFileSync(indexJsPath, indexJs);

    // Also fix types.js if it exists
    const typesJsPath = path.join(contractOutputDir, "dist/types.js");
    if (fs.existsSync(typesJsPath)) {
      let typesJs = fs.readFileSync(typesJsPath, "utf8");
      typesJs = typesJs.replace(
        /from ["']@stellar\/stellar-sdk\/contract["']/g,
        `from "${path.resolve(__dirname, "../../../lib/contract/index.js")}"`,
      );
      typesJs = typesJs.replace(
        /from ["']@stellar\/stellar-sdk["']/g,
        `from "${path.resolve(__dirname, "../../../lib/index.js")}"`,
      );
      fs.writeFileSync(typesJsPath, typesJs);
    }

    // Dynamically import the generated Client (ES module)
    const generatedModule = await import(
      path.join(contractOutputDir, "dist/index.js")
    );
    const GeneratedClient = generatedModule.Client;

    expect(GeneratedClient).toBeDefined();
    expect(typeof GeneratedClient.deploy).toBe("function");

    // Generate a funded keypair for deployment
    const keypair = await generateFundedKeypair();
    const signer = contract.basicNodeSigner(keypair, networkPassphrase);

    // Deploy the contract using the generated Client
    // Note: custom-types contract has no constructor, so deploy takes only options
    await installContract("customTypes");
    const wasmHash = contracts.customTypes.hash;
    const deployTx = await GeneratedClient.deploy({
      networkPassphrase,
      rpcUrl,
      allowHttp: true,
      wasmHash,
      publicKey: keypair.publicKey(),
      ...signer,
    });

    const { result: client } = await deployTx.signAndSend();
    expect(client).toBeDefined();
    expect(client.options.contractId).toBeDefined();

    // Step 4: Call methods on the deployed contract
    // Test hello method
    const helloResult = await client.hello({ hello: "World" });
    expect(helloResult.result).toBe("World");

    // Test woid (void return) method
    const woidResult = await client.woid();
    expect(woidResult.result).toBeNull();

    // Test u32_ method
    const u32Result = await client.u32_({ u32_: 42 });
    expect(u32Result.result).toBe(42);

    // Test boolean method
    const boolResult = await client.boolean({ boolean: true });
    expect(boolResult.result).toBe(true);

    // Test not method (negates boolean)
    const notResult = await client.not({ boolean: true });
    expect(notResult.result).toBe(false);

    // Test strukt method with a struct parameter
    const struktResult = await client.strukt({
      strukt: { a: 123, b: true, c: "test" },
    });
    expect(struktResult.result).toEqual({ a: 123, b: true, c: "test" });

    // Test simple enum
    const simpleResult = await client.simple({ simple: { tag: "First" } });
    expect(simpleResult.result).toEqual({ tag: "First" });

    // Test multi_args method
    const multiResult = await client.multi_args({ a: 10, b: true });
    expect(multiResult.result).toBe(10);

    const timepoint = await client.timepoint({ timepoint: 1625077800n });
    expect(timepoint.result).toBe(1625077800n);

    const duration = await client.duration({ duration: 3600n });
    expect(duration.result).toBe(3600n);
  }, 120000); // 2 minute timeout for deployment
});

describe("Bindings Snapshot Test", () => {
  const snapshotOutputDir = path.resolve(
    __dirname,
    "../temp-bindings-snapshot",
  );

  beforeAll(() => {
    if (fs.existsSync(snapshotOutputDir)) {
      fs.rmSync(snapshotOutputDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(snapshotOutputDir)) {
      fs.rmSync(snapshotOutputDir, { recursive: true });
    }
  });

  it("generates bindings that match snapshot for custom-types contract", () => {
    const wasmPath = path.resolve(
      __dirname,
      "../wasm-fixtures/custom_types.wasm",
    );
    const genResult = runCli(
      `generate --wasm ${wasmPath} --output-dir ${snapshotOutputDir} --contract-name custom-types --overwrite`,
    );

    expect(genResult.status).toBe(0);
    expect(genResult.stdout).toContain("Successfully generated bindings");

    // Read generated files
    const indexTs = fs.readFileSync(
      path.join(snapshotOutputDir, "src/index.ts"),
      "utf8",
    );
    const typesTs = fs.readFileSync(
      path.join(snapshotOutputDir, "src/types.ts"),
      "utf8",
    );
    const clientTs = fs.readFileSync(
      path.join(snapshotOutputDir, "src/client.ts"),
      "utf8",
    );

    // Snapshot the generated TypeScript files
    expect(indexTs).toMatchSnapshot("custom-types-index.ts");
    expect(typesTs).toMatchSnapshot("custom-types-types.ts");
    expect(clientTs).toMatchSnapshot("custom-types-client.ts");
  });
});
