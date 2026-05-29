/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { SorobanCredentialsType } from "./soroban-credentials-type.js";
import {
  SorobanAddressCredentials,
  type SorobanAddressCredentialsWire,
} from "./soroban-address-credentials.js";

export type SorobanCredentialsWire =
  | { type: 0 }
  | { type: 1; address: SorobanAddressCredentialsWire };

export type SorobanCredentialsVariantName =
  | "sorobanCredentialsSourceAccount"
  | "sorobanCredentialsAddress";

/**
 * ```xdr
 * union SorobanCredentials switch (SorobanCredentialsType type)
 * {
 * case SOROBAN_CREDENTIALS_SOURCE_ACCOUNT:
 *     void;
 * case SOROBAN_CREDENTIALS_ADDRESS:
 *     SorobanAddressCredentials address;
 * #ifdef CAP_0071
 * case SOROBAN_CREDENTIALS_ADDRESS_V2:
 *     SorobanAddressCredentials addressV2;
 * case SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES:
 *     SorobanAddressCredentialsWithDelegates addressWithDelegates;
 * #endif
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

  static fromXdrObject(wire: SorobanCredentialsWire): SorobanCredentials {
    switch (wire.type) {
      case 0:
        return new SorobanCredentialsSourceAccount();
      case 1:
        return new SorobanCredentialsAddress(
          SorobanAddressCredentials.fromXdrObject(wire.address),
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

export type SorobanCredentials =
  | SorobanCredentialsSourceAccount
  | SorobanCredentialsAddress;
export const SorobanCredentials = SorobanCredentialsBase;
