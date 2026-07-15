#!/usr/bin/env node
// Class-XDR code generator. Reads xdr/xdr.json (the canonical schema graph
// produced upstream by xdrgen) and emits TypeScript class files matching the
// hand-tuned slice in src/base/xdr/classes/.
//
// Usage:
//   node tools/xdrgen/generate.mjs --out=out/xdrgen [TypeName ...]
//   node tools/xdrgen/generate.mjs --out=out/xdrgen --all
//
// If type names are passed, only those (and their dependencies that are
// also classes) are emitted. With --all, every named definition is emitted.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(__filename), "../..");

// -----------------------------------------------------------------------------
// 1. Load schema
// -----------------------------------------------------------------------------

const xdr = JSON.parse(
  readFileSync(resolve(REPO_ROOT, "xdr/xdr.json"), "utf8"),
);

// Normalize every type name in the schema to xdrgen-style PascalCase
// (`AccountID` → `AccountId`, `SCVal` → `ScVal`, `UInt128Parts` → `Uint128Parts`,
// `HashIDPreimage` → `HashIdPreimage`, etc.). This runs *before* any other
// processing so the rest of the generator can treat the schema as already
// using consumer-facing names — no aliases or post-pass renames needed.
//
// `normalizeTypeName` is defined below in the naming-helpers section but is
// hoisted so this top-level call can use it.
walkAndNormalizeTypeNames(xdr.definitions);

/** @type {Map<string, any>} */
const registry = new Map();
for (const def of xdr.definitions) registry.set(def.name, def);

// Primitive kinds: typedef chains that bottom out in these don't get their own
// class — they're consumed as raw JS values (number, bigint, boolean, …).
const PRIMITIVE_KINDS = new Set([
  "int",
  "unsigned_int",
  "hyper",
  "unsigned_hyper",
  "bool",
]);

// -----------------------------------------------------------------------------
// 2. Naming helpers
// -----------------------------------------------------------------------------

/** Split a member name into capitalized word segments. Splits on underscores
 *  AND camelCase/acronym boundaries, so SCREAMING_SNAKE (`ASSET_TYPE_NATIVE`),
 *  leading-lowercase (`txTOO_EARLY`), and PascalCase (`WasmInsnExec`, `IPv4`)
 *  names all decompose into the same words — PascalCase no longer collapses to
 *  `wasminsnexec` / `ipv4`.
 */
function nameSegments(name) {
  const up = (c) => c >= "A" && c <= "Z";
  const lo = (c) => c >= "a" && c <= "z";
  const dg = (c) => c >= "0" && c <= "9";
  const m = name.match(/^([a-z]+)(.*)$/);
  const prefix = m && m[2].length > 0 ? m[1] : "";
  const rest = (prefix ? m[2] : name).replace(/^_/, "");
  const words = [];
  for (const part of rest.split("_")) {
    let word = "";
    for (let i = 0; i < part.length; i += 1) {
      const ch = part[i];
      const prev = part[i - 1] ?? "";
      const next = part[i + 1] ?? "";
      const camel = up(ch) && (lo(prev) || dg(prev)); // `wasmI`, `g1G`
      const acronym = up(ch) && up(prev) && lo(next); // `IPv` → `I|Pv`
      if (word && (camel || acronym)) {
        words.push(word);
        word = "";
      }
      word += ch;
    }
    if (word) words.push(word);
  }
  const all = (prefix ? [prefix, ...words] : words).filter((p) => p.length > 0);
  return all.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
}

/** ASSET_TYPE_NATIVE → assetTypeNative, txTOO_EARLY → txTooEarly */
function camelize(name) {
  const parts = nameSegments(name);
  if (parts.length === 0) return "";
  return parts[0].toLowerCase() + parts.slice(1).join("");
}

/** ASSET_TYPE_NATIVE → AssetTypeNative, ED25519 → Ed25519 */
function pascalize(name) {
  return nameSegments(name).join("");
}

/** Apply xdrgen-style name normalization to struct/union field names:
 *  - snake_case → camelCase (`hi_hi` → `hiHi`)
 *  - all-caps runs collapse to first-cap (`networkID` → `networkId`,
 *    `sponsoredID` → `sponsoredId`)
 */
function normalizeFieldName(name) {
  let n = name;
  if (n.includes("_")) {
    const parts = n.split("_").filter((p) => p.length > 0);
    n =
      parts[0].toLowerCase() +
      parts
        .slice(1)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join("");
  }
  // Collapse consecutive caps: lowercase any cap preceded by another cap and
  // not followed by a lowercase letter. Keeps the start of `Address` etc.
  n = n.replace(/(?<=[A-Z])[A-Z](?![a-z])/g, (m) => m.toLowerCase());
  return n;
}

/** Normalize an XDR PascalCase type name to a single-initial-cap convention,
 *  matching what xdrgen produces for the legacy `xdr` namespace:
 *
 *    AccountID            → AccountId
 *    SCVal                → ScVal
 *    HashIDPreimage       → HashIdPreimage
 *    SCSpecUDTUnionCaseV0 → ScSpecUdtUnionCaseV0
 *    UInt128Parts         → Uint128Parts
 *    ContractIDPreimage   → ContractIdPreimage
 *
 *  Algorithm: find every run of 2+ consecutive uppercase ASCII letters.
 *  - A 2-letter run followed by a lowercase letter collapses fully (`UI` → `Ui`).
 *  - A 3+-letter run followed by a lowercase letter preserves the final
 *    letter (it starts a new word): `SCV` followed by `a` → `ScV`.
 *  - A run with no following lowercase (end of string or digit) collapses
 *    fully (`ID` at end → `Id`, `V0` is just a single cap then digit so no
 *    run, unaffected).
 */
function normalizeTypeName(name) {
  return name.replace(/[A-Z]{2,}/g, (run, offset) => {
    const after = name[offset + run.length];
    const followedByLower = after && /[a-z]/.test(after);
    if (run.length === 2 || !followedByLower) {
      return run[0] + run.slice(1).toLowerCase();
    }
    return run[0] + run.slice(1, -1).toLowerCase() + run[run.length - 1];
  });
}

/** Recursively rewrite every `name` and `ref.name` in the schema to the
 *  normalized form. Touches: top-level `def.name`, `def.type.name` for ref
 *  typedefs, and the `name` field of every `kind: "ref"` node anywhere in
 *  the tree (e.g. inside struct fields, union arms, var_array element refs,
 *  optional inner refs, …).
 *
 *  Leaves enum member names, struct field names, and union arm names alone —
 *  those are normalized by `normalizeFieldName` / `camelize` during emission.
 */
function walkAndNormalizeTypeNames(definitions) {
  const visit = (node) => {
    if (node == null || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const child of node) visit(child);
      return;
    }
    if (node.kind === "ref" && typeof node.name === "string") {
      node.name = normalizeTypeName(node.name);
    }
    for (const key of Object.keys(node)) {
      if (key === "name" || key === "kind" || key === "value") continue;
      visit(node[key]);
    }
  };
  for (const def of definitions) {
    // Constant names (MAX_OPS_PER_TX, …) are canonical SCREAMING_SNAKE
    // identifiers from the .x sources, not type names — leave them alone.
    if (def.kind === "const") continue;
    if (typeof def.name === "string") {
      def.name = normalizeTypeName(def.name);
    }
    visit(def);
  }
}

// Render an XDR definition's `source` field (the original .x text from
// xdr/xdr.json) as a TSDoc block. Returns an empty string when the
// definition has no source. Each source line is prefixed with ` * `; a
// closing comment terminator and a trailing newline are appended so the
// result can be pasted directly above a class declaration.
function sourceDoc(def) {
  if (typeof def?.source !== "string" || def.source.length === 0) return "";
  // Avoid the */ sequence inside the source closing the comment prematurely.
  const safe = def.source.replaceAll("*/", "*\\/");
  const body = safe
    .split("\n")
    .map((line) => (line.length > 0 ? ` * ${line}` : " *"))
    .join("\n");
  return `/**\n * \`\`\`xdr\n${body}\n * \`\`\`\n */\n`;
}

