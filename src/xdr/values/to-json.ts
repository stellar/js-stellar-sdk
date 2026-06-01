// Generic JSON walker used by `XdrValue.toJson()` / `XdrValue.fromJson()`.
//
// The walker dispatches on `schema.kind` to convert between the raw "wire"
// shape (returned by `toXdrObject()`) and a SEP-0051-style JSON value.
// Schema-name overrides cover types that need a custom encoding (StrKey
// addresses, wide-int parts collapsed to a decimal string, etc.); types
// without an override fall through to the kind-based default.

import { uint8ArrayToHex, hexToUint8Array } from "uint8array-extras";
import { Buffer } from "buffer";

import { XdrError } from "../core/error.js";
import type { XdrType } from "../core/xdr-type.js";
import type { JsonValue } from "./xdr-value.js";
import { XdrString } from "./xdr-string.js";
import {
  structFieldJsonName,
  enumJsonNames,
  unionCaseNames,
} from "./json-names.js";
import {
  assertBigIntFits,
  bigIntTo128Parts,
  bigIntTo256Parts,
  partsTo128BigInt,
  partsTo256BigInt,
  type Int128Parts,
  type Int256Parts,
} from "./bigint-parts.js";
import { StrKey } from "../../base/strkey.js";

type SchemaView<Extras> = XdrType<unknown> & Extras;

interface StructView {
  readonly entries: ReadonlyArray<readonly [string, XdrType<unknown>]>;
}

interface UnionView {
  readonly switchOn: XdrType<unknown>;
  readonly cases: ReadonlyArray<{
    readonly name: string;
    readonly discriminant: unknown;
    readonly arm: UnionArmView;
  }>;
  readonly defaultArm: UnionArmView | undefined;
  readonly switchKey: string;
}

type UnionArmView =
  | XdrType<void>
  | {
      readonly kind: "field";
      readonly name: string;
      readonly schema: XdrType<unknown>;
    };

interface EnumView {
  readonly nameByValue: ReadonlyMap<number, string>;
  // The enum's camelized `member_prefix`, stripped before snake_casing to
  // recover the SEP-0051 JSON name (attached by `withMemberPrefix` in the value
  // layer). Absent for enums without a prefix.
  readonly memberPrefix?: string;
}

interface ArrayView {
  readonly element: XdrType<unknown>;
}

interface FixedArrayView {
  readonly element: XdrType<unknown>;
  readonly length: number;
}

interface OptionView {
  readonly element: XdrType<unknown>;
}

interface LazyView {
  readonly getSchema: () => XdrType<unknown>;
}

interface JsonOverride {
  toJson(wire: unknown): JsonValue;
  fromJson(json: JsonValue): unknown;
}

const OVERRIDES = new Map<string, JsonOverride>();

