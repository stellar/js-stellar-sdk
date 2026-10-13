import { array, int64, option, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { OWNED, copyArray } from "../values/owned.js";
import {
  TransactionEnvelope,
  type TransactionEnvelopeWire,
} from "./transaction-envelope.js";

export interface ParallelTxsComponentWire {
  baseFee: bigint | null;
  executionStages: TransactionEnvelopeWire[][][];
}

/**
 * ```xdr
 * struct ParallelTxsComponent
 * {
 *   int64* baseFee;
 *   // A sequence of stages that *may* have arbitrary data dependencies between
 *   // each other, i.e. in a general case the stage execution order may not be
 *   // arbitrarily shuffled without affecting the end result.
 *   ParallelTxExecutionStage executionStages<>;
 * };
 * ```
 */
export class ParallelTxsComponent extends XdrValue {
  readonly baseFee: bigint | null;
  readonly executionStages: TransactionEnvelope[][][];

  static readonly schema: XdrType<ParallelTxsComponentWire> = struct(
    "ParallelTxsComponent",
    {
      baseFee: option(int64()),
      executionStages: array(
        array(
          array(TransactionEnvelope.schema, UNBOUNDED_MAX_LENGTH),
          UNBOUNDED_MAX_LENGTH,
        ),
        UNBOUNDED_MAX_LENGTH,
      ),
    },
  );

  constructor(
    input: {
      baseFee: bigint | null;
      executionStages: TransactionEnvelope[][][];
    },
    owned?: typeof OWNED,
  ) {
    super();
    this.baseFee = input.baseFee;
    this.executionStages =
      owned === OWNED
        ? input.executionStages
        : copyArray(input.executionStages, (v) =>
            copyArray(v, (v1) => copyArray(v1)),
          );
  }

  toXdrObject(): ParallelTxsComponentWire {
    return {
      baseFee: this.baseFee,
      executionStages: this.executionStages.map((v) =>
        v.map((v1) => v1.map((v2) => v2.toXdrObject())),
      ),
    };
  }

  static fromXdrObject(wire: ParallelTxsComponentWire): ParallelTxsComponent {
    return new ParallelTxsComponent(
      {
        baseFee: wire.baseFee,
        executionStages: wire.executionStages.map((w) =>
          w.map((w1) => w1.map((w2) => TransactionEnvelope.fromXdrObject(w2))),
        ),
      },
      OWNED,
    );
  }
}
