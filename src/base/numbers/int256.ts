import { LargeInt } from "@stellar/js-xdr";

export class Int256 extends LargeInt {
  /**
   * Construct a signed 256-bit integer that can be XDR-encoded.
   *
   * @param args - one or more slices to encode
   *     in big-endian format (i.e. earlier elements are higher bits)
   */
  constructor(...args: Array<bigint | number | string>) {
    super(args);
  }

  get unsigned(): boolean {
    return false;
  }

  get size(): number {
    return 256;
  }
}

Int256.defineIntBoundaries();
