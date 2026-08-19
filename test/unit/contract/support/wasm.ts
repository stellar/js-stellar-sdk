import { concatUint8Arrays, stringToUint8Array } from "uint8array-extras";
import * as StellarSdk from "../../../../src/index.js";

// LEB128 unsigned varint, as used for WASM section lengths.
function leb128(value: number): Uint8Array {
  const bytes: number[] = [];
  let n = value;
  do {
    let byte = n & 0x7f;
    n >>>= 7;
    if (n !== 0) byte |= 0x80;
    bytes.push(byte);
  } while (n !== 0);
  return Uint8Array.from(bytes);
}

// Builds a minimal valid WASM binary whose only content is a `contractspecv0`
// custom section carrying the given spec entries. This is browser-safe (pure
// Uint8Array ops, no filesystem) and is enough for `Spec.fromWasm` to parse,
// which only scans for that custom section.
export function wasmWithSpec(
  entries: StellarSdk.xdr.ScSpecEntry[],
): Uint8Array {
  const name = stringToUint8Array("contractspecv0");
  const payload = concatUint8Arrays(entries.map((e) => e.toXdr()));
  const sectionBody = concatUint8Arrays([leb128(name.length), name, payload]);
  const customSection = concatUint8Arrays([
    Uint8Array.of(0x00), // custom section id
    leb128(sectionBody.length),
    sectionBody,
  ]);
  const header = Uint8Array.of(
    0x00,
    0x61,
    0x73,
    0x6d, // "\0asm" magic
    0x01,
    0x00,
    0x00,
    0x00, // version 1
  );
  return concatUint8Arrays([header, customSection]);
}
