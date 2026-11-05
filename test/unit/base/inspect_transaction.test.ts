import { describe, it, expect, afterEach, vi } from "vitest";

import { Account } from "../../../src/base/account.js";
import { Address } from "../../../src/base/address.js";
import { Asset } from "../../../src/base/asset.js";
import { inspectAuthEntry } from "../../../src/base/auth.js";
import { inspectTransaction } from "../../../src/base/inspect_transaction.js";
import { Keypair } from "../../../src/base/keypair.js";
import { Memo } from "../../../src/base/memo.js";
import { MuxedAccount } from "../../../src/base/muxed_account.js";
import { Networks } from "../../../src/base/network.js";
import { Operation } from "../../../src/base/operation.js";
import { nativeToScVal } from "../../../src/base/scval.js";
import { SorobanDataBuilder } from "../../../src/base/sorobandata_builder.js";
import { Transaction } from "../../../src/base/transaction.js";
import { TransactionBuilder } from "../../../src/base/transaction_builder.js";
import * as xdr from "../../../src/xdr/index.js";
import { expectDefined } from "./support/expect_defined.js";
import {
  expectObjectWithProperty,
  expectOperationType,
} from "./support/operation.js";
import { withFees } from "./support/transaction.js";
import { expectVariant } from "./support/xdr.js";

const CONTRACT_ID = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
const MAX_UINT64 = "18446744073709551615";

function randomKey(): string {
  return Keypair.random().publicKey();
}

function bumpSequenceOp(source?: string): xdr.Operation {
  return Operation.bumpSequence({
    bumpTo: "200",
    ...(source !== undefined && { source }),
  });
}

function classicTx(
  ops: xdr.Operation[] = [bumpSequenceOp()],
  opts: Partial<ConstructorParameters<typeof TransactionBuilder>[1]> = {},
  account: Account | MuxedAccount = new Account(randomKey(), "100"),
): Transaction {
  const builder = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
    ...opts,
  });
  ops.forEach((op) => builder.addOperation(op));
  return builder.setTimeout(30).build();
}

