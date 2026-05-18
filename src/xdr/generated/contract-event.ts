import { struct } from "../types/struct.js";
import { option } from "../types/option.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";
import { Hash, type HashWire } from "./hash.js";
import {
  ContractEventType,
  type ContractEventTypeWire,
} from "./contract-event-type.js";
import {
  ContractEventBody,
  type ContractEventBodyWire,
} from "./contract-event-body.js";

export interface ContractEventWire {
  ext: ExtensionPointWire;
  contractId: HashWire | null;
  type: ContractEventTypeWire;
  body: ContractEventBodyWire;
}

/**
 * ```xdr
 * struct ContractEvent
 * {
 *     // We can use this to add more fields, or because it
 *     // is first, to change ContractEvent into a union.
 *     ExtensionPoint ext;
 *
 *     ContractID* contractID;
 *     ContractEventType type;
 *
 *     union switch (int v)
 *     {
 *     case 0:
 *         struct
 *         {
 *             SCVal topics<>;
 *             SCVal data;
 *         } v0;
 *     }
 *     body;
 * };
 * ```
 */
export class ContractEvent extends XdrValue {
  readonly ext: ExtensionPoint;
  readonly contractId: Hash | null;
  readonly type: ContractEventType;
  readonly body: ContractEventBody;

  static readonly schema: XdrType<ContractEventWire> = struct("ContractEvent", {
    ext: ExtensionPoint.schema,
    contractId: option(Hash.schema),
    type: ContractEventType.schema,
    body: ContractEventBody.schema,
  });

  constructor(input: {
    ext: ExtensionPoint;
    contractId: Hash | null;
    type: ContractEventType;
    body: ContractEventBody;
  }) {
    super();
    this.ext = input.ext;
    this.contractId = input.contractId;
    this.type = input.type;
    this.body = input.body;
  }

  toXdrObject(): ContractEventWire {
    return {
      ext: this.ext.toXdrObject(),
      contractId:
        this.contractId === null ? null : this.contractId.toXdrObject(),
      type: this.type.toXdrObject(),
      body: this.body.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ContractEventWire): ContractEvent {
    return new ContractEvent({
      ext: ExtensionPoint.fromXdrObject(wire.ext),
      contractId:
        wire.contractId === null ? null : Hash.fromXdrObject(wire.contractId),
      type: ContractEventType.fromXdrObject(wire.type),
      body: ContractEventBody.fromXdrObject(wire.body),
    });
  }
}
