// Smoke tests for the generator output (src/xdr/generated/). Confirms
// that compound, cyclic, and inlined-typedef cases round-trip through XDR
// without exploding at module load.
import { describe, it, expect } from "vitest";

import { ScVal as SCVal } from "../../../../src/xdr/generated/sc-val.js";
import { ScAddress as SCAddress } from "../../../../src/xdr/generated/sc-address.js";
import { Asset } from "../../../../src/xdr/generated/asset.js";
import { AlphaNum4 } from "../../../../src/xdr/generated/alpha-num4.js";
import { PublicKey } from "../../../../src/xdr/generated/public-key.js";

const ED = new Uint8Array(32);
for (let i = 0; i < 32; i += 1) ED[i] = i + 1;

describe("generated/SCVal (cyclic union with lazy schema refs)", () => {
  it("scvU32 round-trips", () => {
    const v = SCVal.scvU32(42);
    const decoded = SCVal.fromXdr(v.toXdr());
    expect(decoded.type).toBe("scvU32");
    if (decoded.type === "scvU32") expect(decoded.value).toBe(42);
  });

  it("scvBool round-trips", () => {
    const v = SCVal.scvBool(true);
    const decoded = SCVal.fromXdr(v.toXdr());
    expect(decoded.type).toBe("scvBool");
  });

  it("scvVec (recursive — SCVal[] inside SCVal) round-trips via lazy()", () => {
    const inner = [SCVal.scvU32(1), SCVal.scvU32(2), SCVal.scvBool(false)];
    const v = SCVal.scvVec(inner);
    const decoded = SCVal.fromXdr(v.toXdr());
    expect(decoded.type).toBe("scvVec");
    if (decoded.type === "scvVec") {
      expect(decoded.value).not.toBeNull();
      expect(decoded.value!.length).toBe(3);
      expect(decoded.value![0].type).toBe("scvU32");
    }
  });
});

describe("generated/Asset (the slice's canonical union)", () => {
  it("round-trips via the generated class", () => {
    const issuer = PublicKey.publicKeyTypeEd25519(ED);
    const usd = Asset.assetTypeCreditAlphanum4(
      new AlphaNum4({
        assetCode: new Uint8Array([0x55, 0x53, 0x44, 0]),
        issuer,
      }),
    );
    const decoded = Asset.fromXdr(usd.toXdr());
    expect(decoded.type).toBe("assetTypeCreditAlphanum4");
  });
});

describe("generated/SCAddress (re-export typedef chain — AccountID → PublicKey)", () => {
  it("scAddressTypeAccount round-trips", () => {
    const issuer = PublicKey.publicKeyTypeEd25519(ED);
    const addr = SCAddress.scAddressTypeAccount(issuer);
    const decoded = SCAddress.fromXdr(addr.toXdr());
    expect(decoded.type).toBe("scAddressTypeAccount");
  });
});
