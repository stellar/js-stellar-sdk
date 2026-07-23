// For every generated XDR class with a static `schema`, we:
//   1. Walk the schema to produce a `defaultWire` value (a sample populated
//      with the obvious zero/first-choice values for each kind).
//   2. Round-trip it through the new SDK as a sanity check (toXdr → fromXdr
//      → toXdr byte-equal).
//   3. Encode through the new SDK, decode through the legacy SDK, and
//      assert legacy re-encodes to the same bytes (the legacy SDK is the
//      on-wire oracle).
//
// What this catches: types where our `xdr.json` schema diverges from what
// the legacy SDK expects on the wire. A passing test means both SDKs agree
// on the type's wire format for at least one valid value of that type. A
// failing test points at a concrete schema-divergence bug to investigate.
//
// What this doesn't catch: divergences that only show up for *non-default*
// values (e.g. a sign-extension bug that triggers on negative inputs). For
// that, the corpus tests (`corpus_round_trip.test.ts`) and hand-written
// smoke tests (`legacy_round_trip.test.ts`) are the complementary layers.

import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";

import legacyTypes from "../../fixtures/legacy-xdr/curr_generated.js";

import * as classXdr from "../../../src/xdr/index.js";
import type { XdrType } from "../../../src/xdr/core/xdr-type.js";
import { XdrString } from "../../../src/xdr/index.js";

const legacy = legacyTypes as any;

// Types we intentionally skip from the exhaustive sweep. Each needs a one-
// sentence reason so future readers know why.
const SKIP: ReadonlyMap<string, string> = new Map([
  // Type re-exports / aliases that don't produce a unique sample.
  ["AccountId", "alias of PublicKey (same schema)"],
  ["NodeId", "alias of PublicKey (same schema)"],
  // Types we emit but the legacy SDK doesn't expose under the same name.
  // (When/if encountered, document here.)
]);

// Build the sample wire value for a schema. Returns the wire shape the new
// SDK's `_write` expects (which is also what `toXdrObject()` returns).

function defaultWire(schema: XdrType<unknown>): any {
  const s = schema as XdrType<unknown> & {
    readonly kind: string;
  };
  switch (s.kind) {
    case "void":
      return undefined;
    case "bool":
      return false;
    case "int32":
    case "uint32":
      return 0;
    case "int64":
    case "uint64":
      return 0n;
    case "float":
    case "double":
      return 0;
    case "string":
      // String schema is `xdrString(...)` → returns XdrString on read,
      // accepts XdrString | string | Uint8Array on write.
      return new XdrString("");
    case "opaque": {
      const t = s as any;
      return new Uint8Array(t.length as number);
    }
    case "varOpaque":
      return new Uint8Array(0);
    case "enum": {
      const t = s as any;
      // Pick the first enum value (typically 0 / first declared member).
      return [...(t.nameByValue as Map<number, string>).keys()][0];
    }
    case "option":
      return null;
    case "array": {
      const t = s as any;
      // varArray — empty array is a valid value for every union type.
      return [];
    }
    case "fixedArray": {
      const t = s as any;
      return new Array(t.length as number)
        .fill(null)
        .map(() => defaultWire(t.element));
    }
    case "struct": {
      const t = s as any;
      const out: Record<string, unknown> = {};
      for (const [k, fs] of t.entries as ReadonlyArray<
        readonly [string, XdrType<unknown>]
      >) {
        out[k] = defaultWire(fs);
      }
      return out;
    }
    case "union": {
      const t = s as any;
      const firstCase = t.cases[0];
      const wire: Record<string, unknown> = {
        [t.switchKey]: firstCase.discriminant,
      };
      // Field arm has a `.schema`; void arm doesn't.
      if (firstCase.arm && "schema" in firstCase.arm) {
        wire[firstCase.arm.name] = defaultWire(firstCase.arm.schema);
      }
      return wire;
    }
    case "lazy": {
      const t = s as any;
      return defaultWire(t.getSchema());
    }
    default:
      throw new Error(`defaultWire: unhandled kind ${s.kind}`);
  }
}

