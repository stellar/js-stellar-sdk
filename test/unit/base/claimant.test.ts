import { describe, it, expect } from "vitest";
import { Claimant } from "../../src/claimant.js";
import { StrKey } from "../../src/strkey.js";
import xdr from "../../src/xdr.js";

const DESTINATION = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";

describe("Claimant", () => {
  describe("constructor", () => {
    it("throws an error when destination is invalid", () => {
      expect(() => new Claimant("GCEZWKCA5", undefined as any)).toThrow(
        /Destination is invalid/,
      );
    });

    it("defaults to unconditional if predicate is undefined", () => {
      const claimant = new Claimant(DESTINATION);
      expect(claimant.predicate.switch()).toBe(
        xdr.ClaimPredicateType.claimPredicateUnconditional(),
      );
    });

    it("throws an error if predicate is not an xdr.ClaimPredicate", () => {
      expect(() => new Claimant(DESTINATION, 3 as any)).toThrow(
        /Predicate should be an xdr.ClaimPredicate/,
      );
    });
  });

  describe("predicateUnconditional()", () => {
    it("returns an `unconditional` claim predicate", () => {
      const predicate = Claimant.predicateUnconditional();
      expect(predicate.switch()).toBe(
        xdr.ClaimPredicateType.claimPredicateUnconditional(),
      );
    });
  });

  describe("predicateBeforeAbsoluteTime()", () => {
    it("returns a `beforeAbsoluteTime` claim predicate", () => {
      const time = "4102444800000";
      const predicate = Claimant.predicateBeforeAbsoluteTime(time);
      expect(predicate.switch()).toBe(
        xdr.ClaimPredicateType.claimPredicateBeforeAbsoluteTime(),
      );
      const value = predicate.absBefore();
      expect(value.toString()).toBe(time);
    });
  });

  describe("predicateBeforeRelativeTime()", () => {
    it("returns a `beforeRelativeTime` claim predicate", () => {
      const time = "86400";
      const predicate = Claimant.predicateBeforeRelativeTime(time);
      expect(predicate.switch()).toBe(
        xdr.ClaimPredicateType.claimPredicateBeforeRelativeTime(),
      );
      const value = predicate.relBefore();
      expect(value.toString()).toBe(time);
    });
  });

  describe("predicateNot()", () => {
    it("returns a `not` claim predicate", () => {
      const time = "86400";
      const beforeRel = Claimant.predicateBeforeRelativeTime(time);
      const predicate = Claimant.predicateNot(beforeRel);
      expect(predicate.switch()).toBe(
        xdr.ClaimPredicateType.claimPredicateNot(),
      );
      const notPred = predicate.notPredicate();
      if (notPred == null) {
        expect.fail("Expected notPredicate to be defined");
      }
      const value = notPred.value();
      if (value == null) {
        expect.fail("Expected notPredicate value to be defined");
      }
      expect(value.toString()).toBe(time);
    });
  });

  describe("predicateOr()", () => {
    it("returns an `or` claim predicate", () => {
      const left = Claimant.predicateBeforeRelativeTime("800");
      const right = Claimant.predicateBeforeRelativeTime("1200");
      const predicate = Claimant.predicateOr(left, right);
      expect(predicate.switch()).toBe(
        xdr.ClaimPredicateType.claimPredicateOr(),
      );
      const predicates = predicate.orPredicates();
      const firstValue = predicates[0]?.value();
      const secondValue = predicates[1]?.value();
      if (firstValue == null || secondValue == null) {
        expect.fail("Expected or predicate values to be defined");
      }
      expect(firstValue.toString()).toBe("800");
      expect(secondValue.toString()).toBe("1200");
    });
  });

  describe("predicateAnd()", () => {
    it("returns an `and` predicate claim predicate", () => {
      const left = Claimant.predicateBeforeRelativeTime("800");
      const right = Claimant.predicateBeforeRelativeTime("1200");
      const predicate = Claimant.predicateAnd(left, right);
      expect(predicate.switch()).toBe(
        xdr.ClaimPredicateType.claimPredicateAnd(),
      );
      const predicates = predicate.andPredicates();
      const firstValue = predicates[0]?.value();
      const secondValue = predicates[1]?.value();
      if (firstValue == null || secondValue == null) {
        expect.fail("Expected and predicate values to be defined");
      }
      expect(firstValue.toString()).toBe("800");
      expect(secondValue.toString()).toBe("1200");
    });
  });

  describe("destination", () => {
    it("returns the destination accountID", () => {
      const claimant = new Claimant(DESTINATION);
      expect(claimant.destination).toBe(DESTINATION);
    });

    it("does not allow changes in accountID", () => {
      const claimant = new Claimant(DESTINATION);
      expect(() => {
        (claimant as any).destination = "32323";
      }).toThrow(/Claimant is immutable/);
    });
  });

  describe("predicate", () => {
    it("returns the predicate", () => {
      const claimant = new Claimant(DESTINATION);
      expect(claimant.predicate.switch()).toBe(
        Claimant.predicateUnconditional().switch(),
      );
    });

    it("does not allow changes in predicate", () => {
      const claimant = new Claimant(DESTINATION);
      expect(() => {
        (claimant as any).predicate = null;
      }).toThrow(/Claimant is immutable/);
    });
  });

  describe("toXDRObject()", () => {
    it("returns a xdr.Claimant", () => {
      const claimant = new Claimant(DESTINATION);
      const xdrClaimant = claimant.toXDRObject();
      expect(xdrClaimant).toBeInstanceOf(xdr.Claimant);
      expect(xdrClaimant.switch()).toBe(xdr.ClaimantType.claimantTypeV0());
      const value = xdrClaimant.value();
      expect(StrKey.encodeEd25519PublicKey(value.destination().ed25519())).toBe(
        DESTINATION,
      );
      expect(value.predicate().switch()).toBe(
        Claimant.predicateUnconditional().switch(),
      );

      expect(() => xdrClaimant.toXDR()).not.toThrow();
    });
  });

  describe("fromXDR()", () => {
    it("returns a Claimant", () => {
      const claimant = new Claimant(DESTINATION);
      const hex = claimant.toXDRObject().toXDR("hex");
      const xdrClaimant = xdr.Claimant.fromXDR(hex, "hex");
      const fromXDR = Claimant.fromXDR(xdrClaimant);
      expect(fromXDR.destination).toBe(DESTINATION);
      expect(fromXDR.predicate.switch()).toBe(
        Claimant.predicateUnconditional().switch(),
      );
    });
  });

  // Additional tests for uncovered branches
  describe("constructor with valid predicate", () => {
    it("accepts a valid xdr.ClaimPredicate", () => {
      const predicate = Claimant.predicateBeforeRelativeTime("86400");
      const claimant = new Claimant(DESTINATION, predicate);
      expect(claimant.destination).toBe(DESTINATION);
      expect(claimant.predicate.switch()).toBe(
        xdr.ClaimPredicateType.claimPredicateBeforeRelativeTime(),
      );
    });
  });

  describe("predicateAnd() validation", () => {
    it("throws when left is not an xdr.ClaimPredicate", () => {
      const right = Claimant.predicateUnconditional();
      expect(() => Claimant.predicateAnd("bad" as any, right)).toThrow(
        /left Predicate should be an xdr.ClaimPredicate/,
      );
    });

    it("throws when right is not an xdr.ClaimPredicate", () => {
      const left = Claimant.predicateUnconditional();
      expect(() => Claimant.predicateAnd(left, 42 as any)).toThrow(
        /right Predicate should be an xdr.ClaimPredicate/,
      );
    });
  });

  describe("predicateOr() validation", () => {
    it("throws when left is not an xdr.ClaimPredicate", () => {
      const right = Claimant.predicateUnconditional();
      expect(() => Claimant.predicateOr("bad" as any, right)).toThrow(
        /left Predicate should be an xdr.ClaimPredicate/,
      );
    });

    it("throws when right is not an xdr.ClaimPredicate", () => {
      const left = Claimant.predicateUnconditional();
      expect(() => Claimant.predicateOr(left, 42 as any)).toThrow(
        /right Predicate should be an xdr.ClaimPredicate/,
      );
    });
  });

  describe("predicateNot() validation", () => {
    it("throws when predicate is not an xdr.ClaimPredicate", () => {
      expect(() => Claimant.predicateNot("bad" as any)).toThrow(
        /Predicate should be an xdr.ClaimPredicate/,
      );
    });
  });

  describe("fromXDR() with predicate", () => {
    it("preserves predicate through XDR roundtrip", () => {
      const predicate = Claimant.predicateBeforeAbsoluteTime("4102444800000");
      const claimant = new Claimant(DESTINATION, predicate);
      const hex = claimant.toXDRObject().toXDR("hex");
      const xdrClaimant = xdr.Claimant.fromXDR(hex, "hex");
      const fromXDR = Claimant.fromXDR(xdrClaimant);
      expect(fromXDR.destination).toBe(DESTINATION);
      expect(fromXDR.predicate.switch()).toBe(
        xdr.ClaimPredicateType.claimPredicateBeforeAbsoluteTime(),
      );
      expect(fromXDR.predicate.absBefore().toString()).toBe("4102444800000");
    });
  });
});
