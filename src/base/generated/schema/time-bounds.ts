// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TimePoint } from "./time-point.js";
export interface TimeBounds {
  readonly minTime: TimePoint;
  readonly maxTime: TimePoint;
}
export const TimeBounds = xdr.struct("TimeBounds", {
  minTime: xdr.lazy(() => TimePoint),
  maxTime: xdr.lazy(() => TimePoint),
}) as xdr.XdrType<TimeBounds>;
