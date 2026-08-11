import { struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import { ScAddress, type ScAddressWire } from "./sc-address.js";

export interface ContractExecutableExternalRefWire {
  executableOwner: ScAddressWire;
  tag: XdrString;
}

/**
 * ```xdr
 * struct ContractExecutableExternalRef {
 *     SCAddress executable_owner;
 *     SCString tag;
 * };
 * ```
 */
export class ContractExecutableExternalRef extends XdrValue {
  readonly executableOwner: ScAddress;
  readonly tag: XdrString;

  static readonly schema: XdrType<ContractExecutableExternalRefWire> = struct(
    "ContractExecutableExternalRef",
    {
      executableOwner: ScAddress.schema,
      tag: xdrString(UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    executableOwner: ScAddress;
    tag: XdrString | string | Uint8Array;
  }) {
    super();
    this.executableOwner = input.executableOwner;
    this.tag =
      input.tag instanceof XdrString ? input.tag : new XdrString(input.tag);
  }

  toXdrObject(): ContractExecutableExternalRefWire {
    return {
      executableOwner: this.executableOwner.toXdrObject(),
      tag: this.tag,
    };
  }

  static fromXdrObject(
    wire: ContractExecutableExternalRefWire,
  ): ContractExecutableExternalRef {
    return new ContractExecutableExternalRef({
      executableOwner: ScAddress.fromXdrObject(wire.executableOwner),
      tag: wire.tag,
    });
  }
}
