import { LargeInt } from "@stellar/js-xdr";

export class Uint256 extends LargeInt {
  /**
   * Construct an unsigned 256-bit integer that can be XDR-encoded.
   *
   * @param args - one or more slices to encode
   *     in big-endian format (i.e. earlier elements are higher bits)
   */
  constructor(...args: Array<bigint | number | string>) {
    super(args);
  }

  get unsigned(): boolean {
    return true;
  }

  get size(): number {
    return 256;
  }
}

Uint256.defineIntBoundaries();