// Discover every class with a `schema` field on the public xdr export.
function discoverClasses(): Array<{
  name: string;

  cls: any;
}> {
  const ns = classXdr as Record<string, any>;
  const out: Array<{ name: string; cls: unknown }> = [];
  for (const [name, value] of Object.entries(ns)) {
    if (!value || typeof value !== "function") continue;
    if (!("schema" in value) || !value.schema) continue;
    if (typeof value.fromXdrObject !== "function") continue;
    out.push({ name, cls: value });
  }
  // Stable order so failures are reproducible.
  out.sort((a, b) => a.name.localeCompare(b.name));

  return out as any;
}

describe("schema-exhaustive: every generated class round-trips a default wire", () => {
  const classes = discoverClasses();

  // Sanity check: we should be discovering a meaningful chunk of the surface.
  it("discovers at least 100 classes (suite sanity check)", () => {
    expect(classes.length).toBeGreaterThan(100);
  });

  for (const { name, cls } of classes) {
    const reason = SKIP.get(name);
    if (reason) {
      it.skip(`${name} (skipped: ${reason})`, () => {});
      continue;
    }

    it(`${name}: new SDK self-round-trip`, () => {
      const wire = defaultWire(cls.schema);
      const instance = cls.fromXdrObject(wire);
      const bytes = instance.toXdr();
      // Round-trip self.
      const redecoded = cls.fromXdrObject(cls.schema.decode(bytes));
      expect(redecoded.toXdr()).toEqual(bytes);
    });

    it(`${name}: JSON.stringify fires the toJSON hook (=== toJson output)`, () => {
      const instance = cls.fromXdrObject(defaultWire(cls.schema));
      // Must not throw (bigint fields would, without the hook) and must be
      // exactly the SEP-0051 form toJson() produces.
      expect(JSON.stringify(instance)).toBe(JSON.stringify(instance.toJson()));
      // And nested inside a plain object, since that's the implicit-
      // serialization case (loggers, res.json) the hook exists for.
      expect(JSON.parse(JSON.stringify({ v: instance })).v).toEqual(
        instance.toJson(),
      );
    });

    it(`${name}: legacy SDK accepts new SDK bytes`, () => {
      if (typeof legacy[name]?.fromXDR !== "function") {
        // Legacy doesn't expose this class — that's a coverage gap, not
        // a failure. Mark explicitly.
        return;
      }
      const wire = defaultWire(cls.schema);
      const newBytes = cls.fromXdrObject(wire).toXdr();
      let lgcyDecoded: unknown;
      try {
        lgcyDecoded = legacy[name].fromXDR(Buffer.from(newBytes));
      } catch (err) {
        throw new Error(
          `${name}: legacy SDK fromXDR threw on new-SDK-encoded bytes — ${
            (err as Error).message
          }`,
        );
      }
      // Legacy's `fromXDR` on typedef-opaque types returns a raw Buffer
      // directly (no wrapper class with `.toXDR()`). In that case there's
      // no re-encode step — decoding succeeding IS the wire-equality proof,
      // since the buffer is the bytes verbatim.

      const decoded = lgcyDecoded as any;
      if (typeof decoded?.toXDR === "function") {
        const lgcyReencoded = decoded.toXDR();
        expect(Buffer.from(lgcyReencoded).toString("hex")).toBe(
          Buffer.from(newBytes).toString("hex"),
        );
      } else if (decoded instanceof Uint8Array || Buffer.isBuffer(decoded)) {
        // Typedef-opaque types: legacy fromXDR returns the raw bytes
        // directly. `legacy[name]` is a `SizedReference` wrapper without
        // a usable `.toXDR(value)` shape, so we can't cleanly re-encode.
        // Decode-succeeded-with-matching-bytes is the proof: the legacy
        // SDK accepted the new SDK's wire and the bytes survived the
        // round-trip (since the buffer IS the payload, sans the discrim-
        // inant prefix var-opaque adds).
        const newPayload = Buffer.from(newBytes);
        // For fixed-length opaque, payload bytes appear at the END of
        // newBytes (after any padding). The legacy decoder strips padding
        // and returns the data portion. For var-opaque, the legacy still
        // strips the 4-byte length prefix and any padding. Either way,
        // decoded.length matches the declared/declared-max length.
        expect(
          newPayload
            .toString("hex")
            .endsWith(Buffer.from(decoded).toString("hex")),
          `${name}: decoded bytes don't appear at the tail of new SDK output`,
        ).toBe(true);
      } else {
        throw new Error(
          `${name}: legacy fromXDR returned unexpected shape ${typeof decoded}`,
        );
      }
    });
  }
});