export function walkToJson(wire: unknown, schema: XdrType<unknown>): JsonValue {
  const override = schema.name ? OVERRIDES.get(schema.name) : undefined;
  if (override) return override.toJson(wire);

  switch (schema.kind) {
    case "bool":
      return wire as boolean;
    case "void":
      return null;
    case "int32":
    case "uint32":
      return wire as number;
    case "float":
    case "double":
      return wire as number;
    case "int64":
    case "uint64":
      return (wire as bigint).toString();
    case "string":
      return (wire as XdrString).toJson();
    case "opaque":
    case "varOpaque":
      // SEP-0051: both fixed and variable opaque are hex-encoded strings.
      return uint8ArrayToHex(wire as Uint8Array);
    case "enum": {
      const s = schema as SchemaView<EnumView>;
      const name = s.nameByValue.get(wire as number);
      if (name === undefined) {
        throw new XdrError(
          `${schema.name ?? "enum"}: unknown enum value ${String(wire)}`,
        );
      }
      return (
        enumJsonNames(s.memberPrefix, s.nameByValue).bySource.get(name) ?? name
      );
    }
    case "option": {
      const s = schema as SchemaView<OptionView>;
      return wire === null ? null : walkToJson(wire, s.element);
    }
    case "array":
    case "fixedArray": {
      const s = schema as SchemaView<ArrayView>;
      return (wire as unknown[]).map((v) => walkToJson(v, s.element));
    }
    case "struct": {
      const s = schema as SchemaView<StructView>;
      const rec = wire as Record<string, unknown>;
      const out: Record<string, JsonValue> = {};
      // SEP-0051: struct field keys are snake_case in JSON. Codegen produces
      // camelCase wire field names (`assetCode`), so transform on emit.
      for (const [k, fieldSchema] of s.entries) {
        out[structFieldJsonName(k)] = walkToJson(rec[k], fieldSchema);
      }
      return out;
    }
    case "union": {
      const s = schema as SchemaView<UnionView>;
      const rec = wire as Record<string, unknown>;
      const disc = rec[s.switchKey];
      const matched = s.cases.find((c) => c.discriminant === disc);
      const arm = matched?.arm ?? s.defaultArm;
      if (arm === undefined) {
        throw new XdrError(
          `${schema.name ?? "union"}: no case for discriminator ${String(disc)}`,
        );
      }
      const sourceName = matched?.name ?? "default";
      const names = unionCaseNames(s);
      const jsonKey = names.bySource.get(sourceName) ?? sourceName;
      if (isFieldArm(arm)) {
        return {
          [jsonKey]: walkToJson(rec[arm.name], arm.schema),
        };
      }
      return jsonKey;
    }
    case "lazy": {
      const s = schema as SchemaView<LazyView>;
      return walkToJson(wire, s.getSchema());
    }
    default:
      throw new XdrError(
        `${schema.name ?? schema.kind}: toJson unsupported for kind ${schema.kind}`,
      );
  }
}

export function walkFromJson(
  json: JsonValue,
  schema: XdrType<unknown>,
): unknown {
  const override = schema.name ? OVERRIDES.get(schema.name) : undefined;
  if (override) return override.fromJson(json);

  switch (schema.kind) {
    case "bool":
      assertJsonType(json, "boolean", schema);
      return json;
    case "void":
      return undefined;
    case "int32":
    case "uint32":
    case "float":
    case "double":
      assertJsonType(json, "number", schema);
      return json;
    case "int64":
    case "uint64":
      assertJsonType(json, "string", schema);
      return BigInt(json as string);
    case "string":
      assertJsonType(json, "string", schema);
      return XdrString.fromJson(json as string);
    case "opaque":
    case "varOpaque":
      assertJsonType(json, "string", schema);
      return hexToUint8Array(json as string);
    case "enum": {
      const s = schema as SchemaView<EnumView>;
      assertJsonType(json, "string", schema);
      const target = json as string;
      const names = enumJsonNames(s.memberPrefix, s.nameByValue);
      const sourceName = names.byJson.get(target);
      if (sourceName !== undefined) {
        for (const [value, name] of s.nameByValue) {
          if (name === sourceName) return value;
        }
      }
      // Tolerate the raw (camelCase) source name as well.
      for (const [value, name] of s.nameByValue) {
        if (name === target) return value;
      }
      throw new XdrError(
        `${schema.name ?? "enum"}: unknown enum name ${target}`,
      );
    }
    case "option": {
      const s = schema as SchemaView<OptionView>;
      return json === null ? null : walkFromJson(json, s.element);
    }
    case "array": {
      const s = schema as SchemaView<ArrayView>;
      if (!Array.isArray(json)) {
        throw new XdrError(
          `${schema.name ?? "array"}: expected JSON array, got ${typeof json}`,
        );
      }
      return json.map((v) => walkFromJson(v, s.element));
    }
    case "fixedArray": {
      const s = schema as SchemaView<FixedArrayView>;
      if (!Array.isArray(json)) {
        throw new XdrError(
          `${schema.name ?? "fixedArray"}: expected JSON array, got ${typeof json}`,
        );
      }
      if (json.length !== s.length) {
        throw new XdrError(
          `${schema.name ?? "fixedArray"}: expected length ${s.length}, got ${json.length}`,
        );
      }
      return json.map((v) => walkFromJson(v, s.element));
    }
    case "struct": {
      const s = schema as SchemaView<StructView>;
      if (!isPlainObject(json)) {
        throw new XdrError(`${schema.name ?? "struct"}: expected JSON object`);
      }
      const rec = json as Record<string, JsonValue>;
      const out: Record<string, unknown> = {};
      // Accept either the SEP-0051 snake_case key or the raw camelCase wire
      // name (so internally-produced JSON round-trips even if a caller hands
      // us camelCase).
      for (const [k, fieldSchema] of s.entries) {
        const snake = structFieldJsonName(k);
        const lookupKey = snake in rec ? snake : k in rec ? k : undefined;
        if (lookupKey === undefined) {
          throw new XdrError(
            `${schema.name ?? "struct"}: missing field ${snake}`,
          );
        }
        out[k] = walkFromJson(rec[lookupKey], fieldSchema);
      }
      return out;
    }
    case "union":
      return unionFromJson(json, schema as SchemaView<UnionView>);
    case "lazy": {
      const s = schema as SchemaView<LazyView>;
      return walkFromJson(json, s.getSchema());
    }
    default:
      throw new XdrError(
        `${schema.name ?? schema.kind}: fromJson unsupported for kind ${schema.kind}`,
      );
  }
}

