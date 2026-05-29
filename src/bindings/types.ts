import { Spec } from "../contract/index.js";
import {
  parseTypeFromTypeDef,
  generateTypeImports,
  sanitizeIdentifier,
  escapeStringLiteral,
  formatJSDocComment,
  formatImports,
  isTupleStruct,
} from "./utils.js";
import {
  ScSpecEntry,
  ScSpecUdtEnumCaseV0,
  ScSpecUdtEnumV0,
  ScSpecUdtErrorEnumV0,
  ScSpecUdtStructFieldV0,
  ScSpecUdtStructV0,
  ScSpecUdtUnionCaseV0,
  ScSpecUdtUnionV0,
} from "../xdr/index.js";

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
  private generateEntry(entry: ScSpecEntry): string | null {
    switch (entry.type) {
      case "scSpecEntryUdtStructV0":
        if (isTupleStruct(entry.value)) {
          return this.generateTupleStruct(entry.value);
        }
        return this.generateStruct(entry.value);
      case "scSpecEntryUdtUnionV0":
        return this.generateUnion(entry.value);
      case "scSpecEntryUdtEnumV0":
        return this.generateEnum(entry.value);
      case "scSpecEntryUdtErrorEnumV0":
        return this.generateErrorEnum(entry.value);
      default:
        return null;
    }
  }

  private generateImports(): string {
    const imports = generateTypeImports(
      this.spec.entries.flatMap((entry) => {
        switch (entry.type) {
          case "scSpecEntryUdtStructV0":
            return entry.value.fields.map(
              (field: ScSpecUdtStructFieldV0) => field.type,
            );
          case "scSpecEntryUdtUnionV0":
            return entry.value.cases.flatMap(
              (unionCase: ScSpecUdtUnionCaseV0) => {
                if (unionCase.type === "scSpecUdtUnionCaseTupleV0") {
                  return unionCase.value.type;
                }
                return [];
              },
            );
          case "scSpecEntryUdtEnumV0":
            // Enums do not have associated types
            return [];
          case "scSpecEntryUdtErrorEnumV0":
            // Enums do not have associated types
            return [];
          default:
            return [];
        }
      }),
    );

    return formatImports(imports, {
      includeTypeFileImports: false, // Types file doesn't import from itself
    });
  }

  /**
   * Generate TypeScript interface for a struct
   */
  private generateStruct(struct: ScSpecUdtStructV0): string {
    const name = sanitizeIdentifier(struct.name.toString());
    const doc = formatJSDocComment(
      struct.doc.toString() || `Struct: ${name}`,
      0,
    );

    const fields = struct.fields
      .map((field) => {
        const fieldName = sanitizeIdentifier(field.name.toString());
        const fieldType = parseTypeFromTypeDef(field.type);
        const fieldDoc = formatJSDocComment(field.doc.toString(), 2);

        return `${fieldDoc}  ${fieldName}: ${fieldType};`;
      })
      .join("\n");

    return `${doc}export interface ${name} {
${fields}
}`;
  }

  /**
   * Generate TypeScript union type
   */
  private generateUnion(union: ScSpecUdtUnionV0): string {
    const name = sanitizeIdentifier(union.name.toString());
    const doc = formatJSDocComment(union.doc.toString() || `Union: ${name}`, 0);
    const cases = union.cases.map((unionCase) =>
      this.generateUnionCase(unionCase),
    );

    const caseTypes = cases
      .map((c) => {
        if (c.types.length > 0) {
          return `${formatJSDocComment(c.doc, 2)}  { tag: "${escapeStringLiteral(c.name)}"; values: readonly [${c.types.join(", ")}] }`;
        }
        return `${formatJSDocComment(c.doc, 2)}  { tag: "${escapeStringLiteral(c.name)}"; values: void }`;
      })
      .join(" |\n");

    return `${doc} export type ${name} =
${caseTypes};`;
  }

  /**
   * Generate TypeScript enum
   */
  private generateEnum(enumEntry: ScSpecUdtEnumV0): string {
    const name = sanitizeIdentifier(enumEntry.name.toString());
    const doc = formatJSDocComment(
      enumEntry.doc.toString() || `Enum: ${name}`,
      0,
    );

    const members = enumEntry.cases
      .map((enumCase) => {
        const caseName = sanitizeIdentifier(enumCase.name.toString());
        const caseValue = enumCase.value;
        const caseDoc = enumCase.doc.toString() || `Enum Case: ${caseName}`;

        return `${formatJSDocComment(caseDoc, 2)}  ${caseName} = ${caseValue}`;
      })
      .join(",\n");

    return `${doc}export enum ${name} {
${members}
}`;
  }

  /**
   * Generate TypeScript error enum
   */
  private generateErrorEnum(errorEnum: ScSpecUdtErrorEnumV0): string {
    const name = sanitizeIdentifier(errorEnum.name.toString());
    const doc = formatJSDocComment(
      errorEnum.doc.toString() || `Error Enum: ${name}`,
      0,
    );
    const cases = errorEnum.cases.map((enumCase) =>
      this.generateEnumCase(enumCase),
    );

    const members = cases
      .map((c) => {
        return `${formatJSDocComment(c.doc, 2)}  ${c.value} : { message: "${escapeStringLiteral(c.name)}" }`;
      })
      .join(",\n");

    return `${doc}export const ${name} = {
${members}
}`;
  }

  /**
   * Generate union case
   */
  private generateUnionCase(unionCase: ScSpecUdtUnionCaseV0): UnionCase {
    switch (unionCase.type) {
      case "scSpecUdtUnionCaseVoidV0": {
        const voidCase = unionCase.value;
        return {
          doc: voidCase.doc.toString(),
          name: voidCase.name.toString(),
          types: [],
        };
      }
      case "scSpecUdtUnionCaseTupleV0": {
        const tupleCase = unionCase.value;
        return {
          doc: tupleCase.doc.toString(),
          name: tupleCase.name.toString(),
          types: tupleCase.type.map((t) => parseTypeFromTypeDef(t)),
        };
      }
      default:
        throw new Error(
          `Unknown union case kind: ${(unionCase as { type: string }).type}`,
        );
    }
  }

  /**
   * Generate enum case
   */
  private generateEnumCase(enumCase: ScSpecUdtEnumCaseV0): EnumCase {
    return {
      doc: enumCase.doc.toString(),
      name: enumCase.name.toString(),
      value: enumCase.value,
    };
  }

  private generateTupleStruct(udtStruct: ScSpecUdtStructV0): string {
    const name = sanitizeIdentifier(udtStruct.name.toString());
    const doc = formatJSDocComment(
      udtStruct.doc.toString() || `Tuple Struct: ${name}`,
      0,
    );

    const types = udtStruct.fields
      .map((field) => parseTypeFromTypeDef(field.type))
      .join(", ");

    return `${doc}export type ${name} = readonly [${types}];`;
  }
}
