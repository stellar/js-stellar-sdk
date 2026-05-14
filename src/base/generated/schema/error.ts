// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ErrorCode } from "./error-code.js";
export interface Error {
  readonly code: ErrorCode;
  readonly msg: string;
}
export const Error = xdr.struct("Error", {
  code: xdr.lazy(() => ErrorCode),
  msg: xdr.string(100),
}) as xdr.XdrType<Error>;
