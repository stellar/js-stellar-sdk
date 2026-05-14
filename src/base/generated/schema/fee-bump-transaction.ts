// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { FeeBumpTransactionExt } from "./fee-bump-transaction-ext.js";
import { FeeBumpTransactionInnerTx } from "./fee-bump-transaction-inner-tx.js";
import { MuxedAccount } from "./muxed-account.js";
export interface FeeBumpTransaction {
  readonly feeSource: MuxedAccount;
  readonly fee: bigint;
  readonly innerTx: FeeBumpTransactionInnerTx;
  readonly ext: FeeBumpTransactionExt;
}
export const FeeBumpTransaction = xdr.struct("FeeBumpTransaction", {
  feeSource: xdr.lazy(() => MuxedAccount),
  fee: xdr.int64(),
  innerTx: xdr.lazy(() => FeeBumpTransactionInnerTx),
  ext: xdr.lazy(() => FeeBumpTransactionExt),
}) as xdr.XdrType<FeeBumpTransaction>;
