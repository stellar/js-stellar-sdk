/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ContractIdPreimageType } from "./contract-id-preimage-type.js";
import {
  ContractIdPreimageFromAddress,
  type ContractIdPreimageFromAddressWire,
} from "./contract-id-preimage-from-address.js";
import { Asset, type AssetWire } from "./asset.js";

export type ContractIdPreimageWire =
  | { type: 0; fromAddress: ContractIdPreimageFromAddressWire }
  | { type: 1; fromAsset: AssetWire };

export type ContractIdPreimageVariantName =
  | "contractIdPreimageFromAddress"
  | "contractIdPreimageFromAsset";

/**
 * ```xdr
 * union ContractIDPreimage switch (ContractIDPreimageType type)
 * {
 * case CONTRACT_ID_PREIMAGE_FROM_ADDRESS:
 *     struct
 *     {
 *         SCAddress address;
 *         uint256 salt;
 *     } fromAddress;
 * case CONTRACT_ID_PREIMAGE_FROM_ASSET:
 *     Asset fromAsset;
 * };
 * ```
 */
abstract class ContractIdPreimageBase extends XdrValue {
  abstract readonly type: ContractIdPreimageVariantName;

  static readonly schema: XdrType<ContractIdPreimageWire> = union(
    "ContractIdPreimage",
    {
      switchOn: ContractIdPreimageType.schema,
      cases: [
        case_(
          "contractIdPreimageFromAddress",
          0,
          field("fromAddress", ContractIdPreimageFromAddress.schema),
        ),
        case_(
          "contractIdPreimageFromAsset",
          1,
          field("fromAsset", Asset.schema),
        ),
      ],
    },
  );

  static contractIdPreimageFromAddress(
    fromAddress: ContractIdPreimageFromAddress,
  ): ContractIdPreimageAddress {
    return new ContractIdPreimageAddress(fromAddress);
  }

  static contractIdPreimageFromAsset(
    fromAsset: Asset,
  ): ContractIdPreimageAsset {
    return new ContractIdPreimageAsset(fromAsset);
  }

  static fromXdrObject(wire: ContractIdPreimageWire): ContractIdPreimage {
    switch (wire.type) {
      case 0:
        return new ContractIdPreimageAddress(
          ContractIdPreimageFromAddress.fromXdrObject(wire.fromAddress),
        );
      case 1:
        return new ContractIdPreimageAsset(Asset.fromXdrObject(wire.fromAsset));
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ContractIdPreimage variant.
   * Use this instead of `instanceof ContractIdPreimage`: the exported `ContractIdPreimage` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ContractIdPreimage.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ContractIdPreimage {
    return value instanceof ContractIdPreimageBase;
  }

  abstract toXdrObject(): ContractIdPreimageWire;
}

export class ContractIdPreimageAddress extends ContractIdPreimageBase {
  readonly type = "contractIdPreimageFromAddress" as const;
  readonly fromAddress: ContractIdPreimageFromAddress;

  constructor(fromAddress: ContractIdPreimageFromAddress) {
    super();
    this.fromAddress = fromAddress;
  }

  get value(): ContractIdPreimageFromAddress {
    return this.fromAddress;
  }

  toXdrObject(): Extract<ContractIdPreimageWire, { type: 0 }> {
    return { type: 0, fromAddress: this.fromAddress.toXdrObject() };
  }
}

export class ContractIdPreimageAsset extends ContractIdPreimageBase {
  readonly type = "contractIdPreimageFromAsset" as const;
  readonly fromAsset: Asset;

  constructor(fromAsset: Asset) {
    super();
    this.fromAsset = fromAsset;
  }

  get value(): Asset {
    return this.fromAsset;
  }

  toXdrObject(): Extract<ContractIdPreimageWire, { type: 1 }> {
    return { type: 1, fromAsset: this.fromAsset.toXdrObject() };
  }
}

export type ContractIdPreimage =
  | ContractIdPreimageAddress
  | ContractIdPreimageAsset;
export const ContractIdPreimage = ContractIdPreimageBase;