/** AssetCode4 → asset-code4, AlphaNum12 → alpha-num12, Int128Parts → int128-parts, SCVal → sc-val */
function kebabFile(name) {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2") // SCVal → SC-Val, SCAddressType → SC-AddressType
    .replace(/([a-z])([A-Z])/g, "$1-$2") // CamelCase → Camel-Case
    .replace(/([0-9])([A-Z])/g, "$1-$2") // Int128Parts → Int128-Parts
    .toLowerCase();
}

// -----------------------------------------------------------------------------
// 3. Type classification — does a referenced type have its own emitted class?
// -----------------------------------------------------------------------------

/** True iff this typedef is a plain alias to another named type (re-export). */
function isReExport(def) {
  return def.kind === "typedef" && def.type.kind === "ref";
}

/** True iff this re-export typedef ultimately chases to a wrapped opaque
 *  (`typedef opaque X[N]` or `typedef opaque X<N>` with uppercase name).
 *  Such aliases emit their *own* BytesValue subclass with a distinct named
 *  schema — same byte semantics as the chased target, but a name the JSON
 *  walker can dispatch overrides on (PoolId → L-strkey, ContractId →
 *  C-strkey, etc.). Refs to these resolve to the alias name itself, not
 *  the chased target. */
function isReExportToOpaque(def) {
  if (!isReExport(def)) return false;
  let current = def.type.name;
  while (true) {
    const d = registry.get(current);
    if (!d || d.kind !== "typedef") return false;
    if (d.type.kind !== "ref") {
      return d.type.kind === "opaque_fixed" || d.type.kind === "opaque_var";
    }
    current = d.type.name;
  }
}

/** True iff this typedef name should be inlined (no class) at use sites.
 *
 *  - Primitive typedefs (uint32, int64, …) — always inline as `number`/`bigint`.
 *  - Lowercase opaque typedefs (uint256, …) — inline as `Uint8Array`.
 *  - var_array typedefs (SCVec, SCMap, …) — inline as `T[]`. Named alias is
 *    not preserved at use sites; that's a Phase-4 DX concern.
 *  - string typedefs (SCSymbol, SCString) — inline as `string`.
 *  - optional typedefs — inline as `T | null`.
 *  - Uppercase opaque (Hash, AssetCode4, …) — emit as BytesValue class.
 *  - Re-exports (AccountID, ContractID, …) — separate re-export file. */
function isInlineTypedef(def) {
  if (def.kind !== "typedef") return false;
  const k = def.type.kind;
  if (PRIMITIVE_KINDS.has(k)) return true;
  if (
    k === "var_array" ||
    k === "array" ||
    k === "string" ||
    k === "optional"
  ) {
    return true;
  }
  if (isReExport(def)) {
    // Re-export of an inline target (e.g. Duration → uint64) is itself inline —
    // no class file exists for the target to point at.
    const target = registry.get(def.type.name);
    if (target && target.kind === "typedef" && isInlineTypedef(target)) {
      return true;
    }
    return false;
  }
  // opaque_fixed / opaque_var
  const startsLower =
    def.name.length > 0 && def.name[0] === def.name[0].toLowerCase();
  return startsLower;
}

/** True iff this named type produces its own emitted class file. */
function emitsClass(name) {
  const def = registry.get(name);
  if (!def) return false;
  if (def.kind === "struct" || def.kind === "union" || def.kind === "enum") {
    return true;
  }
  if (def.kind === "typedef") {
    if (isInlineTypedef(def)) return false; // primitive, inline kind, or re-export-to-inline
    if (isReExport(def)) return true; // re-export to a real class
    return true; // PascalCased opaque/string/array typedef gets a class
  }
  return false;
}

// -----------------------------------------------------------------------------
// 4. Schema-expression emitter — for any type node, emit the runtime schema
//    builder expression (e.g. `int32()`, `AssetCode4.schema`, `opaque(4)`).
// -----------------------------------------------------------------------------

/**
 * @param {any} t  — a type node from xdr.json (with .kind, plus shape per kind)
 * @param {EmitContext} ctx
 * @returns {string} — the TS expression
 */
function schemaExpr(t, ctx) {
  switch (t.kind) {
    case "int":
      ctx.builders.add("int32");
      return "int32()";
    case "unsigned_int":
      ctx.builders.add("uint32");
      return "uint32()";
    case "hyper":
      ctx.builders.add("int64");
      return "int64()";
    case "unsigned_hyper":
      ctx.builders.add("uint64");
      return "uint64()";
    case "bool":
      ctx.builders.add("bool");
      return "bool()";
    case "string":
      ctx.valueImports.add("xdrString");
      if (t.max_size != null) return `xdrString(${t.max_size})`;
      ctx.coreImports.add("UNBOUNDED_MAX_LENGTH");
      return `xdrString(UNBOUNDED_MAX_LENGTH)`;
    case "opaque_fixed":
      ctx.builders.add("opaque");
      return `opaque(${t.size})`;
    case "opaque_var":
      ctx.builders.add("varOpaque");
      if (t.max_size != null) return `varOpaque(${t.max_size})`;
      ctx.coreImports.add("UNBOUNDED_MAX_LENGTH");
      return `varOpaque(UNBOUNDED_MAX_LENGTH)`;
    case "var_array": {
      ctx.builders.add("array");
      const inner = schemaExpr(t.element, ctx);
      if (t.max_count != null) return `array(${inner}, ${t.max_count})`;
      ctx.coreImports.add("UNBOUNDED_MAX_LENGTH");
      return `array(${inner}, UNBOUNDED_MAX_LENGTH)`;
    }
    case "array":
      ctx.builders.add("fixedArray");
      return `fixedArray(${schemaExpr(t.element, ctx)}, ${t.size ?? t.count})`;
    case "optional":
      ctx.builders.add("option");
      return `option(${schemaExpr(t.element, ctx)})`;
    case "ref":
      return refSchemaExpr(t.name, ctx);
    default:
      throw new Error(`schemaExpr: unhandled kind ${t.kind}`);
  }
}

/** Schema expression for a named ref — either `<Class>.schema` or an inlined builder. */
function refSchemaExpr(name, ctx) {
  const def = registry.get(name);
  if (!def) throw new Error(`Unknown ref: ${name}`);
  // Inline typedef (primitive or lowercase opaque/string/array) → inline schema
  if (def.kind === "typedef" && isInlineTypedef(def)) {
    return schemaExpr(def.type, ctx);
  }
  // Re-export typedef → chase to the underlying named class. Exception:
  // re-exports-to-opaque (PoolId, ContractId, …) emit their own class with
  // a distinct named schema, so we want a ref to *them*, not the chased
  // target — that's how `schema.name` ends up "PoolId" not "Hash", which
  // is what the JSON walker's override lookup needs.
  if (def.kind === "typedef" && isReExport(def) && !isReExportToOpaque(def)) {
    return refSchemaExpr(def.type.name, ctx);
  }
  // Has its own class. If referencing it would close a schema cycle, wrap in lazy.
  const cls = resolveClassName(name);
  ctx.classImports.add(cls);
  if (ctx.currentType && needsLazy(ctx.currentType, cls)) {
    ctx.builders.add("lazy");
    return `lazy(() => ${cls}.schema)`;
  }
  return `${cls}.schema`;
}

// -----------------------------------------------------------------------------
// 5. Field-type → TS type expression (the runtime instance shape)
// -----------------------------------------------------------------------------

/**
 * The TS type a consumer holds — e.g., `AlphaNum4`, `Uint8Array`, `number`,
 * `bigint`, `XdrString`, `Int128Parts[]`, `PublicKey | null`. Note: XDR
 * `string<N>` surfaces as `XdrString` (a wrapper class — see
 * `src/xdr/values/xdr-string.ts`), while `opaque` surfaces as `Uint8Array`.
 */
