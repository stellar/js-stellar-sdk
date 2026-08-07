// The JSON decoder is a second decoder running parallel to the schema: an
// entry in `to-json.ts`'s OVERRIDES table short-circuits `walkFromJson` before
// any schema-driven check and hand-builds a wire object from a strkey or a bare
// string. Nothing downstream re-derives the schema's rules, so each override is
// on its own to reject what the wire decoder would reject.
//
// Every bug in this family so far — #1581, #1583, #1585, #1588 — was one
// override accepting a value `fromXdr` refuses, then silently re-encoding it as
// something else. The parity monitor (`scripts/xdr-json-parity-monitor.ts`)
// can't catch these: it replays real mainnet payloads, so it only ever exercises
// values that are already valid. This is the negative half — the two decoders
// must agree on what to *reject*.
//
// These inputs are caught at the outermost layer that can see them, so a case
// here pins the behavior, not the layer: a bad claimable-balance discriminant
// is rejected by `StrKey.decodeCheck` before the generated union's own guard
// ever runs. That guard is covered directly, for every union, in
// `union_dispatch.test.ts`.

import { describe, it, expect } from "vitest";
import { XdrError } from "@stellar/js-xdr";

import { StrKey } from "../../../src/base/strkey.js";
import {
  AssetCode,
  AssetCode4,
  AssetCode12,
  ClaimableBalanceId,
  ClaimPredicate,
  Int128Parts,
  Int256Parts,
  ScAddress,
  ScVal,
  Uint128Parts,
  Uint256Parts,
} from "../../../src/xdr/index.js";

/** A `B...` strkey whose 33-byte payload leads with `discriminant`. */
function claimableBalanceStrkey(discriminant: number): string {
  const raw = new Uint8Array(33);
  raw[0] = discriminant;
  raw.set(new Uint8Array(32).fill(7), 1);
  return StrKey.encodeClaimableBalance(raw);
}

interface RejectCase {
  desc: string;
  fromJson: () => unknown;
  /**
   * Expected message. Deliberately not an error *class*: a strkey-borne value
   * is rejected by `StrKey.decodeCheck`, which throws a plain `Error` (as it
   * does for a bad checksum or version byte), while a value that reaches the
   * schema throws `XdrError`. Which layer catches it is an implementation
   * detail; that it is caught, with a message naming the reason, is not.
   */
  message: RegExp;
  /** Wire bytes denoting the same value, when they can be built at all. */
  wire?: { decode: (bytes: Uint8Array) => unknown; bytes: Uint8Array };
}

// `ClaimableBalanceID` has exactly one case, CLAIMABLE_BALANCE_ID_TYPE_V0 (0).
// The strkey checksum covers whatever discriminant byte is present, so a `B...`
// key carrying another value is well-formed as a string and invalid as XDR.
function claimableBalanceIdWire(discriminant: number): Uint8Array {
  const bytes = new Uint8Array(4 + 32);
  new DataView(bytes.buffer).setUint32(0, discriminant);
  bytes.set(new Uint8Array(32).fill(7), 4);
  return bytes;
}

const CASES: RejectCase[] = [
  {
    desc: "claimable balance id with an unknown discriminant",
    fromJson: () => ClaimableBalanceId.fromJson(claimableBalanceStrkey(1)),
    message: /unknown discriminant 1/,
    wire: {
      decode: (b) => ClaimableBalanceId.fromXdr(b),
      bytes: claimableBalanceIdWire(1),
    },
  },
  {
    desc: "claimable balance id with a far out-of-range discriminant",
    fromJson: () => ClaimableBalanceId.fromJson(claimableBalanceStrkey(255)),
    message: /unknown discriminant 255/,
    wire: {
      decode: (b) => ClaimableBalanceId.fromXdr(b),
      bytes: claimableBalanceIdWire(255),
    },
  },
  {
    desc: "sc address wrapping a bad claimable balance discriminant",
    fromJson: () => ScAddress.fromJson(claimableBalanceStrkey(1)),
    message: /unknown discriminant 1/,
  },

  // `padRightZeros` cannot truncate, so an over-long code would reach the
  // opaque wrapper as a mis-sized buffer.
  {
    desc: "asset code longer than its 4-byte arm",
    fromJson: () => AssetCode4.fromJson("ABCDEFGHIJ"),
    message: /expected 4 byte\(s\), got 10/,
  },
  {
    desc: "asset code longer than its 12-byte arm",
    fromJson: () => AssetCode12.fromJson("ABCDEFGHIJKLMNOPQR"),
    message: /expected 12 byte\(s\), got 18/,
  },
  {
    desc: "flattened asset code longer than either arm",
    fromJson: () => AssetCode.fromJson("ABCDEFGHIJKLMNOPQR"),
    message: /expected 12 byte\(s\), got 18/,
  },
];

// `BigInt()` inherits the numeric-literal grammar, so each of these parses to a
// number that is not what the string says — a silent value change, not a parse
// error. Verified case by case against the reference implementation
// (`@stellar/stellar-xdr-json`): it rejects all of them.
const NON_DECIMAL = ["", " ", "0x10", "0b11", "1e3", " 7", "7 ", "1_0", "٧"];

// Accepted by the reference (Rust's `from_str`), so accepted here too, even
// though they are not canonical and normalize on the way back out.
const NON_CANONICAL_BUT_VALID: [string, bigint][] = [
  ["+7", 7n],
  ["01", 1n],
  ["0007", 7n],
  ["-0", 0n],
];

describe("JSON decoding rejects what XDR decoding rejects", () => {
  for (const { desc, fromJson, message, wire } of CASES) {
    describe(desc, () => {
      it("is rejected by fromJson", () => {
        expect(fromJson).toThrow(message);
      });

      if (wire) {
        it("is rejected by fromXdr too", () => {
          expect(() => wire.decode(wire.bytes)).toThrow(XdrError);
        });
      }
    });
  }

  describe("integer fields reject non-decimal strings", () => {
    for (const value of NON_DECIMAL) {
      it(`int64 rejects ${JSON.stringify(value)}`, () => {
        expect(() =>
          ClaimPredicate.fromJson({ before_absolute_time: value }),
        ).toThrow(XdrError);
      });

      it(`wide ints reject ${JSON.stringify(value)}`, () => {
        // each `*Parts` class has its own wire type, so they can't share a
        // loop variable — list the decoders as bare thunks instead
        const decoders = [
          () => Int128Parts.fromJson(value),
          () => Uint128Parts.fromJson(value),
          () => Int256Parts.fromJson(value),
          () => Uint256Parts.fromJson(value),
        ];
        for (const decode of decoders) {
          expect(decode).toThrow(XdrError);
        }
      });
    }
  });

  describe("integer fields accept non-canonical decimal strings", () => {
    for (const [value, expected] of NON_CANONICAL_BUT_VALID) {
      it(`int64 accepts ${JSON.stringify(value)}`, () => {
        expect(ScVal.fromJson({ i64: value }).value).toBe(expected);
      });

      it(`int128 accepts ${JSON.stringify(value)}`, () => {
        expect(Int128Parts.fromJson(value).toJson()).toBe(expected.toString());
      });
    }
  });
});
