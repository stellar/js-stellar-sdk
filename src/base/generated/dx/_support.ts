import {
  base64ToUint8Array,
  hexToUint8Array,
  stringToUint8Array,
  uint8ArrayToBase64,
  uint8ArrayToHex,
  uint8ArrayToString,
} from "uint8array-extras";

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { readonly [key: string]: JsonValue };

export class XdrError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "XdrError";
  }
}

export type BytesEncoding = "hex" | "base64" | "ascii" | "utf8";

export type TypeDescriptor =
  | { readonly kind: "number" }
  | { readonly kind: "bigint" }
  | { readonly kind: "boolean" }
  | { readonly kind: "string" }
  | { readonly kind: "bytes"; readonly encoding?: BytesEncoding }
  | {
      readonly kind: "enum";
      readonly values: Readonly<Record<string, number>>;
    }
  | { readonly kind: "ref"; readonly factory: () => TypeDescriptor }
  | { readonly kind: "array"; readonly element: TypeDescriptor }
  | { readonly kind: "option"; readonly element: TypeDescriptor }
  | { readonly kind: "struct"; readonly fields: readonly FieldDescriptor[] }
  | {
      readonly kind: "union";
      readonly switchKey: string;
      readonly cases: readonly UnionCaseDescriptor[];
    }
  | { readonly kind: "alias"; readonly type: TypeDescriptor }
  // Wide-int overrides: DX surface is a single bigint; engine bridges to/from
  // the schema's struct shape (Int128Parts etc.).
  | { readonly kind: "bigint128"; readonly signed: boolean }
  | { readonly kind: "bigint256"; readonly signed: boolean }
  // String-bytes override: DX surface is a JS string; engine encodes/decodes
  // to/from the schema's Uint8Array shape using `encoding` (e.g. AssetCode4
  // is ASCII).
  | { readonly kind: "stringBytes"; readonly encoding: "ascii" | "utf8" };

export interface FieldDescriptor {
  readonly name: string;
  readonly type: TypeDescriptor;
}

export interface UnionCaseDescriptor {
  readonly name: string;
  readonly discriminator: string | number | boolean;
  readonly payloadName?: string;
  readonly payloadType?: TypeDescriptor;
}

const MASK64 = (1n << 64n) - 1n;
const MIN_INT128 = -(1n << 127n);
const MAX_INT128 = (1n << 127n) - 1n;
const MAX_UINT128 = (1n << 128n) - 1n;
const MIN_INT256 = -(1n << 255n);
const MAX_INT256 = (1n << 255n) - 1n;
const MAX_UINT256 = (1n << 256n) - 1n;

function bigintToParts128(value: bigint): { hi: bigint; lo: bigint } {
  return { hi: value >> 64n, lo: value & MASK64 };
}

function partsToBigint128(parts: { hi: bigint; lo: bigint }): bigint {
  return (parts.hi << 64n) | parts.lo;
}

function bigintToParts256(value: bigint): {
  hi_hi: bigint;
  hi_lo: bigint;
  lo_hi: bigint;
  lo_lo: bigint;
} {
  return {
    hi_hi: value >> 192n,
    hi_lo: (value >> 128n) & MASK64,
    lo_hi: (value >> 64n) & MASK64,
    lo_lo: value & MASK64,
  };
}

function partsToBigint256(parts: {
  hi_hi: bigint;
  hi_lo: bigint;
  lo_hi: bigint;
  lo_lo: bigint;
}): bigint {
  return (
    (parts.hi_hi << 192n) |
    (parts.hi_lo << 128n) |
    (parts.lo_hi << 64n) |
    parts.lo_lo
  );
}

function checkBigintRange(
  value: bigint,
  signed: boolean,
  bits: 128 | 256,
  path: readonly string[],
): void {
  if (bits === 128) {
    if (signed) {
      if (value < MIN_INT128 || value > MAX_INT128) {
        throw new XdrError(
          `int128 out of range at ${pathLabel(path)}: ${value}`,
        );
      }
    } else if (value < 0n || value > MAX_UINT128) {
      throw new XdrError(
        `uint128 out of range at ${pathLabel(path)}: ${value}`,
      );
    }
  } else if (signed) {
    if (value < MIN_INT256 || value > MAX_INT256) {
      throw new XdrError(`int256 out of range at ${pathLabel(path)}: ${value}`);
    }
  } else if (value < 0n || value > MAX_UINT256) {
    throw new XdrError(`uint256 out of range at ${pathLabel(path)}: ${value}`);
  }
}

