// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCSpecEventParamLocationV0 } from "./sc-spec-event-param-location-v0.js";
import { SCSpecTypeDef } from "./stellar-contract-spec-cycle.js";
export interface SCSpecEventParamV0 {
  readonly doc: string;
  readonly name: string;
  readonly type: SCSpecTypeDef;
  readonly location: SCSpecEventParamLocationV0;
}
export const SCSpecEventParamV0 = xdr.struct("SCSpecEventParamV0", {
  doc: xdr.string(1024),
  name: xdr.string(30),
  type: xdr.lazy(() => SCSpecTypeDef),
  location: xdr.lazy(() => SCSpecEventParamLocationV0),
}) as xdr.XdrType<SCSpecEventParamV0>;
