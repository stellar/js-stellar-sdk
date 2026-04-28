import { sha256 } from "sha.js";

/**
 * Computes the SHA-256 hash of the given data.
 *
 * @param data - the data to hash
 */
export function hash(data: Buffer | string): Buffer {
  // sha256 constructor returns a Hash instance (inferred by TypeScript)
  const hasher = new sha256();

  // Preserve the current behavior
  if (typeof data === "string") {
    hasher.update(data, "utf8");
  } else {
    hasher.update(data);
  }

  return hasher.digest();
}
