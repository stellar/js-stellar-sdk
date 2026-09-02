import { describe, it, beforeEach, expect, vi } from "vitest";
import * as StellarSdk from "../../../src/index.js";

import { serverUrl } from "../../constants.js";
import { wasmWithSpec } from "./support/wasm.js";
import { expectOperationType } from "../base/support/operation.js";
import { expectVariant } from "../base/support/xdr.js";

const { xdr, hash, Contract, rpc, Address } = StellarSdk;
const { Client } = StellarSdk.contract;
const { Server } = rpc;

const networkPassphrase = "Test SDF Network ; September 2015";

describe("contract.Client.deploy", () => {
  let server: any;
  let mockPost: any;

  // `Client.deploy` reuses a pre-built `Server` given via `options.server`, so
  // spying on that instance's http client lets the real code path run against
  // controlled JSON-RPC responses without mocking a module.
  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post").mockImplementation(() => {
      throw new Error("unexpected RPC call");
    });
  });

  const deployer = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";

  // A synthetic wasm exposing a single `hello` function, so `Spec.fromWasm`
  // can parse it. The wasm hash is arbitrary for the mock; it only has to
  // match between the tag entry / deploy options and the code entry.
  const wasmBuffer = wasmWithSpec([
    xdr.ScSpecEntry.scSpecEntryFunctionV0(
      new xdr.ScSpecFunctionV0({
        doc: "",
        name: "hello",
        inputs: [],
        outputs: [],
      }),
    ),
  ]);
  const wasmHash = hash(wasmBuffer);

  const wasmLedgerKey = xdr.LedgerKey.contractCode(
    new xdr.LedgerKeyContractCode({ hash: wasmHash }),
  );
  const wasmLedgerCode = xdr.LedgerEntryData.contractCode(
    new xdr.ContractCodeEntry({
      ext: xdr.ContractCodeEntryExt.fromXdr(
        "AAAAAQAAAAAAAAAAAAAVqAAAAJwAAAADAAAAAwAAABgAAAABAAAAAQAAABEAAAAgAAABpA==",
        "base64",
      ),
      hash: wasmHash,
      code: wasmBuffer,
    }),
  );

  // Builds the JSON-RPC response shape returned by `getLedgerEntries` for a
  // single ledger entry, matching what the RPC server produces.
  function ledgerEntriesResponse(
    val: StellarSdk.xdr.LedgerEntryData,
    key: StellarSdk.xdr.LedgerKey,
  ) {
    return {
      data: {
        result: {
          latestLedger: 18039,
          entries: [
            {
              liveUntilLedgerSeq: 1000,
              lastModifiedLedgerSeq: 1,
              xdr: val.toXdr("base64"),
              key: key.toXdr("base64"),
            },
          ],
        },
      },
    };
  }

  // With `simulate: false` the deploy stops after assembling the transaction,
  // so the operation it built can be inspected off the raw builder.
  function builtDeployOp(tx: StellarSdk.contract.AssembledTransaction<any>) {
    const op = expectOperationType(
      tx.raw!.build().operations[0]!,
      "invokeHostFunction",
    );
    return expectVariant(op.func, "hostFunctionTypeCreateContractV2")
      .createContractV2;
  }

  describe("from a wasm hash (baseline)", () => {
    it("fetches the spec and builds a wasm-hash deploy op", async () => {
      mockPost.mockResolvedValueOnce(
        ledgerEntriesResponse(wasmLedgerCode, wasmLedgerKey),
      );

      const tx = await Client.deploy(null, {
        wasmHash,
        address: deployer,
        networkPassphrase,
        rpcUrl: serverUrl,
        server,
        simulate: false,
      });

      // Only the wasm fetch: no account fetch (no publicKey), no simulation.
      expect(mockPost).toHaveBeenCalledTimes(1);

      const args = builtDeployOp(tx);
      const executable = expectVariant(
        args.executable,
        "contractExecutableWasm",
      );
      expect(Array.from(executable.value.toBytes())).toEqual(
        Array.from(wasmHash),
      );
      expect(args.constructorArgs).toHaveLength(0);
    });
  });

  describe("from a CAP-85 external executable ref", () => {
    const ownerId = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
    const owner = new Contract(ownerId);
    const tag = "my-executable";

    // The owner contract's persistent tag entry, whose value is the wasm hash
    // the ref currently names. Resolving it is how deploy finds the spec.
    const tagEntryKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: owner.address().toScAddress(),
        key: xdr.ScVal.scvExecutableTag(tag),
        durability: xdr.ContractDataDurability.persistent,
      }),
    );
    const tagEntryVal = xdr.LedgerEntryData.contractData(
      new xdr.ContractDataEntry({
        ext: xdr.ExtensionPoint.v0(),
        contract: owner.address().toScAddress(),
        durability: xdr.ContractDataDurability.persistent,
        key: xdr.ScVal.scvExecutableTag(tag),
        val: xdr.ScVal.scvBytes(wasmHash),
      }),
    );

    it("resolves the ref for the spec and builds an external-ref deploy op", async () => {
      mockPost
        .mockResolvedValueOnce(ledgerEntriesResponse(tagEntryVal, tagEntryKey))
        .mockResolvedValueOnce(
          ledgerEntriesResponse(wasmLedgerCode, wasmLedgerKey),
        );

      const tx = await Client.deploy(null, {
        externalRef: { owner: ownerId, tag },
        address: deployer,
        networkPassphrase,
        rpcUrl: serverUrl,
        server,
        simulate: false,
      });

      // The tag-entry lookup, then the wasm fetch.
      expect(mockPost).toHaveBeenCalledTimes(2);

      const args = builtDeployOp(tx);
      const ref = expectVariant(
        args.executable,
        "contractExecutableExternalRef",
      ).externalRef;
      expect(Address.fromScAddress(ref.executableOwner).toString()).toBe(
        ownerId,
      );
      expect(ref.tag.toStringStrict()).toBe(tag);
      expect(args.constructorArgs).toHaveLength(0);

      const preimage = expectVariant(
        args.contractIdPreimage,
        "contractIdPreimageFromAddress",
      );
      expect(Address.fromScAddress(preimage.value.address).toString()).toBe(
        deployer,
      );
    });

    it("accepts a ContractExecutableExternalRef directly", async () => {
      mockPost
        .mockResolvedValueOnce(ledgerEntriesResponse(tagEntryVal, tagEntryKey))
        .mockResolvedValueOnce(
          ledgerEntriesResponse(wasmLedgerCode, wasmLedgerKey),
        );

      const tx = await Client.deploy(null, {
        externalRef: new xdr.ContractExecutableExternalRef({
          executableOwner: owner.address().toScAddress(),
          tag,
        }),
        address: deployer,
        networkPassphrase,
        rpcUrl: serverUrl,
        server,
        simulate: false,
      });

      const ref = expectVariant(
        builtDeployOp(tx).executable,
        "contractExecutableExternalRef",
      ).externalRef;
      expect(ref.tag.toStringStrict()).toBe(tag);
    });

    it("rejects when the owner is not a contract", async () => {
      await expect(
        Client.deploy(null, {
          externalRef: { owner: deployer, tag },
          address: deployer,
          networkPassphrase,
          rpcUrl: serverUrl,
          server,
          simulate: false,
        }),
      ).rejects.toMatchObject({ code: 400 });
    });
  });
});
