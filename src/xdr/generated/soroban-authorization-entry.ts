import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  SorobanCredentials,
  type SorobanCredentialsWire,
} from "./soroban-credentials.js";
import {
  SorobanAuthorizedInvocation,
  type SorobanAuthorizedInvocationWire,
} from "./soroban-authorized-invocation.js";

export interface SorobanAuthorizationEntryWire {
  credentials: SorobanCredentialsWire;
  rootInvocation: SorobanAuthorizedInvocationWire;
}

/**
 * ```xdr
 * struct SorobanAuthorizationEntry
 * {
 *     SorobanCredentials credentials;
 *     SorobanAuthorizedInvocation rootInvocation;
 * };
 * ```
 */
export class SorobanAuthorizationEntry extends XdrValue {
  readonly credentials: SorobanCredentials;
  readonly rootInvocation: SorobanAuthorizedInvocation;

  static readonly schema: XdrType<SorobanAuthorizationEntryWire> = struct(
    "SorobanAuthorizationEntry",
    {
      credentials: SorobanCredentials.schema,
      rootInvocation: SorobanAuthorizedInvocation.schema,
    },
  );

  constructor(input: {
    credentials: SorobanCredentials;
    rootInvocation: SorobanAuthorizedInvocation;
  }) {
    super();
    this.credentials = input.credentials;
    this.rootInvocation = input.rootInvocation;
  }

  toXdrObject(): SorobanAuthorizationEntryWire {
    return {
      credentials: this.credentials.toXdrObject(),
      rootInvocation: this.rootInvocation.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: SorobanAuthorizationEntryWire,
  ): SorobanAuthorizationEntry {
    return new SorobanAuthorizationEntry({
      credentials: SorobanCredentials.fromXdrObject(wire.credentials),
      rootInvocation: SorobanAuthorizedInvocation.fromXdrObject(
        wire.rootInvocation,
      ),
    });
  }
}
