import { sha256 } from "@noble/hashes/sha2.js";

/**
 * Computes the SHA-256 hash of the given data.
 *
 * @param data - the data to hash
 */
export function hash(data: Buffer | string): Buffer {
  // Preserve the current UTF-8 string handling while returning a Buffer.
  const bytes = typeof data === "string" ? Buffer.from(data, "utf8") : data;
  return Buffer.from(sha256(bytes));
}
