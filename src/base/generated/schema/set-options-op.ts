// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { Signer } from "./signer.js";
import { string32 } from "./string32.js";
export interface SetOptionsOp {
  readonly inflationDest: AccountId | null;
  readonly clearFlags: number | null;
  readonly setFlags: number | null;
  readonly masterWeight: number | null;
  readonly lowThreshold: number | null;
  readonly medThreshold: number | null;
  readonly highThreshold: number | null;
  readonly homeDomain: string32 | null;
  readonly signer: Signer | null;
}
export const SetOptionsOp = xdr.struct("SetOptionsOp", {
  inflationDest: xdr.option(xdr.lazy(() => AccountId)),
  clearFlags: xdr.option(xdr.uint32()),
  setFlags: xdr.option(xdr.uint32()),
  masterWeight: xdr.option(xdr.uint32()),
  lowThreshold: xdr.option(xdr.uint32()),
  medThreshold: xdr.option(xdr.uint32()),
  highThreshold: xdr.option(xdr.uint32()),
  homeDomain: xdr.option(xdr.lazy(() => string32)),
  signer: xdr.option(xdr.lazy(() => Signer)),
}) as xdr.XdrType<SetOptionsOp>;
