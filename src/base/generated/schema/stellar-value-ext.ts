// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerCloseValueSignature } from "./ledger-close-value-signature.js";
import { StellarValueType } from "./stellar-value-type.js";
export type StellarValueExt =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 1;
      readonly lcValueSignature: LedgerCloseValueSignature;
    };
export const StellarValueExt = xdr.union("StellarValueExt", {
  switchOn: xdr.lazy(() => StellarValueType),
  switchKey: "v",
  cases: [
    xdr.case("stellarValueBasic", 0, xdr.void()),
    xdr.case(
      "stellarValueSigned",
      1,
      xdr.field(
        "lcValueSignature",
        xdr.lazy(() => LedgerCloseValueSignature),
      ),
    ),
  ] as const,
}) as xdr.XdrType<StellarValueExt>;
