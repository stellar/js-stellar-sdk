import { struct } from "../types/struct.js";
import { varOpaque } from "../types/var-opaque.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  ContractCodeEntryExt,
  type ContractCodeEntryExtWire,
} from "./contract-code-entry-ext.js";
import { Hash, type HashWire } from "./hash.js";

export interface ContractCodeEntryWire {
  ext: ContractCodeEntryExtWire;
  hash: HashWire;
  code: Uint8Array;
}

/**
 * ```xdr
 * struct ContractCodeEntry {
 *     union switch (int v)
 *     {
 *         case 0:
 *             void;
 *         case 1:
 *             struct
 *             {
 *                 ExtensionPoint ext;
 *                 ContractCodeCostInputs costInputs;
 *             } v1;
 *     } ext;
 *
 *     Hash hash;
 *     opaque code<>;
 * };
 * ```
 */
export class ContractCodeEntry extends XdrValue {
  readonly ext: ContractCodeEntryExt;
  readonly hash: Hash;
  readonly code: Uint8Array;

  static readonly schema: XdrType<ContractCodeEntryWire> = struct(
    "ContractCodeEntry",
    {
      ext: ContractCodeEntryExt.schema,
      hash: Hash.schema,
      code: varOpaque(UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    ext: ContractCodeEntryExt;
    hash: Hash | Uint8Array | string;
    code: Uint8Array;
  }) {
    super();
    this.ext = input.ext;
    this.hash = input.hash instanceof Hash ? input.hash : new Hash(input.hash);
    this.code = input.code;
  }

  toXdrObject(): ContractCodeEntryWire {
    return {
      ext: this.ext.toXdrObject(),
      hash: this.hash.toXdrObject(),
      code: this.code,
    };
  }

  static fromXdrObject(wire: ContractCodeEntryWire): ContractCodeEntry {
    return new ContractCodeEntry({
      ext: ContractCodeEntryExt.fromXdrObject(wire.ext),
      hash: Hash.fromXdrObject(wire.hash),
      code: wire.code,
    });
  }
}