function pathLabel(path: readonly string[]): string {
  return path.length === 0 ? "<root>" : path.join(".");
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function expectObject(
  value: unknown,
  path: readonly string[],
  label: string,
): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new XdrError(
      `Expected ${label} at ${pathLabel(path)}, got ${describe(value)}`,
    );
  }
  return value as Record<string, unknown>;
}

function expectArray(
  value: unknown,
  path: readonly string[],
): readonly unknown[] {
  if (!Array.isArray(value)) {
    throw new XdrError(
      `Expected array at ${pathLabel(path)}, got ${describe(value)}`,
    );
  }
  return value;
}

export function toXDRObject(
  descriptor: TypeDescriptor,
  value: unknown,
  path: readonly string[] = [],
): unknown {
  switch (descriptor.kind) {
    case "ref":
      return toXDRObject(descriptor.factory(), value, path);
    case "alias":
      return toXDRObject(descriptor.type, value, path);
    case "enum": {
      if (
        typeof value !== "string" ||
        !Object.prototype.hasOwnProperty.call(descriptor.values, value)
      ) {
        throw new XdrError(
          `Unknown enum name at ${pathLabel(path)}: ${describe(value)}`,
        );
      }
      return descriptor.values[value];
    }
    case "bigint128":
      checkBigintRange(value as bigint, descriptor.signed, 128, path);
      return bigintToParts128(value as bigint);
    case "bigint256":
      checkBigintRange(value as bigint, descriptor.signed, 256, path);
      return bigintToParts256(value as bigint);
    case "stringBytes":
      if (typeof value !== "string") {
        throw new XdrError(
          `Expected string at ${pathLabel(path)}, got ${describe(value)}`,
        );
      }
      return decodeBytes(value, descriptor.encoding, path);
    case "array":
      return expectArray(value, path).map((item, index) =>
        toXDRObject(descriptor.element, item, [...path, `[${index}]`]),
      );
    case "option":
      return value === null
        ? null
        : toXDRObject(descriptor.element, value, path);
    case "struct": {
      const input = expectObject(value, path, "struct");
      return Object.fromEntries(
        descriptor.fields.map((field) => [
          field.name,
          toXDRObject(field.type, input[field.name], [...path, field.name]),
        ]),
      );
    }
    case "union": {
      const input = expectObject(value, path, "union");
      const unionCase = descriptor.cases.find(
        (item) => item.name === input.type,
      );
      if (unionCase === undefined) {
        throw new XdrError(
          `Unknown union case at ${pathLabel(path)}: ${String(input.type)}`,
        );
      }
      const output: Record<string, unknown> = {
        [descriptor.switchKey]: unionCase.discriminator,
      };
      if (unionCase.payloadName !== undefined) {
        output[unionCase.payloadName] = toXDRObject(
          unionCase.payloadType!,
          input[unionCase.payloadName],
          [...path, unionCase.payloadName],
        );
      }
      return output;
    }
    default:
      return value;
  }
}

export function fromXDRObject(
  descriptor: TypeDescriptor,
  value: unknown,
  path: readonly string[] = [],
): unknown {
  switch (descriptor.kind) {
    case "ref":
      return fromXDRObject(descriptor.factory(), value, path);
    case "alias":
      return fromXDRObject(descriptor.type, value, path);
    case "enum": {
      for (const [name, num] of Object.entries(descriptor.values)) {
        if (num === value) return name;
      }
      throw new XdrError(
        `Unknown enum value at ${pathLabel(path)}: ${describe(value)}`,
      );
    }
    case "bigint128":
      return partsToBigint128(value as { hi: bigint; lo: bigint });
    case "bigint256":
      return partsToBigint256(
        value as {
          hi_hi: bigint;
          hi_lo: bigint;
          lo_hi: bigint;
          lo_lo: bigint;
        },
      );
    case "stringBytes":
      return encodeBytes(value as Uint8Array, descriptor.encoding, path);
    case "array":
      return expectArray(value, path).map((item, index) =>
        fromXDRObject(descriptor.element, item, [...path, `[${index}]`]),
      );
    case "option":
      return value === null
        ? null
        : fromXDRObject(descriptor.element, value, path);
    case "struct": {
      const input = expectObject(value, path, "struct");
      return Object.fromEntries(
        descriptor.fields.map((field) => [
          field.name,
          fromXDRObject(field.type, input[field.name], [...path, field.name]),
        ]),
      );
    }
    case "union": {
      const input = expectObject(value, path, "union");
      const discriminator = input[descriptor.switchKey];
      const unionCase = descriptor.cases.find(
        (item) => item.discriminator === discriminator,
      );
      if (unionCase === undefined) {
        throw new XdrError(
          `Unknown union discriminator at ${pathLabel(path)}: ${String(discriminator)}`,
        );
      }
      const output: Record<string, unknown> = { type: unionCase.name };
      if (unionCase.payloadName !== undefined) {
        output[unionCase.payloadName] = fromXDRObject(
          unionCase.payloadType!,
          input[unionCase.payloadName],
          [...path, unionCase.payloadName],
        );
      }
      return output;
    }
    default:
      return value;
  }
}

