// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCPNomination } from "./scp-nomination.js";
import { SCPStatementConfirm } from "./scp-statement-confirm.js";
import { SCPStatementExternalize } from "./scp-statement-externalize.js";
import { SCPStatementPrepare } from "./scp-statement-prepare.js";
import { SCPStatementType } from "./scp-statement-type.js";
export type SCPStatementPledges =
  | {
      readonly type: 0;
      readonly prepare: SCPStatementPrepare;
    }
  | {
      readonly type: 1;
      readonly confirm: SCPStatementConfirm;
    }
  | {
      readonly type: 2;
      readonly externalize: SCPStatementExternalize;
    }
  | {
      readonly type: 3;
      readonly nominate: SCPNomination;
    };
export const SCPStatementPledges = xdr.union("SCPStatementPledges", {
  switchOn: xdr.lazy(() => SCPStatementType),
  switchKey: "type",
  cases: [
    xdr.case(
      "scpStPrepare",
      0,
      xdr.field(
        "prepare",
        xdr.lazy(() => SCPStatementPrepare),
      ),
    ),
    xdr.case(
      "scpStConfirm",
      1,
      xdr.field(
        "confirm",
        xdr.lazy(() => SCPStatementConfirm),
      ),
    ),
    xdr.case(
      "scpStExternalize",
      2,
      xdr.field(
        "externalize",
        xdr.lazy(() => SCPStatementExternalize),
      ),
    ),
    xdr.case(
      "scpStNominate",
      3,
      xdr.field(
        "nominate",
        xdr.lazy(() => SCPNomination),
      ),
    ),
  ] as const,
}) as xdr.XdrType<SCPStatementPledges>;