function tsTypeExpr(t, ctx) {
  switch (t.kind) {
    case "int":
    case "unsigned_int":
      return "number";
    case "hyper":
    case "unsigned_hyper":
      return "bigint";
    case "bool":
      return "boolean";
    case "string":
      ctx.valueImports.add("XdrString");
      return "XdrString";
    case "opaque_fixed":
    case "opaque_var":
      return "Uint8Array";
    case "var_array":
    case "array": {
      const inner = tsTypeExpr(t.element, ctx);
      // Wrap unions in parens so `T | null` becomes `(T | null)[]`, not `T | null[]`.
      return inner.includes("|") ? `(${inner})[]` : `${inner}[]`;
    }
    case "optional":
      return `${tsTypeExpr(t.element, ctx)} | null`;
    case "ref":
      return refTsType(t.name, ctx);
    default:
      throw new Error(`tsTypeExpr: unhandled kind ${t.kind}`);
  }
}

function refTsType(name, ctx) {
  const def = registry.get(name);
  if (!def) throw new Error(`Unknown ref: ${name}`);
  if (def.kind === "typedef" && isInlineTypedef(def)) {
    return tsTypeExpr(def.type, ctx);
  }
  // Stop chasing for re-exports-to-opaque — they're their own class now.
  if (def.kind === "typedef" && isReExport(def) && !isReExportToOpaque(def)) {
    return refTsType(def.type.name, ctx);
  }
  ctx.classImports.add(name);
  return name;
}

// -----------------------------------------------------------------------------
// 6. Emit context — tracks imports and pending dependencies
// -----------------------------------------------------------------------------

/**
 * @typedef {{
 *   builders: Set<string>;     // schema builder fns used (int32, struct, …)
 *   classImports: Set<string>; // named types imported from sibling files
 *   coreImports: Set<string>;  // names from @stellar/js-xdr (Infer, etc.)
 *   valueImports: Set<string>; // names from values/xdr-value.js
 *   needsXdrError: boolean;
 * }} EmitContext
 */
function newCtx() {
  return {
    builders: new Set(),
    classImports: new Set(),
    /** Wire-type imports — class names whose `<Name>Wire` type we reference. */
    wireImports: new Set(),
    coreImports: new Set(),
    valueImports: new Set(),
    /** @type {Map<string, Set<string>>} */
    externalImports: new Map(),
    needsXdrError: false,
    /** Name of the type whose body we're currently emitting (for cycle-aware refs). */
    currentType: null,
  };
}

function addExternal(ctx, pkg, name) {
  if (!ctx.externalImports.has(pkg)) ctx.externalImports.set(pkg, new Set());
  ctx.externalImports.get(pkg).add(name);
}

const BUILDER_TO_PATH = {
  int32: "@stellar/js-xdr",
  uint32: "@stellar/js-xdr",
  int64: "@stellar/js-xdr",
  uint64: "@stellar/js-xdr",
  bool: "@stellar/js-xdr",
  string_: "@stellar/js-xdr",
  opaque: "@stellar/js-xdr",
  varOpaque: "@stellar/js-xdr",
  array: "@stellar/js-xdr",
  fixedArray: "@stellar/js-xdr",
  option: "@stellar/js-xdr",
  struct: "@stellar/js-xdr",
  union: "@stellar/js-xdr",
  case_: "@stellar/js-xdr",
  field: "@stellar/js-xdr",
  voidType: "@stellar/js-xdr",
  enumType: "@stellar/js-xdr",
  lazy: "@stellar/js-xdr",
};

const BUILDER_IMPORT_NAME = {
  string_: "string as string_",
  voidType: "void as voidType",
  case_: "case as case_",
};

/** Render an import line, preferring `import type {…}` when all names are type-only. */
function renderImport(path, names) {
  const arr = [...names];
  const allType = arr.length > 0 && arr.every((n) => n.startsWith("type "));
  if (allType) {
    const stripped = arr.map((n) => n.slice(5)).sort();
    return `import type { ${stripped.join(", ")} } from "${path}";`;
  }
  return `import { ${arr.sort().join(", ")} } from "${path}";`;
}

function renderImports(ctx, opts = {}) {
  const lines = [];
  // External package imports first (uint8array-extras, etc.)
  for (const [pkg, names] of ctx.externalImports) {
    lines.push(renderImport(pkg, [...names]));
  }
  // Builders grouped by path (preserves insertion order)
  const byPath = new Map();
  for (const b of ctx.builders) {
    const path = BUILDER_TO_PATH[b];
    if (!byPath.has(path)) byPath.set(path, new Set());
    byPath.get(path).add(BUILDER_IMPORT_NAME[b] ?? b);
  }
  for (const [path, names] of byPath) {
    lines.push(renderImport(path, [...names]));
  }
  // Core imports (Infer, UNBOUNDED_MAX_LENGTH)
  const coreNames = new Set(ctx.coreImports);
  if (opts.needsInfer) coreNames.add("type Infer");
  if (opts.needsUnbounded) coreNames.add("UNBOUNDED_MAX_LENGTH");
  if (coreNames.size > 0) {
    lines.push(renderImport("@stellar/js-xdr", [...coreNames]));
  }
  // XdrError
  if (ctx.needsXdrError) {
    lines.push(`import { XdrError } from "@stellar/js-xdr";`);
  }
  // Value imports (XdrValue, BytesValue, EnumValue, enumFromName,
  // enumFromValue, JsonValue, XdrString)
  if (ctx.valueImports.size > 0) {
    const valueByPath = new Map();
    for (const v of ctx.valueImports) {
      let path;
      if (v === "BytesValue") path = "../values/bytes-value.js";
      else if (
        v === "EnumValue" ||
        v === "enumFromName" ||
        v === "enumFromValue" ||
        v === "withMemberPrefix"
      )
        path = "../values/enum-value.js";
      else if (v === "XdrString" || v === "xdrString")
        path = "../values/xdr-string.js";
      else path = "../values/xdr-value.js"; // XdrValue, type JsonValue
      if (!valueByPath.has(path)) valueByPath.set(path, new Set());
      valueByPath.get(path).add(v);
    }
    for (const [path, names] of valueByPath) {
      lines.push(renderImport(path, [...names]));
    }
  }
  // Class imports — one per file. Combine value-side class import with the
  // wire-type import when both are needed. Skip names declared in the same
  // output file (the current emit unit's own classes + same-SCC siblings).
  const sameFile = opts.sameFileMembers ?? new Set();
  const allClassNames = new Set([...ctx.classImports, ...ctx.wireImports]);
  // Group classes by their output file so co-located classes share an import.
  const byFile = new Map();
  for (const name of allClassNames) {
    if (sameFile.has(name)) continue;
    const file = outputFileBase(name);
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file).push(name);
  }
  for (const [file, names] of byFile) {
    const parts = [];
    for (const name of names.sort()) {
      if (ctx.classImports.has(name)) parts.push(name);
      if (ctx.wireImports.has(name)) parts.push(`type ${name}Wire`);
    }
    lines.push(renderImport(`./${file}.js`, parts));
  }
  return lines.join("\n");
}

// -----------------------------------------------------------------------------
// 7. Emitters per kind
// -----------------------------------------------------------------------------

