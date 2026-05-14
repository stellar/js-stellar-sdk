// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SorobanAddressCredentials } from "./soroban-address-credentials.js";
import { SorobanCredentialsType } from "./soroban-credentials-type.js";
export type SorobanCredentials =
  | {
      readonly type: 0;
    }
  | {
      readonly type: 1;
      readonly address: SorobanAddressCredentials;
    };
export const SorobanCredentials = xdr.union("SorobanCredentials", {
  switchOn: xdr.lazy(() => SorobanCredentialsType),
  switchKey: "type",
  cases: [
    xdr.case("sorobanCredentialsSourceAccount", 0, xdr.void()),
    xdr.case(
      "sorobanCredentialsAddress",
      1,
      xdr.field(
        "address",
        xdr.lazy(() => SorobanAddressCredentials),
      ),
    ),
  ] as const,
}) as xdr.XdrType<SorobanCredentials>;