export function toJSONValue(
  descriptor: TypeDescriptor,
  value: unknown,
  path: readonly string[] = [],
): JsonValue {
  switch (descriptor.kind) {
    case "bigint":
    case "bigint128":
    case "bigint256":
      return (value as bigint).toString();
    case "bytes":
      return encodeBytes(
        value as Uint8Array,
        descriptor.encoding ?? "hex",
        path,
      );
    case "stringBytes":
      if (typeof value !== "string") {
        throw new XdrError(
          `Expected string at ${pathLabel(path)}, got ${describe(value)}`,
        );
      }
      return value;
    case "ref":
      return toJSONValue(descriptor.factory(), value, path);
    case "alias":
      return toJSONValue(descriptor.type, value, path);
    case "enum": {
      if (
        typeof value !== "string" ||
        !Object.prototype.hasOwnProperty.call(descriptor.values, value)
      ) {
        throw new XdrError(
          `Unknown enum name at ${pathLabel(path)}: ${describe(value)}`,
        );
      }
      return value;
    }
    case "array":
      return expectArray(value, path).map((item, index) =>
        toJSONValue(descriptor.element, item, [...path, `[${index}]`]),
      );
    case "option":
      return value === null
        ? null
        : toJSONValue(descriptor.element, value, path);
    case "struct": {
      const input = expectObject(value, path, "struct");
      return Object.fromEntries(
        descriptor.fields.map((field) => [
          field.name,
          toJSONValue(field.type, input[field.name], [...path, field.name]),
        ]),
      );
    }
    case "union": {
      const input = expectObject(value, path, "union");
      const unionCase = descriptor.cases.find(
        (item) => item.name === input.type,
      );
      if (unionCase === undefined) {
        throw new XdrError(
          `Unknown union case at ${pathLabel(path)}: ${String(input.type)}`,
        );
      }
      const output: Record<string, JsonValue> = { type: unionCase.name };
      if (unionCase.payloadName !== undefined) {
        output[unionCase.payloadName] = toJSONValue(
          unionCase.payloadType!,
          input[unionCase.payloadName],
          [...path, unionCase.payloadName],
        );
      }
      return output;
    }
    default:
      return value as JsonValue;
  }
}

