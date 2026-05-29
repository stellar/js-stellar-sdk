import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  BucketMetadataExt,
  type BucketMetadataExtWire,
} from "./bucket-metadata-ext.js";

export interface BucketMetadataWire {
  ledgerVersion: number;
  ext: BucketMetadataExtWire;
}

/**
 * ```xdr
 * struct BucketMetadata
 * {
 *     // Indicates the protocol version used to create / merge this bucket.
 *     uint32 ledgerVersion;
 *
 *     // reserved for future use
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         BucketListType bucketListType;
 *     }
 *     ext;
 * };
 * ```
 */
export class BucketMetadata extends XdrValue {
  readonly ledgerVersion: number;
  readonly ext: BucketMetadataExt;

  static readonly schema: XdrType<BucketMetadataWire> = struct(
    "BucketMetadata",
    {
      ledgerVersion: uint32(),
      ext: BucketMetadataExt.schema,
    },
  );

  constructor(input: { ledgerVersion: number; ext: BucketMetadataExt }) {
    super();
    this.ledgerVersion = input.ledgerVersion;
    this.ext = input.ext;
  }

  toXdrObject(): BucketMetadataWire {
    return {
      ledgerVersion: this.ledgerVersion,
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(wire: BucketMetadataWire): BucketMetadata {
    return new BucketMetadata({
      ledgerVersion: wire.ledgerVersion,
      ext: BucketMetadataExt.fromXdrObject(wire.ext),
    });
  }
}
