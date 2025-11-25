import { xdr } from "@stellar/stellar-base";

/**
 * Generate TypeScript type from XDR type definition
 */
export function parseTypeFromTypeDef(typeDef: xdr.ScSpecTypeDef): string {
  switch (typeDef.switch()) {
    case xdr.ScSpecType.scSpecTypeVal():
      return "xdr.ScVal";
    case xdr.ScSpecType.scSpecTypeBool():
      return "boolean";
    case xdr.ScSpecType.scSpecTypeVoid():
      return "undefined | null";
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
      return "string | Address";
    case xdr.ScSpecType.scSpecTypeVec(): {
      const vecType = parseTypeFromTypeDef(typeDef.vec().elementType());
      return `Array<${vecType}>`;
    }
    case xdr.ScSpecType.scSpecTypeMap(): {
      const keyType = parseTypeFromTypeDef(typeDef.map().keyType());
      const valueType = parseTypeFromTypeDef(typeDef.map().valueType());
      return `Map<${keyType}, ${valueType}>`;
    }
    case xdr.ScSpecType.scSpecTypeTuple(): {
      const tupleTypes = typeDef
        .tuple()
        .valueTypes()
        .map((t: xdr.ScSpecTypeDef) => parseTypeFromTypeDef(t));
      return `[${tupleTypes.join(", ")}]`;
    }
    case xdr.ScSpecType.scSpecTypeOption(): {
      const optionType = parseTypeFromTypeDef(typeDef.option().valueType());
      return `${optionType} | undefined | null`;
    }
    case xdr.ScSpecType.scSpecTypeResult(): {
      const okType = parseTypeFromTypeDef(typeDef.result().okType());
      const errorType = parseTypeFromTypeDef(typeDef.result().errorType());
      return `Result<${okType}, ${errorType}>`;
    }
    case xdr.ScSpecType.scSpecTypeUdt():
      const udtName = sanitizeName(typeDef.udt().name().toString());
      return udtName;
    default:
      return "unknown";
  }
}

/**
 * Imports needed for generating bindings
 */
export interface BindingImports {
  /** Imports needed from type definitions */
  typeFileImports: string[];
  /** Imports needed from the Stellar SDK in the contract namespace */
  stellarContractImports: string[];
  /** Imports needed from Stellar SDK in the global namespace */
  stellarImports: string[];
  /** Whether Buffer import is needed */
  needsBufferImport: boolean;
}
export function generateTypeImports(
  typeDefs: xdr.ScSpecTypeDef[],
): BindingImports {
  const typeFileImports = new Set<string>();
  const stellarContractImports = new Set<string>();
  const stellarImports = new Set<string>();
  let needsBufferImport = false;
  typeDefs.forEach((typeDef) => {
    switch (typeDef.switch()) {
      case xdr.ScSpecType.scSpecTypeUdt():
        // These are contract interfaces/structs/enums/errors that need to imported from types.ts
        typeFileImports.add(sanitizeName(typeDef.udt().name().toString()));
        break;
      case xdr.ScSpecType.scSpecTypeAddress():
      case xdr.ScSpecType.scSpecTypeMuxedAddress():
        stellarImports.add("Address");
        break;
      case xdr.ScSpecType.scSpecTypeBytes():
      case xdr.ScSpecType.scSpecTypeBytesN():
        needsBufferImport = true;
        break;
      case xdr.ScSpecType.scSpecTypeVal():
        stellarImports.add("xdr");
        break;
      case xdr.ScSpecType.scSpecTypeVec():
        {
          const vecImports = generateTypeImports([typeDef.vec().elementType()]);
          vecImports.typeFileImports.forEach((imp) => typeFileImports.add(imp));
          vecImports.stellarContractImports.forEach((imp) =>
            stellarContractImports.add(imp),
          );
          vecImports.stellarImports.forEach((imp) => stellarImports.add(imp));
        }
        break;
      case xdr.ScSpecType.scSpecTypeMap():
        {
          const mapImports = generateTypeImports([
            typeDef.map().keyType(),
            typeDef.map().valueType(),
          ]);
          mapImports.typeFileImports.forEach((imp) => typeFileImports.add(imp));
          mapImports.stellarContractImports.forEach((imp) =>
            stellarContractImports.add(imp),
          );
          mapImports.stellarImports.forEach((imp) => stellarImports.add(imp));
        }
        break;
      case xdr.ScSpecType.scSpecTypeTuple():
        {
          const tupleImports = generateTypeImports(
            typeDef.tuple().valueTypes(),
          );
          tupleImports.typeFileImports.forEach((imp) =>
            typeFileImports.add(imp),
          );
          tupleImports.stellarContractImports.forEach((imp) =>
            stellarContractImports.add(imp),
          );
          tupleImports.stellarImports.forEach((imp) => stellarImports.add(imp));
        }
        break;
      case xdr.ScSpecType.scSpecTypeOption():
        {
          const optionImports = generateTypeImports([
            typeDef.option().valueType(),
          ]);
          optionImports.typeFileImports.forEach((imp) =>
            typeFileImports.add(imp),
          );
          optionImports.stellarContractImports.forEach((imp) =>
            stellarContractImports.add(imp),
          );
          optionImports.stellarImports.forEach((imp) =>
            stellarImports.add(imp),
          );
        }
        break;
      case xdr.ScSpecType.scSpecTypeResult():
        {
          stellarContractImports.add("Result");
          const resultImports = generateTypeImports([
            typeDef.result().okType(),
            typeDef.result().errorType(),
          ]);
          resultImports.typeFileImports.forEach((imp) =>
            typeFileImports.add(imp),
          );
          resultImports.stellarContractImports.forEach((imp) =>
            stellarContractImports.add(imp),
          );
          resultImports.stellarImports.forEach((imp) =>
            stellarImports.add(imp),
          );
        }
        break;
    }
  });

  return {
    typeFileImports: Array.from(typeFileImports),
    stellarContractImports: Array.from(stellarContractImports),
    stellarImports: Array.from(stellarImports),
    needsBufferImport,
  };
}

/**
 * Sanitize a name to avoid reserved keywords
 * @param name
 * @returns
 */
export function sanitizeName(name: string): string {
  if (isNameReserved(name)) {
    // Append underscore to reserved
    return name + "_";
  }
  return name;
}
export function isNameReserved(name: string): boolean {
  const reservedNames = [
    // Keywords
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "export",
    "extends",
    "finally",
    "for",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "new",
    "return",
    "super",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "yield",
    // Future reserved words
    "enum",
    // Strict mode reserved words
    "implements",
    "interface",
    "let",
    "package",
    "private",
    "protected",
    "public",
    "static",
    // Contextual keywords
    "async",
    "await",
    "constructor",
    // Literals
    "null",
    "true",
    "false",
  ];
  return reservedNames.includes(name);
}

export function formatJSDocComment(comment: string, indentLevel = 0): string {
  if (comment.trim() === "") {
    return "";
  }
  const indent = " ".repeat(indentLevel);
  const lines = comment.split("\n").map((line) => `${indent} * ${line}`);
  return `${indent}/**\n${lines.join("\n")}\n${indent} */\n`;
}
