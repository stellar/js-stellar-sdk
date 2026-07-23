import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ScpStatement, type ScpStatementWire } from "./scp-statement.js";
import { Signature, type SignatureWire } from "./signature.js";

export interface ScpEnvelopeWire {
  statement: ScpStatementWire;
  signature: SignatureWire;
}

/**
 * ```xdr
 * struct SCPEnvelope
 * {
 *     SCPStatement statement;
 *     Signature signature;
 * };
 * ```
 */
export class ScpEnvelope extends XdrValue {
  readonly statement: ScpStatement;
  readonly signature: Signature;

  static readonly schema: XdrType<ScpEnvelopeWire> = struct("ScpEnvelope", {
    statement: ScpStatement.schema,
    signature: Signature.schema,
  });

  constructor(input: {
    statement: ScpStatement;
    signature: Signature | Uint8Array | string;
  }) {
    super();
    this.statement = input.statement;
    this.signature =
      input.signature instanceof Signature
        ? input.signature
        : new Signature(input.signature);
  }

  toXdrObject(): ScpEnvelopeWire {
    return {
      statement: this.statement.toXdrObject(),
      signature: this.signature.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ScpEnvelopeWire): ScpEnvelope {
    return new ScpEnvelope({
      statement: ScpStatement.fromXdrObject(wire.statement),
      signature: Signature.fromXdrObject(wire.signature),
    });
  }
}
