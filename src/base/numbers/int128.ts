import { LargeInt } from "@stellar/js-xdr";

export class Int128 extends LargeInt {
  /**
   * Construct a signed 128-bit integer that can be XDR-encoded.
   *
   * @param  args - one or more slices to encode
   *     in big-endian format (i.e. earlier elements are higher bits)
   */
  constructor(...args: Array<bigint | number | string>) {
    super(args);
  }

  get unsigned(): boolean {
    return false;
  }

  get size(): number {
    return 128;
  }
}

Int128.defineIntBoundaries();
