import { sha256 } from "@noble/hashes/sha2.js";
import { stringToUint8Array } from "uint8array-extras";

/**
 * Computes the SHA-256 hash of the given data.
 *
 * @param data - the data to hash
 */
export function hash(data: Uint8Array | string): Uint8Array {
  const bytes = typeof data === "string" ? stringToUint8Array(data) : data;
  return sha256(bytes);
}
