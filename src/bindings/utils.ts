import {
  ScSpecType,
  ScSpecTypeDef,
  ScSpecUdtStructV0,
} from "../base/generated/index.js";
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
/**
 * Sanitize a name to avoid reserved keywords
 * @param identifier - The identifier to sanitize
 * @returns The sanitized identifier
 */
export function sanitizeIdentifier(identifier: string): string {
  // Strip any characters outside the ASCII identifier-safe set [a-zA-Z0-9_$]
  const sanitized = identifier.replace(/[^a-zA-Z0-9_$]/g, "_");

  if (isNameReserved(sanitized)) {
    return sanitized + "_";
  }

  if (/^\d/.test(sanitized)) {
    return "_" + sanitized;
  }

  // If the identifier was entirely special characters, provide a fallback
  if (sanitized === "" || /^_+$/.test(sanitized)) {
    return "_unnamed";
  }

  return sanitized;
}

/**
 * Escape a string for safe interpolation inside a double-quoted JavaScript string literal.
 */
export function escapeStringLiteral(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * Generate TypeScript type from XDR type definition
 */
export function parseTypeFromTypeDef(
  typeDef: ScSpecTypeDef,
  isFunctionInput = false,
): string {
  switch (typeDef.type) {
    case ScSpecType.scSpecTypeVal:
      return "any";
    case ScSpecType.scSpecTypeBool:
      return "boolean";
    case ScSpecType.scSpecTypeVoid:
      return "null";
    case ScSpecType.scSpecTypeError:
      return "Error";
    case ScSpecType.scSpecTypeU32:
    case ScSpecType.scSpecTypeI32:
      return "number";
    case ScSpecType.scSpecTypeU64:
    case ScSpecType.scSpecTypeI64:
    case ScSpecType.scSpecTypeTimepoint:
    case ScSpecType.scSpecTypeDuration:
    case ScSpecType.scSpecTypeU128:
    case ScSpecType.scSpecTypeI128:
    case ScSpecType.scSpecTypeU256:
    case ScSpecType.scSpecTypeI256:
      return "bigint";
    case ScSpecType.scSpecTypeBytes:
    case ScSpecType.scSpecTypeBytesN:
      return "Buffer";
    case ScSpecType.scSpecTypeString:
      return "string";
    case ScSpecType.scSpecTypeSymbol:
      return "string";
    case ScSpecType.scSpecTypeAddress:
    case ScSpecType.scSpecTypeMuxedAddress: {
      // function inputs can accept either string or Address
      if (isFunctionInput) {
        return "string | Address";
      }
      // Otherwise for backward compatibility use string
      return "string";
    }
    case ScSpecType.scSpecTypeVec: {
      const vecType = parseTypeFromTypeDef(
        typeDef.vec.elementType,
        isFunctionInput,
      );
      return `Array<${vecType}>`;
    }
    case ScSpecType.scSpecTypeMap: {
      const keyType = parseTypeFromTypeDef(
        typeDef.map.keyType,
        isFunctionInput,
      );
      const valueType = parseTypeFromTypeDef(
        typeDef.map.valueType,
        isFunctionInput,
      );
      return `Map<${keyType}, ${valueType}>`;
    }
    case ScSpecType.scSpecTypeTuple: {
      const tupleTypes = typeDef.tuple.valueTypes.map((t) =>
        parseTypeFromTypeDef(t, isFunctionInput),
      );
      return `[${tupleTypes.join(", ")}]`;
    }
    case ScSpecType.scSpecTypeOption: {
      // Handle nested options
      while (typeDef.option.valueType.type === ScSpecType.scSpecTypeOption) {
        typeDef = typeDef.option.valueType;
      }
      const optionType = parseTypeFromTypeDef(
        typeDef.option.valueType,
        isFunctionInput,
      );

      return `${optionType} | null`;
    }
    case ScSpecType.scSpecTypeResult: {
      const okType = parseTypeFromTypeDef(
        typeDef.result.okType,
        isFunctionInput,
      );
      const errorType = parseTypeFromTypeDef(
        typeDef.result.errorType,
        isFunctionInput,
      );
      return `Result<${okType}, ${errorType}>`;
    }
    case ScSpecType.scSpecTypeUdt: {
      const udtName = sanitizeIdentifier(typeDef.udt.name);
      return udtName;
    }
    default:
      return "unknown";
  }
}

/**
 * Imports needed for generating bindings
 */
export interface BindingImports {
  /** Imports needed from type definitions */
  typeFileImports: Set<string>;
  /** Imports needed from the Stellar SDK in the contract namespace */
  stellarContractImports: Set<string>;
  /** Imports needed from Stellar SDK in the global namespace */
  stellarImports: Set<string>;
  /** Whether Buffer import is needed */
  needsBufferImport: boolean;
}

/**
 * Extract nested type definitions from container types
 */
function extractNestedTypes(typeDef: ScSpecTypeDef): ScSpecTypeDef[] {
  switch (typeDef.type) {
    case ScSpecType.scSpecTypeVec:
      return [typeDef.vec.elementType];

    case ScSpecType.scSpecTypeMap:
      return [typeDef.map.keyType, typeDef.map.valueType];

    case ScSpecType.scSpecTypeTuple:
      return typeDef.tuple.valueTypes.slice();

    case ScSpecType.scSpecTypeOption:
      return [typeDef.option.valueType];

    case ScSpecType.scSpecTypeResult:
      return [typeDef.result.okType, typeDef.result.errorType];

    default:
      return [];
  }
}

/**
 * Visitor to collect imports from a single type definition
 */
function visitTypeDef(
  typeDef: ScSpecTypeDef,
  accumulator: BindingImports,
): void {
  // Handle leaf types (no nested types)
  switch (typeDef.type) {
    case ScSpecType.scSpecTypeUdt:
      accumulator.typeFileImports.add(sanitizeIdentifier(typeDef.udt.name));
      return;

    case ScSpecType.scSpecTypeAddress:
    case ScSpecType.scSpecTypeMuxedAddress:
      accumulator.stellarImports.add("Address");
      return;

    case ScSpecType.scSpecTypeBytes:
    case ScSpecType.scSpecTypeBytesN:
      accumulator.needsBufferImport = true;
      return;

    case ScSpecType.scSpecTypeVal:
      accumulator.stellarImports.add("xdr");
      return;

    case ScSpecType.scSpecTypeResult:
      accumulator.stellarContractImports.add("Result");
      // Fall through to handle nested types
      break;

    // Primitive types that need no imports
    case ScSpecType.scSpecTypeBool:
    case ScSpecType.scSpecTypeVoid:
    case ScSpecType.scSpecTypeError:
    case ScSpecType.scSpecTypeU32:
    case ScSpecType.scSpecTypeI32:
    case ScSpecType.scSpecTypeU64:
    case ScSpecType.scSpecTypeI64:
    case ScSpecType.scSpecTypeTimepoint:
    case ScSpecType.scSpecTypeDuration:
    case ScSpecType.scSpecTypeU128:
    case ScSpecType.scSpecTypeI128:
    case ScSpecType.scSpecTypeU256:
    case ScSpecType.scSpecTypeI256:
    case ScSpecType.scSpecTypeString:
    case ScSpecType.scSpecTypeSymbol:
      return;
  }

  // Handle container types (have nested types)
  const nestedTypes = extractNestedTypes(typeDef);
  nestedTypes.forEach((nested) => visitTypeDef(nested, accumulator));
}

/**
 * Generate imports needed for a list of type definitions
 */
export function generateTypeImports(typeDefs: ScSpecTypeDef[]): BindingImports {
  const imports: BindingImports = {
    typeFileImports: new Set<string>(),
    stellarContractImports: new Set<string>(),
    stellarImports: new Set<string>(),
    needsBufferImport: false,
  };

  // Visit each type definition
  typeDefs.forEach((typeDef) => visitTypeDef(typeDef, imports));

  return imports;
}

/**
 * Options for formatting imports
 */
export interface FormatImportsOptions {
  /** Whether to include imports from types.ts */
  includeTypeFileImports?: boolean;
  /** Additional imports needed from stellar/stellar-sdk/contract */
  additionalStellarContractImports?: string[];
  /** Additional imports needed from stellar/stellar-sdk */
  additionalStellarImports?: string[];
}

/**
 * Format imports into import statement strings
 */
export function formatImports(
  imports: BindingImports,
  options?: FormatImportsOptions,
): string {
  const importLines: string[] = [];

  const typeFileImports = imports.typeFileImports;
  const stellarContractImports = [
    ...imports.stellarContractImports,
    ...(options?.additionalStellarContractImports || []),
  ];
  const stellarImports = [
    ...imports.stellarImports,
    ...(options?.additionalStellarImports || []),
  ];
  // Type file imports (only if enabled)
  if (options?.includeTypeFileImports && typeFileImports.size > 0) {
    importLines.push(
      `import {${Array.from(typeFileImports).join(", ")}} from './types.js';`,
    );
  }

  // Stellar contract imports
  if (stellarContractImports.length > 0) {
    const uniqueContractImports = Array.from(new Set(stellarContractImports));
    importLines.push(
      `import {${uniqueContractImports.join(", ")}} from '@stellar/stellar-sdk/contract';`,
    );
  }

  // Stellar SDK imports
  if (stellarImports.length > 0) {
    const uniqueStellarImports = Array.from(new Set(stellarImports));
    importLines.push(
      `import {${uniqueStellarImports.join(", ")}} from '@stellar/stellar-sdk';`,
    );
  }

  // Buffer import
  if (imports.needsBufferImport) {
    importLines.push(`import { Buffer } from 'buffer';`);
  }

  return importLines.join("\n");
}

/**
 * Escape special characters in JSDoc comment content
 */
function escapeJSDocContent(text: string): string {
  return (
    text
      // Escape closing comment sequences that would break the JSDoc block
      .replace(/\*\//g, "* /")
      // Escape @ symbols at word boundaries to prevent accidental JSDoc tags
      // We allow common JSDoc tags to pass through
      .replace(
        /@(?!(param|returns?|type|throws?|example|deprecated|see|link|since|author|version|description|summary)\b)/g,
        "\\@",
      )
  );
}

/**
 * Format a comment string as JSDoc with proper escaping
 */
export function formatJSDocComment(comment: string, indentLevel = 0): string {
  if (comment.trim() === "") {
    return "";
  }
  const indent = " ".repeat(indentLevel);

  // Escape special characters and split into lines
  const escapedComment = escapeJSDocContent(comment);
  const lines = escapedComment
    .split("\n")
    .map((line) => `${indent} * ${line}`.trimEnd());

  return `${indent}/**\n${lines.join("\n")}\n${indent} */\n`;
}

export function isTupleStruct(udtStruct: ScSpecUdtStructV0): boolean {
  const fields = udtStruct.fields;
  // A tuple struct has unnamed fields
  return fields.every((field, index) => field.name.trim() === index.toString());
}
