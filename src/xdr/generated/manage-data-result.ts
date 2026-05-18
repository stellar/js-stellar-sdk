/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ManageDataResultCode } from "./manage-data-result-code.js";

export type ManageDataResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 };

export type ManageDataResultVariantName =
  | "manageDataSuccess"
  | "manageDataNotSupportedYet"
  | "manageDataNameNotFound"
  | "manageDataLowReserve"
  | "manageDataInvalidName";

/**
 * ```xdr
 * union ManageDataResult switch (ManageDataResultCode code)
 * {
 * case MANAGE_DATA_SUCCESS:
 *     void;
 * case MANAGE_DATA_NOT_SUPPORTED_YET:
 * case MANAGE_DATA_NAME_NOT_FOUND:
 * case MANAGE_DATA_LOW_RESERVE:
 * case MANAGE_DATA_INVALID_NAME:
 *     void;
 * };
 * ```
 */
abstract class ManageDataResultBase extends XdrValue {
  abstract readonly type: ManageDataResultVariantName;

  static readonly schema: XdrType<ManageDataResultWire> = union(
    "ManageDataResult",
    {
      switchOn: ManageDataResultCode.schema,
      cases: [
        case_("manageDataSuccess", 0, voidType()),
        case_("manageDataNotSupportedYet", -1, voidType()),
        case_("manageDataNameNotFound", -2, voidType()),
        case_("manageDataLowReserve", -3, voidType()),
        case_("manageDataInvalidName", -4, voidType()),
      ],
      switchKey: "code",
    },
  );

  static manageDataSuccess(): ManageDataResultSuccess {
    return new ManageDataResultSuccess();
  }

  static manageDataNotSupportedYet(): ManageDataResultNotSupportedYet {
    return new ManageDataResultNotSupportedYet();
  }

  static manageDataNameNotFound(): ManageDataResultNameNotFound {
    return new ManageDataResultNameNotFound();
  }

  static manageDataLowReserve(): ManageDataResultLowReserve {
    return new ManageDataResultLowReserve();
  }

  static manageDataInvalidName(): ManageDataResultInvalidName {
    return new ManageDataResultInvalidName();
  }

  static fromXdrObject(wire: ManageDataResultWire): ManageDataResult {
    switch (wire.code) {
      case 0:
        return new ManageDataResultSuccess();
      case -1:
        return new ManageDataResultNotSupportedYet();
      case -2:
        return new ManageDataResultNameNotFound();
      case -3:
        return new ManageDataResultLowReserve();
      case -4:
        return new ManageDataResultInvalidName();
    }
  }

  abstract toXdrObject(): ManageDataResultWire;
}

export class ManageDataResultSuccess extends ManageDataResultBase {
  readonly type = "manageDataSuccess" as const;

  toXdrObject(): Extract<ManageDataResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class ManageDataResultNotSupportedYet extends ManageDataResultBase {
  readonly type = "manageDataNotSupportedYet" as const;

  toXdrObject(): Extract<ManageDataResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class ManageDataResultNameNotFound extends ManageDataResultBase {
  readonly type = "manageDataNameNotFound" as const;

  toXdrObject(): Extract<ManageDataResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class ManageDataResultLowReserve extends ManageDataResultBase {
  readonly type = "manageDataLowReserve" as const;

  toXdrObject(): Extract<ManageDataResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class ManageDataResultInvalidName extends ManageDataResultBase {
  readonly type = "manageDataInvalidName" as const;

  toXdrObject(): Extract<ManageDataResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export type ManageDataResult =
  | ManageDataResultSuccess
  | ManageDataResultNotSupportedYet
  | ManageDataResultNameNotFound
  | ManageDataResultLowReserve
  | ManageDataResultInvalidName;
export const ManageDataResult = ManageDataResultBase;
