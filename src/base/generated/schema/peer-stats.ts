// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { NodeId } from "./node-id.js";
export interface PeerStats {
  readonly id: NodeId;
  readonly versionStr: string;
  readonly messagesRead: bigint;
  readonly messagesWritten: bigint;
  readonly bytesRead: bigint;
  readonly bytesWritten: bigint;
  readonly secondsConnected: bigint;
  readonly uniqueFloodBytesRecv: bigint;
  readonly duplicateFloodBytesRecv: bigint;
  readonly uniqueFetchBytesRecv: bigint;
  readonly duplicateFetchBytesRecv: bigint;
  readonly uniqueFloodMessageRecv: bigint;
  readonly duplicateFloodMessageRecv: bigint;
  readonly uniqueFetchMessageRecv: bigint;
  readonly duplicateFetchMessageRecv: bigint;
}
export const PeerStats = xdr.struct("PeerStats", {
  id: xdr.lazy(() => NodeId),
  versionStr: xdr.string(100),
  messagesRead: xdr.uint64(),
  messagesWritten: xdr.uint64(),
  bytesRead: xdr.uint64(),
  bytesWritten: xdr.uint64(),
  secondsConnected: xdr.uint64(),
  uniqueFloodBytesRecv: xdr.uint64(),
  duplicateFloodBytesRecv: xdr.uint64(),
  uniqueFetchBytesRecv: xdr.uint64(),
  duplicateFetchBytesRecv: xdr.uint64(),
  uniqueFloodMessageRecv: xdr.uint64(),
  duplicateFloodMessageRecv: xdr.uint64(),
  uniqueFetchMessageRecv: xdr.uint64(),
  duplicateFetchMessageRecv: xdr.uint64(),
}) as xdr.XdrType<PeerStats>;
