import xdr from "./xdr.js";

export type IntLike = bigint | number | string;

/**
 * Supports building {@link xdr.SorobanTransactionData} structures with various
 * items set to specific values.
 *
 * This is recommended for when you are building
 * {@link Operation.extendFootprintTtl} / {@link Operation.restoreFootprint}
 * operations and need to {@link TransactionBuilder.setSorobanData} to avoid
 * (re)building the entire data structure from scratch.
 *
 * @example
 * // You want to use an existing data blob but override specific parts.
 * const newData = new SorobanDataBuilder(existing)
 *   .setReadOnly(someLedgerKeys)
 *   .setResourceFee("1000")
 *   .build();
 *
 * // You want an instance from scratch
 * const newData = new SorobanDataBuilder()
 *   .setFootprint([someLedgerKey], [])
 *   .setResourceFee("1000")
 *   .build();
 */
export class SorobanDataBuilder {
  private _data: xdr.SorobanTransactionData;

  /**
   * @param sorobanData - either a base64-encoded string that represents an
   *      {@link xdr.SorobanTransactionData} instance or an XDR instance itself
   *      (it will be copied); if omitted or "falsy" (e.g. an empty string), it
   *      starts with an empty instance
   */
  constructor(
    sorobanData?: Buffer | Uint8Array | xdr.SorobanTransactionData | string,
  ) {
    let data: xdr.SorobanTransactionData;

    if (!sorobanData) {
      data = new xdr.SorobanTransactionData({
        resources: new xdr.SorobanResources({
          footprint: new xdr.LedgerFootprint({ readOnly: [], readWrite: [] }),
          instructions: 0,
          diskReadBytes: 0,
          writeBytes: 0,
        }),
        ext: new xdr.SorobanTransactionDataExt(0),
        resourceFee: new xdr.Int64(0),
      });
    } else if (
      typeof sorobanData === "string" ||
      ArrayBuffer.isView(sorobanData)
    ) {
      data = SorobanDataBuilder.fromXDR(sorobanData as Uint8Array | string);
    } else {
      data = SorobanDataBuilder.fromXDR(sorobanData.toXDR()); // copy
    }

    this._data = data;
  }

  /**
   * Decodes and builds a {@link xdr.SorobanTransactionData} instance.
   *
   * @param data - raw input to decode
   */
  static fromXDR(
    data: Buffer | Uint8Array | string,
  ): xdr.SorobanTransactionData {
    if (typeof data === "string") {
      return xdr.SorobanTransactionData.fromXDR(data, "base64");
    } else {
      return xdr.SorobanTransactionData.fromXDR(Buffer.from(data), "raw");
    }
  }

  /**
   * Sets the resource fee portion of the Soroban data.
   *
   * @param fee - the resource fee to set (int64)
   */
  setResourceFee(fee: IntLike): SorobanDataBuilder {
    this._data.resourceFee(new xdr.Int64(fee));
    return this;
  }

  /**
   * Sets up the resource metrics.
   *
   * You should almost NEVER need this, as its often generated / provided to you
   * by transaction simulation/preflight from a Soroban RPC server.
   *
   * @param cpuInstrs - number of CPU instructions
   * @param diskReadBytes - number of bytes being read from disk
   * @param writeBytes - number of bytes being written to disk/memory
   */
  setResources(
    cpuInstrs: number,
    diskReadBytes: number,
    writeBytes: number,
  ): SorobanDataBuilder {
    this._data.resources().instructions(cpuInstrs);
    this._data.resources().diskReadBytes(diskReadBytes);
    this._data.resources().writeBytes(writeBytes);

    return this;
  }

  /**
   * Appends the given ledger keys to the existing storage access footprint.
   *
   * @param readOnly - read-only keys to add
   * @param readWrite - read-write keys to add
   */
  appendFootprint(
    readOnly: xdr.LedgerKey[],
    readWrite: xdr.LedgerKey[],
  ): SorobanDataBuilder {
    return this.setFootprint(
      this.getReadOnly().concat(readOnly),
      this.getReadWrite().concat(readWrite),
    );
  }

  /**
   * Sets the storage access footprint to be a certain set of ledger keys.
   *
   * You can also set each field explicitly via
   * {@link SorobanDataBuilder.setReadOnly} and
   * {@link SorobanDataBuilder.setReadWrite} or add to the existing footprint
   * via {@link SorobanDataBuilder.appendFootprint}.
   *
   * Passing `null|undefined` to either parameter will IGNORE the existing
   * values. If you want to clear them, pass `[]`, instead.
   *
   * @param readOnly - the set of ledger keys to set in the read-only portion of the transaction's `sorobanData`, or `null | undefined` to keep the existing keys
   * @param readWrite - the set of ledger keys to set in the read-write portion of the transaction's `sorobanData`, or `null | undefined` to keep the existing keys
   */
  setFootprint(
    readOnly?: xdr.LedgerKey[] | null,
    readWrite?: xdr.LedgerKey[] | null,
  ): SorobanDataBuilder {
    if (readOnly !== null) {
      // null means "leave me alone"
      this.setReadOnly(readOnly);
    }
    if (readWrite !== null) {
      this.setReadWrite(readWrite);
    }
    return this;
  }

  /**
   * Sets the read-only keys in the access footprint.
   *
   * @param readOnly - read-only keys in the access footprint
   */
  setReadOnly(readOnly?: xdr.LedgerKey[]): SorobanDataBuilder {
    this._data
      .resources()
      .footprint()
      .readOnly(readOnly ?? []);
    return this;
  }

  /**
   * Sets the read-write keys in the access footprint.
   *
   * @param readWrite - read-write keys in the access footprint
   */
  setReadWrite(readWrite?: xdr.LedgerKey[]): SorobanDataBuilder {
    this._data
      .resources()
      .footprint()
      .readWrite(readWrite ?? []);
    return this;
  }

  /**
   * Returns a copy of the final data structure.
   */
  build(): xdr.SorobanTransactionData {
    return xdr.SorobanTransactionData.fromXDR(this._data.toXDR()); // clone
  }

  //
  // getters follow
  //

  /** Returns the read-only storage access pattern. */
  getReadOnly(): xdr.LedgerKey[] {
    return this.getFootprint().readOnly();
  }

  /** Returns the read-write storage access pattern. */
  getReadWrite(): xdr.LedgerKey[] {
    return this.getFootprint().readWrite();
  }

  /** Returns the storage access pattern. */
  getFootprint(): xdr.LedgerFootprint {
    return this._data.resources().footprint();
  }
}
