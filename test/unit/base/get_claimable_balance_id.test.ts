import { describe, it, expect } from "vitest";
import { hexToUint8Array } from "uint8array-extras";
import {
  ClaimableBalanceId,
  CreateClaimableBalanceResult,
  InnerTransactionResult,
  InnerTransactionResultExt,
  InnerTransactionResultPair,
  InnerTransactionResultResult,
  OperationResult,
  OperationResultTr,
  PaymentResult,
  TransactionResult,
  TransactionResultExt,
  TransactionResultResult,
} from "../../../src/xdr/index.js";
import { getClaimableBalanceIdFromResult } from "../../../src/base/get_claimable_balance_id.js";

// The helper is typed, but JS consumers are not; these cases feed it what a
// plain-JS caller can actually pass.
const callUntyped = (result: unknown, opIndex: number): string =>
  getClaimableBalanceIdFromResult(result as TransactionResult, opIndex);

// The 32-byte hash half of a real balance ID, taken from the
// `Transaction#getClaimableBalanceId` fixtures so both halves of issue #584
// are asserted against the same value.
const HASH_HEX =
  "536af35c666a28d26775008321655e9eda2039154270484e3f81d72c66d5c26f";
const BALANCE_ID_HEX = `00000000${HASH_HEX}`;
const INNER_TX_HASH = new Uint8Array(32).fill(7);

function balanceIdOpResult(hashHex: string = HASH_HEX): OperationResult {
  return OperationResult.opInner(
    OperationResultTr.createClaimableBalance(
      CreateClaimableBalanceResult.createClaimableBalanceSuccess(
        ClaimableBalanceId.claimableBalanceIdTypeV0(hexToUint8Array(hashHex)),
      ),
    ),
  );
}

function paymentOpResult(): OperationResult {
  return OperationResult.opInner(
    OperationResultTr.payment(PaymentResult.paymentSuccess()),
  );
}

function txResult(result: TransactionResultResult): TransactionResult {
  return new TransactionResult({
    feeCharged: 100n,
    result,
    ext: TransactionResultExt.v0(),
  });
}

function feeBumpResult(inner: InnerTransactionResultResult): TransactionResult {
  return txResult(
    TransactionResultResult.txFeeBumpInnerSuccess(
      new InnerTransactionResultPair({
        transactionHash: INNER_TX_HASH,
        result: new InnerTransactionResult({
          feeCharged: 100n,
          result: inner,
          ext: InnerTransactionResultExt.v0(),
        }),
      }),
    ),
  );
}

