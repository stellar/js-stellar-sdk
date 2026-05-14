// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractDataDurability } from "./contract-data-durability.js";
import { ExtensionPoint } from "./extension-point.js";
import { SCAddress } from "./sc-address.js";
import { SCVal } from "./stellar-contract-cycle.js";
export interface ContractDataEntry {
  readonly ext: ExtensionPoint;
  readonly contract: SCAddress;
  readonly key: SCVal;
  readonly durability: ContractDataDurability;
  readonly val: SCVal;
}
export const ContractDataEntry = xdr.struct("ContractDataEntry", {
  ext: xdr.lazy(() => ExtensionPoint),
  contract: xdr.lazy(() => SCAddress),
  key: xdr.lazy(() => SCVal),
  durability: xdr.lazy(() => ContractDataDurability),
  val: xdr.lazy(() => SCVal),
}) as xdr.XdrType<ContractDataEntry>;
