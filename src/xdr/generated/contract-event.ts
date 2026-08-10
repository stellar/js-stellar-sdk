import { option, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";
import { ContractId, type ContractIdWire } from "./contract-id.js";
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
  contractId: ContractIdWire | null;
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
  readonly contractId: ContractId | null;
  readonly type: ContractEventType;
  readonly body: ContractEventBody;

  static readonly schema: XdrType<ContractEventWire> = struct("ContractEvent", {
    ext: ExtensionPoint.schema,
    contractId: option(ContractId.schema),
    type: ContractEventType.schema,
    body: ContractEventBody.schema,
  });

  constructor(input: {
    ext: ExtensionPoint;
    contractId: ContractId | null;
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
        wire.contractId === null
          ? null
          : ContractId.fromXdrObject(wire.contractId),
      type: ContractEventType.fromXdrObject(wire.type),
      body: ContractEventBody.fromXdrObject(wire.body),
    });
  }
}