export function fromJSONValue(
  descriptor: TypeDescriptor,
  value: JsonValue,
  path: readonly string[] = [],
): unknown {
  switch (descriptor.kind) {
    case "bigint":
      if (typeof value !== "string" || !/^-?[0-9]+$/.test(value)) {
        throw new XdrError(
          `Canonical bigint at ${pathLabel(path)} must be a decimal string`,
        );
      }
      return BigInt(value);
    case "bigint128":
    case "bigint256": {
      if (typeof value !== "string" || !/^-?[0-9]+$/.test(value)) {
        throw new XdrError(
          `Canonical bigint at ${pathLabel(path)} must be a decimal string`,
        );
      }
      const parsed = BigInt(value);
      checkBigintRange(
        parsed,
        descriptor.signed,
        descriptor.kind === "bigint128" ? 128 : 256,
        path,
      );
      return parsed;
    }
    case "bytes":
      if (typeof value !== "string") {
        throw new XdrError(
          `Canonical bytes at ${pathLabel(path)} must be a string`,
        );
      }
      return decodeBytes(value, descriptor.encoding ?? "hex", path);
    case "stringBytes":
      if (typeof value !== "string") {
        throw new XdrError(
          `Canonical stringBytes at ${pathLabel(path)} must be a string`,
        );
      }
      // Validate by round-tripping through decodeBytes (catches encoding errors)
      decodeBytes(value, descriptor.encoding, path);
      return value;
    case "ref":
      return fromJSONValue(descriptor.factory(), value, path);
    case "alias":
      return fromJSONValue(descriptor.type, value, path);
    case "enum": {
      if (
        typeof value !== "string" ||
        !Object.prototype.hasOwnProperty.call(descriptor.values, value)
      ) {
        throw new XdrError(
          `Unknown enum name at ${pathLabel(path)}: ${describe(value)}`,
        );
      }
      return value;
    }
    case "array":
      if (!Array.isArray(value)) {
        throw new XdrError(
          `Expected array at ${pathLabel(path)}, got ${describe(value)}`,
        );
      }
      return value.map((item, index) =>
        fromJSONValue(descriptor.element, item, [...path, `[${index}]`]),
      );
    case "option":
      return value === null
        ? null
        : fromJSONValue(descriptor.element, value, path);
    case "struct": {
      const input = expectObject(value, path, "struct");
      return Object.fromEntries(
        descriptor.fields.map((field) => [
          field.name,
          fromJSONValue(field.type, (input[field.name] ?? null) as JsonValue, [
            ...path,
            field.name,
          ]),
        ]),
      );
    }
    case "union": {
      const input = expectObject(value, path, "union");
      const unionCase = descriptor.cases.find(
        (item) => item.name === input.type,
      );
      if (unionCase === undefined) {
        throw new XdrError(
          `Unknown union case at ${pathLabel(path)}: ${String(input.type)}`,
        );
      }
      const output: Record<string, unknown> = { type: unionCase.name };
      if (unionCase.payloadName !== undefined) {
        output[unionCase.payloadName] = fromJSONValue(
          unionCase.payloadType!,
          (input[unionCase.payloadName] ?? null) as JsonValue,
          [...path, unionCase.payloadName],
        );
      }
      return output;
    }
    default:
      return value;
  }
}

function encodeBytes(
  bytes: Uint8Array,
  encoding: BytesEncoding,
  path: readonly string[],
): string {
  switch (encoding) {
    case "hex":
      return uint8ArrayToHex(bytes);
    case "base64":
      return uint8ArrayToBase64(bytes);
    case "ascii":
      for (let i = 0; i < bytes.length; i += 1) {
        if (bytes[i] > 0x7f) {
          throw new XdrError(
            `Non-ASCII byte at ${pathLabel(path)}: 0x${bytes[i].toString(16)}`,
          );
        }
      }
      return uint8ArrayToString(bytes, "ascii");
    case "utf8":
      return uint8ArrayToString(bytes);
  }
}

function decodeBytes(
  value: string,
  encoding: BytesEncoding,
  path: readonly string[],
): Uint8Array {
  try {
    switch (encoding) {
      case "hex":
        return hexToUint8Array(value);
      case "base64":
        return base64ToUint8Array(value);
      case "ascii":
        for (let i = 0; i < value.length; i += 1) {
          if (value.charCodeAt(i) > 0x7f) {
            throw new XdrError(`Non-ASCII character at ${pathLabel(path)}`);
          }
        }
        return stringToUint8Array(value);
      case "utf8":
        return stringToUint8Array(value);
    }
  } catch (error) {
    if (error instanceof XdrError) throw error;
    throw new XdrError(
      `Invalid ${encoding} bytes at ${pathLabel(path)}: ${(error as Error).message}`,
    );
  }
}

export type XdrFormat = "raw" | "base64" | "hex";

export function encodeXdr<T>(
  schemaType: { encode: (value: T) => Uint8Array },
  value: T,
  xdrFormat?: XdrFormat,
): Uint8Array | string {
  const bytes = schemaType.encode(value);
  if (xdrFormat === undefined || xdrFormat === "raw") return bytes;
  return xdrFormat === "hex"
    ? uint8ArrayToHex(bytes)
    : uint8ArrayToBase64(bytes);
}

export function decodeXdr<T>(
  schemaType: { decode: (input: Uint8Array) => T },
  xdrInput: string | Uint8Array,
  xdrFormat: XdrFormat = "base64",
): T {
  if (typeof xdrInput !== "string") return schemaType.decode(xdrInput);
  const stringFormat = xdrFormat === "raw" ? "base64" : xdrFormat;
  const bytes =
    stringFormat === "hex"
      ? hexToUint8Array(xdrInput)
      : base64ToUint8Array(xdrInput);
  return schemaType.decode(bytes);
}
