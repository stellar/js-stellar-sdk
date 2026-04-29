/**
 * Returns true if the two byte arrays are equal (used for CRC16 checksum verification).
 *
 * @param expected - the expected checksum bytes
 * @param actual - the actual checksum bytes
 */
export function verifyChecksum(
  expected: Uint8Array,
  actual: Uint8Array,
): boolean {
  if (expected.length !== actual.length) {
    return false;
  }

  if (expected.length === 0) {
    return true;
  }

  for (let i = 0; i < expected.length; i += 1) {
    if (expected[i] !== actual[i]) {
      return false;
    }
  }

  return true;
}
