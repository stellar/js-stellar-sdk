import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { HostFunction, type HostFunctionWire } from "./host-function.js";
import {
  SorobanAuthorizationEntry,
  type SorobanAuthorizationEntryWire,
} from "./soroban-authorization-entry.js";

export interface InvokeHostFunctionOpWire {
  hostFunction: HostFunctionWire;
  auth: SorobanAuthorizationEntryWire[];
}

/**
 * ```xdr
 * struct InvokeHostFunctionOp
 * {
 *     // Host function to invoke.
 *     HostFunction hostFunction;
 *     // Per-address authorizations for this host function.
 *     SorobanAuthorizationEntry auth<>;
 * };
 * ```
 */
export class InvokeHostFunctionOp extends XdrValue {
  readonly hostFunction: HostFunction;
  readonly auth: SorobanAuthorizationEntry[];

  static readonly schema: XdrType<InvokeHostFunctionOpWire> = struct(
    "InvokeHostFunctionOp",
    {
      hostFunction: HostFunction.schema,
      auth: array(SorobanAuthorizationEntry.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    hostFunction: HostFunction;
    auth: SorobanAuthorizationEntry[];
  }) {
    super();
    this.hostFunction = input.hostFunction;
    this.auth = input.auth;
  }

  toXdrObject(): InvokeHostFunctionOpWire {
    return {
      hostFunction: this.hostFunction.toXdrObject(),
      auth: this.auth.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: InvokeHostFunctionOpWire): InvokeHostFunctionOp {
    return new InvokeHostFunctionOp({
      hostFunction: HostFunction.fromXdrObject(wire.hostFunction),
      auth: wire.auth.map((w) => SorobanAuthorizationEntry.fromXdrObject(w)),
    });
  }
}