function bodyOfEnum(def, ctx) {
  ctx.builders.add("enumType");
  ctx.valueImports.add("EnumValue");
  ctx.valueImports.add("enumFromName");
  ctx.valueImports.add("enumFromValue");

  const name = def.name;
  const memberNames = def.members.map((m) => camelize(m.name));
  const nameTypeName = `${name}Name`;

  const singletons = def.members
    .map(
      (m, i) =>
        `  static readonly ${memberNames[i]} = new ${name}("${memberNames[i]}", ${m.value});`,
    )
    .join("\n");

  const schemaEntries = def.members
    .map((m, i) => `    ${memberNames[i]}: ${m.value},`)
    .join("\n");

  // Canonical SEP-0051 JSON names are derived in the value layer (a Stellar
  // concept), not by the generic `enumType` builder. The Rust `stellar-xdr`
  // crate strips each enum's `member_prefix` before serde renders the variant
  // `snake_case` (`SCV_BOOL` → `bool`, `ENVELOPE_TYPE_TX_V0` → `tx_v0`), so we
  // tag the schema with that prefix — camelized to match the member names
  // (`SCV_` → `scv`) — via `withMemberPrefix`, and the walker strips it at
  // runtime. Prefix-less enums emit a plain schema: their camelCase member
  // names already `snake_case` to the canonical form (`createAccount` →
  // `create_account`, `wasmInsnExec` → `wasm_insn_exec`).
  const memberPrefix = def.member_prefix || "";
  const baseSchema = `enumType("${name}", {
${schemaEntries}
  })`;
  let schemaExpr = baseSchema;
  if (memberPrefix) {
    ctx.valueImports.add("withMemberPrefix");
    schemaExpr = `withMemberPrefix(${baseSchema}, "${camelize(memberPrefix)}")`;
  }

  // Enum wire type is `number` (not the literal union) — that's what the
  // `enumType` schema builder infers since its values object isn't `as const`.
  return `export type ${name}Wire = number;

export type ${nameTypeName} =
${memberNames.map((n) => `  | "${n}"`).join("\n")};

${sourceDoc(def)}export class ${name} extends EnumValue<${nameTypeName}> {
${singletons}

  static readonly schema = ${schemaExpr};

  static fromValue(value: number): ${name} {
    return enumFromValue("${name}", ${name}.schema, ${name}, value);
  }

  static fromName(name: ${nameTypeName}): ${name} {
    return enumFromName("${name}", ${name}, name);
  }

  static fromXdrObject(wire: number): ${name} {
    return ${name}.fromValue(wire);
  }
}
`;
}

function emitEnum(def) {
  const ctx = newCtx();
  const body = bodyOfEnum(def, ctx);
  const imports = renderImports(ctx);
  return `${imports}\n\n${body}`;
}

function bodyOfStruct(rawDef, ctx) {
  // Normalize field names to legacy/xdrgen convention (camelCase, no snake;
  // collapse consecutive caps). Wire bytes are unaffected — field names are
  // a TS-side concern.
  const def = {
    ...rawDef,
    fields: rawDef.fields.map((f) => ({
      ...f,
      name: normalizeFieldName(f.name),
    })),
  };
  ctx.currentType = def.name;
  ctx.builders.add("struct");
  ctx.coreImports.add("type XdrType");
  ctx.valueImports.add("XdrValue");

  const name = def.name;
  const wireName = `${name}Wire`;

  // Explicit wire type — exported so other generated files can reference it
  // (and so cyclic types don't choke TS's Infer).
  const wireFieldDecls = def.fields
    .map((f) => `  ${f.name}: ${wireTypeExpr(f.type, ctx)};`)
    .join("\n");
  const wireDecl = `export interface ${wireName} {\n${wireFieldDecls}\n}`;

  // Field declarations
  const fieldDecls = def.fields
    .map((f) => `  readonly ${f.name}: ${tsTypeExpr(f.type, ctx)};`)
    .join("\n");

  // Schema entries
  const schemaEntries = def.fields
    .map((f) => `    ${f.name}: ${schemaExpr(f.type, ctx)},`)
    .join("\n");

  // Constructor input type and assignment
  const ctorInputFields = def.fields
    .map((f) => `    ${f.name}: ${ctorInputType(f.type, ctx)};`)
    .join("\n");

  const ctorAssignments = def.fields.map((f) => ctorAssignment(f)).join("\n");

  // toXdrObject
  const toWireEntries = def.fields
    .map((f) => `      ${f.name}: ${toWireExpr(f, ctx)},`)
    .join("\n");

  // fromXdrObject
  const fromWireArgs = def.fields
    .map((f) => `      ${f.name}: ${fromWireExpr(f, ctx)},`)
    .join("\n");

  return `${wireDecl}

${sourceDoc(rawDef)}export class ${name} extends XdrValue {
${fieldDecls}

  static readonly schema: XdrType<${wireName}> = struct("${name}", {
${schemaEntries}
  });

  constructor(input: {
${ctorInputFields}
  }) {
    super();
${ctorAssignments}
  }

  toXdrObject(): ${wireName} {
    return {
${toWireEntries}
    };
  }

  static fromXdrObject(wire: ${wireName}): ${name} {
    return new ${name}({
${fromWireArgs}
    });
  }
}
`;
}

function emitStruct(rawDef) {
  const ctx = newCtx();
  const body = bodyOfStruct(rawDef, ctx);
  const imports = renderImports(ctx, {
    sameFileMembers: new Set([rawDef.name]),
  });
  return `${imports}\n\n${body}`;
}

function ctorInputType(t, ctx) {
  // For typedef opaque types that emit a wrapper class (Hash, AssetCode4, …),
  // accept Type | Uint8Array | string. Inline-typedef refs (uint256 → Uint8Array)
  // and other types use their plain TS type — except `string<N>` accepts
  // `Uint8Array | string` (the string is UTF-8 encoded at the wire layer).
  if (t.kind === "ref" && emitsClass(t.name)) {
    const def = registry.get(t.name);
    if (def && def.kind === "typedef" && !isReExport(def)) {
      const ek = def.type.kind;
      if (ek === "opaque_fixed" || ek === "opaque_var") {
        ctx.classImports.add(t.name);
        return `${t.name} | Uint8Array | string`;
      }
    }
  }
  // Inline `string<N>` (either directly or via inline typedef like SCString)
  // — accept any of the three forms the `XdrString` constructor takes.
  if (isInlineStringTypedef(t)) {
    ctx.valueImports.add("XdrString");
    return "XdrString | string | Uint8Array";
  }
  // Wrap optional/array around the wider inner input type so e.g.
  // `string<32>?` becomes `Uint8Array | string | null`.
  if (t.kind === "optional") {
    return `${ctorInputType(t.element, ctx)} | null`;
  }
  if (t.kind === "var_array" || t.kind === "array") {
    const inner = ctorInputType(t.element, ctx);
    return inner.includes("|") ? `(${inner})[]` : `${inner}[]`;
  }
  return tsTypeExpr(t, ctx);
}

/** True iff this type node resolves to an inline `string<N>` (either
 *  directly or via an inline `typedef ... string<N>` like SCSymbol / SCString). */
function isInlineStringTypedef(t) {
  if (t.kind === "string") return true;
  if (t.kind === "ref") {
    const def = registry.get(t.name);
    if (def && def.kind === "typedef" && isInlineTypedef(def)) {
      return isInlineStringTypedef(def.type);
    }
  }
  return false;
}

function ctorAssignment(field) {
  return armAssignmentExpr(field.type, field.name, /* fromInput */ true);
}

/** Narrow a constructor parameter (ctorInputType) to the stored field type.
 *  Used by both struct fields and union variant constructors.
 *
 *  `propName` is the local name (variant ctor uses bare name, struct ctor
 *  uses `input.<name>`). Set `fromInput` true for struct fields. */
function armAssignmentExpr(t, propName, fromInput = false) {
  const lhs = `    this.${propName}`;
  const rhs = fromInput ? `input.${propName}` : propName;
  const conv = inputToFieldConversion(t, rhs);
  return conv === rhs ? `${lhs} = ${rhs};` : `${lhs} = ${conv};`;
}

/** Recursive: produce an expression that converts a ctorInputType value to
 *  its stored field type. Handles ref-to-class, inline strings, optional
 *  and array nesting. Returns `expr` unchanged when no narrowing is needed. */
function inputToFieldConversion(t, expr) {
  if (t.kind === "ref" && emitsClass(t.name)) {
    const def = registry.get(t.name);
    if (def && def.kind === "typedef" && !isReExport(def)) {
      const ek = def.type.kind;
      if (ek === "opaque_fixed" || ek === "opaque_var") {
        return `${expr} instanceof ${t.name} ? ${expr} : new ${t.name}(${expr})`;
      }
    }
  }
  if (isInlineStringTypedef(t)) {
    // Constructor accepts `XdrString | string | Uint8Array`; stored field
    // is `XdrString`. Wrap non-XdrString inputs.
    return `${expr} instanceof XdrString ? ${expr} : new XdrString(${expr})`;
  }
  if (t.kind === "optional") {
    const inner = inputToFieldConversion(t.element, expr);
    if (inner === expr) return expr;
    return `${expr} === null ? null : (${inner})`;
  }
  if (t.kind === "var_array" || t.kind === "array") {
    const inner = inputToFieldConversion(t.element, "v");
    if (inner === "v") return expr;
    return `${expr}.map((v) => ${inner})`;
  }
  return expr;
}

