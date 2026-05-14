// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TimeSlicedPeerData } from "./time-sliced-peer-data.js";
export type TimeSlicedPeerDataList = TimeSlicedPeerData[];
export const TimeSlicedPeerDataList = xdr.array(
  xdr.lazy(() => TimeSlicedPeerData),
  25,
) as xdr.XdrType<TimeSlicedPeerDataList>;
