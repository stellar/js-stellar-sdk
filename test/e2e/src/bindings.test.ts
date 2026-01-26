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
import { Address, contract } from "../../../lib";

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

    const u32FailOnEven = await client.u32_fail_on_even({ u32_: 3 });
    expect(u32FailOnEven.result).toEqual(new contract.Ok(3));

    const u32FailOnEvenEven = await client.u32_fail_on_even({ u32_: 4 });
    expect(u32FailOnEvenEven.result).toEqual(
      new contract.Err({ message: "Please provide an odd number" }),
    );

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

    const optionSome = await client.option({
      option: 11,
    });
    expect(optionSome.result).toEqual(11);

    const optionNone = await client.option({
      option: null,
    });
    expect(optionNone.result).toBeNull();

    const optionUndefined = await client.option({
      option: undefined,
    });
    expect(optionUndefined.result).toBeNull();

    // Test i32_ method
    const i32Result = await client.i32_({ i32_: -42 });
    expect(i32Result.result).toBe(-42);

    // Test i64_ method
    const i64Result = await client.i64_({ i64_: 9007199254740993n });
    expect(i64Result.result).toBe(9007199254740993n);

    // Test strukt_hel method
    const struktHelResult = await client.strukt_hel({
      strukt: { a: 0, b: true, c: "world" },
    });
    expect(struktHelResult.result).toEqual(["Hello", "world"]);

    // Test simple enum - Second variant
    const simpleSecond = await client.simple({ simple: { tag: "Second" } });
    expect(simpleSecond.result).toEqual({ tag: "Second" });

    // Test simple enum - Third variant
    const simpleThird = await client.simple({ simple: { tag: "Third" } });
    expect(simpleThird.result).toEqual({ tag: "Third" });

    // Test complex enum - Struct variant
    const complexStruct = await client.complex({
      complex: { tag: "Struct", values: [{ a: 0, b: true, c: "hello" }] },
    });
    expect(complexStruct.result).toEqual({
      tag: "Struct",
      values: [{ a: 0, b: true, c: "hello" }],
    });

    // Test complex enum - Tuple variant
    const complexTuple = await client.complex({
      complex: {
        tag: "Tuple",
        values: [[{ a: 0, b: true, c: "hello" }, { tag: "First" }]],
      },
    });
    expect(complexTuple.result).toEqual({
      tag: "Tuple",
      values: [[{ a: 0, b: true, c: "hello" }, { tag: "First" }]],
    });

    // Test complex enum - Enum variant
    const complexEnum = await client.complex({
      complex: { tag: "Enum", values: [{ tag: "First" }] },
    });
    expect(complexEnum.result).toEqual({
      tag: "Enum",
      values: [{ tag: "First" }],
    });

    // Test complex enum - Asset variant
    const complexAsset = await client.complex({
      complex: { tag: "Asset", values: [keypair.publicKey(), 1n] },
    });
    expect(complexAsset.result).toEqual({
      tag: "Asset",
      values: [keypair.publicKey(), 1n],
    });

    // Test complex enum - Void variant
    const complexVoid = await client.complex({
      complex: { tag: "Void" },
    });
    expect(complexVoid.result).toEqual({ tag: "Void" });

    // Test addresse method
    const addresseResult = await client.addresse({
      addresse: keypair.publicKey(),
    });
    const addresseResultWithAddress = await client.addresse({
      addresse: Address.fromString(keypair.publicKey()),
    });
    expect(addresseResult.result).toBe(keypair.publicKey());
    expect(addresseResultWithAddress.result).toBe(keypair.publicKey());

    // Test bytes method
    const bytesInput = Buffer.from("hello");
    const bytesResult = await client.bytes({ bytes: bytesInput });
    expect(bytesResult.result).toEqual(bytesInput);

    // Test bytes_n method
    const bytesNInput = Buffer.from("123456789");
    const bytesNResult = await client.bytes_n({ bytes_n: bytesNInput });
    expect(bytesNResult.result).toEqual(bytesNInput);

    // Test card method
    const cardResult = await client.card({ card: 11 });
    expect(cardResult.result).toBe(11);

    // Test i128 method
    const i128Result = await client.i128({ i128: -1n });
    expect(i128Result.result).toBe(-1n);

    // Test u128 method
    const u128Result = await client.u128({ u128: 1n });
    expect(u128Result.result).toBe(1n);

    // Test i256 method
    const i256Result = await client.i256({ i256: -1n });
    expect(i256Result.result).toBe(-1n);

    // Test u256 method
    const u256Result = await client.u256({ u256: 1n });
    expect(u256Result.result).toBe(1n);

    // Test multi_args with b=false
    const multiResultFalse = await client.multi_args({ a: 10, b: false });
    expect(multiResultFalse.result).toBe(0);

    // Test map method
    const mapInput = new Map<number, boolean>();
    mapInput.set(1, true);
    mapInput.set(2, false);
    const mapResult = await client.map({ map: mapInput });
    expect(mapResult.result).toEqual(Array.from(mapInput.entries()));

    // Test vec method
    const vecInput = [1, 2, 3];
    const vecResult = await client.vec({ vec: vecInput });
    expect(vecResult.result).toEqual(vecInput);

    // Test tuple method
    const tupleInput: readonly [string, number] = ["hello", 1];
    const tupleResult = await client.tuple({ tuple: tupleInput });
    expect(tupleResult.result).toEqual(tupleInput);

    // Test string method
    const stringResult = await client.string({ string: "hello" });
    expect(stringResult.result).toBe("hello");

    // Test tuple_strukt method
    const tupleStruktInput: readonly [
      { a: number; b: boolean; c: string },
      { tag: "First" },
    ] = [{ a: 0, b: true, c: "hello" }, { tag: "First" }];
    const tupleStruktResult = await client.tuple_strukt({
      tuple_strukt: tupleStruktInput,
    });
    expect(tupleStruktResult.result).toEqual([
      { a: 0, b: true, c: "hello" },
      { tag: "First" },
    ]);
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
