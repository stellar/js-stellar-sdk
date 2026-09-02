/**
 * Fast base64 to/from Uint8Array conversions.
 *
 * `uint8array-extras` implements these portably but its decoder runs a
 * per-byte JS callback through `Uint8Array.from`, which sits under every
 * `fromXdr` call, so decode with `atob` plus a preallocated `charCodeAt` loop
 * instead. The encoder keeps upstream's chunked-`btoa` shape (same chunk
 * size); the only change is `String.fromCharCode` in place of
 * `String.fromCodePoint`, safe because `atob`-domain bytes are all `<=` 0xff.
 */

/**
 * Decode a base64 string into bytes. Accepts base64url input (`-`/`_`) too.
 * @param base64 - the base64-encoded input
 * @returns the decoded bytes
 * @throws TypeError if the input is not a string
 * @throws if the input is not valid base64
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof base64 !== "string") {
    throw new TypeError(`Expected \`string\`, got \`${typeof base64}\``);
  }
  // tolerate base64url input, like uint8array-extras and Buffer did; atob
  // itself handles missing padding
  const normalized =
    base64.includes("-") || base64.includes("_")
      ? base64.replace(/-/g, "+").replace(/_/g, "/")
      : base64;
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Divisible by 3 so each btoa() chunk emits no padding, and small enough to
// stay under engines' max-argument-count limits for `Function.apply`.
const ENCODE_CHUNK_SIZE = 65535;

/**
 * Encode bytes as a base64 string.
 * @param bytes - the bytes to encode
 * @returns the base64-encoded output
 * @throws TypeError if the input is not a Uint8Array
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  if (!(bytes instanceof Uint8Array)) {
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof bytes}\``);
  }
  let base64 = "";
  for (let i = 0; i < bytes.length; i += ENCODE_CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + ENCODE_CHUNK_SIZE);
    base64 += btoa(
      String.fromCharCode.apply(null, chunk as unknown as number[]),
    );
  }
  return base64;
}
