import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<Record<number, BucketEntryType>> = {
    "-1": BucketEntryType.metaentry,
    0: BucketEntryType.liveentry,
    1: BucketEntryType.deadentry,
    2: BucketEntryType.initentry,
  };

  static readonly schema = enumType("BucketEntryType", {
    metaentry: -1,
    liveentry: 0,
    deadentry: 1,
    initentry: 2,
  });

  static fromValue(value: number): BucketEntryType {
    return enumLookup(
      "BucketEntryType",
      BucketEntryType.byValue,
      value,
    ) as BucketEntryType;
  }

  static fromName(name: BucketEntryTypeName): BucketEntryType {
    switch (name) {
      case "metaentry":
        return BucketEntryType.metaentry;
      case "liveentry":
        return BucketEntryType.liveentry;
      case "deadentry":
        return BucketEntryType.deadentry;
      case "initentry":
        return BucketEntryType.initentry;
      default:
        throw new XdrError(`BucketEntryType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): BucketEntryType {
    return BucketEntryType.fromValue(wire);
  }
}
