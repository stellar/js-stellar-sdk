/* eslint-disable jsdoc/require-jsdoc */
// Generates the DX layer (src/base/new-xdr/dx) from xdr/xdr.json. Each module
// pairs a friendly TS surface type with a runtime descriptor so the engine in
// _support.ts can bridge the DX shape to/from the schema layer's wire shape.
// Read the schema layer files to learn each definition's emitted module name
// for cross-imports.

import {
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { format } from "prettier";

const sdkRoot = process.cwd();
const defaultIrPath = resolve(sdkRoot, "xdr/xdr.json");
const defaultOutPath = resolve(sdkRoot, "./src/base/generated/dx");
const irPath = resolve(process.argv[2] ?? defaultIrPath);
const outPath = resolve(process.argv[3] ?? defaultOutPath);
const schemaPath = resolve(outPath, "../schema");
const ir = JSON.parse(readFileSync(irPath, "utf8"));
const definitions = (ir.definitions ?? []).filter(
  (definition) => definition.name && definition.kind !== "const",
);
const enumNames = new Set(
  definitions
    .filter((definition) => definition.kind === "enum")
    .map((definition) => definition.name),
);
const definitionsByName = new Map(
  definitions.map((definition) => [definition.name, definition]),
);
const primitiveNames = new Set([
  "int",
  "int32",
  "uint",
  "uint32",
  "hyper",
  "int64",
  "uhyper",
  "uint64",
  "float",
  "double",
  "bool",
  "void",
]);

// Custom DX representations for specific schema types. Each override pairs a
// TS surface type with a descriptor kind that the engine knows how to bridge
// to/from the schema's actual struct shape. Schema layer is unchanged; engine
// does the conversion.
const customTypeOverrides = new Map([
  [
    "Int128Parts",
    { tsType: "bigint", descriptor: `{ kind: "bigint128", signed: true }` },
  ],
  [
    "UInt128Parts",
    { tsType: "bigint", descriptor: `{ kind: "bigint128", signed: false }` },
  ],
  [
    "Int256Parts",
    { tsType: "bigint", descriptor: `{ kind: "bigint256", signed: true }` },
  ],
  [
    "UInt256Parts",
    { tsType: "bigint", descriptor: `{ kind: "bigint256", signed: false }` },
  ],
  // Asset codes are protocol-defined as ASCII alphanumeric strings stored in
  // fixed-width byte arrays. Surface as JS string at the DX layer; the engine
  // bridges to/from Uint8Array via ASCII at the schema boundary.
  [
    "AssetCode4",
    { tsType: "string", descriptor: `{ kind: "stringBytes", encoding: "ascii" }` },
  ],
  [
    "AssetCode12",
    { tsType: "string", descriptor: `{ kind: "stringBytes", encoding: "ascii" }` },
  ],
]);

// JSON byte encoding overrides for opaque typedefs. Default is "hex".
// Anything that ref's a typedef in this map (directly or transitively via
// alias) picks up the override automatically through the engine's alias chain.
const byteEncodingOverrides = new Map([
  ["AssetCode4", "ascii"],
  ["AssetCode12", "ascii"],
  ["Signature", "base64"],
]);

const primitivePublicNames = new Map([
  ["int", "Int"],
  ["int32", "Int32"],
  ["uint", "Uint"],
  ["uint32", "Uint32"],
  ["hyper", "Hyper"],
  ["int64", "Int64"],
  ["uhyper", "Uhyper"],
  ["uint64", "Uint64"],
  ["float", "Float"],
  ["double", "Double"],
  ["bool", "Bool"],
  ["void", "Void"],
]);

// Normalize the schema layer's exported TS identifier from an IR name.
// Must match the rule applied in `generate-new-xdr-schema.mjs` (`tsName`).
// Converts embedded `ID` runs to `Id` so e.g. `AccountID` -> `AccountId`.
function schemaTsName(rawName) {
  return rawName.replace(/ID(?=[A-Z][a-z]|[0-9_]|$)/g, "Id");
}

// Normalizes any IR raw name to PascalCase used as the DX-exported type name.
// Handles UInt/uint prefixes specially so e.g. "UInt128Parts" stays "Uint128Parts".
function publicTypeName(name) {
  const primitive = primitivePublicNames.get(name);
  if (primitive !== undefined) return primitive;

  const normalized = String(name)
    .replace(/^uint/, "Uint")
    .replace(/^int/, "Int")
    .replace(/^UInt/, "Uint");
  const parts = normalized.match(
    /[A-Z]+(?=[A-Z][a-z]|[0-9]|$)|[A-Z]?[a-z]+|[0-9]+/g,
  ) ?? [normalized];
  return parts
    .map((part) => {
      if (/^[0-9]+$/.test(part)) return part;
      const lower = part.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

const publicNames = new Map(
  definitions.map((definition) => [
    definition.name,
    publicTypeName(definition.name),
  ]),
);

// Normalizes any IR identifier (UPPER_SNAKE, CamelCase, hyphenated) to
// lowerCamelCase, used for enum member names and union case names.
function jsMemberName(name) {
  if (name === undefined || name === null) return undefined;
  const parts = String(name)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  if (parts.length === 0) return "empty";
  return parts
    .map((part, index) => {
      const lower = part.toLowerCase();
      return index === 0
        ? lower
        : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

// Synthesizes a case name when the IR doesn't provide one (integer-switched
// unions). e.g. value=0 -> "case0", value=-1 -> "caseNegative1".
function caseNameFromValue(value) {
  if (typeof value === "number") {
    return value < 0 ? `caseNegative${Math.abs(value)}` : `case${value}`;
  }
  return `case${String(value).replace(/[^A-Za-z0-9_$]/g, "_")}`;
}

// Whether the union's discriminant is a ref to a defined enum (vs. a plain int).
function isEnumSwitch(definition) {
  const type = definition.discriminant.type;
  return type.kind === "ref" && enumNames.has(type.name);
}

// DX-side case name: enum-switched unions use the enum member's lowerCamelCase
// name; integer-switched unions use the arm's payload name or a synthesized one.
function caseName(definition, arm, xdrCase) {
  if (isEnumSwitch(definition)) return jsMemberName(xdrCase.name);
  return arm.name ?? caseNameFromValue(xdrCase.value);
}

// Schema-side discriminator value. Always the numeric / literal wire value —
// the engine's union codec maps from DX's named case back to this on encode.
function schemaDiscriminator(definition, xdrCase) {
  return xdrCase.value;
}

// Schema-side switch field name (e.g. "type", "v", "code"). Matches whatever
// the schema layer emits so the descriptor's runtime conversion can read it.
function schemaSwitchKey(definition) {
  return (
    definition.discriminant.name ?? (isEnumSwitch(definition) ? "type" : "code")
  );
}

// Identity detection: a definition is "identity" if its DX TS shape is byte-
// identical to its schema TS shape, so to/fromXDRObject can be pass-through.
// Computed as a greatest fixed point: assume identity inside cycles, then
// downgrade if any non-identity evidence appears.
const identityCache = new Map();
const identityInProgress = new Set();

// Recursive identity check on an IR type. Refs into definitions delegate to
// isIdentityDefinition; primitives and bytes/string are always identity since
// their DX surface mirrors the schema surface directly.
function isIdentityType(type) {
  switch (type.kind) {
    case "ref": {
      if (primitiveNames.has(type.name)) return true;
      if (customTypeOverrides.has(type.name)) return false;
      const referencedDefinition = definitionsByName.get(type.name);
      return (
        referencedDefinition !== undefined &&
        isIdentityDefinition(referencedDefinition)
      );
    }
    case "array":
    case "var_array":
    case "optional":
      return isIdentityType(type.element);
    case "int":
    case "unsigned_int":
    case "float":
    case "double":
    case "hyper":
    case "unsigned_hyper":
    case "bool":
    case "opaque_fixed":
    case "opaque_var":
    case "string":
      return true;
    default:
      return false;
  }
}

// Memoized identity check on a definition. The in-progress set lets us
// optimistically assume identity inside cycles, retracted if any path proves
// otherwise.
function isIdentityDefinition(definition) {
  if (identityCache.has(definition.name)) {
    return identityCache.get(definition.name);
  }
  if (identityInProgress.has(definition.name)) return true;
  identityInProgress.add(definition.name);
  const result = computeIdentity(definition);
  identityInProgress.delete(definition.name);
  identityCache.set(definition.name, result);
  return result;
}

// Uncached identity rules. Enums are non-identity (DX strings vs schema ints).
// Wide-int Parts are non-identity (overrides). Unions need their switchKey to
// be "type" AND every case's DX name to equal its schema discriminator.
function computeIdentity(definition) {
  if (customTypeOverrides.has(definition.name)) return false;
  switch (definition.kind) {
    case "const":
      return true;
    case "typedef":
      return isIdentityType(definition.type);
    case "enum":
      return false;
    case "struct":
      return definition.fields.every((field) => isIdentityType(field.type));
    case "union":
      if (schemaSwitchKey(definition) !== "type") return false;
      return definition.arms.every((arm) =>
        arm.cases.every((xdrCase) => {
          if (
            caseName(definition, arm, xdrCase) !==
            schemaDiscriminator(definition, xdrCase)
          ) {
            return false;
          }
          return arm.type === undefined || isIdentityType(arm.type);
        }),
      );
    default:
      return false;
  }
}

function tsString(value) {
  return JSON.stringify(value);
}

function kebabName(name) {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function moduleNameForDefinition(definition) {
  return kebabName(publicNames.get(definition.name));
}

// Scans the already-emitted schema directory to learn which file each schema
// definition lives in. Schema modules can bundle cycles, so the file name
// isn't predictable from the definition name alone.
function buildSchemaModuleNames() {
  const modules = new Map();
  for (const entry of readdirSync(schemaPath)) {
    if (!entry.endsWith(".ts") || entry === "index.ts") continue;
    const source = readFileSync(resolve(schemaPath, entry), "utf8");
    for (const definition of definitions) {
      if (modules.has(definition.name)) continue;
      const schemaExport = schemaTsName(definition.name);
      const escapedName = schemaExport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const exportPattern = new RegExp(
        `export\\s+(?:interface|type|const)\\s+${escapedName}\\b`,
      );
      if (exportPattern.test(source)) {
        modules.set(definition.name, entry.replace(/\.ts$/, ""));
      }
    }
  }
  return modules;
}

const schemaModuleNames = buildSchemaModuleNames();

function schemaModuleNameForDefinition(definition) {
  const moduleName = schemaModuleNames.get(definition.name);
  if (moduleName === undefined) {
    throw new Error(
      `Cannot find generated schema module for ${definition.name}`,
    );
  }
  return moduleName;
}

function schemaImportName(definition) {
  return `${publicNames.get(definition.name)}Schema`;
}

function descriptorFunctionName(definition) {
  return `${publicNames.get(definition.name)}Descriptor`;
}

function helperPayloadParamName(payloadName) {
  return `${payloadName}Value`;
}

const numericLimits = new Map([
  ["int", { min: "-2147483648", max: "2147483647" }],
  ["int32", { min: "-2147483648", max: "2147483647" }],
  ["uint", { min: "0", max: "4294967295" }],
  ["uint32", { min: "0", max: "4294967295" }],
  ["hyper", { min: "-9223372036854775808n", max: "9223372036854775807n" }],
  ["int64", { min: "-9223372036854775808n", max: "9223372036854775807n" }],
  ["uhyper", { min: "0n", max: "18446744073709551615n" }],
  ["uint64", { min: "0n", max: "18446744073709551615n" }],
]);

function literalType(value) {
  return typeof value === "string" ? tsString(value) : String(value);
}

// IR primitive ref name to its DX TS type. Named refs delegate to publicNames
// (which resolves to the DX type alias for that definition).
function typeForRef(name) {
  switch (name) {
    case "int":
    case "int32":
    case "uint":
    case "uint32":
    case "float":
    case "double":
      return "number";
    case "hyper":
    case "int64":
    case "uhyper":
    case "uint64":
      return "bigint";
    case "bool":
      return "boolean";
    case "void":
      return "void";
    default: {
      const override = customTypeOverrides.get(name);
      if (override !== undefined) return override.tsType;
      return publicNames.get(name) ?? publicTypeName(name);
    }
  }
}

// IR type to its DX TS type expression, used inside struct field declarations
// and union arms (e.g. "ReadonlyArray<Operation>", "string | null").
function typeForXdrType(type) {
  switch (type.kind) {
    case "ref":
      return typeForRef(type.name);
    case "int":
    case "unsigned_int":
    case "float":
    case "double":
      return "number";
    case "hyper":
    case "unsigned_hyper":
      return "bigint";
    case "bool":
      return "boolean";
    case "opaque_fixed":
    case "opaque_var":
      return "Uint8Array";
    case "string":
      return "string";
    case "array":
    case "var_array":
      return `ReadonlyArray<${typeForXdrType(type.element)}>`;
    case "optional":
      return `${typeForXdrType(type.element)} | null`;
    default:
      throw new Error(
        `Unsupported XDR type kind for TS emission: ${type.kind}`,
      );
  }
}

// IR type to a runtime descriptor literal (e.g. `{ kind: "array", element: ... }`).
// Refs into custom-overridden definitions inline the override descriptor; refs
// into ordinary definitions emit a `{ kind: "ref", factory: XDescriptor }` link.
function descriptorForType(type) {
  switch (type.kind) {
    case "ref": {
      if (
        ["int", "int32", "uint", "uint32", "float", "double"].includes(
          type.name,
        )
      ) {
        return `{ kind: "number" }`;
      }
      if (["hyper", "int64", "uhyper", "uint64"].includes(type.name)) {
        return `{ kind: "bigint" }`;
      }
      if (type.name === "bool") return `{ kind: "boolean" }`;

      // Refs to overridden types inline the override descriptor so consumers
      // referencing (e.g.) Int128Parts get the bigint codec, not a ref to the
      // struct.
      const override = customTypeOverrides.get(type.name);
      if (override !== undefined) return override.descriptor;

      return `{ kind: "ref", factory: ${publicNames.get(type.name) ?? publicTypeName(type.name)}Descriptor }`;
    }

    case "int":
    case "unsigned_int":
    case "float":
    case "double":
      return `{ kind: "number" }`;
    case "hyper":
    case "unsigned_hyper":
      return `{ kind: "bigint" }`;
    case "bool":
      return `{ kind: "boolean" }`;
    case "opaque_fixed":
    case "opaque_var":
      return `{ kind: "bytes", encoding: "hex" }`;
    case "string":
      return `{ kind: "string" }`;
    case "array":
    case "var_array":
      return `{ kind: "array", element: ${descriptorForType(type.element)} }`;
    case "optional":
      return `{ kind: "option", element: ${descriptorForType(type.element)} }`;
    default:
      throw new Error(
        `Unsupported XDR type kind for descriptor emission: ${type.kind}`,
      );
  }
}

// Emits the `export type X = ...` (or interface) declaration for a definition.
// Enums become string literal unions; structs become readonly interfaces;
// unions become discriminated unions keyed on `type`.
function typeAliasForDefinition(definition, schemaName = "Schema") {
  const publicName = publicNames.get(definition.name);
  switch (definition.kind) {
    case "const":
      return "";
    case "typedef": {
      const override = customTypeOverrides.get(definition.name);
      if (override !== undefined) {
        return `export type ${publicName} = ${override.tsType};`;
      }
      return `export type ${publicName} = ${typeForXdrType(definition.type)};`;
    }
    case "enum":
      return `export type ${publicName} =\n${definition.members
        .map((member) => `  | ${tsString(jsMemberName(member.name))}`)
        .join("\n")};`;
    case "struct": {
      const override = customTypeOverrides.get(definition.name);
      if (override !== undefined) {
        return `export type ${publicName} = ${override.tsType};`;
      }
      return `export interface ${publicName} {
${definition.fields
  .map(
    (field) =>
      `  readonly ${tsString(schemaTsName(field.name))}: ${typeForXdrType(field.type)};`,
  )
  .join("\n")}
}`;
    }
    case "union":
      return `export type ${publicName} =
${definition.arms
  .flatMap((arm) =>
    arm.cases.map((xdrCase) => {
      const properties = [
        `  readonly type: ${literalType(caseName(definition, arm, xdrCase))};`,
      ];
      if (arm.type !== undefined) {
        properties.push(
          `  readonly ${tsString(schemaTsName(arm.name ?? "value"))}: ${typeForXdrType(arm.type)};`,
        );
      }
      return `  | {\n${properties.join("\n")}\n    }`;
    }),
  )
  .join("\n")};`;
    default:
      throw new Error(`Unsupported XDR definition kind: ${definition.kind}`);
  }
}

// Runtime descriptor body for a definition. Each kind produces a different
// shape that _support.ts knows how to bridge: alias for typedefs (with
// optional bytes-encoding override), enum with values map, struct with fields,
// union with switchKey + cases.
function descriptorForDefinition(definition) {
  switch (definition.kind) {
    case "typedef": {
      const customOverride = customTypeOverrides.get(definition.name);
      if (customOverride !== undefined) {
        return `{ kind: "alias", type: ${customOverride.descriptor} }`;
      }
      const override = byteEncodingOverrides.get(definition.name);
      if (
        override !== undefined &&
        (definition.type.kind === "opaque_fixed" ||
          definition.type.kind === "opaque_var")
      ) {
        return `{ kind: "alias", type: { kind: "bytes", encoding: ${tsString(override)} } }`;
      }
      return `{ kind: "alias", type: ${descriptorForType(definition.type)} }`;
    }
    case "enum":
      return `{ kind: "enum", values: { ${definition.members
        .map(
          (member) => `${tsString(jsMemberName(member.name))}: ${member.value}`,
        )
        .join(", ")} } }`;
    case "struct": {
      const override = customTypeOverrides.get(definition.name);
      if (override !== undefined) return override.descriptor;
      return `{ kind: "struct", fields: [${definition.fields
        .map(
          (field) =>
            `{ name: ${tsString(schemaTsName(field.name))}, type: ${descriptorForType(field.type)} }`,
        )
        .join(", ")}] }`;
    }
    case "union":
      return `{ kind: "union", switchKey: ${tsString(schemaTsName(schemaSwitchKey(definition)))}, cases: [${definition.arms
        .flatMap((arm) =>
          arm.cases.map((xdrCase) => {
            const parts = [
              `name: ${tsString(caseName(definition, arm, xdrCase))}`,
              `discriminator: ${literalType(schemaDiscriminator(definition, xdrCase))}`,
            ];
            if (arm.type !== undefined) {
              parts.push(
                `payloadName: ${tsString(schemaTsName(arm.name ?? "value"))}`,
              );
              parts.push(`payloadType: ${descriptorForType(arm.type)}`);
            }
            return `{ ${parts.join(", ")} }`;
          }),
        )
        .join(", ")}] }`;
    default:
      return undefined;
  }
}

// Emits the namespace block paired with the type alias: toXDRObject /
// fromXDRObject (identity casts when shapes match, descriptor-driven
// otherwise), toJSON / fromJSON, toXDR / fromXDR (with hex/base64 wrappers),
// plus extras: enum string consts, union case constructor helpers, primitive
// MIN_VALUE / MAX_VALUE.
function namespaceForDefinition(definition, schemaName = "Schema") {
  if (definition.kind === "const") return "";

  const publicName = publicNames.get(definition.name);
  const schemaType = schemaName;

  const enumFields =
    definition.kind === "enum"
      ? definition.members
          .map((member) => {
            const name = jsMemberName(member.name);
            return `  export const ${name} = ${tsString(name)};`;
          })
          .join("\n\n")
      : "";

  const helpers =
    definition.kind === "union"
      ? definition.arms
          .flatMap((arm) =>
            arm.cases.map((xdrCase) => {
              const name = caseName(definition, arm, xdrCase);
              if (arm.type === undefined) {
                return `  export function ${name}(): ${publicName} {\n    return { type: ${tsString(name)} };\n  }`;
              }
              const payloadName = schemaTsName(arm.name ?? "value");
              const payloadParamName = helperPayloadParamName(payloadName);
              return `  export function ${name}(${payloadParamName}: ${typeForXdrType(arm.type)}): ${publicName} {\n    return { type: ${tsString(name)}, ${tsString(payloadName)}: ${payloadParamName} };\n  }`;
            }),
          )
          .join("\n\n")
      : "";

  const numericFields = (() => {
    const limits = numericLimits.get(definition.name);
    if (limits === undefined) return "";
    return `  export const MIN_VALUE = ${limits.min};\n\n  export const MAX_VALUE = ${limits.max};`;
  })();

  const extraFields = [enumFields, helpers, numericFields]
    .filter((field) => field.length > 0)
    .join("\n\n");

  const xdrObjectMethods = isIdentityDefinition(definition)
    ? `  export function toXDRObject(dxValue: ${publicName}): ${schemaType} {
    return dxValue as unknown as ${schemaType};
  }

  export function fromXDRObject(xdrValue: ${schemaType}): ${publicName} {
    return xdrValue as unknown as ${publicName};
  }`
    : `  export function toXDRObject(dxValue: ${publicName}): ${schemaType} {
    return convertToXDRObject(${descriptorFunctionName(definition)}(), dxValue) as ${schemaType};
  }

  export function fromXDRObject(xdrValue: ${schemaType}): ${publicName} {
    return convertFromXDRObject(${descriptorFunctionName(definition)}(), xdrValue) as ${publicName};
  }`;

  return `export namespace ${publicName} {
${xdrObjectMethods}

  export function toJSON(dxValue: ${publicName}): JsonValue {
    return convertToJSONValue(${descriptorFunctionName(definition)}(), dxValue);
  }

  export function fromJSON(jsonValue: JsonValue): ${publicName} {
    return convertFromJSONValue(${descriptorFunctionName(definition)}(), jsonValue) as ${publicName};
  }

  export function toXDR(dxValue: ${publicName}): Uint8Array;
  export function toXDR(dxValue: ${publicName}, xdrFormat: "raw"): Uint8Array;
  export function toXDR(dxValue: ${publicName}, xdrFormat: "base64" | "hex"): string;
  export function toXDR(dxValue: ${publicName}, xdrFormat?: XdrFormat): Uint8Array | string {
    return encodeXdr(${schemaName}, toXDRObject(dxValue), xdrFormat);
  }

  export function fromXDR(xdrInput: string, xdrFormat?: "base64" | "hex"): ${publicName};
  export function fromXDR(xdrInput: Uint8Array): ${publicName};
  export function fromXDR(xdrInput: Uint8Array, xdrFormat: "raw"): ${publicName};
  export function fromXDR(xdrInput: string | Uint8Array, xdrFormat: XdrFormat = "base64"): ${publicName} {
    return fromXDRObject(decodeXdr(${schemaName}, xdrInput, xdrFormat));
  }

  export function isValid(dxValue: ${publicName}): boolean {
    try {
      return ${schemaName}.validate(toXDRObject(dxValue));
    } catch {
      return false;
    }
  }${extraFields.length > 0 ? `\n\n${extraFields}` : ""}
}`;
}

// Assembles _descriptors.ts: one cached factory function per definition that
// returns its TypeDescriptor on first call. Lazy so cyclic refs work.
function emitDescriptors() {
  const concreteDefinitions = definitions.filter(
    (definition) => definition.kind !== "const",
  );

  const descriptorFunctions = concreteDefinitions
    .map((definition) => {
      const fn = descriptorFunctionName(definition);
      const cache = `_${fn}`;
      return `let ${cache}: TypeDescriptor | undefined;\nexport function ${fn}(): TypeDescriptor {\n  return (${cache} ??= ${descriptorForDefinition(definition)});\n}`;
    })
    .join("\n\n");

  return `// Automatically generated by scripts/generate-new-xdr-dx.mjs from xdr/xdr.json
// DO NOT EDIT.

import type { TypeDescriptor } from "./_support.js";

${descriptorFunctions}
`;
}

// Walks an IR type and adds every named ref it transitively touches to `refs`.
function refsForType(type, refs = new Set()) {
  switch (type.kind) {
    case "ref":
      if (!primitiveNames.has(type.name) && definitionsByName.has(type.name)) {
        refs.add(type.name);
      }
      break;
    case "array":
    case "var_array":
    case "optional":
      refsForType(type.element, refs);
      break;
    default:
      break;
  }
  return refs;
}

// All named refs this definition depends on (used for import generation).
function directRefsForDefinition(definition) {
  const refs = new Set();
  switch (definition.kind) {
    case "typedef":
      refsForType(definition.type, refs);
      break;
    case "struct":
      for (const field of definition.fields) refsForType(field.type, refs);
      break;
    case "union":
      for (const arm of definition.arms) {
        if (arm.type !== undefined) refsForType(arm.type, refs);
      }
      break;
    default:
      break;
  }
  return refs;
}

// Direct refs minus self minus const-only deps — the set we need to import.
function typeImportRefsForDefinition(definition) {
  const refs = directRefsForDefinition(definition);
  refs.delete(definition.name);
  return [...refs].filter((name) => {
    const referencedDefinition = definitionsByName.get(name);
    return (
      referencedDefinition !== undefined &&
      referencedDefinition.kind !== "const"
    );
  });
}

// Source text for one DX module: schema-shape import, type imports for refs,
// _support / _descriptors imports, then the type alias and namespace.
function emitDefinitionModule(definition) {
  const publicName = publicNames.get(definition.name);
  const schemaName = schemaImportName(definition);
  const typeImports = typeImportRefsForDefinition(definition)
    .map((name) => definitionsByName.get(name))
    .sort((left, right) =>
      publicNames.get(left.name).localeCompare(publicNames.get(right.name)),
    )
    .map(
      (referencedDefinition) =>
        `import type { ${publicNames.get(referencedDefinition.name)} } from "./${moduleNameForDefinition(referencedDefinition)}.js";`,
    )
    .join("\n");

  const identity = isIdentityDefinition(definition);
  const supportImports = [
    "decodeXdr",
    "encodeXdr",
    "fromJSONValue as convertFromJSONValue",
    ...(identity ? [] : ["fromXDRObject as convertFromXDRObject"]),
    "toJSONValue as convertToJSONValue",
    ...(identity ? [] : ["toXDRObject as convertToXDRObject"]),
  ];

  return `// Automatically generated by scripts/generate-new-xdr-dx.mjs from xdr/xdr.json
// DO NOT EDIT.

import { ${schemaTsName(definition.name)} as ${schemaName} } from "../schema/${schemaModuleNameForDefinition(definition)}.js";
${typeImports.length > 0 ? `${typeImports}\n` : ""}import type { JsonValue, XdrFormat } from "./_support.js";
import {
  ${supportImports.join(",\n  ")},
} from "./_support.js";
import { ${descriptorFunctionName(definition)} } from "./_descriptors.js";

${typeAliasForDefinition(definition, schemaName)}

${namespaceForDefinition(definition, schemaName)}
`;
}

// Top-level index.ts: re-exports every DX module plus the schema namespace
// and the support layer's error/JSON types.
function emitIndex() {
  const exports = definitions
    .filter((definition) => definition.kind !== "const")
    .map(
      (definition) =>
        `export * from "./${moduleNameForDefinition(definition)}.js";`,
    )
    .join("\n\n");
  return `// Automatically generated by scripts/generate-new-xdr-dx.mjs from xdr/xdr.json
// DO NOT EDIT.

export * as Schema from "../schema/index.js";
export { XdrError } from "./_support.js";
export type { JsonValue } from "./_support.js";

${exports}
`;
}

mkdirSync(outPath, { recursive: true });
for (const entry of readdirSync(outPath)) {
  if (entry.endsWith(".ts") && entry !== "_support.ts") {
    unlinkSync(resolve(outPath, entry));
  }
}
writeFileSync(
  resolve(outPath, "_descriptors.ts"),
  await format(emitDescriptors(), { parser: "typescript" }),
);
for (const definition of definitions) {
  if (definition.kind === "const") continue;
  writeFileSync(
    resolve(outPath, `${moduleNameForDefinition(definition)}.ts`),
    await format(emitDefinitionModule(definition), { parser: "typescript" }),
  );
}
writeFileSync(
  resolve(outPath, "index.ts"),
  await format(emitIndex(), { parser: "typescript" }),
);
console.log(`Generated DX layer in ${outPath} from ${irPath}`);
