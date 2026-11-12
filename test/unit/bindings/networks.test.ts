import { describe, it, expect } from "vitest";
import { xdr, contract, Networks } from "../../../src/index.js";
import { BindingGenerator } from "../../../src/bindings/generator.js";

const { Spec } = contract;

const CONTRACT_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

function generator(): BindingGenerator {
  const func = xdr.ScSpecEntry.scSpecEntryFunctionV0(
    new xdr.ScSpecFunctionV0({
      doc: "",
      name: "hello",
      inputs: [],
      outputs: [],
    }),
  );
  return BindingGenerator.fromSpec(new Spec([func]));
}

const STRING_LITERAL = `"(?:[^"\\\\\\n\\r\\u2028\\u2029]|\\\\.)*"`;
const ENTRY = new RegExp(
  `^  (\\w+): \\{\\n` +
    `    networkPassphrase: (${STRING_LITERAL}),\\n` +
    `    contractId: (${STRING_LITERAL}),\\n` +
    `  \\},$`,
  "gm",
);

/** Read back the entries of the generated `networks` export. */
function networksOf(index: string): Record<string, unknown> {
  const start = index.indexOf("export const networks = {\n");
  expect(start).toBeGreaterThan(-1);
  const body = index.slice(start + "export const networks = {\n".length);
  expect(body.endsWith("\n} as const;")).toBe(true);

  const entries = [...body.matchAll(ENTRY)];
  // nothing but entries and the deprecation comment may be left over
  const rest = body
    .replace(ENTRY, "")
    .replace("  /** @deprecated Use `local` instead. */", "")
    .replace("} as const;", "");
  expect(rest.trim()).toBe("");

  return Object.fromEntries(
    entries.map(([, key, networkPassphrase, contractId]) => [
      key,
      {
        networkPassphrase: JSON.parse(networkPassphrase),
        contractId: JSON.parse(contractId),
      },
    ]),
  );
}

describe("bindings networks export", () => {
  it("is absent when no contract ID or passphrase is given", () => {
    const { index, readme } = generator().generate({ contractName: "hello" });

    expect(index).toBe(`export { Client } from "./client.js";`);
    expect(readme).toContain('contractId: "YOUR_CONTRACT_ID",');
    expect(readme).toContain(
      'rpcUrl: "https://soroban-testnet.stellar.org:443",',
    );
    expect(readme).toContain(
      'networkPassphrase: "Test SDF Network ; September 2015",',
    );
  });

  it("is absent when only one of contract ID and passphrase is given", () => {
    expect(
      generator().generate({ contractName: "hello", contractId: CONTRACT_ID })
        .index,
    ).not.toContain("networks");
    expect(
      generator().generate({
        contractName: "hello",
        networkPassphrase: Networks.TESTNET,
      }).index,
    ).not.toContain("networks");
  });

  it("exports the testnet key in the native format", () => {
    const { index } = generator().generate({
      contractName: "hello",
      contractId: CONTRACT_ID,
      networkPassphrase: Networks.TESTNET,
    });

    expect(index).toBe(
      [
        `export { Client } from "./client.js";`,
        ``,
        `export const networks = {`,
        `  testnet: {`,
        `    networkPassphrase: "Test SDF Network ; September 2015",`,
        `    contractId: "${CONTRACT_ID}",`,
        `  },`,
        `} as const;`,
      ].join("\n"),
    );
  });

  it.each([
    [Networks.TESTNET, ["testnet"]],
    [Networks.FUTURENET, ["futurenet"]],
    [Networks.STANDALONE, ["local", "standalone"]],
    [Networks.PUBLIC, ["unknown"]],
    ["My Custom Network ; 2026", ["unknown"]],
  ])("keys %s as %j, like the native bindings", (networkPassphrase, keys) => {
    const { index } = generator().generate({
      contractName: "hello",
      contractId: CONTRACT_ID,
      networkPassphrase,
    });

    const networks = networksOf(index);
    expect(Object.keys(networks)).toEqual(keys);
    keys.forEach((key) => {
      expect(networks[key]).toEqual({
        networkPassphrase,
        contractId: CONTRACT_ID,
      });
    });
  });

  it("marks the standalone key as deprecated", () => {
    const { index } = generator().generate({
      contractName: "hello",
      contractId: CONTRACT_ID,
      networkPassphrase: Networks.STANDALONE,
    });

    expect(index).toContain(
      "  /** @deprecated Use `local` instead. */\n  standalone: {",
    );
  });

  it.each([
    `"; process.exit(1); //`,
    `" }, evil: { x: "`,
    `back\\slash\\"`,
    `line\nbreak\r\u2028\u2029`,
    "`${process.exit(1)}`",
  ])("escapes %j in the passphrase and the contract ID", (hostile) => {
    const { index, readme } = generator().generate({
      contractName: "hello",
      contractId: hostile,
      networkPassphrase: hostile,
    });

    // the strict parse fails if the value escapes its string literal
    expect(networksOf(index)).toEqual({
      unknown: { networkPassphrase: hostile, contractId: hostile },
    });

    const literal = JSON.stringify(hostile)
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029");
    expect(readme).toContain(`  contractId: ${literal},\n`);
    expect(readme).toContain(`  networkPassphrase: ${literal},\n`);
  });

  it("writes the contract ID and passphrase into the README", () => {
    const { readme } = generator().generate({
      contractName: "hello",
      contractId: CONTRACT_ID,
      networkPassphrase: Networks.TESTNET,
    });

    expect(readme).toContain(`contractId: "${CONTRACT_ID}",`);
    expect(readme).not.toContain("YOUR_CONTRACT_ID");
    expect(readme).toContain(
      'rpcUrl: "https://soroban-testnet.stellar.org:443",',
    );
    expect(readme).toContain(`networkPassphrase: "${Networks.TESTNET}",`);
  });

  it("leaves an RPC URL placeholder in the README for a non-testnet passphrase", () => {
    const { readme } = generator().generate({
      contractName: "hello",
      contractId: CONTRACT_ID,
      networkPassphrase: "My Custom Network ; 2026",
    });

    expect(readme).toContain('rpcUrl: "YOUR_RPC_URL",');
    expect(readme).not.toContain("soroban-testnet");
    expect(readme).toContain('networkPassphrase: "My Custom Network ; 2026",');
  });
});