/** How to convert a field value to its wire representation. */
function toWireExpr(field, ctx) {
  return instanceToWire(field.type, `this.${field.name}`, ctx);
}

function fromWireExpr(field, ctx) {
  return wireToInstance(field.type, `wire.${field.name}`, ctx);
}

/** Recursive: convert a TS-side expression to its wire shape, walking var_array,
 *  optional, and inline typedefs. Returns `expr` unchanged when no conversion
 *  is needed (primitives, raw bytes, raw strings). */
function instanceToWire(t, expr, ctx, depth = 0) {
  t = resolveType(t);
  if (t.kind === "ref") {
    // Real class ref (typedef chains already resolved).
    return `${expr}.toXdrObject()`;
  }
  if (t.kind === "var_array" || t.kind === "array") {
    const param = depth === 0 ? "v" : `v${depth}`;
    const inner = instanceToWire(t.element, param, ctx, depth + 1);
    if (inner === param) return expr;
    return `${expr}.map((${param}) => ${inner})`;
  }
  if (t.kind === "optional") {
    const inner = instanceToWire(t.element, expr, ctx, depth);
    if (inner === expr) return expr;
    return `${expr} === null ? null : ${inner}`;
  }
  return expr;
}

function wireToInstance(t, expr, ctx, depth = 0) {
  t = resolveType(t);
  if (t.kind === "ref") {
    const cls = t.name;
    ctx.classImports.add(cls);
    return `${cls}.fromXdrObject(${expr})`;
  }
  if (t.kind === "var_array" || t.kind === "array") {
    const param = depth === 0 ? "w" : `w${depth}`;
    const inner = wireToInstance(t.element, param, ctx, depth + 1);
    if (inner === param) return expr;
    return `${expr}.map((${param}) => ${inner})`;
  }
  if (t.kind === "optional") {
    const inner = wireToInstance(t.element, expr, ctx, depth);
    if (inner === expr) return expr;
    return `${expr} === null ? null : ${inner}`;
  }
  return expr;
}

function toJSONExpr(field, ctx) {
  return jsonEncodeExpr(field.type, `this.${field.name}`, ctx);
}

function fromJSONExpr(field, ctx) {
  return jsonDecodeExpr(field.type, `obj.${field.name}`, ctx);
}

/** Expression converting a value of TS-type `tsType` to a JsonValue. */
function jsonEncodeExpr(t, expr, ctx, depth = 0) {
  t = resolveType(t);
  if (t.kind === "ref") {
    return `${expr}.toJSON()`;
  }
  if (t.kind === "opaque_fixed" || t.kind === "opaque_var") {
    addExternal(ctx, "uint8array-extras", "uint8ArrayToHex");
    return `uint8ArrayToHex(${expr})`;
  }
  if (t.kind === "var_array" || t.kind === "array") {
    const param = depth === 0 ? "v" : `v${depth}`;
    const inner = jsonEncodeExpr(t.element, param, ctx, depth + 1);
    if (inner === param) return expr;
    return `${expr}.map((${param}) => ${inner})`;
  }
  if (t.kind === "optional") {
    const inner = jsonEncodeExpr(t.element, expr, ctx, depth);
    if (inner === expr) return expr;
    return `${expr} === null ? null : ${inner}`;
  }
  if (t.kind === "hyper" || t.kind === "unsigned_hyper") {
    return `${expr}.toString()`;
  }
  return expr; // number, string, boolean — directly JSON-compatible
}

/** Expression decoding a JsonValue to a value of TS-type `tsType`. */
function jsonDecodeExpr(t, expr, ctx, depth = 0) {
  t = resolveType(t);
  if (t.kind === "ref") {
    const cls = t.name;
    ctx.classImports.add(cls);
    return `${cls}.fromJSON(${expr})`;
  }
  if (t.kind === "opaque_fixed" || t.kind === "opaque_var") {
    addExternal(ctx, "uint8array-extras", "hexToUint8Array");
    return `hexToUint8Array(${expr} as string)`;
  }
  if (t.kind === "var_array" || t.kind === "array") {
    const param = depth === 0 ? "w" : `w${depth}`;
    const inner = jsonDecodeExpr(t.element, param, ctx, depth + 1);
    if (inner === param) return `${expr} as ${tsTypeExpr(t, ctx)}`;
    return `(${expr} as JsonValue[]).map((${param}) => ${inner})`;
  }
  if (t.kind === "optional") {
    const inner = jsonDecodeExpr(t.element, expr, ctx, depth);
    if (inner === expr) return `${expr} as ${tsTypeExpr(t, ctx)}`;
    return `${expr} === null ? null : ${inner}`;
  }
  if (t.kind === "hyper" || t.kind === "unsigned_hyper") {
    return `BigInt(${expr} as string)`;
  }
  return `${expr} as ${tsTypeExpr(t, ctx)}`;
}

/** TS type for an arm payload (recursive — handles var_array, optional). */
function instanceTypeOfArm(t, ctx) {
  return tsTypeExpr(t, ctx);
}

/** Wire-side TS type. References to classes use `<ClassName>Wire` (exported
 *  by the referenced class's file). Inline kinds expand to their primitive
 *  wire shapes. */
function wireTypeExpr(t, ctx) {
  t = resolveType(t);
  if (t.kind === "ref") {
    const cls = t.name;
    ctx.wireImports.add(cls);
    return `${cls}Wire`;
  }
  switch (t.kind) {
    case "int":
    case "unsigned_int":
      return "number";
    case "hyper":
    case "unsigned_hyper":
      return "bigint";
    case "bool":
      return "boolean";
    case "string":
      ctx.valueImports.add("XdrString");
      return "XdrString";
    case "opaque_fixed":
    case "opaque_var":
      return "Uint8Array";
    case "var_array":
    case "array": {
      const inner = wireTypeExpr(t.element, ctx);
      return inner.includes("|") ? `(${inner})[]` : `${inner}[]`;
    }
    case "optional":
      return `${wireTypeExpr(t.element, ctx)} | null`;
    default:
      throw new Error(`wireTypeExpr: unhandled kind ${t.kind}`);
  }
}

/** Follow inline typedefs and re-exports until we either bottom out at a
 *  non-ref kind, or reach a ref to a real class (struct/union/enum/uppercase
 *  opaque typedef). The returned node is what conversion logic should switch on.
 */
function resolveType(t) {
  if (t.kind !== "ref") return t;
  const def = registry.get(t.name);
  if (!def) return t;
  if (def.kind === "typedef") {
    if (isInlineTypedef(def)) return resolveType(def.type);
    // Stop at re-exports-to-opaque — those emit their own class.
    if (isReExport(def) && !isReExportToOpaque(def))
      return resolveType(def.type);
  }
  return t; // class ref
}

/** Resolve a ref through re-exports to the underlying named class.
 *  Re-exports-to-opaque are their own class — stop at them. */
function resolveClassName(name) {
  let n = name;
  while (true) {
    const d = registry.get(n);
    if (!d || d.kind !== "typedef" || !isReExport(d) || isReExportToOpaque(d))
      return n;
    n = d.type.name;
  }
}

/** PascalCase → SCREAMING_SNAKE with trailing underscore. */
function screamingSnake(name) {
  return (
    name
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/([0-9])([A-Z])/g, "$1_$2")
      .toUpperCase() + "_"
  );
}

// -----------------------------------------------------------------------------
// Cycle detection — Tarjan SCC over schema-dependency graph.
//
// A class C depends on another class D iff C's schema reads D.schema at
// module-init time. When C and D end up in the same SCC (size > 1) or C has
// a self-loop, we must wrap refs with `lazy(() => D.schema)` to avoid reading
// an undefined schema during class init.
// -----------------------------------------------------------------------------

/** @type {Map<string, string>} — class name → SCC root (most-referenced member). */
let sccByName = null;

/** @type {Map<string, string[]>} — SCC root → sorted member names. Single-class
 *  SCCs are still listed here with a one-element array, so file emission can
 *  uniformly iterate `sccGroups`. */
