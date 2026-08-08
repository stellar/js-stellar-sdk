import { xdr } from "../base/index.js";
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
 * Split a spec type name into its path segments.
 *
 * Since rs-soroban-sdk qualifies user-defined type names with the Rust
 * module path they are declared in, a spec name can look like
 * `token::storage::Balance` rather than a bare `Balance`.
 */
function typeNameSegments(specName: string): string[] {
  return specName.split("::").filter((segment) => segment.length > 0);
}

/**
 * The bare type name of a spec name: the last segment of a module-qualified
 * name (`token::storage::Balance` becomes `Balance`), sanitized.
 */
export function udtTypeName(specName: string): string {
  const segments = typeNameSegments(specName);
  return sanitizeIdentifier(
    segments.length > 0 ? segments[segments.length - 1] : specName,
  );
}

/**
 * The whole spec name as a single identifier
 * (`token::storage::Balance` becomes `token_storage_Balance`).
 */
export function udtQualifiedTypeName(specName: string): string {
  const segments = typeNameSegments(specName);
  return sanitizeIdentifier(
    segments.length > 0 ? segments.join("_") : specName,
  );
}

/**
 * Maps a user-defined type's spec name to the TypeScript identifier the
 * bindings use to refer to it. Shared by the types and client generators so
 * both files agree on every name.
 */
export type UdtNameResolver = (specName: string) => string;

/**
 * The identifiers the generated types file uses for one user-defined type.
 */
export type UdtTypeNames = {
  /** The identifier the type is declared under: its whole spec name. */
  declared: string;
  /**
   * The bare type name the declaration is additionally exported under, or
   * `undefined` when the bare name is unavailable — either the declaration
   * already carries it, or another type in the spec has the same bare name.
   */
  alias?: string;
  /**
   * The other spec names sharing this type's bare name; only non-empty when
   * that clash is why no {@link UdtTypeNames.alias} is exported.
   */
  ambiguousWith: string[];
};

/**
 * The identifiers the generated types file uses for every user-defined type
 * in a spec.
 */
export type UdtNames = {
  /** The identifiers for the type with the given spec name. */
  for: (specName: string) => UdtTypeNames;
  /** How other generated code refers to the type: its alias, else its declared name. */
  reference: UdtNameResolver;
  /** Every identifier the types file exports, declarations and aliases alike. */
  exported: () => string[];
};

/**
 * The spec name of a user-defined type entry, or `null` for entries that do
 * not declare one (functions, events).
 */
function udtEntryName(entry: xdr.ScSpecEntry): string | null {
  switch (entry.switch()) {
    case xdr.ScSpecEntryKind.scSpecEntryUdtStructV0():
      return entry.udtStructV0().name().toString();
    case xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0():
      return entry.udtUnionV0().name().toString();
    case xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0():
      return entry.udtEnumV0().name().toString();
    case xdr.ScSpecEntryKind.scSpecEntryUdtErrorEnumV0():
      return entry.udtErrorEnumV0().name().toString();
    default:
      return null;
  }
}

/**
 * Resolve the TypeScript identifiers for every user-defined type in a spec.
 *
 * Every type is declared under its whole spec name — module path included,
 * `_`-joined — so the Rust type it came from is always spelled out and two
 * same-named types from different modules never clash. Each is then also
 * exported under its bare type name, which is the name generated bindings
 * have always used, so the module path stays out of the way. A bare name is
 * only skipped when the spec makes it ambiguous: several types share it, or
 * another type is declared under it outright.
 *
 * Names are resolved in spec-entry order, and a declaration whose identifier
 * is somehow already taken gets a numeric suffix, so resolution is
 * deterministic for a given spec and the types and client files always agree.
 */
