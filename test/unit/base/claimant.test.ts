import { describe, it, expect } from "vitest";
import {
  Claimant,
  type HorizonPredicateJson,
} from "../../../src/base/claimant.js";
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
      expect(
        StrKey.encodeEd25519PublicKey(new Uint8Array(dest.ed25519.toBytes())),
      ).toBe(DESTINATION);
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

  // Issue #588 — Horizon's JSON dialect only. SEP-0051 (what RPC serves) is
  // already handled by `toJson`/`fromJson`; the two are pinned to one meaning
  // by the cross-dialect test at the bottom.

  describe("predicateFromHorizonJson()", () => {
    it("reads `unconditional: true`", () => {
      const predicate = Claimant.predicateFromHorizonJson({
        unconditional: true,
      });
      expect(predicate.type).toBe("claimPredicateUnconditional");
    });

    it("reads `abs_before_epoch`", () => {
      const predicate = Claimant.predicateFromHorizonJson({
        abs_before_epoch: "4102444800",
      });
      const abs = expectVariant(predicate, "claimPredicateBeforeAbsoluteTime");
      expect(abs.absBefore.toString()).toBe("4102444800");
    });

    it("converts an ISO-8601 `abs_before` to epoch seconds", () => {
      // Guards passing the ISO string through, and the missing /1000.
      const predicate = Claimant.predicateFromHorizonJson({
        abs_before: "2100-01-01T00:00:00Z",
      });
      const abs = expectVariant(predicate, "claimPredicateBeforeAbsoluteTime");
      expect(abs.absBefore.toString()).toBe("4102444800");
    });

    it("reads `rel_before`", () => {
      const predicate = Claimant.predicateFromHorizonJson({
        rel_before: "3600",
      });
      const rel = expectVariant(predicate, "claimPredicateBeforeRelativeTime");
      expect(rel.relBefore.toString()).toBe("3600");
    });

    it("prefers `abs_before_epoch` when both time keys are present", () => {
      // Horizon always sends both. The epoch field cannot lose range.
      const predicate = Claimant.predicateFromHorizonJson({
        abs_before: "2100-01-01T00:00:00Z",
        abs_before_epoch: "4102444800",
      });
      const abs = expectVariant(predicate, "claimPredicateBeforeAbsoluteTime");
      expect(abs.absBefore.toString()).toBe("4102444800");
    });

    it("prefers `abs_before_epoch` even when the two disagree", () => {
      const predicate = Claimant.predicateFromHorizonJson({
        abs_before: "2100-01-01T00:00:00Z",
        abs_before_epoch: "1700000000",
      });
      const abs = expectVariant(predicate, "claimPredicateBeforeAbsoluteTime");
      expect(abs.absBefore.toString()).toBe("1700000000");
    });

    it("reads a `not`", () => {
      const predicate = Claimant.predicateFromHorizonJson({
        not: { rel_before: "3600" },
      });
      const not = expectVariant(predicate, "claimPredicateNot");
      const inner = not.notPredicate;
      if (inner == null) {
        expect.fail("Expected notPredicate to be defined");
      }
      const rel = expectVariant(inner, "claimPredicateBeforeRelativeTime");
      expect(rel.relBefore.toString()).toBe("3600");
    });

    it("reads the most common real Horizon shape", () => {
      // 57 of 1,995 sampled mainnet claimants, and `unconditional` is the
      // key HorizonApi.Predicate omitted.
      const predicate = Claimant.predicateFromHorizonJson({
        not: { unconditional: true },
      });
      const not = expectVariant(predicate, "claimPredicateNot");
      const inner = not.notPredicate;
      if (inner == null) {
        expect.fail("Expected notPredicate to be defined");
      }
      expect(inner.type).toBe("claimPredicateUnconditional");
    });

    it("reads an `and` with exactly 2 sub-predicates", () => {
      const predicate = Claimant.predicateFromHorizonJson({
        and: [{ rel_before: "800" }, { rel_before: "1200" }],
      });
      const and = expectVariant(predicate, "claimPredicateAnd");
      expect(and.andPredicates.length).toBe(2);
      const [first, second] = and.andPredicates;
      if (first == null || second == null) {
        expect.fail("Expected 2 sub-predicates");
      }
      expect(
        expectVariant(
          first,
          "claimPredicateBeforeRelativeTime",
        ).relBefore.toString(),
      ).toBe("800");
      expect(
        expectVariant(
          second,
          "claimPredicateBeforeRelativeTime",
        ).relBefore.toString(),
      ).toBe("1200");
    });

    it("reads an `or` with exactly 2 sub-predicates", () => {
      const predicate = Claimant.predicateFromHorizonJson({
        or: [{ rel_before: "800" }, { unconditional: true }],
      });
      const or = expectVariant(predicate, "claimPredicateOr");
      expect(or.orPredicates.length).toBe(2);
    });

    it("accepts a tree 4 nodes deep", () => {
      // core counts the top-level predicate as depth 1 and rejects depth > 4.
      const predicate = Claimant.predicateFromHorizonJson({
        not: { not: { not: { unconditional: true } } },
      });
      expect(predicate.type).toBe("claimPredicateNot");
    });

    describe("rejects what stellar-core would reject", () => {
      it("throws on a tree 5 nodes deep", () => {
        expect(() =>
          Claimant.predicateFromHorizonJson({
            not: { not: { not: { not: { unconditional: true } } } },
          }),
        ).toThrow(/nested more than 4 levels deep/);
      });

      it.each([
        ["0", [] as HorizonPredicateJson[]],
        ["1", [{ unconditional: true }]],
        [
          "3",
          [
            { unconditional: true },
            { unconditional: true },
            { unconditional: true },
          ],
        ],
      ])("throws on an `and` of arity %s", (_label, and) => {
        expect(() => Claimant.predicateFromHorizonJson({ and })).toThrow(
          /and must have exactly 2 sub-predicates/,
        );
      });

      it("throws on an `or` of the wrong arity", () => {
        expect(() =>
          Claimant.predicateFromHorizonJson({ or: [{ unconditional: true }] }),
        ).toThrow(/or must have exactly 2 sub-predicates/);
      });

      it("throws on a negative `rel_before`", () => {
        expect(() =>
          Claimant.predicateFromHorizonJson({ rel_before: "-1" }),
        ).toThrow(/rel_before must not be negative/);
      });

      it("throws on a negative `abs_before_epoch`", () => {
        expect(() =>
          Claimant.predicateFromHorizonJson({ abs_before_epoch: "-1" }),
        ).toThrow(/abs_before_epoch must not be negative/);
      });

      it("throws on a `not` with a null sub-predicate", () => {
        // XDR models the child as an option, so null is representable.
        expect(() =>
          Claimant.predicateFromHorizonJson({
            not: null as unknown as HorizonPredicateJson,
          }),
        ).toThrow(/not must have a sub-predicate/);
      });
    });

    describe("fails closed on an unrecognized object", () => {
      // Go falls through to the zero value, which is UNCONDITIONAL — the
      // least restrictive predicate. A typo meaning "anytime" fails open.
      it.each([
        ["an empty object", {}],
        ["`unconditional: false`", { unconditional: false }],
        ["an unknown key only", { abs_after: "1700000000" }],
        ["an unknown key beside a valid one", { unconditional: true, oops: 1 }],
        [
          "two unrelated sibling keys",
          { rel_before: "1", unconditional: true },
        ],
      ])("throws on %s", (_label, json) => {
        expect(() =>
          Claimant.predicateFromHorizonJson(json as HorizonPredicateJson),
        ).toThrow(/must have exactly one of/);
      });
    });

    describe("rejects time strings that Int64.fromString would silently coerce", () => {
      // Int64.fromString("") is 0, so an empty epoch would mean "before 1970".
      it.each([
        ["an empty string", ""],
        ["leading whitespace", "  12"],
        ["a non-numeric string", "abc"],
        ["a decimal", "1.5"],
      ])("throws on %s", (_label, abs_before_epoch) => {
        expect(() =>
          Claimant.predicateFromHorizonJson({ abs_before_epoch }),
        ).toThrow(/abs_before_epoch must be a decimal integer string/);
      });

      it("throws on a JSON number where a string is required", () => {
        expect(() =>
          Claimant.predicateFromHorizonJson({
            rel_before: 3600 as unknown as string,
          }),
        ).toThrow(/rel_before must be a decimal integer string/);
      });
    });

    describe("rejects a bigint without leaking a raw TypeError", () => {
      // int64 fields invite BigInt, so the rejection must be our own Error,
      // not a TypeError thrown while formatting the message.
      it.each([
        ["abs_before_epoch", { abs_before_epoch: 1n }],
        ["rel_before", { rel_before: 10n }],
      ])("throws an Error naming %s", (field, json) => {
        const call = () =>
          Claimant.predicateFromHorizonJson(
            json as unknown as HorizonPredicateJson,
          );
        expect(call).toThrow(
          new RegExp(`${field} must be a decimal integer string`),
        );
        expect(call).not.toThrow(TypeError);
      });

      it("throws an Error when the predicate itself is a bigint", () => {
        const call = () =>
          Claimant.predicateFromHorizonJson(
            1n as unknown as HorizonPredicateJson,
          );
        expect(call).toThrow(/claim predicate must be an object/);
        expect(call).not.toThrow(TypeError);
      });
    });

    it("names the shape, not a phantom count, for a non-array `and`", () => {
      expect(() =>
        Claimant.predicateFromHorizonJson({
          and: "nope" as unknown as HorizonPredicateJson[],
        }),
      ).toThrow(/and must be an array of 2 sub-predicates/);
    });

    it("throws when `abs_before` is unrepresentable and no epoch is given", () => {
      // int64 seconds outrange Date, so Date.parse gives NaN.
      expect(() =>
        Claimant.predicateFromHorizonJson({
          abs_before: "+275770-09-13T00:00:00Z",
        }),
      ).toThrow(/abs_before .* is not a representable date/);
    });
  });

  describe("predicateToHorizonJson()", () => {
    it("writes `unconditional: true`", () => {
      expect(
        Claimant.predicateToHorizonJson(Claimant.predicateUnconditional()),
      ).toEqual({ unconditional: true });
    });

    it("writes both `abs_before` and `abs_before_epoch`", () => {
      // Go emits both; Horizon never sends one without the other.
      expect(
        Claimant.predicateToHorizonJson(
          Claimant.predicateBeforeAbsoluteTime("4102444800"),
        ),
      ).toEqual({
        abs_before: "2100-01-01T00:00:00Z",
        abs_before_epoch: "4102444800",
      });
    });

    it("writes `rel_before`", () => {
      expect(
        Claimant.predicateToHorizonJson(
          Claimant.predicateBeforeRelativeTime("3600"),
        ),
      ).toEqual({ rel_before: "3600" });
    });

    it("writes a `not`", () => {
      expect(
        Claimant.predicateToHorizonJson(
          Claimant.predicateNot(Claimant.predicateUnconditional()),
        ),
      ).toEqual({ not: { unconditional: true } });
    });

    it("recurses into nested composites", () => {
      const predicate = Claimant.predicateAnd(
        Claimant.predicateOr(
          Claimant.predicateBeforeRelativeTime("800"),
          Claimant.predicateUnconditional(),
        ),
        Claimant.predicateNot(
          Claimant.predicateBeforeAbsoluteTime("4102444800"),
        ),
      );
      expect(Claimant.predicateToHorizonJson(predicate)).toEqual({
        and: [
          { or: [{ rel_before: "800" }, { unconditional: true }] },
          {
            not: {
              abs_before: "2100-01-01T00:00:00Z",
              abs_before_epoch: "4102444800",
            },
          },
        ],
      });
    });

    describe("refuses to emit a predicate stellar-core would reject", () => {
      // The xdr factories accept all of these, so they are reachable.
      it("throws on a 0-arity `and`", () => {
        expect(() =>
          Claimant.predicateToHorizonJson(
            xdr.ClaimPredicate.claimPredicateAnd([]),
          ),
        ).toThrow(/and must have exactly 2 sub-predicates/);
      });

      it("throws on a 1-arity `or`", () => {
        expect(() =>
          Claimant.predicateToHorizonJson(
            xdr.ClaimPredicate.claimPredicateOr([
              xdr.ClaimPredicate.claimPredicateUnconditional(),
            ]),
          ),
        ).toThrow(/or must have exactly 2 sub-predicates/);
      });

      it("throws on a `not` with a null sub-predicate", () => {
        expect(() =>
          Claimant.predicateToHorizonJson(
            xdr.ClaimPredicate.claimPredicateNot(
              null as unknown as xdr.ClaimPredicate,
            ),
          ),
        ).toThrow(/not must have a sub-predicate/);
      });

      it("throws on a tree 5 nodes deep", () => {
        let predicate = Claimant.predicateUnconditional();
        for (let i = 0; i < 4; i++) {
          predicate = Claimant.predicateNot(predicate);
        }
        expect(() => Claimant.predicateToHorizonJson(predicate)).toThrow(
          /nested more than 4 levels deep/,
        );
      });

      it("throws on a negative time", () => {
        expect(() =>
          Claimant.predicateToHorizonJson(
            Claimant.predicateBeforeRelativeTime("-1"),
          ),
        ).toThrow(/rel_before must not be negative/);
      });

      it("throws on a time member of the wrong type", () => {
        // Duck-typed input: BigInt("1.5") would leak a raw SyntaxError.
        const call = () =>
          Claimant.predicateToHorizonJson({
            type: "claimPredicateBeforeAbsoluteTime",
            absBefore: 1.5,
          } as unknown as xdr.ClaimPredicate);
        expect(call).toThrow(/abs_before_epoch must be a bigint/);
        expect(call).not.toThrow(SyntaxError);
      });
    });
  });

  describe("predicateToHorizonJson() accepts predicates from another build", () => {
    // The CJS and ESM builds carry distinct class objects, so `instanceof`
    // would reject a valid predicate that crossed between them.
    it("renders a structurally valid predicate that is not an instance", () => {
      const foreign = { type: "claimPredicateUnconditional" };
      expect(
        Claimant.predicateToHorizonJson(
          foreign as unknown as xdr.ClaimPredicate,
        ),
      ).toEqual({ unconditional: true });
    });

    it("still throws its own Error when a needed member is missing", () => {
      expect(() =>
        Claimant.predicateToHorizonJson({
          type: "claimPredicateAnd",
        } as unknown as xdr.ClaimPredicate),
      ).toThrow(/and must be an array of 2 sub-predicates/);
    });

    it("still throws its own Error when a time member is missing", () => {
      expect(() =>
        Claimant.predicateToHorizonJson({
          type: "claimPredicateBeforeRelativeTime",
        } as unknown as xdr.ClaimPredicate),
      ).toThrow(/rel_before is missing/);
    });
  });

  describe("absolute times outside the JS Date range", () => {
    it("emits the epoch alone when no ISO form exists", () => {
      // Date tops out near 8.64e12 seconds, but core accepts any non-negative
      // int64, so dropping `abs_before` beats refusing to render at all.
      expect(
        Claimant.predicateToHorizonJson(
          Claimant.predicateBeforeAbsoluteTime("9223372036854775807"),
        ),
      ).toEqual({ abs_before_epoch: "9223372036854775807" });
    });

    it("still emits both keys at the last representable second", () => {
      expect(
        Claimant.predicateToHorizonJson(
          Claimant.predicateBeforeAbsoluteTime("8640000000000"),
        ),
      ).toEqual({
        abs_before: "+275760-09-13T00:00:00Z",
        abs_before_epoch: "8640000000000",
      });
    });

    it("round-trips an epoch that has no ISO form", () => {
      const json = { abs_before_epoch: "9223372036854775807" };
      const predicate = Claimant.predicateFromHorizonJson(json);
      expect(Claimant.predicateToHorizonJson(predicate)).toEqual(json);
    });
  });

  describe("expanded years match Go's format", () => {
    // Go: `ts := Format(RFC3339); if Year() > 9999 { ts = "+" + ts }` — so the
    // year is unpadded. JS toISOString pads it to 6 digits and Date.parse
    // accepts only that padded form.
    it("emits an unpadded expanded year, as Horizon does", () => {
      expect(
        Claimant.predicateToHorizonJson(
          Claimant.predicateBeforeAbsoluteTime("253402300800"),
        ),
      ).toEqual({
        abs_before: "+10000-01-01T00:00:00Z",
        abs_before_epoch: "253402300800",
      });
    });

    it("reads Horizon's unpadded expanded year", () => {
      const predicate = Claimant.predicateFromHorizonJson({
        abs_before: "+10000-01-01T00:00:00Z",
      });
      const abs = expectVariant(predicate, "claimPredicateBeforeAbsoluteTime");
      expect(abs.absBefore.toString()).toBe("253402300800");
    });

    it("reads an unsigned expanded year, as Go's reader accepts", () => {
      // Go: `^([-+]?\d{4,})-…`. ES needs a sign and exactly 6 digits, so
      // neither "10000-…" nor "+10000-…" parses without normalizing.
      const predicate = Claimant.predicateFromHorizonJson({
        abs_before: "10000-01-01T00:00:00Z",
      });
      const abs = expectVariant(predicate, "claimPredicateBeforeAbsoluteTime");
      expect(abs.absBefore.toString()).toBe("253402300800");
    });

    it("round-trips an expanded year", () => {
      const json = {
        abs_before: "+10000-01-01T00:00:00Z",
        abs_before_epoch: "253402300800",
      };
      expect(
        Claimant.predicateToHorizonJson(
          Claimant.predicateFromHorizonJson(json),
        ),
      ).toEqual(json);
    });
  });

  describe("`abs_before` requires an explicit timezone", () => {
    // Date.parse resolves an offset-less timestamp in the host timezone, so the
    // same JSON would mean different instants on different machines. Go rejects
    // these too: it parses with time.RFC3339, where the offset is mandatory.
    it.each([
      ["no timezone", "2100-01-01T00:00:00"],
      ["date only", "2100-01-01"],
      ["not a timestamp", "tomorrow"],
    ])("throws on %s", (_label, abs_before) => {
      expect(() => Claimant.predicateFromHorizonJson({ abs_before })).toThrow(
        /abs_before must be an ISO-8601 timestamp with a timezone/,
      );
    });

    it.each([
      ["Z", "2100-01-01T00:00:00Z", "4102444800"],
      ["a positive offset", "2100-01-01T00:00:00+02:00", "4102437600"],
      ["a negative offset", "2100-01-01T00:00:00-05:00", "4102462800"],
      ["fractional seconds", "2100-01-01T00:00:00.500Z", "4102444800"],
    ])("accepts %s", (_label, abs_before, epoch) => {
      const predicate = Claimant.predicateFromHorizonJson({ abs_before });
      const abs = expectVariant(predicate, "claimPredicateBeforeAbsoluteTime");
      expect(abs.absBefore.toString()).toBe(epoch);
    });
  });

  describe("int64 range is enforced in both directions", () => {
    // The arm factories do not range-check, so an out-of-range predicate is
    // reachable from public API — only `toXdr()` rejects it later.
    it("refuses to render a time outside int64", () => {
      expect(() =>
        Claimant.predicateToHorizonJson(
          xdr.ClaimPredicate.claimPredicateBeforeAbsoluteTime(
            (10n ** 20n) as never,
          ),
        ),
      ).toThrow(/abs_before_epoch must be within int64 range/);
    });

    it("names the field when reading a time outside int64", () => {
      // `Int64.fromString` raises an XdrError that never names the field.
      expect(() =>
        Claimant.predicateFromHorizonJson({
          abs_before_epoch: "100000000000000000000",
        }),
      ).toThrow(/abs_before_epoch must be within int64 range/);
    });

    it("still accepts int64 max in both directions", () => {
      const json = { abs_before_epoch: "9223372036854775807" };
      expect(
        Claimant.predicateToHorizonJson(
          Claimant.predicateFromHorizonJson(json),
        ),
      ).toEqual(json);
    });
  });

  describe("time members are not coerced", () => {
    // `String(value)` would turn `[1]` into "1"; the real member is a bigint.
    it.each([
      ["an array", [1]],
      ["a boxed string", new String("5")],
      ["a numeric string", "5"],
    ])("throws on %s", (_label, absBefore) => {
      expect(() =>
        Claimant.predicateToHorizonJson({
          type: "claimPredicateBeforeAbsoluteTime",
          absBefore,
        } as unknown as xdr.ClaimPredicate),
      ).toThrow(/abs_before_epoch must be a bigint/);
    });
  });

  describe("Horizon JSON round-trips", () => {
    it("preserves a real Horizon response fixture exactly", () => {
      // Verbatim from mainnet balance 0000000047d06a6d…. Catches silent
      // corruption in the int64 conversions.
      const fixture = {
        not: {
          abs_before: "2026-09-03T13:49:59Z",
          abs_before_epoch: "1788443399",
        },
      };
      const predicate = Claimant.predicateFromHorizonJson(fixture);
      expect(Claimant.predicateToHorizonJson(predicate)).toEqual(fixture);
    });

    it("normalizes an ISO-only input to carry both time keys", () => {
      // Horizon always sends the pair, so output emits both regardless.
      const predicate = Claimant.predicateFromHorizonJson({
        abs_before: "2100-01-01T00:00:00Z",
      });
      expect(Claimant.predicateToHorizonJson(predicate)).toEqual({
        abs_before: "2100-01-01T00:00:00Z",
        abs_before_epoch: "4102444800",
      });
    });

    it("agrees with the SEP-0051 dialect on the same predicate", () => {
      // Regression guard for the RPC path: both dialects, one meaning.
      const fromHorizon = Claimant.predicateFromHorizonJson({
        not: {
          abs_before: "2026-09-03T13:49:59Z",
          abs_before_epoch: "1788443399",
        },
      });
      const fromSep51 = xdr.ClaimPredicate.fromJson({
        not: { before_absolute_time: "1788443399" },
      });
      expect(fromHorizon.equals(fromSep51)).toBe(true);
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
