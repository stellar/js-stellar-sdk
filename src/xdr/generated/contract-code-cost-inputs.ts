import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";

export interface ContractCodeCostInputsWire {
  ext: ExtensionPointWire;
  nInstructions: number;
  nFunctions: number;
  nGlobals: number;
  nTableEntries: number;
  nTypes: number;
  nDataSegments: number;
  nElemSegments: number;
  nImports: number;
  nExports: number;
  nDataSegmentBytes: number;
}

/**
 * ```xdr
 * struct ContractCodeCostInputs {
 *     ExtensionPoint ext;
 *     uint32 nInstructions;
 *     uint32 nFunctions;
 *     uint32 nGlobals;
 *     uint32 nTableEntries;
 *     uint32 nTypes;
 *     uint32 nDataSegments;
 *     uint32 nElemSegments;
 *     uint32 nImports;
 *     uint32 nExports;
 *     uint32 nDataSegmentBytes;
 * };
 * ```
 */
export class ContractCodeCostInputs extends XdrValue {
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

  static readonly schema: XdrType<ContractCodeCostInputsWire> = struct(
    "ContractCodeCostInputs",
    {
      ext: ExtensionPoint.schema,
      nInstructions: uint32(),
      nFunctions: uint32(),
      nGlobals: uint32(),
      nTableEntries: uint32(),
      nTypes: uint32(),
      nDataSegments: uint32(),
      nElemSegments: uint32(),
      nImports: uint32(),
      nExports: uint32(),
      nDataSegmentBytes: uint32(),
    },
  );

  constructor(input: {
    ext: ExtensionPoint;
    nInstructions: number;
    nFunctions: number;
    nGlobals: number;
    nTableEntries: number;
    nTypes: number;
    nDataSegments: number;
    nElemSegments: number;
    nImports: number;
    nExports: number;
    nDataSegmentBytes: number;
  }) {
    super();
    this.ext = input.ext;
    this.nInstructions = input.nInstructions;
    this.nFunctions = input.nFunctions;
    this.nGlobals = input.nGlobals;
    this.nTableEntries = input.nTableEntries;
    this.nTypes = input.nTypes;
    this.nDataSegments = input.nDataSegments;
    this.nElemSegments = input.nElemSegments;
    this.nImports = input.nImports;
    this.nExports = input.nExports;
    this.nDataSegmentBytes = input.nDataSegmentBytes;
  }

  toXdrObject(): ContractCodeCostInputsWire {
    return {
      ext: this.ext.toXdrObject(),
      nInstructions: this.nInstructions,
      nFunctions: this.nFunctions,
      nGlobals: this.nGlobals,
      nTableEntries: this.nTableEntries,
      nTypes: this.nTypes,
      nDataSegments: this.nDataSegments,
      nElemSegments: this.nElemSegments,
      nImports: this.nImports,
      nExports: this.nExports,
      nDataSegmentBytes: this.nDataSegmentBytes,
    };
  }

  static fromXdrObject(
    wire: ContractCodeCostInputsWire,
  ): ContractCodeCostInputs {
    return new ContractCodeCostInputs({
      ext: ExtensionPoint.fromXdrObject(wire.ext),
      nInstructions: wire.nInstructions,
      nFunctions: wire.nFunctions,
      nGlobals: wire.nGlobals,
      nTableEntries: wire.nTableEntries,
      nTypes: wire.nTypes,
      nDataSegments: wire.nDataSegments,
      nElemSegments: wire.nElemSegments,
      nImports: wire.nImports,
      nExports: wire.nExports,
      nDataSegmentBytes: wire.nDataSegmentBytes,
    });
  }
}
