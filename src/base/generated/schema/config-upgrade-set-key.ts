// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractId } from "./contract-id.js";
import { Hash } from "./hash.js";
export interface ConfigUpgradeSetKey {
  readonly contractId: ContractId;
  readonly contentHash: Hash;
}
export const ConfigUpgradeSetKey = xdr.struct("ConfigUpgradeSetKey", {
  contractId: xdr.lazy(() => ContractId),
  contentHash: xdr.lazy(() => Hash),
}) as xdr.XdrType<ConfigUpgradeSetKey>;
