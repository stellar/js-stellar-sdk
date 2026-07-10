import {
  hexToUint8Array,
  uint8ArrayToHex,
  base64ToUint8Array,
  uint8ArrayToBase64,
} from "uint8array-extras";
import type { XdrType } from "@stellar/js-xdr";
import { XdrError } from "@stellar/js-xdr";
import { walkToJson, walkFromJson } from "./to-json.js";

export type XdrFormat = "raw" | "hex" | "base64";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

/**
 * Bridge a concrete `XdrValue` subclass to its wire shape. Every subclass
 * declares `static readonly schema` and `static fromXdrObject(wire)`, which
 * is everything `XdrValue.fromXdr` needs to round-trip bytes through the class.
 */
export interface XdrValueConstructor<Wire, Instance extends XdrValue> {
  readonly schema: XdrType<Wire>;
  readonly name: string;
  fromXdrObject(wire: Wire): Instance;
}

/**
 * Base class for every generated XDR type. Subclasses supply:
 *   - `static readonly schema: XdrType<Wire>` describing the wire shape
 *   - `toXdrObject(): Wire` converting `this` into the wire shape (public so
 *     nested classes can compose without breaking access modifiers)
 *   - `static fromXdrObject(wire: Wire): InstanceType` going the other way
 *   - `toJson(): JsonValue`
 *
 * Inherited helpers (`toXdr`, `fromXdr`, `toString`, `equals`) handle the rest.
 */
export abstract class XdrValue {
  abstract toXdrObject(): unknown;

  toXdr(): Uint8Array;
  toXdr(format: "raw"): Uint8Array;
  toXdr(format: "hex" | "base64"): string;
  toXdr(format: XdrFormat = "raw"): Uint8Array | string {
    const ctor = this.constructor as typeof XdrValue & {
      readonly schema: XdrType<unknown>;
    };
    if (!ctor.schema) {
      throw new XdrError(`${ctor.name}: missing static schema`);
    }
    const bytes = ctor.schema.encode(this.toXdrObject());
    return encodeBytes(bytes, format);
  }

  toString(): string {
    return uint8ArrayToBase64(this.toXdr());
  }

  toJson(): JsonValue {
    const ctor = this.constructor as typeof XdrValue & {
      readonly schema: XdrType<unknown>;
    };
    if (!ctor.schema) {
      throw new XdrError(`${ctor.name}: missing static schema`);
    }
    return walkToJson(this.toXdrObject(), ctor.schema);
  }

  equals(other: this): boolean {
    if (this === other) return true;
    if (other == null || !(other instanceof XdrValue)) return false;
    if (this.constructor !== other.constructor) return false;
    const a = this.toXdr();
    const b = other.toXdr();
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  static fromXdr<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: Uint8Array,
  ): Instance;
  static fromXdr<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: string,
    format: "hex" | "base64",
  ): Instance;
  static fromXdr<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: Uint8Array | string,
    format?: "hex" | "base64",
  ): Instance {
    const bytes = decodeBytes(input, format);
    return this.fromXdrObject(this.schema.decode(bytes));
  }

  static fromJson<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    json: JsonValue,
  ): Instance {
    return this.fromXdrObject(walkFromJson(json, this.schema) as Wire);
  }
}

export function encodeBytes(
  bytes: Uint8Array,
  format: XdrFormat,
): Uint8Array | string {
  switch (format) {
    case "raw":
      return bytes;
    case "hex":
      return uint8ArrayToHex(bytes);
    case "base64":
      return uint8ArrayToBase64(bytes);
  }
}

export function decodeBytes(
  input: Uint8Array | string,
  format: "raw" | "hex" | "base64" | undefined,
): Uint8Array {
  if (input instanceof Uint8Array) return input;
  if (format === undefined || format === "raw") {
    throw new XdrError(
      "fromXdr: string input requires format ('hex' | 'base64')",
    );
  }
  if (format === "hex") return hexToUint8Array(input);
  return base64ToUint8Array(input);
}
