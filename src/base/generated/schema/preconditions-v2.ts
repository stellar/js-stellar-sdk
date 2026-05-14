// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Duration } from "./duration.js";
import { LedgerBounds } from "./ledger-bounds.js";
import { SequenceNumber } from "./sequence-number.js";
import { SignerKey } from "./signer-key.js";
import { TimeBounds } from "./time-bounds.js";
export interface PreconditionsV2 {
  readonly timeBounds: TimeBounds | null;
  readonly ledgerBounds: LedgerBounds | null;
  readonly minSeqNum: SequenceNumber | null;
  readonly minSeqAge: Duration;
  readonly minSeqLedgerGap: number;
  readonly extraSigners: SignerKey[];
}
export const PreconditionsV2 = xdr.struct("PreconditionsV2", {
  timeBounds: xdr.option(xdr.lazy(() => TimeBounds)),
  ledgerBounds: xdr.option(xdr.lazy(() => LedgerBounds)),
  minSeqNum: xdr.option(xdr.lazy(() => SequenceNumber)),
  minSeqAge: xdr.lazy(() => Duration),
  minSeqLedgerGap: xdr.uint32(),
  extraSigners: xdr.array(
    xdr.lazy(() => SignerKey),
    2,
  ),
}) as xdr.XdrType<PreconditionsV2>;
