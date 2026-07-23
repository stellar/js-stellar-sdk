/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, uint32, union } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  AuthenticatedMessageV0,
  type AuthenticatedMessageV0Wire,
} from "./authenticated-message-v0.js";

export type AuthenticatedMessageWire = { v: 0; v0: AuthenticatedMessageV0Wire };

export type AuthenticatedMessageVariantName = "v0";

/**
 * ```xdr
 * union AuthenticatedMessage switch (uint32 v)
 * {
 * case 0:
 *     struct
 *     {
 *         uint64 sequence;
 *         StellarMessage message;
 *         HmacSha256Mac mac;
 *     } v0;
 * };
 * ```
 */
abstract class AuthenticatedMessageBase extends XdrValue {
  abstract readonly type: AuthenticatedMessageVariantName;

  static readonly schema: XdrType<AuthenticatedMessageWire> = union(
    "AuthenticatedMessage",
    {
      switchOn: uint32(),
      cases: [case_("v0", 0, field("v0", AuthenticatedMessageV0.schema))],
      switchKey: "v",
    },
  );

  static v0(v0: AuthenticatedMessageV0): AuthenticatedMessageV0Arm {
    return new AuthenticatedMessageV0Arm(v0);
  }

  static fromXdrObject(wire: AuthenticatedMessageWire): AuthenticatedMessage {
    switch (wire.v) {
      case 0:
        return new AuthenticatedMessageV0Arm(
          AuthenticatedMessageV0.fromXdrObject(wire.v0),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete AuthenticatedMessage variant.
   * Use this instead of `instanceof AuthenticatedMessage`: the exported `AuthenticatedMessage` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `AuthenticatedMessage.is(x)` narrows to the union.
   */
  static is(value: unknown): value is AuthenticatedMessage {
    return value instanceof AuthenticatedMessageBase;
  }

  abstract toXdrObject(): AuthenticatedMessageWire;
}

export class AuthenticatedMessageV0Arm extends AuthenticatedMessageBase {
  readonly type = "v0" as const;
  readonly v0: AuthenticatedMessageV0;

  constructor(v0: AuthenticatedMessageV0) {
    super();
    this.v0 = v0;
  }

  get value(): AuthenticatedMessageV0 {
    return this.v0;
  }

  toXdrObject(): Extract<AuthenticatedMessageWire, { v: 0 }> {
    return { v: 0, v0: this.v0.toXdrObject() };
  }
}

export type AuthenticatedMessage = AuthenticatedMessageV0Arm;
export const AuthenticatedMessage = AuthenticatedMessageBase;
