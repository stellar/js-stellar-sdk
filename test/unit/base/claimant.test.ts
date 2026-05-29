import { describe, it, expect } from "vitest";
import { Claimant } from "../../../src/base/claimant.js";
import { StrKey } from "../../../src/base/strkey.js";
import * as xdr from "../../../src/xdr/index.js";
import { expectVariant } from "./support/xdr.js";

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
        /Predicate should be an xdr.ClaimPredicate/,
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
      const before = expectVariant(
        predicate,
        "claimPredicateBeforeAbsoluteTime",
      );
      expect(before.absBefore.toString()).toBe(time);
    });
  });

  describe("predicateBeforeRelativeTime()", () => {
    it("returns a `beforeRelativeTime` claim predicate", () => {
      const time = "86400";
      const predicate = Claimant.predicateBeforeRelativeTime(time);
      const before = expectVariant(
        predicate,
        "claimPredicateBeforeRelativeTime",
      );
      expect(before.relBefore.toString()).toBe(time);
    });
  });

  describe("predicateNot()", () => {
    it("returns a `not` claim predicate", () => {
      const time = "86400";
      const beforeRel = Claimant.predicateBeforeRelativeTime(time);
      const predicate = Claimant.predicateNot(beforeRel);
      const not = expectVariant(predicate, "claimPredicateNot");
      const inner = not.notPredicate;
      if (inner == null) {
        expect.fail("Expected notPredicate to be defined");
      }
      const innerRel = expectVariant(inner, "claimPredicateBeforeRelativeTime");
      expect(innerRel.relBefore.toString()).toBe(time);
    });
  });

  describe("predicateOr()", () => {
    it("returns an `or` claim predicate", () => {
      const left = Claimant.predicateBeforeRelativeTime("800");
      const right = Claimant.predicateBeforeRelativeTime("1200");
      const predicate = Claimant.predicateOr(left, right);
      const or = expectVariant(predicate, "claimPredicateOr");
      const [first, second] = or.orPredicates;
      const firstRel = expectVariant(
        first!,
        "claimPredicateBeforeRelativeTime",
      );
      const secondRel = expectVariant(
        second!,
        "claimPredicateBeforeRelativeTime",
      );
      expect(firstRel.relBefore.toString()).toBe("800");
      expect(secondRel.relBefore.toString()).toBe("1200");
    });
  });

  describe("predicateAnd()", () => {
    it("returns an `and` predicate claim predicate", () => {
      const left = Claimant.predicateBeforeRelativeTime("800");
      const right = Claimant.predicateBeforeRelativeTime("1200");
      const predicate = Claimant.predicateAnd(left, right);
      const and = expectVariant(predicate, "claimPredicateAnd");
      const [first, second] = and.andPredicates;
      const firstRel = expectVariant(
        first!,
        "claimPredicateBeforeRelativeTime",
      );
      const secondRel = expectVariant(
        second!,
        "claimPredicateBeforeRelativeTime",
      );
      expect(firstRel.relBefore.toString()).toBe("800");
      expect(secondRel.relBefore.toString()).toBe("1200");
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
      expect(claimant.predicate.type).toBe("claimPredicateUnconditional");
    });

    it("does not allow changes in predicate", () => {
      const claimant = new Claimant(DESTINATION);
      expect(() => {
        (claimant as any).predicate = null;
      }).toThrow(/Claimant is immutable/);
    });
  });

  describe("toXdrObject()", () => {
    it("returns a xdr.Claimant", () => {
      const claimant = new Claimant(DESTINATION);
      const xdrClaimant = claimant.toXdrObject();
      expect(xdrClaimant).toBeInstanceOf(xdr.Claimant);
      const v0 = expectVariant(xdrClaimant, "claimantTypeV0");
      const inner = v0.v0;
      const dest = expectVariant(inner.destination, "publicKeyTypeEd25519");
      expect(StrKey.encodeEd25519PublicKey(Buffer.from(dest.ed25519))).toBe(
        DESTINATION,
      );
      expect(inner.predicate.type).toBe("claimPredicateUnconditional");

      expect(() => xdrClaimant.toXdr()).not.toThrow();
    });
  });

  describe("fromXdr()", () => {
    it("returns a Claimant", () => {
      const claimant = new Claimant(DESTINATION);
      const hex = claimant.toXdrObject().toXdr("hex");
      const xdrClaimant = xdr.Claimant.fromXdr(hex, "hex");
      const fromXdr = Claimant.fromXdr(xdrClaimant);
      expect(fromXdr.destination).toBe(DESTINATION);
      expect(fromXdr.predicate.type).toBe("claimPredicateUnconditional");
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

  describe("fromXdr() with predicate", () => {
    it("preserves predicate through XDR roundtrip", () => {
      const predicate = Claimant.predicateBeforeAbsoluteTime("4102444800000");
      const claimant = new Claimant(DESTINATION, predicate);
      const hex = claimant.toXdrObject().toXdr("hex");
      const xdrClaimant = xdr.Claimant.fromXdr(hex, "hex");
      const fromXdr = Claimant.fromXdr(xdrClaimant);
      expect(fromXdr.destination).toBe(DESTINATION);
      const abs = expectVariant(
        fromXdr.predicate,
        "claimPredicateBeforeAbsoluteTime",
      );
      expect(abs.absBefore.toString()).toBe("4102444800000");
    });
  });
});
