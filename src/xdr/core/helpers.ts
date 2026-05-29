import { XdrError } from "./error.js";

export function viewFor(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

export function paddingLength(length: number): number {
  return (4 - (length % 4)) % 4;
}

export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function assertLength(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 4294967295) {
    throw new XdrError(`${name}: expected uint32 length`);
  }
}

export function assertIntRange(
  value: unknown,
  min: number,
  max: number,
  path: string,
): asserts value is number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new XdrError(`${path}: expected integer in range ${min}..${max}`);
  }
}

export function assertBigIntRange(
  value: unknown,
  min: bigint,
  max: bigint,
  path: string,
): asserts value is bigint {
  if (typeof value !== "bigint" || value < min || value > max) {
    throw new XdrError(`${path}: expected bigint in range ${min}..${max}`);
  }
}

export function assertFiniteNumber(
  value: unknown,
  path: string,
): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new XdrError(`${path}: expected finite number`);
  }
}

export function assertUint8Array(
  value: unknown,
  path: string,
): asserts value is Uint8Array {
  if (!(value instanceof Uint8Array)) {
    throw new XdrError(`${path}: expected Uint8Array`);
  }
}

export function assertArray(
  value: unknown,
  path: string,
): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new XdrError(`${path}: expected array`);
  }
}
