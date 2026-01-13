import { xdr } from "@stellar/stellar-base";
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
  if (isNameReserved(identifier)) {
    // Append underscore to reserved
    return identifier + "_";
  }

  if (/^\d/.test(identifier)) {
    // Prefix leading digit with underscore
    return "_" + identifier;
  }

  return identifier;
}

/**
 * Generate TypeScript type from XDR type definition
 */
export function parseTypeFromTypeDef(typeDef: xdr.ScSpecTypeDef): string {
  switch (typeDef.switch()) {
    case xdr.ScSpecType.scSpecTypeVal():
      return "any";
    case xdr.ScSpecType.scSpecTypeBool():
      return "boolean";
    case xdr.ScSpecType.scSpecTypeVoid():
      return "null";
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
      // Handle nested options
      while (
        typeDef.option().valueType().switch() ===
        xdr.ScSpecType.scSpecTypeOption()
      ) {
        typeDef = typeDef.option().valueType();
      }
      const optionType = parseTypeFromTypeDef(typeDef.option().valueType());

      return `${optionType} | null`;
    }
    case xdr.ScSpecType.scSpecTypeResult(): {
      const okType = parseTypeFromTypeDef(typeDef.result().okType());
      const errorType = parseTypeFromTypeDef(typeDef.result().errorType());
      return `Result<${okType}, ${errorType}>`;
    }
    case xdr.ScSpecType.scSpecTypeUdt(): {
      const udtName = sanitizeIdentifier(typeDef.udt().name().toString());
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
function extractNestedTypes(typeDef: xdr.ScSpecTypeDef): xdr.ScSpecTypeDef[] {
  switch (typeDef.switch()) {
    case xdr.ScSpecType.scSpecTypeVec():
      return [typeDef.vec().elementType()];

    case xdr.ScSpecType.scSpecTypeMap():
      return [typeDef.map().keyType(), typeDef.map().valueType()];

    case xdr.ScSpecType.scSpecTypeTuple():
      return typeDef.tuple().valueTypes();

    case xdr.ScSpecType.scSpecTypeOption():
      return [typeDef.option().valueType()];

    case xdr.ScSpecType.scSpecTypeResult():
      return [typeDef.result().okType(), typeDef.result().errorType()];

    default:
      return [];
  }
}

/**
 * Visitor to collect imports from a single type definition
 */
function visitTypeDef(
  typeDef: xdr.ScSpecTypeDef,
  accumulator: BindingImports,
): void {
  const typeSwitch = typeDef.switch();

  // Handle leaf types (no nested types)
  switch (typeSwitch) {
    case xdr.ScSpecType.scSpecTypeUdt():
      accumulator.typeFileImports.add(
        sanitizeIdentifier(typeDef.udt().name().toString()),
      );
      return;

    case xdr.ScSpecType.scSpecTypeAddress():
    case xdr.ScSpecType.scSpecTypeMuxedAddress():
      accumulator.stellarImports.add("Address");
      return;

    case xdr.ScSpecType.scSpecTypeBytes():
    case xdr.ScSpecType.scSpecTypeBytesN():
      accumulator.needsBufferImport = true;
      return;

    case xdr.ScSpecType.scSpecTypeVal():
      accumulator.stellarImports.add("xdr");
      return;

    case xdr.ScSpecType.scSpecTypeResult():
      accumulator.stellarContractImports.add("Result");
      // Fall through to handle nested types
      break;

    // Primitive types that need no imports
    case xdr.ScSpecType.scSpecTypeBool():
    case xdr.ScSpecType.scSpecTypeVoid():
    case xdr.ScSpecType.scSpecTypeError():
    case xdr.ScSpecType.scSpecTypeU32():
    case xdr.ScSpecType.scSpecTypeI32():
    case xdr.ScSpecType.scSpecTypeU64():
    case xdr.ScSpecType.scSpecTypeI64():
    case xdr.ScSpecType.scSpecTypeTimepoint():
    case xdr.ScSpecType.scSpecTypeDuration():
    case xdr.ScSpecType.scSpecTypeU128():
    case xdr.ScSpecType.scSpecTypeI128():
    case xdr.ScSpecType.scSpecTypeU256():
    case xdr.ScSpecType.scSpecTypeI256():
    case xdr.ScSpecType.scSpecTypeString():
    case xdr.ScSpecType.scSpecTypeSymbol():
      return;
  }

  // Handle container types (have nested types)
  const nestedTypes = extractNestedTypes(typeDef);
  nestedTypes.forEach((nested) => visitTypeDef(nested, accumulator));
}

/**
 * Generate imports needed for a list of type definitions
 */
export function generateTypeImports(
  typeDefs: xdr.ScSpecTypeDef[],
): BindingImports {
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