let sccGroups = null;

/** Walk a type tree and collect names of classes whose .schema is read. */
function collectSchemaDeps(t, into) {
  if (t.kind === "ref") {
    const def = registry.get(t.name);
    if (!def) return;
    if (def.kind === "typedef" && isInlineTypedef(def)) {
      collectSchemaDeps(def.type, into);
      return;
    }
    const cls = resolveClassName(t.name);
    into.add(cls);
    return;
  }
  if (t.kind === "var_array" || t.kind === "array" || t.kind === "optional") {
    collectSchemaDeps(t.element, into);
  }
}

function buildDepGraph() {
  /** @type {Map<string, Set<string>>} */
  const graph = new Map();
  for (const def of xdr.definitions) {
    if (!emitsClass(def.name)) continue;
    /** @type {Set<string>} */
    const deps = new Set();
    if (def.kind === "struct") {
      for (const f of def.fields) collectSchemaDeps(f.type, deps);
    } else if (def.kind === "union") {
      collectSchemaDeps(def.discriminant.type, deps);
      for (const a of def.arms) if (a.type) collectSchemaDeps(a.type, deps);
    } else if (def.kind === "typedef" && isReExport(def)) {
      // Re-export depends on its target's class
      const cls = resolveClassName(def.name);
      if (cls !== def.name) deps.add(cls);
    }
    // enums, BytesValue typedefs — no class deps
    graph.set(def.name, deps);
  }
  return graph;
}

/** Tarjan's SCC algorithm. Returns Map<node, members[]> — every node maps to
 *  the same sorted member array (object-identity equal across the SCC). */
function tarjanSCC(graph) {
  const index = new Map();
  const lowlink = new Map();
  const onStack = new Set();
  const stack = [];
  let counter = 0;
  /** @type {Map<string, string[]>} */
  const sccs = new Map();

  function strongConnect(v) {
    index.set(v, counter);
    lowlink.set(v, counter);
    counter += 1;
    stack.push(v);
    onStack.add(v);

    const succs = graph.get(v) ?? new Set();
    for (const w of succs) {
      if (!graph.has(w)) continue; // external
      if (!index.has(w)) {
        strongConnect(w);
        lowlink.set(v, Math.min(lowlink.get(v), lowlink.get(w)));
      } else if (onStack.has(w)) {
        lowlink.set(v, Math.min(lowlink.get(v), index.get(w)));
      }
    }

    if (lowlink.get(v) === index.get(v)) {
      const members = [];
      let w;
      do {
        w = stack.pop();
        onStack.delete(w);
        members.push(w);
      } while (w !== v);
      members.sort();
      for (const m of members) sccs.set(m, members);
    }
  }

  for (const v of graph.keys()) {
    if (!index.has(v)) strongConnect(v);
  }
  return sccs;
}

/** Count incoming references to each class across the entire schema. Used to
 *  pick the "root" of a multi-class SCC — the member with the most external
 *  references becomes the file name (e.g. SCVal beats SCMapEntry). */
function buildInDegree() {
  /** @type {Map<string, number>} */
  const deg = new Map();
  for (const def of xdr.definitions) {
    if (!emitsClass(def.name)) continue;
    /** @type {Set<string>} */
    const seen = new Set();
    if (def.kind === "struct") {
      for (const f of def.fields) collectSchemaDeps(f.type, seen);
    } else if (def.kind === "union") {
      collectSchemaDeps(def.discriminant.type, seen);
      for (const a of def.arms) if (a.type) collectSchemaDeps(a.type, seen);
    } else if (def.kind === "typedef" && isReExport(def)) {
      const cls = resolveClassName(def.name);
      if (cls !== def.name) seen.add(cls);
    }
    for (const dep of seen) deg.set(dep, (deg.get(dep) ?? 0) + 1);
  }
  return deg;
}

/** Pick the root of a multi-member SCC: the member with the most external
 *  refs (i.e. refs from outside the SCC). Ties are broken by total in-degree,
 *  then alphabetically — fully deterministic. */
function pickSCCRoot(members, inDegree) {
  if (members.length === 1) return members[0];
  const memberSet = new Set(members);
  let best = null;
  let bestExternal = -1;
  let bestTotal = -1;
  // Compute external in-degree per member.
  for (const m of members) {
    let external = 0;
    for (const [otherName, deps] of depGraph) {
      if (memberSet.has(otherName)) continue;
      if (deps.has(m)) external += 1;
    }
    const total = inDegree.get(m) ?? 0;
    if (
      external > bestExternal ||
      (external === bestExternal && total > bestTotal) ||
      (external === bestExternal && total === bestTotal && m < best)
    ) {
      best = m;
      bestExternal = external;
      bestTotal = total;
    }
  }
  return best;
}

/** @type {Map<string, Set<string>> | null} */
let depGraph = null;

function buildSCCs() {
  depGraph = buildDepGraph();
  const byMember = tarjanSCC(depGraph);
  const inDegree = buildInDegree();

  sccByName = new Map();
  sccGroups = new Map();

  // Choose a root per SCC and populate the canonical maps.
  const seen = new Set();
  for (const members of byMember.values()) {
    if (seen.has(members)) continue;
    seen.add(members);
    const root = pickSCCRoot(members, inDegree);
    sccGroups.set(root, members);
    for (const m of members) sccByName.set(m, root);
  }
}

/** True iff a ref from `currentType` to `targetClass` closes a schema cycle. */
function needsLazy(currentType, targetClass) {
  if (!sccByName) return false;
  if (currentType === targetClass) return true; // self-reference
  // Same SCC (size > 1) — still need lazy() because within the merged file
  // they're forward-declared with respect to each other.
  const rootA = sccByName.get(currentType);
  const rootB = sccByName.get(targetClass);
  if (rootA && rootA === rootB) {
    const group = sccGroups.get(rootA);
    return group != null && group.length > 1;
  }
  return false;
}

/** SCC root for a class — the most-referenced member of its SCC, or the
 *  class itself if it isn't in a multi-class SCC. Used for file-name lookups. */
function sccRoot(name) {
  return sccByName.get(name) ?? name;
}

/** Output file base (no extension) for a class. Members of a multi-class SCC
 *  share the root's filename. */
function outputFileBase(name) {
  return kebabFile(sccRoot(name));
}

/** Member-name prefix to strip when deriving variant class names. */
function pickPrefix(enumDef) {
  if (enumDef.member_prefix && enumDef.member_prefix.length > 0) {
    return enumDef.member_prefix;
  }
  const candidate = screamingSnake(enumDef.name);
  if (enumDef.members.every((m) => m.name.startsWith(candidate))) {
    return candidate;
  }
  return "";
}

