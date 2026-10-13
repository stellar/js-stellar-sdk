import { describe, it, expect } from "vitest";

import {
  ContractCodeEntry,
  ContractCodeEntryExt,
  DecoratedSignature,
  HostFunction,
  LedgerFootprint,
  LedgerKey,
  LedgerKeyAccount,
  Memo,
  MuxedAccount,
  Operation,
  OperationBody,
  ParallelTxsComponent,
  Preconditions,
  PublicKey,
  ScVal,
  Signature,
  Transaction,
  TransactionEnvelope,
  TransactionExt,
  TransactionV1Envelope,
  XdrString,
} from "../../../src/xdr/index.js";

const op = () =>
  new Operation({ sourceAccount: null, body: OperationBody.inflation() });

const tx = (operations: Operation[]) =>
  new Transaction({
    sourceAccount: MuxedAccount.keyTypeEd25519(new Uint8Array(32)),
    fee: 100,
    seqNum: 1n,
    cond: Preconditions.precondNone(),
    memo: Memo.memoNone(),
    operations,
    ext: TransactionExt.v0(),
  });

const envelope = () =>
  TransactionEnvelope.envelopeTypeTx(
    new TransactionV1Envelope({ tx: tx([op()]), signatures: [] }),
  );

const accountKey = () =>
  LedgerKey.account(
    new LedgerKeyAccount({
      accountId: PublicKey.publicKeyTypeEd25519(new Uint8Array(32)),
    }),
  );

// Like Buffer, whose slice() returns a view; Buffer has no browser global.
class ViewBytes extends Uint8Array {
  slice(start?: number, end?: number): ViewBytes {
    return this.subarray(start, end);
  }
}

