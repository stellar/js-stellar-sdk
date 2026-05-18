// Compile-time probes for the new-xdr DX layer. This file is type-checked
// by `tsc -p test/tsconfig.json`; it has no runtime assertions, so if it
// compiles clean the design properties below hold.
import {
  Asset,
  AssetNative,
  AssetCreditAlphanum4,
  AssetCreditAlphanum12,
  AlphaNum4,
  AlphaNum12,
  PublicKey,
} from "../../../../src/xdr/index.js";

const ed = new Uint8Array(32);
const issuer = PublicKey.publicKeyTypeEd25519(ed);
const native = Asset.assetTypeNative();
const usd = Asset.assetTypeCreditAlphanum4(
  new AlphaNum4({ assetCode: new Uint8Array(4), issuer }),
);
const tether = Asset.assetTypeCreditAlphanum12(
  new AlphaNum12({ assetCode: new Uint8Array(12), issuer }),
);
const alphaNum12 = new AlphaNum12({ assetCode: new Uint8Array(12), issuer });

// --- Probe 1: factory enforces payload type at construction ---
// @ts-expect-error — string is not assignable to AlphaNum4
Asset.assetTypeCreditAlphanum4("not an alpha num");
// @ts-expect-error — AlphaNum12 is not assignable to AlphaNum4 (branded via AssetCode4)
Asset.assetTypeCreditAlphanum4(alphaNum12);

// --- Probe 2: `switch (asset.type)` narrows `asset` (and hence `asset.value`) ---
function describeViaSwitch(a: Asset): string {
  switch (a.type) {
    case "assetTypeNative":
      // a: AssetNative — no `value` field
      return "native";
    case "assetTypeCreditAlphanum4":
      // a: AssetCreditAlphanum4 — value: AlphaNum4 (no cast needed)
      return a.value.assetCode.toJson();
    case "assetTypeCreditAlphanum12":
      // a: AssetCreditAlphanum12 — value: AlphaNum12
      return a.value.assetCode.toJson();
  }
}

// --- Probe 3: instanceof narrows the same way ---
function describeViaInstanceof(a: Asset): string {
  if (a instanceof AssetNative) return "native";
  if (a instanceof AssetCreditAlphanum4) return a.value.assetCode.toJson();
  if (a instanceof AssetCreditAlphanum12) return a.value.assetCode.toJson();
  return "unreachable";
}

// --- Probe 4: exhaustiveness — missing case is a compile error ---
function exhaustive(a: Asset): string {
  switch (a.type) {
    case "assetTypeNative":
      return "native";
    case "assetTypeCreditAlphanum4":
      return "a4";
    // missing assetTypeCreditAlphanum12 — TS catches this via the never check
    default: {
      // @ts-expect-error — should narrow to never if exhaustive
      const unreachable: never = a;
      return unreachable;
    }
  }
}

// --- Probe 5: PublicKey single-arm union has accessible payload without narrowing ---
function pkPayload(p: PublicKey): Uint8Array {
  return p.ed25519;
}

export {
  native,
  usd,
  tether,
  describeViaSwitch,
  describeViaInstanceof,
  exhaustive,
  pkPayload,
};
