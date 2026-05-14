/* eslint-disable jsdoc/require-jsdoc */
// Generates the schema layer (src/base/new-xdr/schema) from xdr/xdr.json.
// Each generated module mirrors an XDR definition as a TS type plus an xdr-ts
// runtime const for wire encode/decode. Cyclic refs are bundled into a single
// module per strongly-connected component to keep imports acyclic.

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import ts from "typescript";

const sdkRoot = process.cwd();
const defaultIrPath = resolve(sdkRoot, "xdr/xdr.json");
const defaultOutPath = resolve(sdkRoot, "./src/base/generated/schema");
const irPath = resolve(process.argv[2] ?? defaultIrPath);
const outPath = resolve(process.argv[3] ?? defaultOutPath);

const xdrSourcePath = resolve(sdkRoot, "src/base/new-xdr/index.js");
const generatedDir = outPath.endsWith(".ts") ? dirname(outPath) : outPath;
const xdrImportRelative = relative(generatedDir, xdrSourcePath).replace(
  /\\/g,
  "/",
);
const xdrImportSpecifier = xdrImportRelative.startsWith(".")
  ? xdrImportRelative
  : `./${xdrImportRelative}`;
const ir = JSON.parse(readFileSync(irPath, "utf8"));
const definitions = (ir.definitions ?? []).filter(
  (definition) => definition.kind !== "const",
);

const f = ts.factory;
const enumNames = new Set(
  definitions
    .filter((definition) => definition.kind === "enum")
    .map((definition) => definition.name),
);
const definedNames = new Set(
  definitions.map((definition) => definition.name).filter(Boolean),
);

// Maps IR primitive ref names to the xdr-ts factory function to call.
const primitiveRefs = new Map([
  ["int", ["int32"]],
  ["int32", ["int32"]],
  ["uint", ["uint32"]],
  ["uint32", ["uint32"]],
  ["hyper", ["int64"]],
  ["int64", ["int64"]],
  ["uhyper", ["uint64"]],
  ["uint64", ["uint64"]],
  ["float", ["float"]],
  ["double", ["double"]],
  ["bool", ["bool"]],
  ["void", ["void"]],
]);

function assertIdentifier(name) {
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) {
    throw new Error(`Cannot emit invalid TypeScript identifier: ${name}`);
  }
  return name;
}

// Normalize a raw IR name to its emitted TS identifier. Currently rewrites
// embedded `ID` runs (e.g. `AccountID`, `ClaimableBalanceIDType`) to `Id` so
// the TS surface matches the DX layer's PascalCase convention. The runtime
// string label passed to `xdr.struct("AccountID", ...)` etc. is left alone.
function tsName(rawName) {
  return rawName.replace(/ID(?=[A-Z][a-z]|[0-9_]|$)/g, "Id");
}

function id(name) {
  return f.createIdentifier(assertIdentifier(name));
}

function str(value) {
  return f.createStringLiteral(String(value));
}

function num(value) {
  if (value < 0) {
    return f.createPrefixUnaryExpression(
      ts.SyntaxKind.MinusToken,
      f.createNumericLiteral(Math.abs(value)),
    );
  }
  return f.createNumericLiteral(value);
}

function lit(value) {
  if (typeof value === "number") return num(value);
  if (typeof value === "boolean")
    return value ? f.createTrue() : f.createFalse();
  return str(value);
}

function xdrMember(name) {
  return f.createPropertyAccessExpression(id("xdr"), name);
}

function xdrCall(name, args = []) {
  return f.createCallExpression(xdrMember(name), undefined, args);
}

function prop(name, initializer) {
  return f.createPropertyAssignment(str(name), initializer);
}

function exportConst(name, initializer, type = undefined) {
  return f.createVariableStatement(
    [f.createModifier(ts.SyntaxKind.ExportKeyword)],
    f.createVariableDeclarationList(
      [f.createVariableDeclaration(id(name), undefined, type, initializer)],
      ts.NodeFlags.Const,
    ),
  );
}

function asConst(expression) {
  return f.createAsExpression(expression, f.createTypeReferenceNode("const"));
}

function xdrTypeNode(
  typeArgument = f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
) {
  return f.createTypeReferenceNode(
    f.createQualifiedName(id("xdr"), id("XdrType")),
    [typeArgument],
  );
}

