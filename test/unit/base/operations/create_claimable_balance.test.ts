import { describe, it, expect } from "vitest";
import { Operation } from "../../../../src/base/operation.js";
import { Asset } from "../../../../src/base/asset.js";
import { Claimant } from "../../../../src/base/claimant.js";
import * as xdr from "../../../../src/xdr/index.js";
import { expectDefined } from "../support/expect_defined.js";
import { expectOperationType } from "../support/operation.js";

const asset = new Asset(
  "USD",
  "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
);
const amount = "100.0000000";
const claimants = [
  new Claimant("GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ"),
];

describe("Operation.createClaimableBalance()", () => {
  it("creates a createClaimableBalanceOp", () => {
    const op = Operation.createClaimableBalance({ asset, amount, claimants });
    const xdrHex = op.toXdr("hex");
    const operation = xdr.Operation.fromXdr(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXdrObject(operation),
      "createClaimableBalance",
    );

    expect(obj.asset.toString()).toBe(asset.toString());
    expect(obj.amount).toBe(amount);
    expect(obj.claimants).toHaveLength(1);

    const firstClaimant = expectDefined(obj.claimants[0]);
    const expectedClaimant = expectDefined(claimants[0]);

    expect(firstClaimant.toXdrObject().toXdr("hex")).toBe(
      expectedClaimant.toXdrObject().toXdr("hex"),
    );
  });

  it("throws when asset is not provided", () => {
    expect(() =>
      // @ts-expect-error: intentionally omitting required field to test runtime validation
      Operation.createClaimableBalance({ amount, claimants }),
    ).toThrow(/must provide an asset for create claimable balance operation/);
  });

  it("throws when amount is not provided", () => {
    expect(() =>
      // @ts-expect-error: intentionally omitting required field to test runtime validation
      Operation.createClaimableBalance({ asset, claimants }),
    ).toThrow(
      /amount argument must be of type String, represent a positive number and have at most 7 digits after the decimal/,
    );
  });

  it("throws when claimants is not provided", () => {
    expect(() =>
      // @ts-expect-error: intentionally omitting required field to test runtime validation
      Operation.createClaimableBalance({ asset, amount }),
    ).toThrow(/must provide at least one claimant/);
  });

  it("throws when claimants is an empty array", () => {
    expect(() =>
      Operation.createClaimableBalance({ asset, amount, claimants: [] }),
    ).toThrow(/must provide at least one claimant/);
  });

  it("preserves an optional source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.createClaimableBalance({
      asset,
      amount,
      claimants,
      source,
    });

    const obj = expectOperationType(
      Operation.fromXdrObject(xdr.Operation.fromXdr(op.toXdr("hex"), "hex")),
      "createClaimableBalance",
    );

    expect(obj.source).toBe(source);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.createClaimableBalance({ asset, amount, claimants });
    const hex = op.toXdr("hex");
    const roundtripped = xdr.Operation.fromXdr(hex, "hex");
    expect(roundtripped.body.type).toBe("createClaimableBalance");
  });

  describe("rejects what stellar-core rejects", () => {
    const other = "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7";
    const first = expectDefined(claimants[0]);

    const nest = (levels: number) => {
      let predicate = Claimant.predicateUnconditional();
      for (let i = 0; i < levels; i += 1) {
        predicate = Claimant.predicateNot(predicate);
      }
      return predicate;
    };

    it("throws on a duplicate claimant destination", () => {
      expect(() =>
        Operation.createClaimableBalance({
          asset,
          amount,
          claimants: [first, new Claimant(first.destination)],
        }),
      ).toThrow(/duplicate claimant destination/);
    });

    it("accepts distinct claimant destinations", () => {
      expect(() =>
        Operation.createClaimableBalance({
          asset,
          amount,
          claimants: [first, new Claimant(other)],
        }),
      ).not.toThrow();
    });

    it("throws on a predicate nested more than four levels deep", () => {
      expect(() =>
        Operation.createClaimableBalance({
          asset,
          amount,
          claimants: [new Claimant(first.destination, nest(4))],
        }),
      ).toThrow(/nested deeper than 4 levels/);
    });

    it("accepts a predicate nested exactly four levels deep", () => {
      expect(() =>
        Operation.createClaimableBalance({
          asset,
          amount,
          claimants: [
            new Claimant(
              first.destination,
              Claimant.predicateAnd(
                Claimant.predicateOr(
                  Claimant.predicateNot(Claimant.predicateUnconditional()),
                  Claimant.predicateUnconditional(),
                ),
                Claimant.predicateUnconditional(),
              ),
            ),
          ],
        }),
      ).not.toThrow();
    });

    it("throws on a negative absBefore", () => {
      expect(() =>
        Operation.createClaimableBalance({
          asset,
          amount,
          claimants: [
            new Claimant(
              first.destination,
              Claimant.predicateBeforeAbsoluteTime("-1"),
            ),
          ],
        }),
      ).toThrow(/absBefore must not be negative/);
    });

    it("throws on a negative relBefore", () => {
      expect(() =>
        Operation.createClaimableBalance({
          asset,
          amount,
          claimants: [
            new Claimant(
              first.destination,
              Claimant.predicateBeforeRelativeTime("-1"),
            ),
          ],
        }),
      ).toThrow(/relBefore must not be negative/);
    });

    it("accepts a zero absBefore", () => {
      expect(() =>
        Operation.createClaimableBalance({
          asset,
          amount,
          claimants: [
            new Claimant(
              first.destination,
              Claimant.predicateBeforeAbsoluteTime("0"),
            ),
          ],
        }),
      ).not.toThrow();
    });

    it("throws when and holds fewer than two predicates", () => {
      expect(() =>
        Operation.createClaimableBalance({
          asset,
          amount,
          claimants: [
            new Claimant(
              first.destination,
              xdr.ClaimPredicate.claimPredicateAnd([
                Claimant.predicateUnconditional(),
              ]),
            ),
          ],
        }),
      ).toThrow(/claimPredicateAnd requires exactly two predicates, got 1/);
    });

    it("throws when or holds fewer than two predicates", () => {
      expect(() =>
        Operation.createClaimableBalance({
          asset,
          amount,
          claimants: [
            new Claimant(
              first.destination,
              xdr.ClaimPredicate.claimPredicateOr([]),
            ),
          ],
        }),
      ).toThrow(/claimPredicateOr requires exactly two predicates, got 0/);
    });

    it("throws when not holds no predicate", () => {
      expect(() =>
        Operation.createClaimableBalance({
          asset,
          amount,
          claimants: [
            new Claimant(
              first.destination,
              xdr.ClaimPredicate.claimPredicateNot(null),
            ),
          ],
        }),
      ).toThrow(/claimPredicateNot requires a predicate/);
    });
  });
});
