// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCSpecEventDataFormat } from "./sc-spec-event-data-format.js";
import { SCSpecEventParamV0 } from "./sc-spec-event-param-v0.js";
import { SCSymbol } from "./sc-symbol.js";
export interface SCSpecEventV0 {
  readonly doc: string;
  readonly lib: string;
  readonly name: SCSymbol;
  readonly prefixTopics: SCSymbol[];
  readonly params: SCSpecEventParamV0[];
  readonly dataFormat: SCSpecEventDataFormat;
}
export const SCSpecEventV0 = xdr.struct("SCSpecEventV0", {
  doc: xdr.string(1024),
  lib: xdr.string(80),
  name: xdr.lazy(() => SCSymbol),
  prefixTopics: xdr.array(
    xdr.lazy(() => SCSymbol),
    2,
  ),
  params: xdr.array(
    xdr.lazy(() => SCSpecEventParamV0),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  dataFormat: xdr.lazy(() => SCSpecEventDataFormat),
}) as xdr.XdrType<SCSpecEventV0>;
