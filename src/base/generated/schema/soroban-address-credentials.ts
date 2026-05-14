// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCAddress } from "./sc-address.js";
import { SCVal } from "./stellar-contract-cycle.js";
export interface SorobanAddressCredentials {
  readonly address: SCAddress;
  readonly nonce: bigint;
  readonly signatureExpirationLedger: number;
  readonly signature: SCVal;
}
export const SorobanAddressCredentials = xdr.struct(
  "SorobanAddressCredentials",
  {
    address: xdr.lazy(() => SCAddress),
    nonce: xdr.int64(),
    signatureExpirationLedger: xdr.uint32(),
    signature: xdr.lazy(() => SCVal),
  },
) as xdr.XdrType<SorobanAddressCredentials>;