function unionFromJson(
  json: JsonValue,
  schema: SchemaView<UnionView>,
): unknown {
  let jsonKey: string;
  let payload: JsonValue | undefined;
  if (typeof json === "string") {
    jsonKey = json;
  } else if (isPlainObject(json)) {
    const keys = Object.keys(json as object);
    if (keys.length !== 1) {
      throw new XdrError(
        `${schema.name ?? "union"}: expected single-key object, got ${keys.length}`,
      );
    }
    jsonKey = keys[0];
    payload = (json as Record<string, JsonValue>)[jsonKey];
  } else {
    throw new XdrError(
      `${schema.name ?? "union"}: expected string or single-key object`,
    );
  }

  // Accept either the SEP-0051 form (snake_case, prefix stripped) or the
  // raw camelCase source name; fall back to literal for "default".
  const names = unionCaseNames(schema);
  const sourceName = names.byJson.get(jsonKey) ?? jsonKey;
  const matched = schema.cases.find((c) => c.name === sourceName);
  const arm =
    matched?.arm ??
    (sourceName === "default" || jsonKey === "default"
      ? schema.defaultArm
      : undefined);
  if (arm === undefined) {
    throw new XdrError(`${schema.name ?? "union"}: unknown case ${jsonKey}`);
  }
  const discriminant = matched
    ? matched.discriminant
    : walkFromJson(jsonKey, schema.switchOn);
  const out: Record<string, unknown> = { [schema.switchKey]: discriminant };
  if (isFieldArm(arm)) {
    if (payload === undefined) {
      throw new XdrError(
        `${schema.name ?? "union"}.${jsonKey}: missing arm payload`,
      );
    }
    out[arm.name] = walkFromJson(payload, arm.schema);
  } else if (payload !== undefined && payload !== null) {
    throw new XdrError(
      `${schema.name ?? "union"}.${jsonKey}: unexpected payload for void arm`,
    );
  }
  return out;
}

function isFieldArm(
  arm: UnionArmView,
): arm is Extract<UnionArmView, { kind: "field" }> {
  return typeof arm === "object" && arm !== null && "schema" in arm;
}

function assertJsonType(
  json: JsonValue,
  expected: "string" | "number" | "boolean",
  schema: XdrType<unknown>,
): void {
  if (typeof json !== expected) {
    throw new XdrError(
      `${schema.name ?? schema.kind}: expected JSON ${expected}, got ${typeof json}`,
    );
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Uint8Array)
  );
}

