// Compile-time regression test for issue #1630: `XdrValue.equals` must be
// callable on union-typed values. The signature was once `equals(other: this)`,
// and polymorphic `this` in parameter position intersects a union's arms —
// discriminated arms with conflicting `type` properties reduce to `never`, so
// no argument compiled (TS2345) on any of the SDK's union types even though
// the runtime was correct. This file only has to typecheck; it never runs.

import type {
  ScVal,
  ScValU32,
  TransactionEnvelope,
  LedgerEntry,
  LedgerEntryData,
  Memo,
  HostFunction,
  SorobanCredentials,
  InvokeContractArgs,
} from "../../src/xdr/index.js";

declare const scValA: ScVal;
declare const scValB: ScVal;
declare const envelopeA: TransactionEnvelope;
declare const envelopeB: TransactionEnvelope;
declare const ledgerEntryDataA: LedgerEntryData;
declare const ledgerEntryDataB: LedgerEntryData;
declare const memoA: Memo;
declare const memoB: Memo;
declare const hostFunctionA: HostFunction;
declare const hostFunctionB: HostFunction;
declare const credentialsA: SorobanCredentials;
declare const credentialsB: SorobanCredentials;
declare const structA: InvokeContractArgs;
declare const structB: InvokeContractArgs;
declare const singleArm: ScValU32;
declare const ledgerEntry: LedgerEntry;

export const results: boolean[] = [
  // Union receiver and union argument, for every union named in the issue.
  scValA.equals(scValB),
  envelopeA.equals(envelopeB),
  ledgerEntryDataA.equals(ledgerEntryDataB),
  memoA.equals(memoB),
  hostFunctionA.equals(hostFunctionB),
  credentialsA.equals(credentialsB),

  // Structs and single union arms keep working.
  structA.equals(structB),
  singleArm.equals(singleArm),

  // Single arm against the full union, both directions.
  singleArm.equals(scValA),
  scValA.equals(singleArm),

  // Cross-type comparison compiles and returns false at runtime.
  scValA.equals(memoA),

  // Union-typed property read — the real-world shape that surfaced the bug
  // (no `const` annotation to narrow the union back to one arm).
  ledgerEntry.data.equals(ledgerEntryDataA),
];
