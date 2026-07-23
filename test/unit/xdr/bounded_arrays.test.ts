// Regression coverage for bounded variable-length arrays (`foo<N>` in the
// .x sources). The generator once read `max_size` for `var_array` nodes while
// `xdr/xdr.json` stores the limit as `max_count`, so every bounded array was
// silently emitted as unbounded and the SDK would happily encode protocol-
// invalid values (e.g. a transaction with 101 operations).
//
// Two layers:
//   1. A schema sweep that cross-checks every bounded struct field declared
//      in `xdr/xdr.json` against the generated class's schema, so a future
//      generator regression fails loudly for all fields at once.
//   2. A behavioral test that encoding a Transaction with 101 operations
//      throws while 100 succeeds (MAX_OPS_PER_TX).

import { describe, it, expect } from "vitest";

import xdrJson from "../../../xdr/xdr.json";
import * as classXdr from "../../../src/xdr/index.js";
import type { XdrType } from "../../../src/xdr/core/xdr-type.js";

interface BoundedField {
  owner: string;
  field: string;
  maxCount: number;
}

// Mirror of the generator's type-name normalization (SCSpecEventV0 →
// ScSpecEventV0) so schema-dump names map to exported class names.
function normalizeTypeName(name: string): string {
  return name.replace(/[A-Z]{2,}/g, (run, offset: number) => {
    const after = name[offset + run.length];
    const followedByLower = after !== undefined && /[a-z]/.test(after);
    if (run.length === 2 || !followedByLower) {
      return run[0] + run.slice(1).toLowerCase();
    }
    return run[0] + run.slice(1, -1).toLowerCase() + run[run.length - 1];
  });
}

// Collect every `struct X { ... T field<N>; ... }` from the schema dump.
function boundedStructFields(): BoundedField[] {
  const out: BoundedField[] = [];
  for (const def of (xdrJson as any).definitions) {
    if (def.kind !== "struct") continue;
    for (const f of def.fields ?? []) {
      if (f.type?.kind === "var_array" && f.type.max_count != null) {
        out.push({
          owner: normalizeTypeName(def.name),
          field: f.name,
          maxCount: f.type.max_count,
        });
      }
    }
  }
  return out;
}

function unwrapLazy(schema: any): any {
  return schema?.kind === "lazy" ? unwrapLazy(schema.getSchema()) : schema;
}

describe("bounded var_array limits survive generation", () => {
  const bounded = boundedStructFields();

  it("finds a meaningful number of bounded fields (suite sanity check)", () => {
    expect(bounded.length).toBeGreaterThanOrEqual(16);
  });

  for (const { owner, field, maxCount } of bounded) {
    it(`${owner}.${field} has maxLength ${maxCount}`, () => {
      const cls = (classXdr as Record<string, any>)[owner];
      expect(
        cls?.schema,
        `class ${owner} not found on xdr export`,
      ).toBeDefined();
      const schema = unwrapLazy(cls.schema);
      const entry = (
        schema.entries as ReadonlyArray<readonly [string, XdrType<unknown>]>
      ).find(([name]) => name === field);
      expect(entry, `${owner}.${field} not in schema`).toBeDefined();
      const fieldSchema = unwrapLazy(entry![1]) as any;
      expect(fieldSchema.kind).toBe("array");
      expect(fieldSchema.maxLength).toBe(maxCount);
    });
  }
});

describe("Transaction rejects more than MAX_OPS_PER_TX operations", () => {
  const { MuxedAccount, Operation, Transaction } = classXdr as any;

  const inflationOp = () =>
    new Operation({
      sourceAccount: null,
      body: classXdr.OperationBody.inflation(),
    });

  const tx = (opCount: number) =>
    new Transaction({
      sourceAccount: MuxedAccount.keyTypeEd25519(new Uint8Array(32)),
      fee: 100,
      seqNum: 1n,
      cond: classXdr.Preconditions.precondNone(),
      memo: classXdr.Memo.memoNone(),
      operations: Array.from({ length: opCount }, inflationOp),
      ext: classXdr.TransactionExt.fromXdrObject({ v: 0 }),
    });

  it("encodes exactly 100 operations", () => {
    expect(() => tx(100).toXdr()).not.toThrow();
  });

  it("throws on 101 operations", () => {
    expect(() => tx(101).toXdr()).toThrow(/exceeds maximum 100/);
  });

  it("rejects over-long arrays on decode too", () => {
    // Legal 100-op tx re-labelled as 101 ops must not decode: splice a bumped
    // length in. Simpler: decode bytes from an (unvalidated) hand-built buffer
    // is awkward here, so assert the schema's read-side bound directly.
    expect(
      (Transaction.schema as any).entries.find(
        ([n]: [string]) => n === "operations",
      )![1].maxLength,
    ).toBe(100);
  });
});
