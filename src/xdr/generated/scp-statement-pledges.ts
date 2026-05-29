/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScpStatementType } from "./scp-statement-type.js";
import {
  ScpStatementPrepare,
  type ScpStatementPrepareWire,
} from "./scp-statement-prepare.js";
import {
  ScpStatementConfirm,
  type ScpStatementConfirmWire,
} from "./scp-statement-confirm.js";
import {
  ScpStatementExternalize,
  type ScpStatementExternalizeWire,
} from "./scp-statement-externalize.js";
import { ScpNomination, type ScpNominationWire } from "./scp-nomination.js";

export type ScpStatementPledgesWire =
  | { type: 0; prepare: ScpStatementPrepareWire }
  | { type: 1; confirm: ScpStatementConfirmWire }
  | { type: 2; externalize: ScpStatementExternalizeWire }
  | { type: 3; nominate: ScpNominationWire };

export type ScpStatementPledgesVariantName =
  | "scpStPrepare"
  | "scpStConfirm"
  | "scpStExternalize"
  | "scpStNominate";

/**
 * ```xdr
 * union switch (SCPStatementType type)
 *     {
 *     case SCP_ST_PREPARE:
 *         struct
 *         {
 *             Hash quorumSetHash;       // D
 *             SCPBallot ballot;         // b
 *             SCPBallot* prepared;      // p
 *             SCPBallot* preparedPrime; // p'
 *             uint32 nC;                // c.n
 *             uint32 nH;                // h.n
 *         } prepare;
 *     case SCP_ST_CONFIRM:
 *         struct
 *         {
 *             SCPBallot ballot;   // b
 *             uint32 nPrepared;   // p.n
 *             uint32 nCommit;     // c.n
 *             uint32 nH;          // h.n
 *             Hash quorumSetHash; // D
 *         } confirm;
 *     case SCP_ST_EXTERNALIZE:
 *         struct
 *         {
 *             SCPBallot commit;         // c
 *             uint32 nH;                // h.n
 *             Hash commitQuorumSetHash; // D used before EXTERNALIZE
 *         } externalize;
 *     case SCP_ST_NOMINATE:
 *         SCPNomination nominate;
 *     }
 * ```
 */
abstract class ScpStatementPledgesBase extends XdrValue {
  abstract readonly type: ScpStatementPledgesVariantName;

  static readonly schema: XdrType<ScpStatementPledgesWire> = union(
    "ScpStatementPledges",
    {
      switchOn: ScpStatementType.schema,
      cases: [
        case_("scpStPrepare", 0, field("prepare", ScpStatementPrepare.schema)),
        case_("scpStConfirm", 1, field("confirm", ScpStatementConfirm.schema)),
        case_(
          "scpStExternalize",
          2,
          field("externalize", ScpStatementExternalize.schema),
        ),
        case_("scpStNominate", 3, field("nominate", ScpNomination.schema)),
      ],
    },
  );

  static scpStPrepare(
    prepare: ScpStatementPrepare,
  ): ScpStatementPledgesPrepare {
    return new ScpStatementPledgesPrepare(prepare);
  }

  static scpStConfirm(
    confirm: ScpStatementConfirm,
  ): ScpStatementPledgesConfirm {
    return new ScpStatementPledgesConfirm(confirm);
  }

  static scpStExternalize(
    externalize: ScpStatementExternalize,
  ): ScpStatementPledgesExternalize {
    return new ScpStatementPledgesExternalize(externalize);
  }

  static scpStNominate(nominate: ScpNomination): ScpStatementPledgesNominate {
    return new ScpStatementPledgesNominate(nominate);
  }

  static fromXdrObject(wire: ScpStatementPledgesWire): ScpStatementPledges {
    switch (wire.type) {
      case 0:
        return new ScpStatementPledgesPrepare(
          ScpStatementPrepare.fromXdrObject(wire.prepare),
        );
      case 1:
        return new ScpStatementPledgesConfirm(
          ScpStatementConfirm.fromXdrObject(wire.confirm),
        );
      case 2:
        return new ScpStatementPledgesExternalize(
          ScpStatementExternalize.fromXdrObject(wire.externalize),
        );
      case 3:
        return new ScpStatementPledgesNominate(
          ScpNomination.fromXdrObject(wire.nominate),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ScpStatementPledges variant.
   * Use this instead of `instanceof ScpStatementPledges`: the exported `ScpStatementPledges` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ScpStatementPledges.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ScpStatementPledges {
    return value instanceof ScpStatementPledgesBase;
  }

  abstract toXdrObject(): ScpStatementPledgesWire;
}

export class ScpStatementPledgesPrepare extends ScpStatementPledgesBase {
  readonly type = "scpStPrepare" as const;
  readonly prepare: ScpStatementPrepare;

  constructor(prepare: ScpStatementPrepare) {
    super();
    this.prepare = prepare;
  }

  get value(): ScpStatementPrepare {
    return this.prepare;
  }

  toXdrObject(): Extract<ScpStatementPledgesWire, { type: 0 }> {
    return { type: 0, prepare: this.prepare.toXdrObject() };
  }
}

export class ScpStatementPledgesConfirm extends ScpStatementPledgesBase {
  readonly type = "scpStConfirm" as const;
  readonly confirm: ScpStatementConfirm;

  constructor(confirm: ScpStatementConfirm) {
    super();
    this.confirm = confirm;
  }

  get value(): ScpStatementConfirm {
    return this.confirm;
  }

  toXdrObject(): Extract<ScpStatementPledgesWire, { type: 1 }> {
    return { type: 1, confirm: this.confirm.toXdrObject() };
  }
}

export class ScpStatementPledgesExternalize extends ScpStatementPledgesBase {
  readonly type = "scpStExternalize" as const;
  readonly externalize: ScpStatementExternalize;

  constructor(externalize: ScpStatementExternalize) {
    super();
    this.externalize = externalize;
  }

  get value(): ScpStatementExternalize {
    return this.externalize;
  }

  toXdrObject(): Extract<ScpStatementPledgesWire, { type: 2 }> {
    return { type: 2, externalize: this.externalize.toXdrObject() };
  }
}

export class ScpStatementPledgesNominate extends ScpStatementPledgesBase {
  readonly type = "scpStNominate" as const;
  readonly nominate: ScpNomination;

  constructor(nominate: ScpNomination) {
    super();
    this.nominate = nominate;
  }

  get value(): ScpNomination {
    return this.nominate;
  }

  toXdrObject(): Extract<ScpStatementPledgesWire, { type: 3 }> {
    return { type: 3, nominate: this.nominate.toXdrObject() };
  }
}

export type ScpStatementPledges =
  | ScpStatementPledgesPrepare
  | ScpStatementPledgesConfirm
  | ScpStatementPledgesExternalize
  | ScpStatementPledgesNominate;
export const ScpStatementPledges = ScpStatementPledgesBase;