describe("getClaimableBalanceIdFromResult", () => {
  describe("success", () => {
    it("extracts the balance ID from a single-operation result", () => {
      const result = txResult(
        TransactionResultResult.txSuccess([balanceIdOpResult()]),
      );

      expect(getClaimableBalanceIdFromResult(result, 0)).toBe(BALANCE_ID_HEX);
    });

    it("extracts the balance ID at the requested index", () => {
      const otherHash = "a".repeat(64);
      const result = txResult(
        TransactionResultResult.txSuccess([
          paymentOpResult(),
          balanceIdOpResult(),
          balanceIdOpResult(otherHash),
        ]),
      );

      expect(getClaimableBalanceIdFromResult(result, 1)).toBe(BALANCE_ID_HEX);
      expect(getClaimableBalanceIdFromResult(result, 2)).toBe(
        `00000000${otherHash}`,
      );
    });

    it("unwraps a fee-bump transaction result", () => {
      const result = feeBumpResult(
        InnerTransactionResultResult.txSuccess([balanceIdOpResult()]),
      );

      expect(getClaimableBalanceIdFromResult(result, 0)).toBe(BALANCE_ID_HEX);
    });

    it("treats -0 as index 0", () => {
      const result = txResult(
        TransactionResultResult.txSuccess([balanceIdOpResult()]),
      );

      expect(getClaimableBalanceIdFromResult(result, -0)).toBe(BALANCE_ID_HEX);
    });

    it("extracts the balance ID from a base64 round trip", () => {
      const result = txResult(
        TransactionResultResult.txSuccess([balanceIdOpResult()]),
      );
      const decoded = TransactionResult.fromXdr(
        result.toXdr("base64"),
        "base64",
      );

      expect(getClaimableBalanceIdFromResult(decoded, 0)).toBe(BALANCE_ID_HEX);
    });

    it("extracts the balance ID from a fee-bump base64 round trip", () => {
      const result = feeBumpResult(
        InnerTransactionResultResult.txSuccess([balanceIdOpResult()]),
      );
      const decoded = TransactionResult.fromXdr(
        result.toXdr("base64"),
        "base64",
      );

      expect(getClaimableBalanceIdFromResult(decoded, 0)).toBe(BALANCE_ID_HEX);
    });
  });

  describe("invalid operation index", () => {
    const result = txResult(
      TransactionResultResult.txSuccess([balanceIdOpResult()]),
    );

    it("throws for a negative index", () => {
      expect(() => getClaimableBalanceIdFromResult(result, -1)).toThrow(
        RangeError,
      );
    });

    it("throws for a non-integer index", () => {
      expect(() => getClaimableBalanceIdFromResult(result, 1.5)).toThrow(
        RangeError,
      );
    });

    it("throws for an index past the last operation result", () => {
      expect(() => getClaimableBalanceIdFromResult(result, 1)).toThrow(
        RangeError,
      );
    });

    it("throws for an index past the last fee-bump operation result", () => {
      const feeBump = feeBumpResult(
        InnerTransactionResultResult.txSuccess([balanceIdOpResult()]),
      );

      expect(() => getClaimableBalanceIdFromResult(feeBump, 1)).toThrow(
        RangeError,
      );
    });
  });

  describe("unsuccessful transaction", () => {
    it("throws when the transaction failed", () => {
      const result = txResult(
        TransactionResultResult.txFailed([balanceIdOpResult()]),
      );

      expect(() => getClaimableBalanceIdFromResult(result, 0)).toThrow(
        /txFailed/,
      );
    });

    it("throws when the result carries no operation results", () => {
      const result = txResult(TransactionResultResult.txBadSeq());

      expect(() => getClaimableBalanceIdFromResult(result, 0)).toThrow(
        /txBadSeq/,
      );
    });

    it("throws when the fee-bump inner transaction failed", () => {
      const result = feeBumpResult(
        InnerTransactionResultResult.txFailed([balanceIdOpResult()]),
      );

      expect(() => getClaimableBalanceIdFromResult(result, 0)).toThrow(
        /txFailed/,
      );
    });

    it("throws when the fee bump itself failed", () => {
      const result = txResult(
        TransactionResultResult.txFeeBumpInnerFailed(
          new InnerTransactionResultPair({
            transactionHash: INNER_TX_HASH,
            result: new InnerTransactionResult({
              feeCharged: 100n,
              result: InnerTransactionResultResult.txFailed([
                balanceIdOpResult(),
              ]),
              ext: InnerTransactionResultExt.v0(),
            }),
          }),
        ),
      );

      expect(() => getClaimableBalanceIdFromResult(result, 0)).toThrow(
        /txFeeBumpInnerFailed/,
      );
    });
  });

  describe("unexpected operation result", () => {
    it("throws when the operation result is not opInner", () => {
      const result = txResult(
        TransactionResultResult.txSuccess([OperationResult.opBadAuth()]),
      );

      expect(() => getClaimableBalanceIdFromResult(result, 0)).toThrow(
        /opBadAuth/,
      );
    });

    it("throws when the operation is not createClaimableBalance", () => {
      const result = txResult(
        TransactionResultResult.txSuccess([paymentOpResult()]),
      );

      expect(() => getClaimableBalanceIdFromResult(result, 0)).toThrow(
        /payment/,
      );
    });

    it("throws when the createClaimableBalance operation failed", () => {
      const result = txResult(
        TransactionResultResult.txSuccess([
          OperationResult.opInner(
            OperationResultTr.createClaimableBalance(
              CreateClaimableBalanceResult.createClaimableBalanceUnderfunded(),
            ),
          ),
        ]),
      );

      expect(() => getClaimableBalanceIdFromResult(result, 0)).toThrow(
        /createClaimableBalanceUnderfunded/,
      );
    });
  });
  describe("input that is not a transaction result", () => {
    it.each([
      ["null", null],
      ["undefined", undefined],
      ["an empty object", {}],
      ["a null-prototype object", Object.create(null) as unknown],
      ["a number", 42],
      ["a boolean", true],
      ["an object whose result arm is missing", { result: null }],
    ])("throws a TypeError for %s", (_label, value) => {
      expect(() => callUntyped(value, 0)).toThrow(TypeError);
      expect(() => callUntyped(value, 0)).toThrow(/xdr\.TransactionResult/);
    });

    it("throws for an arm name without an operation results array", () => {
      expect(() => callUntyped({ result: { type: "txSuccess" } }, 0)).toThrow(
        /operation results are missing/,
      );
      expect(() =>
        callUntyped(
          {
            result: {
              type: "txFeeBumpInnerSuccess",
              innerResultPair: { result: { result: { type: "txSuccess" } } },
            },
          },
          0,
        ),
      ).toThrow(/operation results are missing/);
    });

    it("names the decode step when handed an undecoded base64 result", () => {
      const encoded = txResult(
        TransactionResultResult.txSuccess([balanceIdOpResult()]),
      ).toXdr("base64");

      expect(() => callUntyped(encoded, 0)).toThrow(/fromXdr/);
    });
  });
});
