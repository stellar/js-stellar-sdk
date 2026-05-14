// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerKey } from "./ledger-key.js";
import { RevokeSponsorshipOpSigner } from "./revoke-sponsorship-op-signer.js";
import { RevokeSponsorshipType } from "./revoke-sponsorship-type.js";
export type RevokeSponsorshipOp =
  | {
      readonly type: 0;
      readonly ledgerKey: LedgerKey;
    }
  | {
      readonly type: 1;
      readonly signer: RevokeSponsorshipOpSigner;
    };
export const RevokeSponsorshipOp = xdr.union("RevokeSponsorshipOp", {
  switchOn: xdr.lazy(() => RevokeSponsorshipType),
  switchKey: "type",
  cases: [
    xdr.case(
      "revokeSponsorshipLedgerEntry",
      0,
      xdr.field(
        "ledgerKey",
        xdr.lazy(() => LedgerKey),
      ),
    ),
    xdr.case(
      "revokeSponsorshipSigner",
      1,
      xdr.field(
        "signer",
        xdr.lazy(() => RevokeSponsorshipOpSigner),
      ),
    ),
  ] as const,
}) as xdr.XdrType<RevokeSponsorshipOp>;
