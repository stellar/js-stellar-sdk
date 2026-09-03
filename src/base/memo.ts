import { hexToUint8Array, stringToUint8Array } from "uint8array-extras";
import CustomBigNumber from "./util/bignumber.js";
import type { BigNumber } from "./util/bignumber.js";
import { Hash as XdrHash, Memo as XdrMemo, Uint64 } from "../xdr/index.js";

/**
 * Type of {@link Memo}.
 */
export const MemoNone = "none";
/**
 * Type of {@link Memo}.
 */
export const MemoID = "id";
/**
 * Type of {@link Memo}.
 */
export const MemoText = "text";
/**
 * Type of {@link Memo}.
 */
export const MemoHash = "hash";
/**
 * Type of {@link Memo}.
 */
export const MemoReturn = "return";

export type MemoTypeNone = typeof MemoNone;
export type MemoTypeID = typeof MemoID;
export type MemoTypeText = typeof MemoText;
export type MemoTypeHash = typeof MemoHash;
export type MemoTypeReturn = typeof MemoReturn;

export namespace MemoType {
  export type None = MemoTypeNone;
  export type ID = MemoTypeID;
  export type Text = MemoTypeText;
  export type Hash = MemoTypeHash;
  export type Return = MemoTypeReturn;
}
export type MemoType =
  MemoTypeHash | MemoTypeID | MemoTypeNone | MemoTypeReturn | MemoTypeText;

export type MemoValue = string | null | Uint8Array;

type MemoValueMap = {
  [MemoNone]: null;
  [MemoID]: string;
  [MemoText]: Uint8Array | string;
  [MemoHash]: Uint8Array;
  [MemoReturn]: Uint8Array;
};

type MemoTypeToValue<T extends MemoType> = MemoValueMap[T];
/**
 * `Memo` represents memos attached to transactions.
 *
 * @see [Transactions concept](https://developers.stellar.org/docs/glossary/transactions/)
 */
export class Memo<T extends MemoType = MemoType> {
  private _type: T;
  private _value: MemoValue;

  constructor(type: MemoType.None, value?: null);
  constructor(type: MemoType.Hash | MemoType.Return, value: Uint8Array);
  constructor(type: MemoType.ID, value: string | bigint);
  constructor(
    type: MemoType.Hash | MemoType.ID | MemoType.Return | MemoType.Text,
    value: string,
  );
  constructor(type: T, value: MemoValue);
  /**
   * @param type - `MemoNone`, `MemoID`, `MemoText`, `MemoHash` or `MemoReturn`
   * @param value - `string` for `MemoID`, `MemoText`, `Uint8Array` or hex string for `MemoHash` or `MemoReturn`
   */
  constructor(type: T, value: MemoValue | bigint = null) {
    this._type = type;
    this._value = typeof value === "bigint" ? value.toString() : value;

    switch (this._type) {
      case MemoNone:
        break;
      case MemoID:
        Memo._validateIdValue(value as string | bigint);
        break;
      case MemoText:
        Memo._validateTextValue(value as MemoValue);
        break;
      case MemoHash:
      case MemoReturn:
        Memo._validateHashValue(value as MemoValue);
        // We want MemoHash and MemoReturn to have Uint8Array as a value
        if (typeof value === "string") {
          this._value = hexToUint8Array(value);
        }
        break;
      default:
        throw new Error("Invalid memo type");
    }
  }

  /**
   * Contains memo type: `MemoNone`, `MemoID`, `MemoText`, `MemoHash` or `MemoReturn`
   */
  get type(): T {
    return this._type;
  }

  set type(_type: T) {
    throw new Error("Memo is immutable");
  }

  /**
   * Contains memo value:
   * * `null` for `MemoNone`,
   * * `string` for `MemoID`,
   * * `Uint8Array` for `MemoText` after decoding using `fromXdrObject`, original value otherwise,
   * * `Uint8Array` for `MemoHash`, `MemoReturn`.
   */
  get value(): MemoTypeToValue<T> {
    switch (this._type) {
      case MemoNone:
        return null as MemoTypeToValue<T>;
      case MemoID:
      case MemoText:
        return this._value as MemoTypeToValue<T>;
      case MemoHash:
      case MemoReturn:
        // Uint8Array.from, not .slice(): Buffer.prototype.slice returns a view,
        // so it would not be a defensive copy for Buffer-typed callers.
        return Uint8Array.from(this._value as Uint8Array) as MemoTypeToValue<T>;
      default:
        throw new Error("Invalid memo type");
    }
  }

  set value(_value: MemoTypeToValue<T>) {
    throw new Error("Memo is immutable");
  }

