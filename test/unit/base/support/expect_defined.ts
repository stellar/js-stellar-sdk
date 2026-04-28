import { expect } from "vitest";

export function expectDefined<T>(value: T | null | undefined): NonNullable<T> {
  expect(value).toBeDefined();
  expect(value).not.toBeNull();

  if (value === null || value === undefined) {
    throw new Error("Expected value to be defined");
  }

  return value;
}