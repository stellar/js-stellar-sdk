// Pure helpers for converting between a single `bigint` and the {hi, lo} /
// {hiHi, hiLo, loHi, loLo} wire shapes used by 128/256-bit int XDR types.
//
// Lives in its own file (separate from `bigint-value.ts`) so the JSON walker
// can use these helpers without pulling in `XdrValue` — and therefore without
// creating a circular import through `xdr-value.ts` → `to-json.ts`.

const MASK_64 = (1n << 64n) - 1n;
const MASK_HI_SIGNED_128 = 1n << 127n;
const MASK_HI_SIGNED_256 = 1n << 255n;

export interface Int128Parts {
  readonly hi: bigint;
  readonly lo: bigint;
}

export interface Int256Parts {
  readonly hiHi: bigint;
  readonly hiLo: bigint;
  readonly loHi: bigint;
  readonly loLo: bigint;
}

export function bigIntTo128Parts(value: bigint, signed: boolean): Int128Parts {
  const unsigned =
    signed && value < 0n ? value + MASK_HI_SIGNED_128 * 2n : value;
  const lo = unsigned & MASK_64;
  const hiBits = (unsigned >> 64n) & MASK_64;
  const hi = signed ? toSigned64(hiBits) : hiBits;
  return { hi, lo };
}

export function partsTo128BigInt(parts: Int128Parts, signed: boolean): bigint {
  const hi = signed ? to64Bits(parts.hi) : parts.hi;
  const combined = (hi << 64n) | (parts.lo & MASK_64);
  return signed && combined >= MASK_HI_SIGNED_128
    ? combined - MASK_HI_SIGNED_128 * 2n
    : combined;
}

export function bigIntTo256Parts(value: bigint, signed: boolean): Int256Parts {
  const unsigned =
    signed && value < 0n ? value + MASK_HI_SIGNED_256 * 2n : value;
  const loLo = unsigned & MASK_64;
  const loHi = (unsigned >> 64n) & MASK_64;
  const hiLo = (unsigned >> 128n) & MASK_64;
  const hiHiBits = (unsigned >> 192n) & MASK_64;
  const hiHi = signed ? toSigned64(hiHiBits) : hiHiBits;
  return { hiHi, hiLo, loHi, loLo };
}

export function partsTo256BigInt(parts: Int256Parts, signed: boolean): bigint {
  const hiHi = signed ? to64Bits(parts.hiHi) : parts.hiHi;
  const combined =
    (hiHi << 192n) |
    ((parts.hiLo & MASK_64) << 128n) |
    ((parts.loHi & MASK_64) << 64n) |
    (parts.loLo & MASK_64);
  return signed && combined >= MASK_HI_SIGNED_256
    ? combined - MASK_HI_SIGNED_256 * 2n
    : combined;
}

function toSigned64(bits: bigint): bigint {
  return bits >= 1n << 63n ? bits - (1n << 64n) : bits;
}

function to64Bits(value: bigint): bigint {
  return value < 0n ? value + (1n << 64n) : value;
}