function typeReference(name) {
  return f.createTypeReferenceNode(id(tsName(name)));
}

function arrayType(element) {
  return f.createArrayTypeNode(element);
}

function literalType(value) {
  return f.createLiteralTypeNode(lit(value));
}

// IR primitive ref name to its TS keyword type (number/bigint/boolean/void),
// or a named TS reference for user-defined types.
function typeNodeForRef(name) {
  switch (name) {
    case "int":
    case "int32":
    case "uint":
    case "uint32":
    case "float":
    case "double":
      return f.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    case "hyper":
    case "int64":
    case "uhyper":
    case "uint64":
      return f.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword);
    case "bool":
      return f.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    case "void":
      return f.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
    default:
      return typeReference(name);
  }
}

// IR type node to a TS value-type AST node (the user-facing TS type, not the
// xdr-ts runtime expression).
function valueTypeNode(type) {
  switch (type.kind) {
    case "ref":
      return typeNodeForRef(type.name);
    case "int":
    case "unsigned_int":
    case "float":
    case "double":
      return f.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    case "hyper":
    case "unsigned_hyper":
      return f.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword);
    case "bool":
      return f.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    case "opaque_fixed":
    case "opaque_var":
      return typeReference("Uint8Array");
    case "string":
      return f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    case "array":
    case "var_array":
      return arrayType(valueTypeNode(type.element));
    case "optional":
      return f.createUnionTypeNode([
        valueTypeNode(type.element),
        f.createLiteralTypeNode(f.createNull()),
      ]);
    default:
      throw new Error(
        `Unsupported XDR type kind for type emission: ${type.kind}`,
      );
  }
}

