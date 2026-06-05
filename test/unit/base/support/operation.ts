import { expect } from "vitest";

import type {
  OperationRecord,
  OperationType,
} from "../../../../src/base/operations/types.js";

export type OperationOfType<TType extends OperationType> = Extract<
  OperationRecord,
  { type: TType }
>;

export function expectOperationType<TType extends OperationType>(
  operation: OperationRecord,
  type: TType,
): OperationOfType<TType> {
  expect(operation.type).toBe(type);

  if (operation.type !== type) {
    throw new Error(`Expected ${type} operation`);
  }

  return operation as OperationOfType<TType>;
}

export function expectObjectWithProperty<
  TObject extends object,
  TKey extends PropertyKey,
>(value: TObject, key: TKey): Extract<TObject, Record<TKey, unknown>> {
  expect(key in value).toBe(true);

  if (!(key in value)) {
    throw new Error(`Expected object to have ${String(key)} property`);
  }

  return value as Extract<TObject, Record<TKey, unknown>>;
}
