import { UnsignedHyper } from "@stellar/js-xdr";
import BigNumber from "./util/bignumber.js";
import xdr from "./xdr.js";

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

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MemoType {
  export type None = MemoTypeNone;
  export type ID = MemoTypeID;
  export type Text = MemoTypeText;
  export type Hash = MemoTypeHash;
  export type Return = MemoTypeReturn;
}
export type MemoType =
  | MemoTypeHash
  | MemoTypeID
  | MemoTypeNone
  | MemoTypeReturn
  | MemoTypeText;

export type MemoValue = Buffer | string | null;

type MemoValueMap = {
  [MemoNone]: null;
  [MemoID]: string;
  [MemoText]: Buffer | string;
  [MemoHash]: Buffer;
  [MemoReturn]: Buffer;
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
  constructor(type: MemoType.Hash | MemoType.Return, value: Buffer);
  constructor(
    type: MemoType.Hash | MemoType.ID | MemoType.Return | MemoType.Text,
    value: string,
  );
  constructor(type: T, value: MemoValue);
  /**
   * @param type - `MemoNone`, `MemoID`, `MemoText`, `MemoHash` or `MemoReturn`
   * @param value - `string` for `MemoID`, `MemoText`, buffer or hex string for `MemoHash` or `MemoReturn`
   */
  constructor(type: T, value: MemoValue = null) {
    this._type = type;
    this._value = value;

    switch (this._type) {
      case MemoNone:
        break;
      case MemoID:
        Memo._validateIdValue(value as string);
        break;
      case MemoText:
        Memo._validateTextValue(value);
        break;
      case MemoHash:
      case MemoReturn:
        Memo._validateHashValue(value);
        // We want MemoHash and MemoReturn to have Buffer as a value
        if (typeof value === "string") {
          this._value = Buffer.from(value, "hex");
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
   * * `Buffer` for `MemoText` after decoding using `fromXDRObject`, original value otherwise,
   * * `Buffer` for `MemoHash`, `MemoReturn`.
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
        return Buffer.from(this._value as Buffer) as MemoTypeToValue<T>;
      default:
        throw new Error("Invalid memo type");
    }
  }

  set value(_value: MemoTypeToValue<T>) {
    throw new Error("Memo is immutable");
  }

  private static _validateIdValue(value: string): void {
    const error = new Error(`Expects a uint64 as a string. Got ${value}`);

    if (typeof value !== "string") {
      throw error;
    }

    // Only plain decimal digit strings are accepted. Scientific notation
    // ("1e18") and trailing-zero decimals ("1.0") pass BigNumber validation
    // but crash in BigInt() during XDR serialization.
    if (!/^[0-9]+$/.test(value)) {
      throw error;
    }

    let number: BigNumber;
    try {
      number = new BigNumber(value);
    } catch (e) {
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
      if (Buffer.byteLength(value, "utf8") > 28) {
        throw new Error("Expects string, array or buffer, max 28 bytes");
      }
    } else if (Buffer.isBuffer(value)) {
      if (value.length > 28) {
        throw new Error("Expects string, array or buffer, max 28 bytes");
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      if (!(xdr.Memo as any).armTypeForArm("text").isValid(value)) {
        throw new Error("Expects string, array or buffer, max 28 bytes");
      }
    }
  }

  private static _validateHashValue(value: MemoValue): void {
    const error = new Error(
      `Expects a 32 byte hash value or hex encoded string. Got ${String(value)}`,
    );

    if (value === null || typeof value === "undefined") {
      throw error;
    }

    let valueBuffer: Buffer;
    if (typeof value === "string") {
      if (!/^[0-9A-Fa-f]{64}$/g.test(value)) {
        throw error;
      }
      valueBuffer = Buffer.from(value, "hex");
    } else if (Buffer.isBuffer(value)) {
      valueBuffer = Buffer.from(value);
    } else {
      throw error;
    }

    if (!valueBuffer.length || valueBuffer.length !== 32) {
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
   * @param text - memo text
   */
  static text(text: string): Memo<MemoTypeText> {
    return new Memo(MemoText, text);
  }

  /**
   * Creates and returns a `MemoID` memo.
   *
   * @param id - 64-bit number represented as a string
   */
  static id(id: string): Memo<MemoTypeID> {
    return new Memo(MemoID, id);
  }

  /**
   * Creates and returns a `MemoHash` memo.
   *
   * @param hash - 32 byte hash or hex encoded string
   */
  static hash(hash: Buffer | string): Memo<MemoTypeHash> {
    return new Memo(MemoHash, hash);
  }

  /**
   * Creates and returns a `MemoReturn` memo.
   *
   * @param hash - 32 byte hash or hex encoded string
   */
  static return(hash: Buffer | string): Memo<MemoTypeReturn> {
    return new Memo(MemoReturn, hash);
  }

  /**
   * Returns XDR memo object.
   */
  toXDRObject(): xdr.Memo {
    switch (this._type) {
      case MemoNone:
        return xdr.Memo.memoNone();
      case MemoID:
        return xdr.Memo.memoId(
          xdr.Uint64.fromString(
            UnsignedHyper.fromString(this._value as string).toString(),
          ),
        );
      case MemoText:
        return xdr.Memo.memoText(this._value as string);
      case MemoHash:
        return xdr.Memo.memoHash(this._value as Buffer);
      case MemoReturn:
        return xdr.Memo.memoReturn(this._value as Buffer);
      default:
        throw new Error("Invalid memo type");
    }
  }

  /**
   * Returns {@link Memo} from XDR memo object.
   *
   * @param object - XDR memo object
   */
  static fromXDRObject(object: xdr.Memo): Memo {
    switch (object.switch()) {
      case xdr.MemoType.memoId():
        return Memo.id(object.id().toString());
      case xdr.MemoType.memoText():
        return Memo.text(object.value() as string);
      case xdr.MemoType.memoHash():
        return Memo.hash(object.hash());
      case xdr.MemoType.memoReturn():
        return Memo.return(object.retHash());
      default:
        break;
    }

    if (typeof object.value() === "undefined") {
      return Memo.none();
    }

    throw new Error("Unknown type");
  }
}