function bodyOfUnion(rawDef, ctx) {
  // Normalize arm names (the wire-side payload field) to legacy convention.
  const def = {
    ...rawDef,
    arms: rawDef.arms.map((arm) => ({
      ...arm,
      name: arm.name == null ? null : normalizeFieldName(arm.name),
    })),
  };
  ctx.currentType = def.name;
  ctx.builders.add("union");
  ctx.coreImports.add("type XdrType");
  ctx.valueImports.add("XdrValue");

  const name = def.name;
  const baseName = `${name}Base`;
  const wireName = `${name}Wire`;
  const variantNameType = `${name}VariantName`;

  // Discriminant — either an enum ref or a raw primitive (int, unsigned_int, bool).
  const discType = def.discriminant.type;
  const switchKey = def.discriminant.name;
  const discIsEnum =
    discType.kind === "ref" && registry.get(discType.name)?.kind === "enum";
  let discRefName = null;
  let enumPrefix = "";
  if (discIsEnum) {
    discRefName = discType.name;
    const discDef = registry.get(discRefName);
    enumPrefix = pickPrefix(discDef);
    ctx.classImports.add(resolveClassName(discRefName));
  }

  // Names imported as arm-payload classes — used to detect collisions
  // between auto-derived variant class names and arm types.
  const armClassNames = new Set();
  for (const arm of def.arms) {
    if (arm.type && arm.type.kind === "ref") {
      armClassNames.add(resolveClassName(arm.type.name));
    }
  }

  // Build arm metadata — one entry per case (multi-case arms expand into
  // multiple variant subclasses sharing the same payload shape).
  const armsMeta = def.arms.flatMap((arm) => {
    const isVoid = arm.name == null;
    return arm.cases.map((c) => {
      // Discriminant case identifier (the string passed to case_).
      let discCamel;
      let variantCls;
      if (c.name) {
        discCamel = camelize(c.name);
        const stripped = c.name.slice(enumPrefix.length);
        variantCls = name + pascalize(stripped);
      } else if (arm.name) {
        discCamel = arm.name;
        variantCls = name + pascalize(arm.name);
      } else {
        discCamel = `v${c.value}`;
        variantCls = `${name}V${c.value}`;
      }
      // If the auto-derived variant class name collides with an arm-payload
      // class we'd import (e.g. AuthenticatedMessage.v0 → arm type
      // AuthenticatedMessageV0), suffix the variant to disambiguate.
      if (armClassNames.has(variantCls)) variantCls += "Arm";
      return {
        caseName: c.name ?? null,
        discCamel,
        discValue: c.value,
        variantCls,
        isVoid,
        armName: arm.name,
        armType: arm.type ?? null,
      };
    });
  });

  // Variant name union type
  const variantTypeUnion = armsMeta
    .map((a) => `  | "${a.discCamel}"`)
    .join("\n");

  // case_ entries in schema
  ctx.builders.add("case_");
  if (armsMeta.some((a) => a.isVoid)) ctx.builders.add("voidType");
  if (armsMeta.some((a) => !a.isVoid)) ctx.builders.add("field");
  // Render schema cases
  const schemaCases = armsMeta
    .map((a) => {
      if (a.isVoid) {
        return `      case_("${a.discCamel}", ${a.discValue}, voidType()),`;
      }
      return `      case_(\n        "${a.discCamel}",\n        ${a.discValue},\n        field("${a.armName}", ${schemaExpr(a.armType, ctx)}),\n      ),`;
    })
    .join("\n");

  // Factory statics
  const factories = armsMeta
    .map((a) => {
      if (a.isVoid) {
        return `  static ${a.discCamel}(): ${a.variantCls} {
    return new ${a.variantCls}();
  }`;
      }
      const paramName = a.armName;
      const paramType = ctorInputType(a.armType, ctx);
      return `  static ${a.discCamel}(${paramName}: ${paramType}): ${a.variantCls} {
    return new ${a.variantCls}(${paramName});
  }`;
    })
    .join("\n\n");

  // fromXdrObject dispatch
  const fromWireCases = armsMeta
    .map((a) => {
      if (a.isVoid) {
        return `      case ${a.discValue}:\n        return new ${a.variantCls}();`;
      }
      const argExpr = wireToInstance(a.armType, `wire.${a.armName}`, ctx);
      return `      case ${a.discValue}:\n        return new ${a.variantCls}(${argExpr});`;
    })
    .join("\n");

  // Variant subclasses. Wire shape uses `switchKey` (the XDR discriminant
  // name); JS instances expose a uniform `type` discriminator regardless.
  const variantClasses = armsMeta
    .map((a) => {
      const wireType = `Extract<${wireName}, { ${switchKey}: ${a.discValue} }>`;
      if (a.isVoid) {
        // Void cases carry no payload; expose a uniform `value` getter that
        // returns null so `.value` is callable on every variant of the union
        // (the union's `.value` type becomes `<payloads> | null`).
        return `export class ${a.variantCls} extends ${baseName} {
  readonly type = "${a.discCamel}" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): ${wireType} {
    return { ${switchKey}: ${a.discValue} };
  }
}`;
      }
      const valueType = instanceTypeOfArm(a.armType, ctx);
      const armField = a.armName;
      const toWireValue = instanceToWire(a.armType, `this.${armField}`, ctx);
      const ctorParamType = ctorInputType(a.armType, ctx);
      // Constructor accepts the wider ctorInputType (e.g. `Hash | Uint8Array
      // | string`, or `Uint8Array | string` for string<N>); the stored field
      // is the narrower instance type. Normalize at assignment.
      const armAssignment = armAssignmentExpr(a.armType, armField);
      // Primary field is named after the XDR arm (e.g. `fromAddress`,
      // `ed25519`, `paymentOp`). `value` is preserved as a thin getter so
      // existing consumer code keeps working during migration. For inline
      // `string<N>` arms the getter UTF-8-decodes the `XdrString` to a JS
      // string — `.value` reads as "give me the payload as a string" while
      // the arm-named field exposes the raw `XdrString` wrapper.
      let valueAlias;
      if (armField === "value") {
        valueAlias = "";
      } else if (isInlineStringTypedef(a.armType)) {
        valueAlias = `\n  get value(): string {\n    return this.${armField}.toString();\n  }\n`;
      } else {
        valueAlias = `\n  get value(): ${valueType} {\n    return this.${armField};\n  }\n`;
      }
      return `export class ${a.variantCls} extends ${baseName} {
  readonly type = "${a.discCamel}" as const;
  readonly ${armField}: ${valueType};

  constructor(${armField}: ${ctorParamType}) {
    super();
${armAssignment}
  }
${valueAlias}
  toXdrObject(): ${wireType} {
    return { ${switchKey}: ${a.discValue}, ${a.armName}: ${toWireValue} };
  }
}`;
    })
    .join("\n\n");

  const variantClsList = armsMeta.map((a) => a.variantCls).join(" | ");

  const switchOnExpr = discIsEnum
    ? `${resolveClassName(discRefName)}.schema`
    : schemaExpr(discType, ctx);
  const switchKeyOption =
    switchKey === "type" ? "" : `,\n    switchKey: "${switchKey}"`;

  // Explicit wire type — a discriminated union literal. Avoids Infer cycles.
  const wireVariants = armsMeta
    .map((a) => {
      const base = `{ ${switchKey}: ${a.discValue} }`;
      if (a.isVoid) return base;
      return `{ ${switchKey}: ${a.discValue}; ${a.armName}: ${wireTypeExpr(a.armType, ctx)} }`;
    })
    .join("\n  | ");
  const wireDecl = `export type ${wireName} =\n  | ${wireVariants};`;

  return `${wireDecl}

export type ${variantNameType} =
${variantTypeUnion};

${sourceDoc(rawDef)}abstract class ${baseName} extends XdrValue {
  abstract readonly type: ${variantNameType};

  static readonly schema: XdrType<${wireName}> = union("${name}", {
    switchOn: ${switchOnExpr},
    cases: [
${schemaCases}
    ]${switchKeyOption},
  });

${factories}

  static fromXdrObject(wire: ${wireName}): ${name} {
    switch (wire.${switchKey}) {
${fromWireCases}
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ${name} variant.
   * Use this instead of \`instanceof ${name}\`: the exported \`${name}\` value
   * is the abstract base, so \`instanceof\` narrows to the base (not the
   * variant union) and forces a cast. \`${name}.is(x)\` narrows to the union.
   */
  static is(value: unknown): value is ${name} {
    return value instanceof ${baseName};
  }

  abstract toXdrObject(): ${wireName};
}

${variantClasses}

export type ${name} = ${variantClsList};
export const ${name} = ${baseName};
`;
}

const UNION_ESLINT_HEADER = `/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.`;

function emitUnion(rawDef) {
  const ctx = newCtx();
  const body = bodyOfUnion(rawDef, ctx);
  const imports = renderImports(ctx, {
    sameFileMembers: new Set([rawDef.name]),
  });
  return `${UNION_ESLINT_HEADER}\n${imports}\n\n${body}`;
}