function readonlyPropertyType(name, type) {
  return f.createPropertySignature(
    [f.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
    str(name),
    undefined,
    type,
  );
}

// TS type node for an enum's value: a union of its members' numeric literals.
function enumValueTypeNode(definition) {
  return f.createUnionTypeNode(
    definition.members.map((member) => literalType(jsMemberName(member.name))),
  );
}

// TS type literal `{ readonly f1: T1; ... }` for a struct definition.
function structValueTypeNode(definition) {
  return f.createTypeLiteralNode(
    definition.fields.map((field) =>
      readonlyPropertyType(tsName(field.name), valueTypeNode(field.type)),
    ),
  );
}

// One arm of a discriminated union as a TS type literal: the discriminator
// property plus the optional payload field.
function unionVariantTypeNode(definition, arm, xdrCase) {
  const switchType = definition.discriminant.type;
  const isEnumSwitch =
    switchType.kind === "ref" && enumNames.has(switchType.name);
  const discriminantProperty = tsName(
    definition.discriminant.name ?? (isEnumSwitch ? "type" : "code"),
  );
  const discriminantValue = xdrCase.value;
  const properties = [
    readonlyPropertyType(discriminantProperty, literalType(discriminantValue)),
  ];
  if (arm.type !== undefined) {
    properties.push(
      readonlyPropertyType(tsName(arm.name ?? "value"), valueTypeNode(arm.type)),
    );
  }
  return f.createTypeLiteralNode(properties);
}

// TS type union of all variants of a discriminated union.
function unionValueTypeNode(definition) {
  return f.createUnionTypeNode(
    definition.arms.flatMap((arm) =>
      arm.cases.map((xdrCase) =>
        unionVariantTypeNode(definition, arm, xdrCase),
      ),
    ),
  );
}

// Dispatches to the right *ValueTypeNode based on the definition's kind.
function schemaValueTypeNode(definition) {
  switch (definition.kind) {
    case "typedef":
      return valueTypeNode(definition.type);
    case "enum":
      return enumValueTypeNode(definition);
    case "struct":
      return structValueTypeNode(definition);
    case "union":
      return unionValueTypeNode(definition);
    default:
      throw new Error(
        `Unsupported XDR schema definition kind: ${definition.kind}`,
      );
  }
}

// Emits `xdr.lazy(() => Name)`, optionally widened with a type-cast. Used for
// forward / cyclic references where the target const isn't yet declared.
function lazyRef(name, typeNode = undefined) {
  if (!definedNames.has(name)) {
    throw new Error(`Unknown XDR ref: ${name}`);
  }
  const expression = xdrCall("lazy", [
    f.createArrowFunction(
      undefined,
      undefined,
      [],
      undefined,
      f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      id(tsName(name)),
    ),
  ]);
  return typeNode ? f.createAsExpression(expression, typeNode) : expression;
}

// Runtime expression for a ref: primitives become direct factory calls
// (e.g. xdr.int32()); user-defined names go through xdr.lazy(() => Name).
function refExpression(name) {
  const primitive = primitiveRefs.get(name);
  if (primitive !== undefined) {
    return xdrCall(primitive[0]);
  }
  return lazyRef(name);
}

// Extracts the bounded length from a var_array / opaque_var / string IR node.
// Different XDR types use different IR field names, so we check all of them.
// Falls back to xdr.UNBOUNDED_MAX_LENGTH when no bound is present.
function maxLengthExpression(type) {
  const maxLength =
    type.max_count ?? type.max_size ?? type.max_length ?? type.maxLength;
  return maxLength === undefined
    ? f.createPropertyAccessExpression(id("xdr"), "UNBOUNDED_MAX_LENGTH")
    : num(maxLength);
}

// Central dispatcher: IR type node to its xdr-ts runtime expression
// (e.g. xdr.struct(...), xdr.array(..., 100), xdr.lazy(() => Foo)).
function typeExpression(type) {
  switch (type.kind) {
    case "ref":
      return refExpression(type.name);
    case "int":
      return xdrCall("int32");
    case "unsigned_int":
      return xdrCall("uint32");
    case "hyper":
      return xdrCall("int64");
    case "unsigned_hyper":
      return xdrCall("uint64");
    case "bool":
      return xdrCall("bool");
    case "float":
      return xdrCall("float");
    case "double":
      return xdrCall("double");
    case "opaque_fixed":
      return xdrCall("opaque", [num(type.size)]);
    case "opaque_var":
      return xdrCall("varOpaque", [maxLengthExpression(type)]);
    case "string":
      return xdrCall("string", [maxLengthExpression(type)]);
    case "array":
      return xdrCall("fixedArray", [
        typeExpression(type.element),
        num(type.count),
      ]);
    case "var_array":
      return xdrCall("array", [
        typeExpression(type.element),
        maxLengthExpression(type),
      ]);
    case "optional":
      return xdrCall("option", [typeExpression(type.element)]);
    default:
      throw new Error(`Unsupported XDR type kind: ${type.kind}`);
  }
}

// Thin wrapper kept as a clear extension point for future switch-typing rules.
function switchTypeExpression(type) {
  return typeExpression(type);
}

// Normalizes any IR identifier (UPPER_SNAKE, CamelCase, hyphenated) to
// lowerCamelCase, the convention used for case names in the schema layer.
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

function emitConst(definition) {
  return exportConst(tsName(definition.name), lit(definition.value));
}

// `export type X = xdr.Infer<typeof X>;` — used for enums where the runtime
// const carries the canonical TS type.
function emitInferTypeAlias(definition) {
  const name = tsName(definition.name);
  return f.createTypeAliasDeclaration(
    [f.createModifier(ts.SyntaxKind.ExportKeyword)],
    id(name),
    undefined,
    f.createTypeReferenceNode(f.createQualifiedName(id("xdr"), id("Infer")), [
      f.createTypeQueryNode(id(name)),
    ]),
  );
}

// `export type X = <type literal>;` — explicit TS shape for typedefs / unions.
function emitStructuralTypeAlias(definition) {
  return f.createTypeAliasDeclaration(
    [f.createModifier(ts.SyntaxKind.ExportKeyword)],
    id(tsName(definition.name)),
    undefined,
    schemaValueTypeNode(definition),
  );
}

// `export interface X { ... }` declaration for a struct definition.
function emitStructInterface(definition) {
  return f.createInterfaceDeclaration(
    [f.createModifier(ts.SyntaxKind.ExportKeyword)],
    id(tsName(definition.name)),
    undefined,
    undefined,
    definition.fields.map((field) =>
      readonlyPropertyType(tsName(field.name), valueTypeNode(field.type)),
    ),
  );
}

// Runtime const for a typedef: `export const X = <typeExpression> as XdrType<X>;`
function emitTypedef(definition, type) {
  const initializer = typeExpression(definition.type);
  return exportConst(
    tsName(definition.name),
    type === undefined ? initializer : f.createAsExpression(initializer, type),
  );
}

// Runtime const for an enum: `export const X = xdr.enumType("X", { name: value, ... } as const);`
function emitEnum(definition) {
  return exportConst(
    tsName(definition.name),
    xdrCall("enumType", [
      str(definition.name),
      asConst(
        f.createObjectLiteralExpression(
          definition.members.map((member) =>
            prop(jsMemberName(member.name), lit(member.value)),
          ),
          true,
        ),
      ),
    ]),
  );
}

// Runtime const for a struct: `export const X = xdr.struct("X", { f: <type>, ... });`
function emitStruct(definition, type) {
  const initializer = xdrCall("struct", [
    str(definition.name),
    f.createObjectLiteralExpression(
      definition.fields.map((field) =>
        prop(tsName(field.name), typeExpression(field.type)),
      ),
      true,
    ),
  ]);
  return exportConst(
    tsName(definition.name),
    type === undefined ? initializer : f.createAsExpression(initializer, type),
  );
}

// One `xdr.case(name, discriminant, arm)` entry inside a union's `cases` array.
function emitUnionCase(definition, arm, xdrCase) {
  const switchType = definition.discriminant.type;
  const isEnumSwitch =
    switchType.kind === "ref" && enumNames.has(switchType.name);
  const caseName = isEnumSwitch
    ? jsMemberName(xdrCase.name)
    : (arm.name ?? caseNameFromValue(xdrCase.value));
  const discriminant = xdrCase.value;
  const armExpression =
    arm.type === undefined
      ? xdrCall("void")
      : xdrCall("field", [
          str(tsName(arm.name ?? "value")),
          typeExpression(arm.type),
        ]);

  return xdrCall("case", [str(caseName), lit(discriminant), armExpression]);
}

// Runtime const for a union: `xdr.union("X", { switchOn, switchKey, cases })`.
function emitUnion(definition, type) {
  const cases = definition.arms.flatMap((arm) =>
    arm.cases.map((xdrCase) => emitUnionCase(definition, arm, xdrCase)),
  );
  const initializer = xdrCall("union", [
    str(definition.name),
    f.createObjectLiteralExpression(
      [
        f.createPropertyAssignment(
          id("switchOn"),
          switchTypeExpression(definition.discriminant.type),
        ),
        f.createPropertyAssignment(
          id("switchKey"),
          str(tsName(definition.discriminant.name ?? "code")),
        ),
        f.createPropertyAssignment(
          id("cases"),
          asConst(f.createArrayLiteralExpression(cases, true)),
        ),
      ],
      true,
    ),
  ]);
  return exportConst(
    tsName(definition.name),
    type === undefined ? initializer : f.createAsExpression(initializer, type),
  );
}

// Top-level dispatcher: returns the array of statements for a definition (the
// TS type alias / interface plus the runtime schema const).
function emitDefinition(definition) {
  switch (definition.kind) {
    case "const":
      return [emitConst(definition)];
    case "typedef":
    case "union":
      return [
        emitStructuralTypeAlias(definition),
        emitSchemaDefinition(
          definition,
          xdrTypeNode(typeReference(definition.name)),
        ),
      ];
    case "struct":
      return [
        emitStructInterface(definition),
        emitSchemaDefinition(
          definition,
          xdrTypeNode(typeReference(definition.name)),
        ),
      ];
    case "enum":
      return [emitSchemaDefinition(definition), emitInferTypeAlias(definition)];
    default:
      throw new Error(`Unsupported XDR definition kind: ${definition.kind}`);
  }
}

// Emits just the runtime const declaration (no surrounding TS aliases).
function emitSchemaDefinition(definition, type = undefined) {
  switch (definition.kind) {
    case "typedef":
      return emitTypedef(definition, type);
    case "enum":
      return emitEnum(definition);
    case "struct":
      return emitStruct(definition, type);
    case "union":
      return emitUnion(definition, type);
    default:
      throw new Error(
        `Unsupported XDR schema definition kind: ${definition.kind}`,
      );
  }
}

// Walks an IR type and adds every named ref it transitively touches to `refs`.
function collectTypeRefs(type, refs) {
  if (type === undefined) return;
  switch (type.kind) {
    case "ref":
      if (!primitiveRefs.has(type.name)) refs.add(type.name);
      return;
    case "array":
    case "var_array":
    case "optional":
      collectTypeRefs(type.element, refs);
      return;
    default:
      return;
  }
}

// All other definition names this definition references (excluding self by
// default — pass includeSelf to keep self-loops for cycle detection).
function definitionRefs(definition, options = {}) {
  const refs = new Set();
  switch (definition.kind) {
    case "typedef":
      collectTypeRefs(definition.type, refs);
      break;
    case "struct":
      for (const field of definition.fields) collectTypeRefs(field.type, refs);
      break;
    case "union":
      collectTypeRefs(definition.discriminant.type, refs);
      for (const arm of definition.arms) collectTypeRefs(arm.type, refs);
      break;
  }
  if (!options.includeSelf) refs.delete(definition.name);
  return refs;
}

// Tarjan's SCC algorithm — partitions a directed graph into strongly-connected
// components in reverse topological order. Used to bundle cyclic definitions
// into a single module so imports stay acyclic.
function stronglyConnectedComponents(graph) {
  const components = [];
  const stack = [];
  const onStack = new Set();
  const indexes = new Map();
  const lowlinks = new Map();
  let nextIndex = 0;

  function visit(node) {
    indexes.set(node, nextIndex);
    lowlinks.set(node, nextIndex);
    nextIndex += 1;
    stack.push(node);
    onStack.add(node);

    for (const dependency of graph.get(node) ?? []) {
      if (!graph.has(dependency)) continue;
      if (!indexes.has(dependency)) {
        visit(dependency);
        lowlinks.set(
          node,
          Math.min(lowlinks.get(node), lowlinks.get(dependency)),
        );
      } else if (onStack.has(dependency)) {
        lowlinks.set(
          node,
          Math.min(lowlinks.get(node), indexes.get(dependency)),
        );
      }
    }

    if (lowlinks.get(node) !== indexes.get(node)) return;

    const component = [];
    let member;
    do {
      member = stack.pop();
      onStack.delete(member);
      component.push(member);
    } while (member !== node);
    components.push(component);
  }

  for (const node of graph.keys()) {
    if (!indexes.has(node)) visit(node);
  }
  return components;
}

// Maps an IR file_index to a kebab-case module name (used for cycle modules
// that span a single .x file).
function moduleNameForFile(fileIndex) {
  const file = ir.files?.[fileIndex]?.name;
  if (file === undefined) return "unknown";
  return basename(file, ".x")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function kebabName(name) {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

// Partitions all definitions into modules: one per SCC. Single-definition SCCs
// get their own module named after the definition; multi-definition SCCs get a
// "<file>-cycle" or "cycle-NNN" name. Returns the modules, the per-definition
// module lookup, and the set of names that participate in any cycle.
function buildModules() {
  const namedDefinitions = new Map(
    definitions
      .filter((definition) => definition.name !== undefined)
      .map((definition) => [definition.name, definition]),
  );
  const graph = new Map();
  for (const definition of namedDefinitions.values()) {
    graph.set(
      definition.name,
      definitionRefs(definition, { includeSelf: true }),
    );
  }

  const definitionToModule = new Map();
  const modules = new Map();
  const recursiveNames = new Set();
  const usedModuleNames = new Set();
  let cycleIndex = 0;

  function uniqueModuleName(baseName) {
    let name = baseName || "xdr-definition";
    let suffix = 2;
    while (usedModuleNames.has(name)) {
      name = `${baseName}-${suffix++}`;
    }
    usedModuleNames.add(name);
    return name;
  }

  for (const component of stronglyConnectedComponents(graph)) {
    const componentDefinitions = component.map((name) =>
      namedDefinitions.get(name),
    );
    const fileIndexes = new Set(
      componentDefinitions.map((definition) => definition.file_index),
    );
    const isSelfRecursive =
      component.length === 1 && graph.get(component[0])?.has(component[0]);
    if (component.length > 1 || isSelfRecursive) {
      for (const name of component) recursiveNames.add(name);
    }
    const moduleName =
      component.length > 1
        ? uniqueModuleName(
            fileIndexes.size === 1
              ? `${moduleNameForFile(componentDefinitions[0].file_index)}-cycle`
              : `cycle-${String(cycleIndex++).padStart(3, "0")}`,
          )
        : uniqueModuleName(kebabName(componentDefinitions[0].name));
    for (const definition of componentDefinitions) {
      definitionToModule.set(definition.name, moduleName);
    }
    modules.set(moduleName, componentDefinitions);
  }

  return { modules, definitionToModule, recursiveNames };
}

function createImport(moduleSpecifier, namedImports) {
  return f.createImportDeclaration(
    undefined,
    f.createImportClause(
      false,
      undefined,
      f.createNamedImports(
        namedImports.map((name) =>
          f.createImportSpecifier(false, undefined, id(tsName(name))),
        ),
      ),
    ),
    str(moduleSpecifier),
  );
}

function createXdrImport(moduleSpecifier) {
  return f.createImportDeclaration(
    undefined,
    f.createImportClause(false, undefined, f.createNamespaceImport(id("xdr"))),
    str(moduleSpecifier),
  );
}

function printSourceFile(statements) {
  const sourceFile = f.createSourceFile(
    statements,
    f.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
  });
  return printer.printFile(sourceFile);
}

// Assembles the source text for one module: the xdr-ts namespace import,
// cross-module imports for any external refs, and each definition's emitted
// statements.
function emitModule(
  moduleName,
  moduleDefinitions,
  definitionToModule,
  recursiveNames,
) {
  const importedNames = new Set();
  for (const definition of moduleDefinitions) {
    for (const ref of definitionRefs(definition)) {
      if (definitionToModule.get(ref) !== moduleName) importedNames.add(ref);
    }
  }

  const importsByModule = new Map();
  for (const name of importedNames) {
    const dependencyModule = definitionToModule.get(name);
    if (dependencyModule === undefined) continue;
    if (!importsByModule.has(dependencyModule)) {
      importsByModule.set(dependencyModule, []);
    }
    importsByModule.get(dependencyModule).push(name);
  }

  const dependencyImports = [...importsByModule.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([dependencyModule, names]) =>
      createImport(`./${dependencyModule}.js`, names.sort()),
    );

  return `// Automatically generated from ${irPath}
// DO NOT EDIT.

${printSourceFile([
  createXdrImport(xdrImportSpecifier),
  ...dependencyImports,
  ...moduleDefinitions.flatMap((definition) =>
    emitDefinition(definition, recursiveNames),
  ),
])}`;
}

function createExportAll(moduleSpecifier) {
  return f.createExportDeclaration(
    undefined,
    false,
    undefined,
    str(moduleSpecifier),
  );
}

// Default mode: writes one TS file per SCC plus an index.ts that re-exports
// every module. Wipes the output dir first.
function emitSplitOutput(outDir) {
  const { modules, definitionToModule, recursiveNames } = buildModules();
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const moduleNames = [...modules.keys()].sort();
  for (const moduleName of moduleNames) {
    writeFileSync(
      join(outDir, `${moduleName}.ts`),
      emitModule(
        moduleName,
        modules.get(moduleName),
        definitionToModule,
        recursiveNames,
      ),
    );
  }
  writeFileSync(
    join(outDir, "index.ts"),
    `// Automatically generated from ${irPath}
// DO NOT EDIT.

${printSourceFile(moduleNames.map((moduleName) => createExportAll(`./${moduleName}.js`)))}`,
  );
  return moduleNames.length;
}

// Alternative mode: emits every definition into a single .ts file. Triggered
// when the output path ends in .ts.
function emitSingleOutput(filePath) {
  const sourceFile = f.createSourceFile(
    [
      f.createImportDeclaration(
        undefined,
        f.createImportClause(
          false,
          undefined,
          f.createNamespaceImport(id("xdr")),
        ),
        str(xdrImportSpecifier),
      ),
      ...definitions.flatMap((definition) => emitDefinition(definition)),
    ],
    f.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
  });

  const output = `// Automatically generated from ${irPath}
// DO NOT EDIT.

${printer.printFile(sourceFile)}`;

  writeFileSync(filePath, output);
}

if (outPath.endsWith(".ts")) {
  emitSingleOutput(outPath);
  console.log(`Generated ${outPath} from ${irPath}`);
} else {
  const count = emitSplitOutput(outPath);
  console.log(`Generated ${count} modules in ${outPath} from ${irPath}`);
}