function asBuffer(bytes: Uint8Array): Buffer {
  return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function asUint8Array(buf: Buffer): Uint8Array {
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

// ---------- overrides ----------
// StrKey-encoded addresses.

OVERRIDES.set("PublicKey", {
  toJson(wire) {
    const w = wire as { type: number; ed25519: Uint8Array };
    if (w.type !== 0) {
      throw new XdrError(
        `PublicKey: unsupported variant ${w.type} for JSON output`,
      );
    }
    return StrKey.encodeEd25519PublicKey(asBuffer(w.ed25519));
  },
  fromJson(json) {
    if (typeof json !== "string") {
      throw new XdrError("PublicKey: expected G-strkey string");
    }
    return {
      type: 0,
      ed25519: asUint8Array(StrKey.decodeEd25519PublicKey(json)),
    };
  },
});

OVERRIDES.set("MuxedAccount", {
  toJson(wire) {
    const w = wire as
      | { type: 0; ed25519: Uint8Array }
      | { type: 256; med25519: { id: bigint; ed25519: Uint8Array } };
    if (w.type === 0) {
      return StrKey.encodeEd25519PublicKey(asBuffer(w.ed25519));
    }
    const payload = Buffer.alloc(40);
    payload.set(w.med25519.ed25519, 0);
    payload.writeBigUInt64BE(w.med25519.id, 32);
    return StrKey.encodeMed25519PublicKey(payload);
  },
  fromJson(json) {
    if (typeof json !== "string") {
      throw new XdrError("MuxedAccount: expected strkey string");
    }
    if (json.startsWith("G")) {
      return {
        type: 0,
        ed25519: asUint8Array(StrKey.decodeEd25519PublicKey(json)),
      };
    }
    if (json.startsWith("M")) {
      const raw = StrKey.decodeMed25519PublicKey(json);
      const ed25519 = asUint8Array(raw.subarray(0, 32));
      const id = raw.readBigUInt64BE(32);
      return { type: 256, med25519: { id, ed25519 } };
    }
    throw new XdrError(`MuxedAccount: unsupported strkey prefix in ${json}`);
  },
});

OVERRIDES.set("MuxedEd25519Account", {
  toJson(wire) {
    const w = wire as { id: bigint; ed25519: Uint8Array };
    const payload = Buffer.alloc(40);
    payload.set(w.ed25519, 0);
    payload.writeBigUInt64BE(w.id, 32);
    return StrKey.encodeMed25519PublicKey(payload);
  },
  fromJson(json) {
    if (typeof json !== "string") {
      throw new XdrError("MuxedEd25519Account: expected M-strkey string");
    }
    const raw = StrKey.decodeMed25519PublicKey(json);
    return {
      id: raw.readBigUInt64BE(32),
      ed25519: asUint8Array(raw.subarray(0, 32)),
    };
  },
});

OVERRIDES.set("SignerKey", {
  toJson(wire) {
    const w = wire as
      | { type: 0; ed25519: Uint8Array }
      | { type: 1; preAuthTx: Uint8Array }
      | { type: 2; hashX: Uint8Array }
      | {
          type: 3;
          ed25519SignedPayload: { ed25519: Uint8Array; payload: Uint8Array };
        };
    switch (w.type) {
      case 0:
        return StrKey.encodeEd25519PublicKey(asBuffer(w.ed25519));
      case 1:
        return StrKey.encodePreAuthTx(asBuffer(w.preAuthTx));
      case 2:
        return StrKey.encodeSha256Hash(asBuffer(w.hashX));
      case 3: {
        const sp = w.ed25519SignedPayload;
        const buf = Buffer.alloc(32 + 4 + roundUp4(sp.payload.length));
        buf.set(sp.ed25519, 0);
        buf.writeUInt32BE(sp.payload.length, 32);
        buf.set(sp.payload, 36);
        return StrKey.encodeSignedPayload(buf);
      }
    }
  },
  fromJson(json) {
    if (typeof json !== "string") {
      throw new XdrError("SignerKey: expected strkey string");
    }
    if (json.startsWith("G")) {
      return {
        type: 0,
        ed25519: asUint8Array(StrKey.decodeEd25519PublicKey(json)),
      };
    }
    if (json.startsWith("T")) {
      return {
        type: 1,
        preAuthTx: asUint8Array(StrKey.decodePreAuthTx(json)),
      };
    }
    if (json.startsWith("X")) {
      return { type: 2, hashX: asUint8Array(StrKey.decodeSha256Hash(json)) };
    }
    if (json.startsWith("P")) {
      const raw = StrKey.decodeSignedPayload(json);
      const ed25519 = asUint8Array(raw.subarray(0, 32));
      const payloadLen = raw.readUInt32BE(32);
      const payload = asUint8Array(raw.subarray(36, 36 + payloadLen));
      return { type: 3, ed25519SignedPayload: { ed25519, payload } };
    }
    throw new XdrError(`SignerKey: unsupported strkey prefix in ${json}`);
  },
});

OVERRIDES.set("ScAddress", {
  toJson(wire) {
    const w = wire as
      | { type: 0; accountId: { type: 0; ed25519: Uint8Array } }
      | { type: 1; contractId: Uint8Array }
      | {
          type: 2;
          muxedAccount: { id: bigint; ed25519: Uint8Array };
        }
      | {
          type: 3;
          claimableBalanceId: { type: 0; v0: Uint8Array };
        }
      | { type: 4; liquidityPoolId: Uint8Array };
    switch (w.type) {
      case 0:
        return StrKey.encodeEd25519PublicKey(asBuffer(w.accountId.ed25519));
      case 1:
        return StrKey.encodeContract(asBuffer(w.contractId));
      case 2: {
        const payload = Buffer.alloc(40);
        payload.set(w.muxedAccount.ed25519, 0);
        payload.writeBigUInt64BE(w.muxedAccount.id, 32);
        return StrKey.encodeMed25519PublicKey(payload);
      }
      case 3: {
        const cb = w.claimableBalanceId;
        // CLAIMABLE_BALANCE_ID_TYPE_V0 (=0) prefix-byte
        const raw = Buffer.alloc(1 + 32);
        raw.writeUInt8(0, 0);
        raw.set(cb.v0, 1);
        return StrKey.encodeClaimableBalance(raw);
      }
      case 4:
        return StrKey.encodeLiquidityPool(asBuffer(w.liquidityPoolId));
    }
  },
  fromJson(json) {
    if (typeof json !== "string") {
      throw new XdrError("ScAddress: expected strkey string");
    }
    if (json.startsWith("G")) {
      return {
        type: 0,
        accountId: {
          type: 0,
          ed25519: asUint8Array(StrKey.decodeEd25519PublicKey(json)),
        },
      };
    }
    if (json.startsWith("C")) {
      return { type: 1, contractId: asUint8Array(StrKey.decodeContract(json)) };
    }
    if (json.startsWith("M")) {
      const raw = StrKey.decodeMed25519PublicKey(json);
      return {
        type: 2,
        muxedAccount: {
          id: raw.readBigUInt64BE(32),
          ed25519: asUint8Array(raw.subarray(0, 32)),
        },
      };
    }
    if (json.startsWith("B")) {
      const raw = StrKey.decodeClaimableBalance(json);
      return {
        type: 3,
        claimableBalanceId: {
          type: raw.readUInt8(0),
          v0: asUint8Array(raw.subarray(1)),
        },
      };
    }
    if (json.startsWith("L")) {
      return {
        type: 4,
        liquidityPoolId: asUint8Array(StrKey.decodeLiquidityPool(json)),
      };
    }
    throw new XdrError(`ScAddress: unsupported strkey prefix in ${json}`);
  },
});

OVERRIDES.set("ClaimableBalanceId", {
  toJson(wire) {
    const w = wire as { type: 0; v0: Uint8Array };
    const raw = Buffer.alloc(1 + 32);
    raw.writeUInt8(0, 0);
    raw.set(w.v0, 1);
    return StrKey.encodeClaimableBalance(raw);
  },
  fromJson(json) {
    if (typeof json !== "string") {
      throw new XdrError("ClaimableBalanceId: expected B-strkey string");
    }
    const raw = StrKey.decodeClaimableBalance(json);
    return { type: raw.readUInt8(0), v0: asUint8Array(raw.subarray(1)) };
  },
});

// PoolId / ContractId: typedef aliases of Hash with strkey JSON forms.
// These have distinct named schemas (emitted by the codegen) so the override
// fires only for the alias, not the underlying Hash.

OVERRIDES.set("PoolId", {
  toJson(wire) {
    return StrKey.encodeLiquidityPool(asBuffer(wire as Uint8Array));
  },
  fromJson(json) {
    if (typeof json !== "string") {
      throw new XdrError("PoolId: expected L-strkey string");
    }
    return asUint8Array(StrKey.decodeLiquidityPool(json));
  },
});

OVERRIDES.set("ContractId", {
  toJson(wire) {
    return StrKey.encodeContract(asBuffer(wire as Uint8Array));
  },
  fromJson(json) {
    if (typeof json !== "string") {
      throw new XdrError("ContractId: expected C-strkey string");
    }
    return asUint8Array(StrKey.decodeContract(json));
  },
});

// AssetCode4 / AssetCode12: per SEP-0051, trim trailing zero bytes (down to
// a 5-byte minimum for AssetCode12 so the result is distinguishable from
// AssetCode4 output) and apply the string-escape rules.
OVERRIDES.set("AssetCode4", {
  toJson(wire) {
    return new XdrString(trimTrailingZeros(wire as Uint8Array, 0)).toJson();
  },
  fromJson(json) {
    if (typeof json !== "string") {
      throw new XdrError("AssetCode4: expected escaped-string JSON");
    }
    return padRightZeros(XdrString.fromJson(json).bytes, 4);
  },
});

OVERRIDES.set("AssetCode12", {
  toJson(wire) {
    return new XdrString(trimTrailingZeros(wire as Uint8Array, 5)).toJson();
  },
  fromJson(json) {
    if (typeof json !== "string") {
      throw new XdrError("AssetCode12: expected escaped-string JSON");
    }
    return padRightZeros(XdrString.fromJson(json).bytes, 12);
  },
});

function trimTrailingZeros(bytes: Uint8Array, minLen: number): Uint8Array {
  let end = bytes.length;
  while (end > minLen && bytes[end - 1] === 0) end -= 1;
  return end === bytes.length ? bytes : bytes.slice(0, end);
}

function padRightZeros(bytes: Uint8Array, length: number): Uint8Array {
  if (bytes.length >= length) return bytes;
  const out = new Uint8Array(length);
  out.set(bytes);
  return out;
}

// Wide-int parts collapse to a single decimal string.

OVERRIDES.set("Int128Parts", {
  toJson(wire) {
    return partsTo128BigInt(wire as Int128Parts, true).toString();
  },
  fromJson(json) {
    if (typeof json !== "string") {
      throw new XdrError("Int128Parts: expected decimal string");
    }
    const value = BigInt(json);
    assertBigIntFits(value, true, 128, "Int128Parts");
    return bigIntTo128Parts(value, true);
  },
});

OVERRIDES.set("Uint128Parts", {
  toJson(wire) {
    return partsTo128BigInt(wire as Int128Parts, false).toString();
  },
  fromJson(json) {
    if (typeof json !== "string") {
      throw new XdrError("Uint128Parts: expected decimal string");
    }
    const value = BigInt(json);
    assertBigIntFits(value, false, 128, "Uint128Parts");
    return bigIntTo128Parts(value, false);
  },
});

OVERRIDES.set("Int256Parts", {
  toJson(wire) {
    return partsTo256BigInt(wire as Int256Parts, true).toString();
  },
  fromJson(json) {
    if (typeof json !== "string") {
      throw new XdrError("Int256Parts: expected decimal string");
    }
    const value = BigInt(json);
    assertBigIntFits(value, true, 256, "Int256Parts");
    return bigIntTo256Parts(value, true);
  },
});

OVERRIDES.set("Uint256Parts", {
  toJson(wire) {
    return partsTo256BigInt(wire as Int256Parts, false).toString();
  },
  fromJson(json) {
    if (typeof json !== "string") {
      throw new XdrError("Uint256Parts: expected decimal string");
    }
    const value = BigInt(json);
    assertBigIntFits(value, false, 256, "Uint256Parts");
    return bigIntTo256Parts(value, false);
  },
});

function roundUp4(n: number): number {
  return n + ((4 - (n % 4)) % 4);
}