export function createUdtNames(entries: xdr.ScSpecEntry[]): UdtNames {
  const specNames: string[] = [];
  entries.forEach((entry) => {
    const specName = udtEntryName(entry);
    if (specName !== null && !specNames.includes(specName)) {
      specNames.push(specName);
    }
  });

  const taken = new Set<string>();
  const names = new Map<string, UdtTypeNames>();

  // Declarations first: they are the names that must exist.
  specNames.forEach((specName) => {
    const base = udtQualifiedTypeName(specName);
    let declared = base;
    let suffix = 2;
    while (taken.has(declared)) {
      declared = `${base}${suffix}`;
      suffix += 1;
    }
    taken.add(declared);
    names.set(specName, { declared, ambiguousWith: [] });
  });

  // Then the bare-name aliases, for every type whose bare name is its alone.
  const claimants = new Map<string, string[]>();
  specNames.forEach((specName) => {
    const bare = udtTypeName(specName);
    claimants.set(bare, [...(claimants.get(bare) ?? []), specName]);
  });

  claimants.forEach((claiming, bare) => {
    if (claiming.length === 1 && !taken.has(bare)) {
      taken.add(bare);
      names.get(claiming[0])!.alias = bare;
      return;
    }
    // Ambiguous: the bare name is shared, or is itself a declared name.
    claiming.forEach((specName) => {
      if (names.get(specName)!.declared === bare) {
        return;
      }
      names.get(specName)!.ambiguousWith = claiming.filter(
        (other) => other !== specName,
      );
    });
  });

  const namesFor = (specName: string): UdtTypeNames =>
    names.get(specName) ?? {
      declared: udtQualifiedTypeName(specName),
      ambiguousWith: [],
    };

  return {
    for: namesFor,
    reference: (specName: string) => {
      const resolved = namesFor(specName);
      return resolved.alias ?? resolved.declared;
    },
    exported: () =>
      specNames.flatMap((specName) => {
        const resolved = names.get(specName)!;
        return resolved.alias === undefined
          ? [resolved.declared]
          : [resolved.declared, resolved.alias];
      }),
  };
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
  typeDef: xdr.ScSpecTypeDef,
  isFunctionInput = false,
  resolveUdtName: UdtNameResolver = udtTypeName,
): string {
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
    case xdr.ScSpecType.scSpecTypeMuxedAddress(): {
      // function inputs can accept either string or Address
      if (isFunctionInput) {
        return "string | Address";
      }
      // Otherwise for backward compatibility use string
      return "string";
    }
    case xdr.ScSpecType.scSpecTypeVec(): {
      const vecType = parseTypeFromTypeDef(
        typeDef.vec().elementType(),
        isFunctionInput,
        resolveUdtName,
      );
      return `Array<${vecType}>`;
    }
    case xdr.ScSpecType.scSpecTypeMap(): {
      const keyType = parseTypeFromTypeDef(
        typeDef.map().keyType(),
        isFunctionInput,
        resolveUdtName,
      );
      const valueType = parseTypeFromTypeDef(
        typeDef.map().valueType(),
        isFunctionInput,
        resolveUdtName,
      );
      return `Map<${keyType}, ${valueType}>`;
    }
    case xdr.ScSpecType.scSpecTypeTuple(): {
      const tupleTypes = typeDef
        .tuple()
        .valueTypes()
        .map((t: xdr.ScSpecTypeDef) =>
          parseTypeFromTypeDef(t, isFunctionInput, resolveUdtName),
        );
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
      const optionType = parseTypeFromTypeDef(
        typeDef.option().valueType(),
        isFunctionInput,
        resolveUdtName,
      );

      return `${optionType} | null`;
    }
    case xdr.ScSpecType.scSpecTypeResult(): {
      const okType = parseTypeFromTypeDef(
        typeDef.result().okType(),
        isFunctionInput,
        resolveUdtName,
      );
      const errorType = parseTypeFromTypeDef(
        typeDef.result().errorType(),
        isFunctionInput,
        resolveUdtName,
      );
      return `Result<${okType}, ${errorType}>`;
    }
    case xdr.ScSpecType.scSpecTypeUdt(): {
      return resolveUdtName(typeDef.udt().name().toString());
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
  resolveUdtName: UdtNameResolver,
): void {
  const typeSwitch = typeDef.switch();

  // Handle leaf types (no nested types)
  switch (typeSwitch) {
    case xdr.ScSpecType.scSpecTypeUdt():
      accumulator.typeFileImports.add(
        resolveUdtName(typeDef.udt().name().toString()),
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
  nestedTypes.forEach((nested) =>
    visitTypeDef(nested, accumulator, resolveUdtName),
  );
}

/**
 * Generate imports needed for a list of type definitions
 */
export function generateTypeImports(
  typeDefs: xdr.ScSpecTypeDef[],
  resolveUdtName: UdtNameResolver = udtTypeName,
): BindingImports {
  const imports: BindingImports = {
    typeFileImports: new Set<string>(),
    stellarContractImports: new Set<string>(),
    stellarImports: new Set<string>(),
    needsBufferImport: false,
  };

  // Visit each type definition
  typeDefs.forEach((typeDef) => visitTypeDef(typeDef, imports, resolveUdtName));

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

/**
 * Convert a sanitized identifier (snake_case, kebab-case, etc.) to PascalCase.
 * Intended to be applied after {@link sanitizeIdentifier}.
 */
export function toPascalCase(identifier: string): string {
  const pascal = identifier
    .split(/[_$]+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return pascal === "" ? "Unnamed" : pascal;
}

/**
 * Convert a sanitized identifier (snake_case, kebab-case, etc.) to camelCase.
 * Intended to be applied after {@link sanitizeIdentifier}.
 */
export function toCamelCase(identifier: string): string {
  const pascal = toPascalCase(identifier);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function isTupleStruct(udtStruct: xdr.ScSpecUdtStructV0): boolean {
  const fields = udtStruct.fields();
  // A tuple struct has unnamed fields
  return fields.every(
    (field, index) => field.name().toString().trim() === index.toString(),
  );
}
