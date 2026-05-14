// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractExecutable } from "./contract-executable.js";
import { Duration } from "./duration.js";
import { Int128Parts } from "./int128-parts.js";
import { Int256Parts } from "./int256-parts.js";
import { SCAddress } from "./sc-address.js";
import { SCBytes } from "./sc-bytes.js";
import { SCError } from "./sc-error.js";
import { SCNonceKey } from "./sc-nonce-key.js";
import { SCString } from "./sc-string.js";
import { SCSymbol } from "./sc-symbol.js";
import { SCValType } from "./sc-val-type.js";
import { TimePoint } from "./time-point.js";
import { UInt128Parts } from "./u-int128-parts.js";
import { UInt256Parts } from "./u-int256-parts.js";
export interface SCContractInstance {
  readonly executable: ContractExecutable;
  readonly storage: SCMap | null;
}
export const SCContractInstance = xdr.struct("SCContractInstance", {
  executable: xdr.lazy(() => ContractExecutable),
  storage: xdr.option(xdr.lazy(() => SCMap)),
}) as xdr.XdrType<SCContractInstance>;
export interface SCMapEntry {
  readonly key: SCVal;
  readonly val: SCVal;
}
export const SCMapEntry = xdr.struct("SCMapEntry", {
  key: xdr.lazy(() => SCVal),
  val: xdr.lazy(() => SCVal),
}) as xdr.XdrType<SCMapEntry>;
export type SCMap = SCMapEntry[];
export const SCMap = xdr.array(
  xdr.lazy(() => SCMapEntry),
  xdr.UNBOUNDED_MAX_LENGTH,
) as xdr.XdrType<SCMap>;
export type SCVal =
  | {
      readonly type: 0;
      readonly b: boolean;
    }
  | {
      readonly type: 1;
    }
  | {
      readonly type: 2;
      readonly error: SCError;
    }
  | {
      readonly type: 3;
      readonly u32: number;
    }
  | {
      readonly type: 4;
      readonly i32: number;
    }
  | {
      readonly type: 5;
      readonly u64: bigint;
    }
  | {
      readonly type: 6;
      readonly i64: bigint;
    }
  | {
      readonly type: 7;
      readonly timepoint: TimePoint;
    }
  | {
      readonly type: 8;
      readonly duration: Duration;
    }
  | {
      readonly type: 9;
      readonly u128: UInt128Parts;
    }
  | {
      readonly type: 10;
      readonly i128: Int128Parts;
    }
  | {
      readonly type: 11;
      readonly u256: UInt256Parts;
    }
  | {
      readonly type: 12;
      readonly i256: Int256Parts;
    }
  | {
      readonly type: 13;
      readonly bytes: SCBytes;
    }
  | {
      readonly type: 14;
      readonly str: SCString;
    }
  | {
      readonly type: 15;
      readonly sym: SCSymbol;
    }
  | {
      readonly type: 16;
      readonly vec: SCVec | null;
    }
  | {
      readonly type: 17;
      readonly map: SCMap | null;
    }
  | {
      readonly type: 18;
      readonly address: SCAddress;
    }
  | {
      readonly type: 19;
      readonly instance: SCContractInstance;
    }
  | {
      readonly type: 20;
    }
  | {
      readonly type: 21;
      readonly nonce_key: SCNonceKey;
    };
export const SCVal = xdr.union("SCVal", {
  switchOn: xdr.lazy(() => SCValType),
  switchKey: "type",
  cases: [
    xdr.case("scvBool", 0, xdr.field("b", xdr.bool())),
    xdr.case("scvVoid", 1, xdr.void()),
    xdr.case(
      "scvError",
      2,
      xdr.field(
        "error",
        xdr.lazy(() => SCError),
      ),
    ),
    xdr.case("scvU32", 3, xdr.field("u32", xdr.uint32())),
    xdr.case("scvI32", 4, xdr.field("i32", xdr.int32())),
    xdr.case("scvU64", 5, xdr.field("u64", xdr.uint64())),
    xdr.case("scvI64", 6, xdr.field("i64", xdr.int64())),
    xdr.case(
      "scvTimepoint",
      7,
      xdr.field(
        "timepoint",
        xdr.lazy(() => TimePoint),
      ),
    ),
    xdr.case(
      "scvDuration",
      8,
      xdr.field(
        "duration",
        xdr.lazy(() => Duration),
      ),
    ),
    xdr.case(
      "scvU128",
      9,
      xdr.field(
        "u128",
        xdr.lazy(() => UInt128Parts),
      ),
    ),
    xdr.case(
      "scvI128",
      10,
      xdr.field(
        "i128",
        xdr.lazy(() => Int128Parts),
      ),
    ),
    xdr.case(
      "scvU256",
      11,
      xdr.field(
        "u256",
        xdr.lazy(() => UInt256Parts),
      ),
    ),
    xdr.case(
      "scvI256",
      12,
      xdr.field(
        "i256",
        xdr.lazy(() => Int256Parts),
      ),
    ),
    xdr.case(
      "scvBytes",
      13,
      xdr.field(
        "bytes",
        xdr.lazy(() => SCBytes),
      ),
    ),
    xdr.case(
      "scvString",
      14,
      xdr.field(
        "str",
        xdr.lazy(() => SCString),
      ),
    ),
    xdr.case(
      "scvSymbol",
      15,
      xdr.field(
        "sym",
        xdr.lazy(() => SCSymbol),
      ),
    ),
    xdr.case("scvVec", 16, xdr.field("vec", xdr.option(xdr.lazy(() => SCVec)))),
    xdr.case("scvMap", 17, xdr.field("map", xdr.option(xdr.lazy(() => SCMap)))),
    xdr.case(
      "scvAddress",
      18,
      xdr.field(
        "address",
        xdr.lazy(() => SCAddress),
      ),
    ),
    xdr.case(
      "scvContractInstance",
      19,
      xdr.field(
        "instance",
        xdr.lazy(() => SCContractInstance),
      ),
    ),
    xdr.case("scvLedgerKeyContractInstance", 20, xdr.void()),
    xdr.case(
      "scvLedgerKeyNonce",
      21,
      xdr.field(
        "nonce_key",
        xdr.lazy(() => SCNonceKey),
      ),
    ),
  ] as const,
}) as xdr.XdrType<SCVal>;
export type SCVec = SCVal[];
export const SCVec = xdr.array(
  xdr.lazy(() => SCVal),
  xdr.UNBOUNDED_MAX_LENGTH,
) as xdr.XdrType<SCVec>;
