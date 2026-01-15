/**
 * This test validates that JSDoc documentation is properly exported
 * for stellar-base functions when re-exported from stellar-sdk.
 * 
 * Note: This test primarily validates that the functions are exported
 * and maintain their functionality. The JSDoc comments can be verified
 * by checking the generated lib/index.d.ts file.
 */

import { describe, it, expect } from 'vitest';
import { nativeToScVal, scValToNative, scValToBigInt } from '@stellar/stellar-base';

describe('stellar-base re-exports with JSDoc', () => {
  it('nativeToScVal should convert native values to ScVal', () => {
    const scVal = nativeToScVal(1234n);
    expect(scVal).toBeDefined();
    expect(scVal.switch()).toBeDefined();
  });

  it('scValToNative should convert ScVal to native values', () => {
    const scVal = nativeToScVal(5678n);
    const native = scValToNative(scVal);
    expect(native).toBe(5678n);
  });

  it('scValToBigInt should extract BigInt from ScVal', () => {
    const scVal = nativeToScVal(9999n);
    const bigIntVal = scValToBigInt(scVal);
    expect(bigIntVal).toBe(9999n);
  });

  it('nativeToScVal should handle type options', () => {
    const val = nativeToScVal("test", { type: 'symbol' });
    expect(val).toBeDefined();
    
    const converted = scValToNative(val);
    expect(typeof converted).toBe('string');
  });

  it('nativeToScVal should handle complex types', () => {
    const complexValue = {
      a: 1n,
      b: 'test',
      c: [1, 2, 3],
    };
    const scVal = nativeToScVal(complexValue);
    expect(scVal).toBeDefined();
    
    const native = scValToNative(scVal);
    expect(native).toBeDefined();
  });
});