function sorobanTx(op: xdr.Operation, resourceFee = 50_000n): Transaction {
  return new TransactionBuilder(new Account(randomKey(), "100"), {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(op)
    .setSorobanData(
      new SorobanDataBuilder().setResourceFee(resourceFee).build(),
    )
    .setTimeout(30)
    .build();
}

function withCond(tx: Transaction, cond: xdr.Preconditions): Transaction {
  const { tx: inner, signatures } = expectVariant(
    tx.toEnvelope(),
    "envelopeTypeTx",
  ).v1;
  return new Transaction(
    xdr.TransactionEnvelope.envelopeTypeTx(
      new xdr.TransactionV1Envelope({
        tx: new xdr.Transaction({
          sourceAccount: inner.sourceAccount,
          fee: inner.fee,
          seqNum: inner.seqNum,
          cond,
          memo: inner.memo,
          operations: inner.operations,
          ext: inner.ext,
        }),
        signatures,
      }),
    ),
    tx.networkPassphrase,
  );
}

function asSummary(tx: Transaction) {
  const summary = inspectTransaction(tx);
  expect("inner" in summary).toBe(false);
  if ("inner" in summary) {
    throw new Error("expected a TransactionSummary");
  }
  return summary;
}

function addressCreds(publicKey: string): xdr.SorobanAddressCredentials {
  return new xdr.SorobanAddressCredentials({
    address: new Address(publicKey).toScAddress(),
    nonce: 987654321n,
    signatureExpirationLedger: 0,
    signature: xdr.ScVal.scvVec([]),
  });
}

function authEntry(
  credentials: xdr.SorobanCredentials,
): xdr.SorobanAuthorizationEntry {
  return new xdr.SorobanAuthorizationEntry({
    credentials,
    rootInvocation: new xdr.SorobanAuthorizedInvocation({
      function:
        xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
          new xdr.InvokeContractArgs({
            contractAddress: new Address(CONTRACT_ID).toScAddress(),
            functionName: "transfer",
            args: [],
          }),
        ),
      subInvocations: [],
    }),
  });
}

function isJsonObject(
  value: xdr.JsonValue,
): value is { readonly [key: string]: xdr.JsonValue } {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function jsonAt(value: xdr.JsonValue, ...keys: string[]): xdr.JsonValue {
  return keys.reduce<xdr.JsonValue>((node, key) => {
    if (!isJsonObject(node)) {
      throw new Error(`expected a JSON object at '${key}'`);
    }
    return expectDefined(node[key]);
  }, value);
}

describe("inspectTransaction", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("envelope fields", () => {
    it("reports the source account and the sequence number", () => {
      const tx = classicTx();
      const summary = asSummary(tx);
      expect(summary.source).toBe(tx.source);
      expect(summary.sequence).toBe("101");
    });

    it("keeps a muxed source account as its M address", () => {
      const muxed = new MuxedAccount(new Account(randomKey(), "100"), "42");
      const summary = asSummary(classicTx(undefined, {}, muxed));
      expect(summary.source).toBe(muxed.accountId());
      expect(summary.source.startsWith("M")).toBe(true);
    });
  });

  describe("memo", () => {
    it("reports no memo as type none with a null value", () => {
      expect(asSummary(classicTx()).memo).toEqual({
        type: "none",
        value: null,
      });
    });

    it("reports an id memo as a decimal string, up to the uint64 maximum", () => {
      const summary = asSummary(
        classicTx(undefined, { memo: Memo.id(MAX_UINT64) }),
      );
      expect(summary.memo).toEqual({ type: "id", value: MAX_UINT64 });
    });

    it("decodes a text memo as UTF-8 when the bytes are valid UTF-8", () => {
      expect(
        asSummary(classicTx(undefined, { memo: Memo.text("hi") })).memo,
      ).toEqual({ type: "text", value: "hi" });
      expect(
        asSummary(classicTx(undefined, { memo: Memo.text("héllo") })).memo,
      ).toEqual({ type: "text", value: "héllo" });
    });

    it("reports a text memo that is not valid UTF-8 in the SEP-51 escaped form", () => {
      const bytes = new Uint8Array([0xff, 0x41, 0x00]);
      const summary = asSummary(
        classicTx(undefined, { memo: Memo.text(bytes) }),
      );
      expect(summary.memo).toEqual({
        type: "text",
        value: String.raw`\xffA\0`,
      });
      expect(summary.memo.value).toBe(new xdr.XdrString(bytes).toJson());
    });

    it("reports hash and return memos as lowercase hex", () => {
      expect(
        asSummary(classicTx(undefined, { memo: Memo.hash("AB".repeat(32)) }))
          .memo,
      ).toEqual({ type: "hash", value: "ab".repeat(32) });
      expect(
        asSummary(classicTx(undefined, { memo: Memo.return("cd".repeat(32)) }))
          .memo,
      ).toEqual({ type: "return", value: "cd".repeat(32) });
    });
  });

  describe("preconditions", () => {
    it("is null when the transaction has no preconditions", () => {
      const tx = withCond(classicTx(), xdr.Preconditions.precondNone());
      expect(asSummary(tx).preconditions).toBeNull();
    });

    it("reports time bounds alone, with every v2 field null or empty", () => {
      const tx = classicTx();
      const timeBounds = expectDefined(tx.timeBounds);
      expect(asSummary(tx).preconditions).toEqual({
        timeBounds: {
          minTime: timeBounds.minTime,
          maxTime: timeBounds.maxTime,
        },
        ledgerBounds: null,
        minAccountSequence: null,
        minAccountSequenceAge: null,
        minAccountSequenceLedgerGap: null,
        extraSigners: [],
      });
    });

    it("reports every v2 precondition, with 64-bit values as strings and signers as strkeys", () => {
      const signer = randomKey();
      const tx = classicTx(undefined, {
        ledgerbounds: { minLedger: 5, maxLedger: 10 },
        minAccountSequence: "77",
        minAccountSequenceAge: BigInt(MAX_UINT64),
        minAccountSequenceLedgerGap: 3,
        extraSigners: [signer],
      });
      const timeBounds = expectDefined(tx.timeBounds);
      expect(asSummary(tx).preconditions).toEqual({
        timeBounds: {
          minTime: timeBounds.minTime,
          maxTime: timeBounds.maxTime,
        },
        ledgerBounds: { minLedger: 5, maxLedger: 10 },
        minAccountSequence: "77",
        minAccountSequenceAge: MAX_UINT64,
        minAccountSequenceLedgerGap: 3,
        extraSigners: [signer],
      });
    });

    it("reports v2 numeric fields that were left unset as zero, not null", () => {
      const tx = classicTx(undefined, {
        ledgerbounds: { minLedger: 0, maxLedger: 10 },
      });
      const preconditions = expectDefined(asSummary(tx).preconditions);
      expect(preconditions.minAccountSequence).toBeNull();
      expect(preconditions.minAccountSequenceAge).toBe("0");
      expect(preconditions.minAccountSequenceLedgerGap).toBe(0);
    });

    it("reads a v0 envelope, which can carry only time bounds", () => {
      const kp = Keypair.random();
      const v1 = expectVariant(classicTx().toEnvelope(), "envelopeTypeTx").v1
        .tx;
      const tx = new Transaction(
        xdr.TransactionEnvelope.envelopeTypeTxV0(
          new xdr.TransactionV0Envelope({
            tx: new xdr.TransactionV0({
              sourceAccountEd25519: kp.rawPublicKey(),
              fee: 100,
              seqNum: 101n,
              timeBounds: new xdr.TimeBounds({ minTime: 1n, maxTime: 2n }),
              memo: xdr.Memo.memoNone(),
              operations: v1.operations,
              ext: xdr.TransactionV0Ext.v0(),
            }),
            signatures: [],
          }),
        ),
        Networks.TESTNET,
      );
      const summary = asSummary(tx);
      expect(summary.source).toBe(kp.publicKey());
      expect(summary.preconditions).toEqual({
        timeBounds: { minTime: "1", maxTime: "2" },
        ledgerBounds: null,
        minAccountSequence: null,
        minAccountSequenceAge: null,
        minAccountSequenceLedgerGap: null,
        extraSigners: [],
      });
      expect(summary.fees).toEqual({
        max: "100",
        resource: null,
        inclusion: "100",
      });
    });
  });

  describe("fees", () => {
    it("reports a classic fee with no resource fee and the whole fee as inclusion", () => {
      const tx = classicTx([bumpSequenceOp(), bumpSequenceOp()]);
      expect(asSummary(tx).fees).toEqual({
        max: "200",
        resource: null,
        inclusion: "200",
      });
    });

    it("splits a Soroban fee into the resource fee and the inclusion fee", () => {
      const tx = sorobanTx(
        Operation.uploadContractWasm({
          wasm: new Uint8Array([0, 97, 115, 109]),
        }),
      );
      expect(asSummary(tx).fees).toEqual({
        max: "50100",
        resource: "50000",
        inclusion: "100",
      });
    });

    it("reports a negative inclusion fee when the resource fee exceeds the declared fee", () => {
      const base = sorobanTx(
        Operation.uploadContractWasm({
          wasm: new Uint8Array([0, 97, 115, 109]),
        }),
      );
      const tx = withFees(base, 100, 50_000n);
      expect(asSummary(tx).fees).toEqual({
        max: "100",
        resource: "50000",
        inclusion: "-49900",
      });
    });
  });

  describe("operations", () => {
    it("lists each classic operation with its index, type, resolved source and details", () => {
      const override = randomKey();
      const destination = randomKey();
      const tx = classicTx([
        Operation.payment({
          destination,
          asset: Asset.native(),
          amount: "10.5",
        }),
        bumpSequenceOp(override),
      ]);
      const summary = asSummary(tx);

      expect(summary.operations).toHaveLength(2);
      expect(summary.operations[0]).toEqual({
        index: 0,
        type: "payment",
        source: tx.source,
        authEntries: [],
        invocation: null,
        details: tx.operations[0],
      });
      expect(summary.operations[1]).toEqual({
        index: 1,
        type: "bumpSequence",
        source: override,
        authEntries: [],
        invocation: null,
        details: tx.operations[1],
      });
    });

    it("keeps a muxed operation source as its M address", () => {
      const muxed = new MuxedAccount(new Account(randomKey(), "100"), "7");
      const tx = classicTx([bumpSequenceOp(muxed.accountId())]);
      expect(asSummary(tx).operations[0]?.source).toBe(muxed.accountId());
    });
  });

  describe("Soroban operations", () => {
    it("lists every auth entry, for each credential type, through inspectAuthEntry", () => {
      const signer = randomKey();
      const entries = [
        authEntry(xdr.SorobanCredentials.sorobanCredentialsSourceAccount()),
        authEntry(
          xdr.SorobanCredentials.sorobanCredentialsAddress(
            addressCreds(signer),
          ),
        ),
        authEntry(
          xdr.SorobanCredentials.sorobanCredentialsAddressV2(
            addressCreds(signer),
          ),
        ),
        authEntry(
          xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
            new xdr.SorobanAddressCredentialsWithDelegates({
              addressCredentials: addressCreds(signer),
              delegates: [],
            }),
          ),
        ),
      ];
      const tx = sorobanTx(
        Operation.invokeContractFunction({
          contract: CONTRACT_ID,
          function: "transfer",
          args: [],
          auth: entries,
        }),
      );
      const decoded = expectOperationType(
        tx.operations[0],
        "invokeHostFunction",
      );
      const operation = expectDefined(asSummary(tx).operations[0]);

      expect(operation.authEntries).toEqual(
        expectDefined(decoded.auth).map((entry) => ({
          type: "entry",
          info: inspectAuthEntry(entry),
        })),
      );
      expect(
        operation.authEntries.map((entry) =>
          entry.type === "entry" ? entry.info.credentialType : entry.type,
        ),
      ).toEqual([
        "sourceAccount",
        "address",
        "addressV2",
        "addressWithDelegates",
      ]);
    });

    it("builds the invocation tree for a contract call", () => {
      const from = randomKey();
      const tx = sorobanTx(
        Operation.invokeContractFunction({
          contract: CONTRACT_ID,
          function: "transfer",
          args: [
            new Address(from).toScVal(),
            nativeToScVal(5n, { type: "i128" }),
          ],
        }),
      );
      const operation = expectDefined(asSummary(tx).operations[0]);
      expect(operation.type).toBe("invokeHostFunction");
      expect(operation.source).toBe(tx.source);
      expect(operation.invocation).toEqual({
        type: "execute",
        args: { source: CONTRACT_ID, function: "transfer", args: [from, 5n] },
        invocations: [],
      });
    });

    it("builds the invocation tree for a Stellar Asset Contract deployment", () => {
      const issuer = randomKey();
      const tx = sorobanTx(
        Operation.createStellarAssetContract({
          asset: new Asset("USD", issuer),
        }),
      );
      expect(expectDefined(asSummary(tx).operations[0]).invocation).toEqual({
        type: "create",
        args: { type: "sac", asset: `USD:${issuer}` },
        invocations: [],
      });
    });

    it("builds the invocation tree for a custom contract deployment with constructor arguments", () => {
      const deployer = randomKey();
      const tx = sorobanTx(
        Operation.createCustomContract({
          address: new Address(deployer),
          wasmHash: new Uint8Array(32).fill(1),
          salt: new Uint8Array(32).fill(2),
          constructorArgs: [nativeToScVal("init")],
        }),
      );
      expect(expectDefined(asSummary(tx).operations[0]).invocation).toEqual({
        type: "create",
        args: {
          type: "wasm",
          wasm: {
            salt: "02".repeat(32),
            hash: "01".repeat(32),
            address: deployer,
            constructorArgs: ["init"],
          },
        },
        invocations: [],
      });
    });

    it("reports no invocation for a wasm upload", () => {
      const tx = sorobanTx(
        Operation.uploadContractWasm({
          wasm: new Uint8Array([0, 97, 115, 109]),
        }),
      );
      const operation = expectDefined(asSummary(tx).operations[0]);
      expect(operation.invocation).toBeNull();
      expect(operation.authEntries).toEqual([]);
    });

    it("degrades an invocation that buildInvocationTree rejects to unreadable", () => {
      const tx = sorobanTx(
        Operation.invokeHostFunction({
          func: xdr.HostFunction.hostFunctionTypeCreateContract(
            new xdr.CreateContractArgs({
              contractIdPreimage:
                xdr.ContractIdPreimage.contractIdPreimageFromAsset(
                  new Asset("USD", randomKey()).toXdrObject(),
                ),
              executable: xdr.ContractExecutable.contractExecutableWasm(
                new xdr.Hash(new Uint8Array(32).fill(1)),
              ),
            }),
          ),
          auth: [],
        }),
      );
      const summary = asSummary(tx);
      expect(summary.operations[0]?.invocation).toEqual({
        type: "unreadable",
        reason: expect.stringMatching(/creation function appears invalid/),
      });
      expect(summary.fees.resource).toBe("50000");
    });

    it("degrades an auth entry that inspectAuthEntry rejects to unreadable and keeps the others", () => {
      const tx = sorobanTx(
        Operation.uploadContractWasm({
          wasm: new Uint8Array([0, 97, 115, 109]),
          auth: [
            authEntry(
              xdr.SorobanCredentials.sorobanCredentialsAddress(
                addressCreds(randomKey()),
              ),
            ),
            authEntry(
              xdr.SorobanCredentials.sorobanCredentialsAddress(
                addressCreds(randomKey()),
              ),
            ),
          ],
        }),
      );
      vi.spyOn(Address, "fromScAddress").mockImplementationOnce(() => {
        throw new Error("unrecognized address");
      });

      const authEntries = expectDefined(
        asSummary(tx).operations[0],
      ).authEntries;
      expect(authEntries[0]).toEqual({
        type: "unreadable",
        reason: expect.stringContaining("unrecognized address"),
      });
      expect(authEntries[1]?.type).toBe("entry");
    });
  });

  describe("fee bump", () => {
    it("nests the inner transaction summary under inner, next to the fee source and the outer fee", () => {
      const inner = classicTx([
        Operation.payment({
          destination: randomKey(),
          asset: Asset.native(),
          amount: "1",
        }),
      ]);
      const feeSource = randomKey();
      const bump = TransactionBuilder.buildFeeBumpTransaction(
        feeSource,
        "200",
        inner,
        Networks.TESTNET,
      );

      const summary = expectObjectWithProperty(
        inspectTransaction(bump),
        "inner",
      );
      expect(summary.feeSource).toBe(feeSource);
      expect(summary.maxFee).toBe("400");
      expect(summary.inner).toEqual(inspectTransaction(bump.innerTransaction));
      expect(summary.inner.fees.max).toBe("100");
    });

    it("keeps the Soroban fee split of the inner transaction, with a negative inclusion fee", () => {
      const inner = withFees(
        sorobanTx(
          Operation.uploadContractWasm({
            wasm: new Uint8Array([0, 97, 115, 109]),
          }),
        ),
        100,
        50_000n,
      );
      const bump = TransactionBuilder.buildFeeBumpTransaction(
        randomKey(),
        "200",
        inner,
        Networks.TESTNET,
      );
      const summary = expectObjectWithProperty(
        inspectTransaction(bump),
        "inner",
      );
      expect(summary.maxFee).toBe("50400");
      expect(summary.inner.fees).toEqual({
        max: "100",
        resource: "50000",
        inclusion: "-49900",
      });
    });
  });

  describe("caller errors", () => {
    it("throws a TypeError for an argument that is not a transaction", () => {
      const envelope = classicTx().toEnvelope();
      // @ts-expect-error testing a JavaScript caller that passes null
      expect(() => inspectTransaction(null)).toThrow(TypeError);
      // @ts-expect-error testing a JavaScript caller that passes a plain object
      expect(() => inspectTransaction({})).toThrow(TypeError);
      // @ts-expect-error testing a JavaScript caller that passes a raw envelope
      expect(() => inspectTransaction(envelope)).toThrow(TypeError);
    });
  });

  describe("agreement with toJson()", () => {
    it("reports the same values as the XDR-JSON rendering where both report a value", () => {
      const signer = randomKey();
      const tx = classicTx(undefined, {
        memo: Memo.id(MAX_UINT64),
        ledgerbounds: { minLedger: 5, maxLedger: 10 },
        minAccountSequenceAge: BigInt(MAX_UINT64),
        extraSigners: [signer],
      });
      const summary = asSummary(tx);
      const preconditions = expectDefined(summary.preconditions);
      const json = jsonAt(tx.toEnvelope().toJson(), "tx", "tx");
      const v2 = jsonAt(json, "cond", "v2");

      expect(summary.sequence).toBe(jsonAt(json, "seq_num"));
      expect(summary.fees.max).toBe(String(jsonAt(json, "fee")));
      expect(summary.memo.value).toBe(jsonAt(json, "memo", "id"));
      expect(preconditions.minAccountSequenceAge).toBe(
        jsonAt(v2, "min_seq_age"),
      );
      expect(preconditions.extraSigners).toEqual(jsonAt(v2, "extra_signers"));
      expect(preconditions.timeBounds?.maxTime).toBe(
        jsonAt(v2, "time_bounds", "max_time"),
      );
    });

    it("reports a hash memo with the same hex as the XDR-JSON rendering", () => {
      const tx = classicTx(undefined, { memo: Memo.hash("ab".repeat(32)) });
      expect(asSummary(tx).memo.value).toBe(
        jsonAt(tx.toEnvelope().toJson(), "tx", "tx", "memo", "hash"),
      );
    });
  });

  describe("exports", () => {
    it("is exported from the base entry point and the package root", async () => {
      const base = await import("../../../src/base/index.js");
      const root = await import("../../../src/index.js");
      expect("inspectTransaction" in base).toBe(true);
      expect("inspectTransaction" in root).toBe(true);
    });
  });
});
