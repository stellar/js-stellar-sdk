// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractDataDurability } from "./contract-data-durability.js";
import { SCAddress } from "./sc-address.js";
import { SCVal } from "./stellar-contract-cycle.js";
export interface LedgerKeyContractData {
  readonly contract: SCAddress;
  readonly key: SCVal;
  readonly durability: ContractDataDurability;
}
export const LedgerKeyContractData = xdr.struct("LedgerKeyContractData", {
  contract: xdr.lazy(() => SCAddress),
  key: xdr.lazy(() => SCVal),
  durability: xdr.lazy(() => ContractDataDurability),
}) as xdr.XdrType<LedgerKeyContractData>;
