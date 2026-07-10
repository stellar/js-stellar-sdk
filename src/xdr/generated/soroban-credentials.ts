/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union, void as voidType } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { SorobanCredentialsType } from "./soroban-credentials-type.js";
import {
  SorobanAddressCredentials,
  type SorobanAddressCredentialsWire,
} from "./soroban-address-credentials.js";
import {
  SorobanAddressCredentialsWithDelegates,
  type SorobanAddressCredentialsWithDelegatesWire,
} from "./soroban-address-credentials-with-delegates.js";

export type SorobanCredentialsWire =
  | { type: 0 }
  | { type: 1; address: SorobanAddressCredentialsWire }
  | { type: 2; addressV2: SorobanAddressCredentialsWire }
  | {
      type: 3;
      addressWithDelegates: SorobanAddressCredentialsWithDelegatesWire;
    };

export type SorobanCredentialsVariantName =
  | "sorobanCredentialsSourceAccount"
  | "sorobanCredentialsAddress"
  | "sorobanCredentialsAddressV2"
  | "sorobanCredentialsAddressWithDelegates";

/**
 * ```xdr
 * union SorobanCredentials switch (SorobanCredentialsType type)
 * {
 * case SOROBAN_CREDENTIALS_SOURCE_ACCOUNT:
 *     void;
 * case SOROBAN_CREDENTIALS_ADDRESS:
 *     SorobanAddressCredentials address;
 * case SOROBAN_CREDENTIALS_ADDRESS_V2:
 *     SorobanAddressCredentials addressV2;
 * case SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES:
 *     SorobanAddressCredentialsWithDelegates addressWithDelegates;
 * };
 * ```
 */
abstract class SorobanCredentialsBase extends XdrValue {
  abstract readonly type: SorobanCredentialsVariantName;

  static readonly schema: XdrType<SorobanCredentialsWire> = union(
    "SorobanCredentials",
    {
      switchOn: SorobanCredentialsType.schema,
      cases: [
        case_("sorobanCredentialsSourceAccount", 0, voidType()),
        case_(
          "sorobanCredentialsAddress",
          1,
          field("address", SorobanAddressCredentials.schema),
        ),
        case_(
          "sorobanCredentialsAddressV2",
          2,
          field("addressV2", SorobanAddressCredentials.schema),
        ),
        case_(
          "sorobanCredentialsAddressWithDelegates",
          3,
          field(
            "addressWithDelegates",
            SorobanAddressCredentialsWithDelegates.schema,
          ),
        ),
      ],
    },
  );

  static sorobanCredentialsSourceAccount(): SorobanCredentialsSourceAccount {
    return new SorobanCredentialsSourceAccount();
  }

  static sorobanCredentialsAddress(
    address: SorobanAddressCredentials,
  ): SorobanCredentialsAddress {
    return new SorobanCredentialsAddress(address);
  }

  static sorobanCredentialsAddressV2(
    addressV2: SorobanAddressCredentials,
  ): SorobanCredentialsAddressV2 {
    return new SorobanCredentialsAddressV2(addressV2);
  }

  static sorobanCredentialsAddressWithDelegates(
    addressWithDelegates: SorobanAddressCredentialsWithDelegates,
  ): SorobanCredentialsAddressWithDelegates {
    return new SorobanCredentialsAddressWithDelegates(addressWithDelegates);
  }

  static fromXdrObject(wire: SorobanCredentialsWire): SorobanCredentials {
    switch (wire.type) {
      case 0:
        return new SorobanCredentialsSourceAccount();
      case 1:
        return new SorobanCredentialsAddress(
          SorobanAddressCredentials.fromXdrObject(wire.address),
        );
      case 2:
        return new SorobanCredentialsAddressV2(
          SorobanAddressCredentials.fromXdrObject(wire.addressV2),
        );
      case 3:
        return new SorobanCredentialsAddressWithDelegates(
          SorobanAddressCredentialsWithDelegates.fromXdrObject(
            wire.addressWithDelegates,
          ),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete SorobanCredentials variant.
   * Use this instead of `instanceof SorobanCredentials`: the exported `SorobanCredentials` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `SorobanCredentials.is(x)` narrows to the union.
   */
  static is(value: unknown): value is SorobanCredentials {
    return value instanceof SorobanCredentialsBase;
  }

  abstract toXdrObject(): SorobanCredentialsWire;
}

export class SorobanCredentialsSourceAccount extends SorobanCredentialsBase {
  readonly type = "sorobanCredentialsSourceAccount" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<SorobanCredentialsWire, { type: 0 }> {
    return { type: 0 };
  }
}

export class SorobanCredentialsAddress extends SorobanCredentialsBase {
  readonly type = "sorobanCredentialsAddress" as const;
  readonly address: SorobanAddressCredentials;

  constructor(address: SorobanAddressCredentials) {
    super();
    this.address = address;
  }

  get value(): SorobanAddressCredentials {
    return this.address;
  }

  toXdrObject(): Extract<SorobanCredentialsWire, { type: 1 }> {
    return { type: 1, address: this.address.toXdrObject() };
  }
}

export class SorobanCredentialsAddressV2 extends SorobanCredentialsBase {
  readonly type = "sorobanCredentialsAddressV2" as const;
  readonly addressV2: SorobanAddressCredentials;

  constructor(addressV2: SorobanAddressCredentials) {
    super();
    this.addressV2 = addressV2;
  }

  get value(): SorobanAddressCredentials {
    return this.addressV2;
  }

  toXdrObject(): Extract<SorobanCredentialsWire, { type: 2 }> {
    return { type: 2, addressV2: this.addressV2.toXdrObject() };
  }
}

export class SorobanCredentialsAddressWithDelegates extends SorobanCredentialsBase {
  readonly type = "sorobanCredentialsAddressWithDelegates" as const;
  readonly addressWithDelegates: SorobanAddressCredentialsWithDelegates;

  constructor(addressWithDelegates: SorobanAddressCredentialsWithDelegates) {
    super();
    this.addressWithDelegates = addressWithDelegates;
  }

  get value(): SorobanAddressCredentialsWithDelegates {
    return this.addressWithDelegates;
  }

  toXdrObject(): Extract<SorobanCredentialsWire, { type: 3 }> {
    return {
      type: 3,
      addressWithDelegates: this.addressWithDelegates.toXdrObject(),
    };
  }
}

export type SorobanCredentials =
  | SorobanCredentialsSourceAccount
  | SorobanCredentialsAddress
  | SorobanCredentialsAddressV2
  | SorobanCredentialsAddressWithDelegates;
export const SorobanCredentials = SorobanCredentialsBase;
