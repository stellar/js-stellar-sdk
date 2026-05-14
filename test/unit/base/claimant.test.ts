import { describe, it, expect } from "vitest";
import { Claimant } from "../../../src/base/claimant.js";
import { StrKey } from "../../../src/base/strkey.js";
import xdr from "../../../src/base/xdr.js";

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
      expect(claimant.predicate.type).toBe("claimPredicateUnconditional");
    });

    it("throws an error if predicate is not an xdr.ClaimPredicate", () => {
      expect(() => new Claimant(DESTINATION, 3 as any)).toThrow(
        /Predicate should be an ClaimPredicate/,
      );
    });
  });

  describe("predicateUnconditional()", () => {
    it("returns an `unconditional` claim predicate", () => {
      const predicate = Claimant.predicateUnconditional();
      expect(predicate.type).toBe("claimPredicateUnconditional");
    });
  });

  describe("predicateBeforeAbsoluteTime()", () => {
    it("returns a `beforeAbsoluteTime` claim predicate", () => {
      const time = "4102444800000";
      const predicate = Claimant.predicateBeforeAbsoluteTime(time);
      expect(predicate.type).toBe("claimPredicateBeforeAbsoluteTime");
      if (predicate.type !== "claimPredicateBeforeAbsoluteTime") {
        throw new Error("Expected claimPredicateBeforeAbsoluteTime");
      }
      const value = predicate.absBefore;
      expect(value.toString()).toBe(time);
    });
  });

  describe("predicateBeforeRelativeTime()", () => {
    it("returns a `beforeRelativeTime` claim predicate", () => {
      const time = "86400";
      const predicate = Claimant.predicateBeforeRelativeTime(time);
      expect(predicate.type).toBe("claimPredicateBeforeRelativeTime");
      if (predicate.type !== "claimPredicateBeforeRelativeTime") {
        throw new Error("Expected claimPredicateBeforeRelativeTime");
      }
      const value = predicate.relBefore;
      expect(value.toString()).toBe(time);
    });
  });

  describe("predicateNot()", () => {
    it("returns a `not` claim predicate", () => {
      const time = "86400";
      const beforeRel = Claimant.predicateBeforeRelativeTime(time);
      const predicate = Claimant.predicateNot(beforeRel);
      expect(predicate.type).toBe("claimPredicateNot");
      if (predicate.type !== "claimPredicateNot") {
        throw new Error("Expected claimPredicateNot");
      }
      const notPred = predicate.notPredicate;
      if (notPred == null) {
        expect.fail("Expected notPredicate to be defined");
      }
      const value = notPred;
      if (value.type !== "claimPredicateBeforeRelativeTime") {
        expect.fail("Expected notPredicate value to be defined");
      }
      expect(value.relBefore.toString()).toBe(time);
    });
  });

  describe("predicateOr()", () => {
    it("returns an `or` claim predicate", () => {
      const left = Claimant.predicateBeforeRelativeTime("800");
      const right = Claimant.predicateBeforeRelativeTime("1200");
      const predicate = Claimant.predicateOr(left, right);
      expect(predicate.type).toBe("claimPredicateOr");
      if (predicate.type !== "claimPredicateOr") {
        expect.fail("Expected claimPredicateOr");
      }
      const predicates = predicate.orPredicates;
      const firstValue = predicates[0];
      const secondValue = predicates[1];
      if (firstValue == null || secondValue == null) {
        expect.fail("Expected or predicate values to be defined");
      }
      if (firstValue.type !== "claimPredicateBeforeRelativeTime") {
        expect.fail(
          "Expected first or predicate value to be claimPredicateBeforeRelativeTime",
        );
      }
      if (secondValue.type !== "claimPredicateBeforeRelativeTime") {
        expect.fail(
          "Expected second or predicate value to be claimPredicateBeforeRelativeTime",
        );
      }
      expect(firstValue.relBefore.toString()).toBe("800");
      expect(secondValue.relBefore.toString()).toBe("1200");
    });
  });

  describe("predicateAnd()", () => {
    it("returns an `and` predicate claim predicate", () => {
      const left = Claimant.predicateBeforeRelativeTime("800");
      const right = Claimant.predicateBeforeRelativeTime("1200");
      const predicate = Claimant.predicateAnd(left, right);
      expect(predicate.type).toBe("claimPredicateAnd");
      if (predicate.type !== "claimPredicateAnd") {
        expect.fail("Expected claimPredicateAnd");
      }
      const predicates = predicate.andPredicates;
      const firstValue = predicates[0];
      const secondValue = predicates[1];
      if (firstValue == null || secondValue == null) {
        expect.fail("Expected and predicate values to be defined");
      }
      if (firstValue.type !== "claimPredicateBeforeRelativeTime") {
        expect.fail(
          "Expected first and predicate value to be claimPredicateBeforeRelativeTime",
        );
      }
      if (secondValue.type !== "claimPredicateBeforeRelativeTime") {
        expect.fail(
          "Expected second and predicate value to be claimPredicateBeforeRelativeTime",
        );
      }
      expect(firstValue.relBefore.toString()).toBe("800");
      expect(secondValue.relBefore.toString()).toBe("1200");
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
      expect(claimant.predicate.type).toBe(
        Claimant.predicateUnconditional().type,
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
      expect(xdrClaimant.type).toBe("claimantTypeV0");
      if (xdrClaimant.type !== "claimantTypeV0") {
        expect.fail("Expected claimantTypeV0");
      }
      const value = xdrClaimant.v0;
      expect(
        StrKey.encodeEd25519PublicKey(Buffer.from(value.destination.ed25519)),
      ).toBe(DESTINATION);
      expect(value.predicate.type).toBe(Claimant.predicateUnconditional().type);

      expect(() => xdr.Claimant.toXDR(xdrClaimant)).not.toThrow();
    });
  });

  describe("fromXDR()", () => {
    it("returns a Claimant", () => {
      const claimant = new Claimant(DESTINATION);
      const hex = xdr.Claimant.toXDR(claimant.toXDRObject(), "hex");
      const xdrClaimant = xdr.Claimant.fromXDR(hex, "hex");
      const fromXDR = Claimant.fromXDR(xdrClaimant);
      expect(fromXDR.destination).toBe(DESTINATION);
      expect(fromXDR.predicate.type).toBe(
        Claimant.predicateUnconditional().type,
      );
    });
  });

  // Additional tests for uncovered branches
  describe("constructor with valid predicate", () => {
    it("accepts a valid xdr.ClaimPredicate", () => {
      const predicate = Claimant.predicateBeforeRelativeTime("86400");
      const claimant = new Claimant(DESTINATION, predicate);
      expect(claimant.destination).toBe(DESTINATION);
      expect(claimant.predicate.type).toBe("claimPredicateBeforeRelativeTime");
    });
  });

  describe("predicateAnd() validation", () => {
    it("throws when left is not an xdr.ClaimPredicate", () => {
      const right = Claimant.predicateUnconditional();
      expect(() => Claimant.predicateAnd("bad" as any, right)).toThrow(
        /left Predicate should be an ClaimPredicate/,
      );
    });

    it("throws when right is not an xdr.ClaimPredicate", () => {
      const left = Claimant.predicateUnconditional();
      expect(() => Claimant.predicateAnd(left, 42 as any)).toThrow(
        /right Predicate should be an ClaimPredicate/,
      );
    });
  });

  describe("predicateOr() validation", () => {
    it("throws when left is not an xdr.ClaimPredicate", () => {
      const right = Claimant.predicateUnconditional();
      expect(() => Claimant.predicateOr("bad" as any, right)).toThrow(
        /left Predicate should be an ClaimPredicate/,
      );
    });

    it("throws when right is not an xdr.ClaimPredicate", () => {
      const left = Claimant.predicateUnconditional();
      expect(() => Claimant.predicateOr(left, 42 as any)).toThrow(
        /right Predicate should be an ClaimPredicate/,
      );
    });
  });

  describe("predicateNot() validation", () => {
    it("throws when predicate is not an xdr.ClaimPredicate", () => {
      expect(() => Claimant.predicateNot("bad" as any)).toThrow(
        /Predicate should be an ClaimPredicate/,
      );
    });
  });

  describe("fromXDR() with predicate", () => {
    it("preserves predicate through XDR roundtrip", () => {
      const predicate = Claimant.predicateBeforeAbsoluteTime("4102444800000");
      const claimant = new Claimant(DESTINATION, predicate);
      const hex = xdr.Claimant.toXDR(claimant.toXDRObject(), "hex");
      const xdrClaimant = xdr.Claimant.fromXDR(hex, "hex");
      const fromXDR = Claimant.fromXDR(xdrClaimant);
      expect(fromXDR.destination).toBe(DESTINATION);
      if (fromXDR.predicate.type !== "claimPredicateBeforeAbsoluteTime") {
        expect.fail("Expected claimPredicateBeforeAbsoluteTime");
      }
      expect(fromXDR.predicate.absBefore.toString()).toBe("4102444800000");
    });
  });
});
