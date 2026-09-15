// Round-trip coverage for CAP-87 (ML-DSA signature verification host
// functions). These `ContractCostType` members are too new for the legacy
// SDK oracle used by `schema_exhaustive.test.ts` (which only samples enum
// value 0), so they get hand-written coverage here.
import { describe, expect, it } from "vitest";

import { ContractCostType } from "../../../src/xdr/index.js";

const NEW_COST_TYPES: [string, number][] = [
  ["mlDsa44DecodeVerifyingKey", 86],
  ["mlDsa65DecodeVerifyingKey", 87],
  ["mlDsa87DecodeVerifyingKey", 88],
  ["mlDsa44DecodeSignature", 89],
  ["mlDsa65DecodeSignature", 90],
  ["mlDsa87DecodeSignature", 91],
  ["verifyMlDsa44Sig", 92],
  ["verifyMlDsa65Sig", 93],
  ["verifyMlDsa87Sig", 94],
];

describe("CAP-87: ML-DSA signature verification cost types", () => {
  it.each(NEW_COST_TYPES)(
    "resolves %s by name and by wire value %i",
    (name, value) => {
      const byName = ContractCostType.fromName(name as never);
      const byValue = ContractCostType.fromValue(value);

      expect(byName).toBe(byValue);
      expect(byName.value).toBe(value);
      expect(byName.name).toBe(name);
    },
  );

  it.each(NEW_COST_TYPES)("round-trips %s through XDR", (name) => {
    const cost = ContractCostType.fromName(name as never);
    const decoded = ContractCostType.fromXdr(cost.toXdr());

    expect(decoded).toBe(cost);
  });

  it("keeps the pre-CAP-0087 members unshifted", () => {
    expect(ContractCostType.bn254G1Msm.value).toBe(85);
  });
});
