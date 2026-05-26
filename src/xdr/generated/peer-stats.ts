import { struct } from "../types/struct.js";
import { uint64 } from "../types/uint64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";

export interface PeerStatsWire {
  id: PublicKeyWire;
  versionStr: XdrString;
  messagesRead: bigint;
  messagesWritten: bigint;
  bytesRead: bigint;
  bytesWritten: bigint;
  secondsConnected: bigint;
  uniqueFloodBytesRecv: bigint;
  duplicateFloodBytesRecv: bigint;
  uniqueFetchBytesRecv: bigint;
  duplicateFetchBytesRecv: bigint;
  uniqueFloodMessageRecv: bigint;
  duplicateFloodMessageRecv: bigint;
  uniqueFetchMessageRecv: bigint;
  duplicateFetchMessageRecv: bigint;
}

/**
 * ```xdr
 * struct PeerStats
 * {
 *     NodeID id;
 *     string versionStr<100>;
 *     uint64 messagesRead;
 *     uint64 messagesWritten;
 *     uint64 bytesRead;
 *     uint64 bytesWritten;
 *     uint64 secondsConnected;
 *
 *     uint64 uniqueFloodBytesRecv;
 *     uint64 duplicateFloodBytesRecv;
 *     uint64 uniqueFetchBytesRecv;
 *     uint64 duplicateFetchBytesRecv;
 *
 *     uint64 uniqueFloodMessageRecv;
 *     uint64 duplicateFloodMessageRecv;
 *     uint64 uniqueFetchMessageRecv;
 *     uint64 duplicateFetchMessageRecv;
 * };
 * ```
 */
export class PeerStats extends XdrValue {
  readonly id: PublicKey;
  readonly versionStr: XdrString;
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

  static readonly schema: XdrType<PeerStatsWire> = struct("PeerStats", {
    id: PublicKey.schema,
    versionStr: xdrString(100),
    messagesRead: uint64(),
    messagesWritten: uint64(),
    bytesRead: uint64(),
    bytesWritten: uint64(),
    secondsConnected: uint64(),
    uniqueFloodBytesRecv: uint64(),
    duplicateFloodBytesRecv: uint64(),
    uniqueFetchBytesRecv: uint64(),
    duplicateFetchBytesRecv: uint64(),
    uniqueFloodMessageRecv: uint64(),
    duplicateFloodMessageRecv: uint64(),
    uniqueFetchMessageRecv: uint64(),
    duplicateFetchMessageRecv: uint64(),
  });

  constructor(input: {
    id: PublicKey;
    versionStr: XdrString | string | Uint8Array;
    messagesRead: bigint;
    messagesWritten: bigint;
    bytesRead: bigint;
    bytesWritten: bigint;
    secondsConnected: bigint;
    uniqueFloodBytesRecv: bigint;
    duplicateFloodBytesRecv: bigint;
    uniqueFetchBytesRecv: bigint;
    duplicateFetchBytesRecv: bigint;
    uniqueFloodMessageRecv: bigint;
    duplicateFloodMessageRecv: bigint;
    uniqueFetchMessageRecv: bigint;
    duplicateFetchMessageRecv: bigint;
  }) {
    super();
    this.id = input.id;
    this.versionStr =
      input.versionStr instanceof XdrString
        ? input.versionStr
        : new XdrString(input.versionStr);
    this.messagesRead = input.messagesRead;
    this.messagesWritten = input.messagesWritten;
    this.bytesRead = input.bytesRead;
    this.bytesWritten = input.bytesWritten;
    this.secondsConnected = input.secondsConnected;
    this.uniqueFloodBytesRecv = input.uniqueFloodBytesRecv;
    this.duplicateFloodBytesRecv = input.duplicateFloodBytesRecv;
    this.uniqueFetchBytesRecv = input.uniqueFetchBytesRecv;
    this.duplicateFetchBytesRecv = input.duplicateFetchBytesRecv;
    this.uniqueFloodMessageRecv = input.uniqueFloodMessageRecv;
    this.duplicateFloodMessageRecv = input.duplicateFloodMessageRecv;
    this.uniqueFetchMessageRecv = input.uniqueFetchMessageRecv;
    this.duplicateFetchMessageRecv = input.duplicateFetchMessageRecv;
  }

  toXdrObject(): PeerStatsWire {
    return {
      id: this.id.toXdrObject(),
      versionStr: this.versionStr,
      messagesRead: this.messagesRead,
      messagesWritten: this.messagesWritten,
      bytesRead: this.bytesRead,
      bytesWritten: this.bytesWritten,
      secondsConnected: this.secondsConnected,
      uniqueFloodBytesRecv: this.uniqueFloodBytesRecv,
      duplicateFloodBytesRecv: this.duplicateFloodBytesRecv,
      uniqueFetchBytesRecv: this.uniqueFetchBytesRecv,
      duplicateFetchBytesRecv: this.duplicateFetchBytesRecv,
      uniqueFloodMessageRecv: this.uniqueFloodMessageRecv,
      duplicateFloodMessageRecv: this.duplicateFloodMessageRecv,
      uniqueFetchMessageRecv: this.uniqueFetchMessageRecv,
      duplicateFetchMessageRecv: this.duplicateFetchMessageRecv,
    };
  }

  static fromXdrObject(wire: PeerStatsWire): PeerStats {
    return new PeerStats({
      id: PublicKey.fromXdrObject(wire.id),
      versionStr: wire.versionStr,
      messagesRead: wire.messagesRead,
      messagesWritten: wire.messagesWritten,
      bytesRead: wire.bytesRead,
      bytesWritten: wire.bytesWritten,
      secondsConnected: wire.secondsConnected,
      uniqueFloodBytesRecv: wire.uniqueFloodBytesRecv,
      duplicateFloodBytesRecv: wire.duplicateFloodBytesRecv,
      uniqueFetchBytesRecv: wire.uniqueFetchBytesRecv,
      duplicateFetchBytesRecv: wire.duplicateFetchBytesRecv,
      uniqueFloodMessageRecv: wire.uniqueFloodMessageRecv,
      duplicateFloodMessageRecv: wire.duplicateFloodMessageRecv,
      uniqueFetchMessageRecv: wire.uniqueFetchMessageRecv,
      duplicateFetchMessageRecv: wire.duplicateFetchMessageRecv,
    });
  }
}
