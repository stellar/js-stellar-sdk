// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SorobanAuthorizedFunction } from "./soroban-authorized-function.js";
export interface SorobanAuthorizedInvocation {
  readonly function: SorobanAuthorizedFunction;
  readonly subInvocations: SorobanAuthorizedInvocation[];
}
export const SorobanAuthorizedInvocation = xdr.struct(
  "SorobanAuthorizedInvocation",
  {
    function: xdr.lazy(() => SorobanAuthorizedFunction),
    subInvocations: xdr.array(
      xdr.lazy(() => SorobanAuthorizedInvocation),
      xdr.UNBOUNDED_MAX_LENGTH,
    ),
  },
) as xdr.XdrType<SorobanAuthorizedInvocation>;
