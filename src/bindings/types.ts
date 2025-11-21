import { xdr } from "@stellar/stellar-base";
import { Spec } from "../contract";

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
    const types: string[] = [];

    // Generate types for each entry in the spec
    this.spec.entries.forEach((entry) => {
      const generated = this.generateEntry(entry);
      if (generated) {
        types.push(generated);
      }
    });

    return types.join("\n\n");
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

  /**
   * Generate TypeScript interface for a struct
   */
  private generateStruct(struct: xdr.ScSpecUdtStructV0): string {
    const name = struct.name().toString();
    const doc = struct.doc().toString() || `Struct: ${name}`;

    const fields = struct
      .fields()
      .map((field) => {
        const fieldName = field.name().toString();
        const fieldType = this.generateTypeFromTypeDef(field.type());
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
    const name = union.name().toString();
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
    const name = enumEntry.name().toString();
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
    const name = errorEnum.name().toString();
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
          types: tupleCase.type().map((t) => this.generateTypeFromTypeDef(t)),
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

  /**
   * Generate TypeScript type from XDR type definition
   */
  private generateTypeFromTypeDef(typeDef: xdr.ScSpecTypeDef): string {
    switch (typeDef.switch()) {
      case xdr.ScSpecType.scSpecTypeVal():
        return "xdr.ScVal";
      case xdr.ScSpecType.scSpecTypeBool():
        return "boolean";
      case xdr.ScSpecType.scSpecTypeVoid():
        return "void";
      case xdr.ScSpecType.scSpecTypeError():
        return "Error";
      case xdr.ScSpecType.scSpecTypeU32():
      case xdr.ScSpecType.scSpecTypeI32():
        return "number";
      case xdr.ScSpecType.scSpecTypeU64():
      case xdr.ScSpecType.scSpecTypeI64():
      case xdr.ScSpecType.scSpecTypeTimepoint():
      case xdr.ScSpecType.scSpecTypeDuration():
      case xdr.ScSpecType.scSpecTypeU128():
      case xdr.ScSpecType.scSpecTypeI128():
      case xdr.ScSpecType.scSpecTypeU256():
      case xdr.ScSpecType.scSpecTypeI256():
        return "bigint";
      case xdr.ScSpecType.scSpecTypeBytes():
      case xdr.ScSpecType.scSpecTypeBytesN():
        return "Buffer";
      case xdr.ScSpecType.scSpecTypeString():
        return "string";
      case xdr.ScSpecType.scSpecTypeSymbol():
        return "string";
      case xdr.ScSpecType.scSpecTypeAddress():
      case xdr.ScSpecType.scSpecTypeMuxedAddress():
        return "string";
      case xdr.ScSpecType.scSpecTypeVec(): {
        const vecType = this.generateTypeFromTypeDef(
          typeDef.vec().elementType(),
        );
        return `Array<${vecType}>`;
      }
      case xdr.ScSpecType.scSpecTypeMap(): {
        const keyType = this.generateTypeFromTypeDef(typeDef.map().keyType());
        const valueType = this.generateTypeFromTypeDef(
          typeDef.map().valueType(),
        );
        return `Map<${keyType}, ${valueType}>`;
      }
      case xdr.ScSpecType.scSpecTypeTuple(): {
        const tupleTypes = typeDef
          .tuple()
          .valueTypes()
          .map((t: xdr.ScSpecTypeDef) => this.generateTypeFromTypeDef(t));
        return `[${tupleTypes.join(", ")}]`;
      }
      case xdr.ScSpecType.scSpecTypeOption(): {
        const optionType = this.generateTypeFromTypeDef(
          typeDef.option().valueType(),
        );
        return `${optionType} | undefined`;
      }
      case xdr.ScSpecType.scSpecTypeResult(): {
        const okType = this.generateTypeFromTypeDef(typeDef.result().okType());
        const errorType = this.generateTypeFromTypeDef(
          typeDef.result().errorType(),
        );
        return `Result<${okType}, ${errorType}>`;
      }
      case xdr.ScSpecType.scSpecTypeUdt():
        return typeDef.udt().name().toString();
      default:
        return "unknown";
    }
  }
}