describe("XDR constructors copy their inputs", () => {
  describe("byte inputs", () => {
    it("BytesValue copies a Uint8Array input", () => {
      const bytes = new Uint8Array(64);
      const sig = new Signature(bytes);
      const before = sig.toXdr("hex");

      bytes[0] = 0xff;

      expect(sig.value).not.toBe(bytes);
      expect(sig.toXdr("hex")).toBe(before);
    });

    it("BytesValue copies a Uint8Array subclass whose slice() is a view, and keeps its class", () => {
      const bytes = new ViewBytes(64);
      const sig = new Signature(bytes);
      const before = sig.toXdr("hex");

      bytes[0] = 0xff;

      expect(sig.value).toBeInstanceOf(ViewBytes);
      expect(sig.toXdr("hex")).toBe(before);
    });

    it("a struct field built from a Uint8Array keeps its bytes", () => {
      const bytes = new Uint8Array(64);
      const ds = new DecoratedSignature({
        hint: new Uint8Array(4),
        signature: bytes,
      });
      const before = ds.toXdr("hex");

      bytes[0] = 0xff;

      expect(ds.toXdr("hex")).toBe(before);
    });

    it("XdrString copies a Uint8Array input", () => {
      const bytes = new TextEncoder().encode("hello");
      const str = new XdrString(bytes);

      bytes[0] = "J".charCodeAt(0);

      expect(str.bytes).not.toBe(bytes);
      expect(str.toString()).toBe("hello");
    });

    it("XdrString copies another XdrString whose bytes are a subclass with a view slice()", () => {
      const source = new XdrString(ViewBytes.from([0x68, 0x69]));
      const copy = new XdrString(source);

      copy.bytes[0] = "J".charCodeAt(0);

      expect(source.toString()).toBe("hi");
    });

    it("a string<N> union arm built from a Uint8Array keeps its bytes", () => {
      const bytes = new TextEncoder().encode("hello");
      const sym = ScVal.scvSymbol(bytes);
      const before = sym.toXdr("hex");

      bytes[0] = "J".charCodeAt(0);

      expect(sym.toXdr("hex")).toBe(before);
    });

    it("a raw Uint8Array union arm copies its input", () => {
      const wasm = new Uint8Array([0x00, 0x61, 0x73, 0x6d]);
      const hf = HostFunction.hostFunctionTypeUploadContractWasm(wasm);
      const before = hf.toXdr("hex");

      wasm[1] = 0;

      expect(hf.value).not.toBe(wasm);
      expect(hf.toXdr("hex")).toBe(before);
    });

    it("a raw Uint8Array struct field copies its input", () => {
      const code = new Uint8Array([0x00, 0x61, 0x73, 0x6d]);
      const entry = new ContractCodeEntry({
        ext: ContractCodeEntryExt.v0(),
        hash: new Uint8Array(32),
        code,
      });
      const before = entry.toXdr("hex");

      code[1] = 0;

      expect(entry.code).not.toBe(code);
      expect(entry.toXdr("hex")).toBe(before);
    });

    it("leaves a raw byte input that is not a Uint8Array for encode to reject", () => {
      // Reflect.apply passes a value that the TypeScript signature forbids.
      const hf = Reflect.apply(
        HostFunction.hostFunctionTypeUploadContractWasm,
        HostFunction,
        [undefined],
      );

      expect(() => hf.toXdr()).toThrow(/expected Uint8Array/);
    });

    it("copies an empty Uint8Array input", () => {
      const bytes = new Uint8Array(0);
      const wasm = HostFunction.hostFunctionTypeUploadContractWasm(bytes);

      expect(wasm.value).not.toBe(bytes);
      expect(wasm.value).toHaveLength(0);
    });
  });

  describe("array inputs", () => {
    it("a struct array field copies its input", () => {
      const operations = [op()];
      const t = tx(operations);
      const before = t.toXdr("hex");

      operations.push(op());

      expect(t.operations).not.toBe(operations);
      expect(t.operations).toHaveLength(1);
      expect(t.toXdr("hex")).toBe(before);
    });

    it("copies an empty array input", () => {
      const operations: Operation[] = [];
      const t = tx(operations);

      operations.push(op());

      expect(t.operations).toHaveLength(0);
    });

    it("throws a TypeError for a missing array field", () => {
      // Reflect.construct passes a value that the TypeScript signature forbids.
      expect(() =>
        Reflect.construct(LedgerFootprint, [{ readOnly: [] }]),
      ).toThrow(TypeError);
    });

    it("an optional array union arm copies its input", () => {
      const vec = [ScVal.scvU32(1)];
      const val = ScVal.scvVec(vec);
      const before = val.toXdr("hex");

      vec.push(ScVal.scvU32(2));

      expect(val.vec).not.toBe(vec);
      expect(val.toXdr("hex")).toBe(before);
    });

    it("an optional array union arm keeps null", () => {
      expect(ScVal.scvVec(null).vec).toBeNull();
    });

    it("a nested array field copies every level", () => {
      const inner = [envelope()];
      const stage = [inner];
      const stages = [stage];
      const component = new ParallelTxsComponent({
        baseFee: null,
        executionStages: stages,
      });
      const before = component.toXdr("hex");

      stages.push([]);
      stage.push([]);
      inner.push(envelope());

      expect(component.executionStages).toHaveLength(1);
      expect(component.executionStages[0]).toHaveLength(1);
      expect(component.executionStages[0][0]).toHaveLength(1);
      expect(component.toXdr("hex")).toBe(before);
    });
  });

  describe("decode", () => {
    it("a decoded value does not share the input buffer", () => {
      const bytes = ScVal.scvBytes(new Uint8Array([1, 2, 3])).toXdr();
      const decoded = ScVal.fromXdr(bytes);

      bytes.fill(0);

      expect(decoded.toXdr("hex")).toBe("0000000d0000000301020300");
    });

    it("decoded bytes survive a round trip unchanged", () => {
      const wasm = new Uint8Array(1024).map((_, i) => i & 0xff);
      const hf = HostFunction.hostFunctionTypeUploadContractWasm(wasm);

      const decoded = HostFunction.fromXdr(hf.toXdr());

      expect(decoded.equals(hf)).toBe(true);
    });
  });

  describe("read-back", () => {
    it("a stored array stays writable", () => {
      const footprint = new LedgerFootprint({ readOnly: [], readWrite: [] });

      footprint.readWrite.push(accountKey());

      expect(footprint.readWrite).toHaveLength(1);
      expect(LedgerFootprint.fromXdr(footprint.toXdr()).readWrite).toHaveLength(
        1,
      );
    });
  });
});
