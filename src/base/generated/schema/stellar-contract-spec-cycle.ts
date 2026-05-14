// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCSpecType } from "./sc-spec-type.js";
import { SCSpecTypeBytesN } from "./sc-spec-type-bytes-n.js";
import { SCSpecTypeUDT } from "./sc-spec-type-udt.js";
export interface SCSpecTypeTuple {
  readonly valueTypes: SCSpecTypeDef[];
}
export const SCSpecTypeTuple = xdr.struct("SCSpecTypeTuple", {
  valueTypes: xdr.array(
    xdr.lazy(() => SCSpecTypeDef),
    12,
  ),
}) as xdr.XdrType<SCSpecTypeTuple>;
export interface SCSpecTypeMap {
  readonly keyType: SCSpecTypeDef;
  readonly valueType: SCSpecTypeDef;
}
export const SCSpecTypeMap = xdr.struct("SCSpecTypeMap", {
  keyType: xdr.lazy(() => SCSpecTypeDef),
  valueType: xdr.lazy(() => SCSpecTypeDef),
}) as xdr.XdrType<SCSpecTypeMap>;
export interface SCSpecTypeVec {
  readonly elementType: SCSpecTypeDef;
}
export const SCSpecTypeVec = xdr.struct("SCSpecTypeVec", {
  elementType: xdr.lazy(() => SCSpecTypeDef),
}) as xdr.XdrType<SCSpecTypeVec>;
export interface SCSpecTypeResult {
  readonly okType: SCSpecTypeDef;
  readonly errorType: SCSpecTypeDef;
}
export const SCSpecTypeResult = xdr.struct("SCSpecTypeResult", {
  okType: xdr.lazy(() => SCSpecTypeDef),
  errorType: xdr.lazy(() => SCSpecTypeDef),
}) as xdr.XdrType<SCSpecTypeResult>;
export type SCSpecTypeDef =
  | {
      readonly type: 0;
    }
  | {
      readonly type: 1;
    }
  | {
      readonly type: 2;
    }
  | {
      readonly type: 3;
    }
  | {
      readonly type: 4;
    }
  | {
      readonly type: 5;
    }
  | {
      readonly type: 6;
    }
  | {
      readonly type: 7;
    }
  | {
      readonly type: 8;
    }
  | {
      readonly type: 9;
    }
  | {
      readonly type: 10;
    }
  | {
      readonly type: 11;
    }
  | {
      readonly type: 12;
    }
  | {
      readonly type: 13;
    }
  | {
      readonly type: 14;
    }
  | {
      readonly type: 16;
    }
  | {
      readonly type: 17;
    }
  | {
      readonly type: 19;
    }
  | {
      readonly type: 20;
    }
  | {
      readonly type: 1000;
      readonly option: SCSpecTypeOption;
    }
  | {
      readonly type: 1001;
      readonly result: SCSpecTypeResult;
    }
  | {
      readonly type: 1002;
      readonly vec: SCSpecTypeVec;
    }
  | {
      readonly type: 1004;
      readonly map: SCSpecTypeMap;
    }
  | {
      readonly type: 1005;
      readonly tuple: SCSpecTypeTuple;
    }
  | {
      readonly type: 1006;
      readonly bytesN: SCSpecTypeBytesN;
    }
  | {
      readonly type: 2000;
      readonly udt: SCSpecTypeUDT;
    };
export const SCSpecTypeDef = xdr.union("SCSpecTypeDef", {
  switchOn: xdr.lazy(() => SCSpecType),
  switchKey: "type",
  cases: [
    xdr.case("scSpecTypeVal", 0, xdr.void()),
    xdr.case("scSpecTypeBool", 1, xdr.void()),
    xdr.case("scSpecTypeVoid", 2, xdr.void()),
    xdr.case("scSpecTypeError", 3, xdr.void()),
    xdr.case("scSpecTypeU32", 4, xdr.void()),
    xdr.case("scSpecTypeI32", 5, xdr.void()),
    xdr.case("scSpecTypeU64", 6, xdr.void()),
    xdr.case("scSpecTypeI64", 7, xdr.void()),
    xdr.case("scSpecTypeTimepoint", 8, xdr.void()),
    xdr.case("scSpecTypeDuration", 9, xdr.void()),
    xdr.case("scSpecTypeU128", 10, xdr.void()),
    xdr.case("scSpecTypeI128", 11, xdr.void()),
    xdr.case("scSpecTypeU256", 12, xdr.void()),
    xdr.case("scSpecTypeI256", 13, xdr.void()),
    xdr.case("scSpecTypeBytes", 14, xdr.void()),
    xdr.case("scSpecTypeString", 16, xdr.void()),
    xdr.case("scSpecTypeSymbol", 17, xdr.void()),
    xdr.case("scSpecTypeAddress", 19, xdr.void()),
    xdr.case("scSpecTypeMuxedAddress", 20, xdr.void()),
    xdr.case(
      "scSpecTypeOption",
      1000,
      xdr.field(
        "option",
        xdr.lazy(() => SCSpecTypeOption),
      ),
    ),
    xdr.case(
      "scSpecTypeResult",
      1001,
      xdr.field(
        "result",
        xdr.lazy(() => SCSpecTypeResult),
      ),
    ),
    xdr.case(
      "scSpecTypeVec",
      1002,
      xdr.field(
        "vec",
        xdr.lazy(() => SCSpecTypeVec),
      ),
    ),
    xdr.case(
      "scSpecTypeMap",
      1004,
      xdr.field(
        "map",
        xdr.lazy(() => SCSpecTypeMap),
      ),
    ),
    xdr.case(
      "scSpecTypeTuple",
      1005,
      xdr.field(
        "tuple",
        xdr.lazy(() => SCSpecTypeTuple),
      ),
    ),
    xdr.case(
      "scSpecTypeBytesN",
      1006,
      xdr.field(
        "bytesN",
        xdr.lazy(() => SCSpecTypeBytesN),
      ),
    ),
    xdr.case(
      "scSpecTypeUdt",
      2000,
      xdr.field(
        "udt",
        xdr.lazy(() => SCSpecTypeUDT),
      ),
    ),
  ] as const,
}) as xdr.XdrType<SCSpecTypeDef>;
export interface SCSpecTypeOption {
  readonly valueType: SCSpecTypeDef;
}
export const SCSpecTypeOption = xdr.struct("SCSpecTypeOption", {
  valueType: xdr.lazy(() => SCSpecTypeDef),
}) as xdr.XdrType<SCSpecTypeOption>;