function emitTypedef(def) {
  // Re-export-to-opaque: emit a distinct BytesValue subclass with its own
  // named schema. Identical byte semantics to the chased target, but a name
  // the JSON walker can dispatch overrides on (PoolId → L-strkey, etc.).
  if (isReExportToOpaque(def)) {
    let current = def.type.name;
    while (true) {
      const d = registry.get(current);
      if (!d || d.kind !== "typedef" || (d.type.kind === "ref") === false)
        break;
      if (d.type.kind !== "ref") break;
      current = d.type.name;
    }
    const targetDef = registry.get(current);
    return emitWrappedOpaque(def.name, targetDef.type, def);
  }

  // Pure re-export typedef (alias to another named class — union, struct,
  // enum, or BytesValue-wrapped non-opaque)
  if (isReExport(def)) {
    let current = def.type.name;
    while (true) {
      const d = registry.get(current);
      if (!d || d.kind !== "typedef" || !isReExport(d)) break;
      current = d.type.name;
    }
    return `import { ${current}, type ${current}Wire } from "./${outputFileBase(current)}.js";

export type ${def.name} = ${current};
export const ${def.name} = ${current};
export type ${def.name}Wire = ${current}Wire;
`;
  }

  const inner = def.type;

  // Wrapped opaque typedef (Hash, AssetCode4, …) → BytesValue<"Name"> class
  if (inner.kind === "opaque_fixed" || inner.kind === "opaque_var") {
    return emitWrappedOpaque(def.name, inner, def);
  }

  throw new Error(`emitTypedef: unhandled inner kind ${inner.kind}`);
}

/** Emit a BytesValue subclass for a named typedef-opaque. Used both for
 *  direct typedef-opaques (Hash, AssetCode4, …) and for re-export aliases
 *  whose chased target is one (PoolId, ContractId, …) — the re-export path
 *  gets a distinct class identity so the JSON walker can dispatch overrides
 *  on its name. `sourceDef` carries the TSDoc source from the original
 *  declaration, even if `inner` came from a chased target. */
function emitWrappedOpaque(name, inner, sourceDef) {
  const ctx = newCtx();
  ctx.valueImports.add("BytesValue");
  let schemaText;
  if (inner.kind === "opaque_fixed") {
    ctx.builders.add("opaque");
    schemaText = `opaque(${inner.size}, "${name}")`;
  } else {
    ctx.builders.add("varOpaque");
    const lenArg =
      inner.max_size != null
        ? String(inner.max_size)
        : (ctx.coreImports.add("UNBOUNDED_MAX_LENGTH"), "UNBOUNDED_MAX_LENGTH");
    schemaText = `varOpaque(${lenArg}, "${name}")`;
  }
  const encoding = "hex"; // canonical default — DX layer can override
  const byteLengthDecl =
    inner.kind === "opaque_fixed"
      ? `  static readonly byteLength = ${inner.size};\n`
      : "";
  const imports = renderImports(ctx);
  return `${imports}\n
export type ${name}Wire = Uint8Array;

${sourceDoc(sourceDef)}export class ${name} extends BytesValue<"${name}"> {
${byteLengthDecl}  static readonly encoding = "${encoding}" as const;
  static readonly schema = ${schemaText};

  static fromXdrObject(wire: Uint8Array): ${name} {
    return new ${name}(wire);
  }
}
`;
}

// -----------------------------------------------------------------------------
// 8. Dispatch & run
// -----------------------------------------------------------------------------

/** Emit one combined file containing every class in `members` (a multi-class
 *  SCC). Within-group references resolve to same-file declarations; imports
 *  for arms/fields outside the SCC are merged and rendered once at the top. */
function emitGroupedFile(members) {
  const ctx = newCtx();
  const bodies = [];
  let hasUnion = false;
  for (const name of members) {
    const def = registry.get(name);
    if (!def) throw new Error(`emitGroupedFile: unknown type ${name}`);
    switch (def.kind) {
      case "enum":
        bodies.push(bodyOfEnum(def, ctx));
        break;
      case "struct":
        bodies.push(bodyOfStruct(def, ctx));
        break;
      case "union":
        bodies.push(bodyOfUnion(def, ctx));
        hasUnion = true;
        break;
      case "typedef":
        // Typedef opaques/re-exports never enter multi-class SCCs (no schema
        // class deps), so this path shouldn't trigger. Fall back to the solo
        // emit and inline it so the group file stays self-contained.
        bodies.push(emitTypedef(def));
        break;
      default:
        throw new Error(`emitGroupedFile: unhandled kind ${def.kind}`);
    }
  }
  const sameFile = new Set(members);
  const imports = renderImports(ctx, { sameFileMembers: sameFile });
  const header = hasUnion ? `${UNION_ESLINT_HEADER}\n` : "";
  return `${header}${imports}\n\n${bodies.join("\n")}`;
}

function emitDef(def) {
  switch (def.kind) {
    case "enum":
      return emitEnum(def);
    case "struct":
      return emitStruct(def);
    case "union":
      return emitUnion(def);
    case "typedef":
      return emitTypedef(def);
    default:
      throw new Error(`Cannot emit kind ${def.kind} (${def.name})`);
  }
}

function main() {
  const args = process.argv.slice(2);
  let outDir = "out/xdrgen";
  const explicitNames = [];
  let all = false;
  for (const a of args) {
    if (a.startsWith("--out=")) outDir = a.slice(6);
    else if (a === "--all") all = true;
    else if (a === "--clean") {
      // handled later
    } else if (a.startsWith("--")) {
      throw new Error(`Unknown flag: ${a}`);
    } else explicitNames.push(a);
  }

  // Build SCC graph once for cycle-aware schema refs.
  buildSCCs();

  const outAbs = resolve(REPO_ROOT, outDir);
  if (args.includes("--clean"))
    rmSync(outAbs, { recursive: true, force: true });
  mkdirSync(outAbs, { recursive: true });

  // Determine the set of names to emit
  const queue = new Set();
  const seed = all
    ? [...registry.keys()].filter((n) => emitsClass(n))
    : explicitNames;
  for (const n of seed) queue.add(n);

  // Group classes by SCC root. Members of a multi-class SCC share one output
  // file (named after the most-referenced member); each non-root member gets
  // a one-line re-export shim so its old kebab path keeps resolving.
  const rootsToEmit = new Set();
  for (const name of queue) {
    if (!registry.get(name)) {
      console.error(`xdrgen: unknown type ${name}`);
      continue;
    }
    if (!emitsClass(name)) continue;
    rootsToEmit.add(sccRoot(name));
  }

  let emitted = 0;
  for (const root of rootsToEmit) {
    const members = sccGroups.get(root) ?? [root];
    const path = resolve(outAbs, `${kebabFile(root)}.ts`);
    const content =
      members.length > 1
        ? emitGroupedFile(members)
        : emitDef(registry.get(root));
    writeFileSync(path, content);
    emitted += 1;
    // Back-compat shims for non-root members.
    for (const m of members) {
      if (m === root) continue;
      const shimPath = resolve(outAbs, `${kebabFile(m)}.ts`);
      const shim = `export { ${m}, type ${m}Wire } from "./${kebabFile(root)}.js";\n`;
      writeFileSync(shimPath, shim);
      emitted += 1;
    }
  }

  // Emit constants.ts + barrel index.ts when generating everything.
  if (all) {
    const consts = xdr.definitions.filter((d) => d.kind === "const");
    if (consts.length > 0) {
      const lines = consts.map(
        (c) => `export const ${c.name} = ${JSON.stringify(c.value)};`,
      );
      writeFileSync(resolve(outAbs, "constants.ts"), lines.join("\n") + "\n");
      emitted += 1;
    }

    // Barrel — one entry per SCC root file (members re-export through it).
    const barrelRoots = [...rootsToEmit].sort();
    const barrelLines = barrelRoots.map(
      (n) => `export * from "./${kebabFile(n)}.js";`,
    );
    if (consts.length > 0) {
      barrelLines.push(`export * from "./constants.js";`);
    }
    writeFileSync(resolve(outAbs, "index.ts"), barrelLines.join("\n") + "\n");
    emitted += 1;
  }

  console.error(`xdrgen: emitted ${emitted} file(s) to ${outDir}`);

  // Run prettier on the output so consumers get formatted TS straight from xdrgen.
  try {
    execSync(
      `pnpm prettier --ignore-path config/.prettierignore --write '${outDir}/**/*.ts' --log-level warn`,
      { cwd: REPO_ROOT, stdio: "inherit" },
    );
  } catch (e) {
    console.error(`xdrgen: prettier failed (output is unformatted)`);
  }
}

main();
