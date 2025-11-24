import { xdr } from "@stellar/stellar-base";
import { Spec } from "../contract";
import {
  parseTypeFromTypeDef,
  generateTypeImports,
  sanitizeName,
} from "./utils";

/**
 * Interface for struct fields
 */
export interface StructField {
  doc: string;
  name: string;
  type: string;
}

/**
 * Interface for union cases
 */
export interface UnionCase {
  doc: string;
  name: string;
  types: string[];
}

/**
 * Interface for enum cases
 */
export interface EnumCase {
  doc: string;
  name: string;
  value: number;
}

/**
 * Generates TypeScript type definitions from Stellar contract specs
 */
export class TypeGenerator {
  private spec: Spec;

  constructor(spec: Spec) {
    this.spec = spec;
  }

  /**
   * Generate all TypeScript type definitions
   */
  generate(): string {
    // Generate types for each entry in the spec
    const types = this.spec.entries
      .map((entry) => this.generateEntry(entry))
      .filter((t) => t)
      .join("\n\n");
    // Generate imports for all types
    const imports = this.generateImports();

    return `${imports}

    ${types}
    `;
  }

  /**
   * Generate TypeScript for a single spec entry
   */
  private generateEntry(entry: xdr.ScSpecEntry): string | null {
    switch (entry.switch()) {
      case xdr.ScSpecEntryKind.scSpecEntryUdtStructV0():
        return this.generateStruct(entry.udtStructV0());
      case xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0():
        return this.generateUnion(entry.udtUnionV0());
      case xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0():
        return this.generateEnum(entry.udtEnumV0());
      case xdr.ScSpecEntryKind.scSpecEntryUdtErrorEnumV0():
        return this.generateErrorEnum(entry.udtErrorEnumV0());
      default:
        return null;
    }
  }

  private generateImports(): string {
    let imports = generateTypeImports(
      this.spec.entries.flatMap((entry) => {
        switch (entry.switch()) {
          case xdr.ScSpecEntryKind.scSpecEntryUdtStructV0():
            return entry
              .udtStructV0()
              .fields()
              .map((field) => field.type());
          case xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0():
            return entry
              .udtUnionV0()
              .cases()
              .flatMap((unionCase) => {
                if (
                  unionCase.switch() ===
                  xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0()
                ) {
                  return unionCase.tupleCase().type();
                }
                return [];
              });
          case xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0():
            // Enums do not have associated types
            return [];
          case xdr.ScSpecEntryKind.scSpecEntryUdtErrorEnumV0():
            // Enums do not have associated types
            return [];
          default:
            return [];
        }
      }),
    );

    const importLines: string[] = [];

    if (imports.needsBufferImport) {
      importLines.push(`import { Buffer } from 'buffer';`);
    }
    if (imports.stellarContractImports.length > 0) {
      importLines.push(
        `import {\n${imports.stellarContractImports.join(",\n")}\n} from '@stellar/stellar-sdk';`,
      );
    }
    if (imports.stellarImports.length > 0) {
      importLines.push(
        `import {\n${imports.stellarImports.join(",\n")}\n} from '@stellar/stellar-sdk';`,
      );
    }

    return importLines.join("\n");
  }

  /**
   * Generate TypeScript interface for a struct
   */
  private generateStruct(struct: xdr.ScSpecUdtStructV0): string {
    const name = sanitizeName(struct.name().toString());
    const doc = struct.doc().toString() || `Struct: ${name}`;

    const fields = struct
      .fields()
      .map((field) => {
        const fieldName = field.name().toString();
        const fieldType = parseTypeFromTypeDef(field.type());
        const fieldDoc = field.doc().toString();

        if (fieldDoc) {
          return `  /**\n   * ${fieldDoc}\n   */\n  ${fieldName}: ${fieldType};`;
        }
        return `  ${fieldName}: ${fieldType};`;
      })
      .join("\n");

    return `/**
 * ${doc}
 */
export interface ${name} {
${fields}
}`;
  }

  /**
   * Generate TypeScript union type
   */
  private generateUnion(union: xdr.ScSpecUdtUnionV0): string {
    const name = sanitizeName(union.name().toString());
    const doc = union.doc().toString() || `Union: ${name}`;
    const cases = union
      .cases()
      .map((unionCase) => this.generateUnionCase(unionCase));

    const caseTypes = cases
      .map((c) => {
        if (c.types.length > 0) {
          return `  { tag: "${c.name}"; values: [${c.types.join(", ")}] }`;
        }
        return `  { tag: "${c.name}" }`;
      })
      .join(" |\n");

    return `/**
 * ${doc}
 */
export type ${name} =
${caseTypes};`;
  }

  /**
   * Generate TypeScript enum
   */
  private generateEnum(enumEntry: xdr.ScSpecUdtEnumV0): string {
    const name = sanitizeName(enumEntry.name().toString());
    const doc = enumEntry.doc().toString() || `Enum: ${name}`;

    const members = enumEntry
      .cases()
      .map((enumCase) => {
        const caseName = enumCase.name().toString();
        const caseValue = enumCase.value();
        const caseDoc = enumCase.doc().toString() || `Enum Case: ${caseName}`;

        return `  /**
   * ${caseDoc}
   */
  ${caseName} = ${caseValue}`;
      })
      .join(",\n");

    return `/**
 * ${doc}
 */
export enum ${name} {
${members}
}`;
  }

  /**
   * Generate TypeScript error enum
   */
  private generateErrorEnum(errorEnum: xdr.ScSpecUdtErrorEnumV0): string {
    const name = sanitizeName(errorEnum.name().toString());
    const doc = errorEnum.doc().toString() || `Error Enum: ${name}`;
    const cases = errorEnum
      .cases()
      .map((enumCase) => this.generateEnumCase(enumCase));

    const members = cases
      .map((c) => {
        if (c.doc) {
          return `  /**
   * ${c.doc}
   */
  ${c.value} : {message: "${c.name}" }`;
        }
        return `  ${c.value} : {message: "${c.name}" }`;
      })
      .join(",\n");

    return `/**
 * ${doc}
 */
export const ${name} = {
${members}
}`;
  }

  /**
   * Generate union case
   */
  private generateUnionCase(unionCase: xdr.ScSpecUdtUnionCaseV0): UnionCase {
    switch (unionCase.switch()) {
      case xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0(): {
        const voidCase = unionCase.voidCase();
        return {
          doc: voidCase.doc().toString(),
          name: voidCase.name().toString(),
          types: [],
        };
      }
      case xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0(): {
        const tupleCase = unionCase.tupleCase();
        return {
          doc: tupleCase.doc().toString(),
          name: tupleCase.name().toString(),
          types: tupleCase.type().map((t) => parseTypeFromTypeDef(t)),
        };
      }
      default:
        throw new Error(`Unknown union case kind: ${unionCase.switch()}`);
    }
  }

  /**
   * Generate enum case
   */
  private generateEnumCase(enumCase: xdr.ScSpecUdtEnumCaseV0): EnumCase {
    return {
      doc: enumCase.doc().toString(),
      name: enumCase.name().toString(),
      value: enumCase.value(),
    };
  }
}
