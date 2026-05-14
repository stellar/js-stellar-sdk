import { expect } from "vitest";
import { xdr } from "../../../../src/index.js";
export function expectDefined<T>(value: T | null | undefined): NonNullable<T> {
  expect(value).toBeDefined();
  expect(value).not.toBeNull();

  if (value === null || value === undefined) {
    throw new Error("Expected value to be defined");
  }

  return value;
}

export function expectScVal<T extends xdr.ScVal["type"]>(
  value: xdr.ScVal,
  tag: T,
): Extract<xdr.ScVal, { type: T }> {
  if (value.type !== tag) {
    throw new TypeError(`Expected ScVal of type ${tag}, got ${value.type}`);
  }
  return value as Extract<xdr.ScVal, { type: T }>;
}