  private static _validateIdValue(value: string | bigint): void {
    const originalType = typeof value;
    const error = new Error(
      originalType === "bigint"
        ? `Expects a uint64 as a string or bigint. Got ${value} (bigint) out of uint64 range.`
        : `Expects a uint64 as a string or bigint. Got ${value}${
            originalType !== "string" ? ` (${originalType})` : ""
          }.`,
    );

    if (originalType !== "string" && originalType !== "bigint") {
      throw error;
    }

    const stringValue =
      originalType === "bigint"
        ? (value as bigint).toString()
        : (value as string);

    // Only plain decimal digit strings are accepted. Scientific notation
    // ("1e18") and trailing-zero decimals ("1.0") pass BigNumber validation
    // but crash in BigInt() during XDR serialization.
    if (!/^[0-9]+$/.test(stringValue)) {
      throw error;
    }

    let number: BigNumber;
    try {
      number = new CustomBigNumber(stringValue);
    } catch {
      throw error;
    }

    // Infinity
    if (!number.isFinite()) {
      throw error;
    }

    // NaN
    if (number.isNaN()) {
      throw error;
    }

    // Negative
    if (number.isNegative()) {
      throw error;
    }

    // Decimal
    if (!number.isInteger()) {
      throw error;
    }

    // Exceeds uint64 max (2^64 - 1)
    if (number.isGreaterThan("18446744073709551615")) {
      throw error;
    }
  }

  private static _validateTextValue(value: MemoValue): void {
    if (typeof value === "string") {
      if (stringToUint8Array(value).length > 28) {
        throw new Error("Expects string or Uint8Array, max 28 bytes");
      }
    } else if (value instanceof Uint8Array) {
      if (value.length > 28) {
        throw new Error("Expects string or Uint8Array, max 28 bytes");
      }
    } else {
      throw new Error("Expects string or Uint8Array, max 28 bytes");
    }
  }

  private static _validateHashValue(value: MemoValue): void {
    const error = new Error(
      `Expects a 32 byte hash value or hex encoded string. Got ${String(value)}`,
    );

    if (value === null || typeof value === "undefined") {
      throw error;
    }

    let valueBytes: Uint8Array;
    if (typeof value === "string") {
      if (!/^[0-9A-Fa-f]{64}$/g.test(value)) {
        throw error;
      }
      valueBytes = hexToUint8Array(value);
    } else if (value instanceof Uint8Array) {
      valueBytes = value;
    } else {
      throw error;
    }

    if (!valueBytes.length || valueBytes.length !== 32) {
      throw error;
    }
  }

  /**
   * Returns an empty memo (`MemoNone`).
   */
  static none(): Memo<MemoTypeNone> {
    return new Memo(MemoNone);
  }

  /**
   * Creates and returns a `MemoText` memo.
   *
   * @param text - memo text. A JS string is UTF-8 encoded on the wire;
   *   pass a `Uint8Array` for byte-exact content. A plain `number[]` is not
   *   accepted (16.2.0 and earlier took one); wrap it: `new Uint8Array(arr)`.
   */
  static text(text: string | Uint8Array): Memo<MemoTypeText> {
    return new Memo(MemoText, text as MemoValue);
  }

  /**
   * Creates and returns a `MemoID` memo.
   *
   * @param id - 64-bit number represented as a string
   */
  static id(id: string | bigint): Memo<MemoTypeID> {
    return new Memo(MemoID, id);
  }

  /**
   * Creates and returns a `MemoHash` memo.
   *
   * @param hash - 32 byte hash or hex encoded string
   */
  static hash(hash: Uint8Array | string): Memo<MemoTypeHash> {
    return new Memo(MemoHash, hash);
  }

  /**
   * Creates and returns a `MemoReturn` memo.
   *
   * @param hash - 32 byte hash or hex encoded string
   */
  static return(hash: Uint8Array | string): Memo<MemoTypeReturn> {
    return new Memo(MemoReturn, hash);
  }

  /**
   * Returns XDR memo object.
   */
  toXdrObject(): XdrMemo {
    switch (this._type) {
      case MemoNone:
        return XdrMemo.memoNone();
      case MemoID:
        return XdrMemo.memoId(Uint64.fromString(this._value as string));
      case MemoText:
        // The XDR `string<28>` type accepts either a JS string (UTF-8 encoded)
        // or a Uint8Array (byte-exact). Memo.text may have been constructed
        // with either, so forward as-is.
        return XdrMemo.memoText(this._value as string);
      case MemoHash:
        return XdrMemo.memoHash(new XdrHash(this._value as Uint8Array));
      case MemoReturn:
        return XdrMemo.memoReturn(new XdrHash(this._value as Uint8Array));
      default:
        throw new Error("Invalid memo type");
    }
  }

  /**
   * Returns {@link Memo} from XDR memo object.
   *
   * @param object - XDR memo object
   */
  static fromXdrObject(object: XdrMemo): Memo {
    switch (object.type) {
      case "memoId":
        return Memo.id(object.value.toString());
      case "memoText":
        return Memo.text(Uint8Array.from(object.text.bytes));
      case "memoHash":
        return Memo.hash(object.value.toBytes());
      case "memoReturn":
        return Memo.return(object.value.toBytes());
      case "memoNone":
        return Memo.none();
      default:
        break;
    }

    throw new Error("Unknown type");
  }

  /**
   * @deprecated Use {@link toXdrObject} instead.
   * Deprecated in version v17.0.0
   */
  toXDRObject(): XdrMemo {
    return this.toXdrObject();
  }

  /**
   * @deprecated Use {@link Memo.fromXdrObject} instead.
   * Deprecated in version v17.0.0
   */
  static fromXDRObject(object: XdrMemo): Memo {
    return Memo.fromXdrObject(object);
  }
}
