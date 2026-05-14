// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ExtensionPoint } from "./extension-point.js";
export interface ContractCodeCostInputs {
  readonly ext: ExtensionPoint;
  readonly nInstructions: number;
  readonly nFunctions: number;
  readonly nGlobals: number;
  readonly nTableEntries: number;
  readonly nTypes: number;
  readonly nDataSegments: number;
  readonly nElemSegments: number;
  readonly nImports: number;
  readonly nExports: number;
  readonly nDataSegmentBytes: number;
}
export const ContractCodeCostInputs = xdr.struct("ContractCodeCostInputs", {
  ext: xdr.lazy(() => ExtensionPoint),
  nInstructions: xdr.uint32(),
  nFunctions: xdr.uint32(),
  nGlobals: xdr.uint32(),
  nTableEntries: xdr.uint32(),
  nTypes: xdr.uint32(),
  nDataSegments: xdr.uint32(),
  nElemSegments: xdr.uint32(),
  nImports: xdr.uint32(),
  nExports: xdr.uint32(),
  nDataSegmentBytes: xdr.uint32(),
}) as xdr.XdrType<ContractCodeCostInputs>;
