import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type BucketEntryTypeWire = number;

export type BucketEntryTypeName =
  | "metaentry"
  | "liveentry"
  | "deadentry"
  | "initentry";

/**
 * ```xdr
 * enum BucketEntryType
 * {
 *     METAENTRY =
 *         -1, // At-and-after protocol 11: bucket metadata, should come first.
 *     LIVEENTRY = 0, // Before protocol 11: created-or-updated;
 *                    // At-and-after protocol 11: only updated.
 *     DEADENTRY = 1,
 *     INITENTRY = 2 // At-and-after protocol 11: only created.
 * };
 * ```
 */
export class BucketEntryType extends EnumValue<BucketEntryTypeName> {
  static readonly metaentry = new BucketEntryType("metaentry", -1);
  static readonly liveentry = new BucketEntryType("liveentry", 0);
  static readonly deadentry = new BucketEntryType("deadentry", 1);
  static readonly initentry = new BucketEntryType("initentry", 2);

  static readonly schema = enumType("BucketEntryType", {
    metaentry: -1,
    liveentry: 0,
    deadentry: 1,
    initentry: 2,
  });

  static fromValue(value: number): BucketEntryType {
    return enumFromValue(
      "BucketEntryType",
      BucketEntryType.schema,
      BucketEntryType,
      value,
    );
  }

  static fromName(name: BucketEntryTypeName): BucketEntryType {
    return enumFromName("BucketEntryType", BucketEntryType, name);
  }

  static fromXdrObject(wire: number): BucketEntryType {
    return BucketEntryType.fromValue(wire);
  }
}
