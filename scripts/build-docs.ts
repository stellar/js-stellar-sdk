/**
 * Walks api.json from typedoc, routes each public symbol to a bucket
 * by source file path, and writes one markdown file per bucket to
 * `docs/reference/`. Each symbol is rendered as an H2 block with a
 * summary, a TS-fenced declaration, structured params, and a source
 * link pinned to `DOCS_SOURCE_REF` (default: trunk branch; release
 * deploys override). See `.claude/notes/docs-plan.md` →
 * "scripts/build-docs.ts — phased implementation" for the full
 * multi-phase plan.
 */

import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { DOCS_SOURCE_REF } from "./docs-source-ref.js";

const REPO_ROOT = process.cwd();
const TYPEDOC_JSON = join(REPO_ROOT, "tmp/typedoc-json/api.json");
const OUTPUT_DIR = join(REPO_ROOT, "docs/reference");
const REPO_SLUG = "stellar/js-stellar-sdk";

const BUCKET_TO_SLUG = {
  "Core / Keys": "core-keys",
  "Core / Assets": "core-assets",
  "Core / Transactions": "core-transactions",
  "Core / XDR": "core-xdr",
  "Core / Soroban Primitives": "core-soroban-primitives",
  "Network / Horizon": "network-horizon",
  "Network / RPC": "network-rpc",
  "Network / Friendbot": "network-friendbot",
  "Network / HTTP": "network-http",
  "Contracts / Client": "contracts-client",
  "Contracts / Bindings": "contracts-bindings",
  "SEPs / Toml": "seps-toml",
  "SEPs / Federation": "seps-federation",
  "SEPs / WebAuth": "seps-webauth",
  Errors: "errors",
  "Cross-cutting": "cross-cutting",
} as const satisfies Record<string, string>;

type BucketName = keyof typeof BUCKET_TO_SLUG;

// Exact-file overrides take precedence over directory prefixes.
// Use for files whose bucket differs from the directory's default
// (e.g. src/webauth/errors.ts → Errors, not SEPs / WebAuth).
const FILE_OVERRIDES: Record<string, BucketName> = {
  "src/utils.ts": "Cross-cutting",
  "src/utils/url.ts": "Network / HTTP",
  "src/config.ts": "Cross-cutting",
  "src/webauth/errors.ts": "Errors",
  "src/base/util/bignumber.ts": "Cross-cutting",
  "src/base/util/util.ts": "Cross-cutting",
  "src/base/util/checksum.ts": "Core / Keys",
  "src/base/keypair.ts": "Core / Keys",
  "src/base/signing.ts": "Core / Keys",
  "src/base/strkey.ts": "Core / Keys",
  "src/base/signerkey.ts": "Core / Keys",
  "src/base/asset.ts": "Core / Assets",
  "src/base/liquidity_pool_asset.ts": "Core / Assets",
  "src/base/liquidity_pool_id.ts": "Core / Assets",
  "src/base/get_liquidity_pool_id.ts": "Core / Assets",
  "src/base/claimant.ts": "Core / Assets",
  "src/base/hashing.ts": "Core / XDR",
  "src/base/address.ts": "Core / Soroban Primitives",
  "src/base/contract.ts": "Core / Soroban Primitives",
  "src/base/scval.ts": "Core / Soroban Primitives",
  "src/base/auth.ts": "Core / Soroban Primitives",
  "src/base/invocation.ts": "Core / Soroban Primitives",
  "src/base/events.ts": "Core / Soroban Primitives",
  "src/base/sorobandata_builder.ts": "Core / Soroban Primitives",
  "src/base/soroban.ts": "Core / Soroban Primitives",
};

// Ordered: more-specific prefix first. Walk takes first match, so
// `src/base/operations/` resolves before `src/base/`.
const DIRECTORY_PREFIXES: ReadonlyArray<readonly [string, BucketName]> = [
  ["src/base/operations/", "Core / Transactions"],
  ["src/base/numbers/", "Core / Transactions"],
  ["src/base/util/", "Core / Transactions"],
  ["src/base/", "Core / Transactions"],
  ["src/horizon/", "Network / Horizon"],
  ["src/rpc/", "Network / RPC"],
  ["src/friendbot/", "Network / Friendbot"],
  ["src/http-client/", "Network / HTTP"],
  ["src/contract/", "Contracts / Client"],
  ["src/bindings/", "Contracts / Bindings"],
  ["src/cli/", "Contracts / Bindings"],
  ["src/stellartoml/", "SEPs / Toml"],
  ["src/federation/", "SEPs / Federation"],
  ["src/webauth/", "SEPs / WebAuth"],
  ["src/errors/", "Errors"],
];

type RouteResult = BucketName | "external" | "unmapped";

function bucketForPath(path: string): RouteResult {
  if (!path.startsWith("src/")) return "external";
  if (path.startsWith("src/base/generated/")) return "external";
  const override = FILE_OVERRIDES[path];
  if (override !== undefined) return override;
  for (const [prefix, bucket] of DIRECTORY_PREFIXES) {
    if (path.startsWith(prefix)) return bucket;
  }
  return "unmapped";
}

// TypeDoc 0.28 ReflectionKind numeric codes (the JSON model uses these).
const KIND_PROJECT = 1;
const KIND_MODULE = 2;
const KIND_NAMESPACE = 4;
const KIND_ENUM = 8;
const KIND_VARIABLE = 32;
const KIND_FUNCTION = 64;
const KIND_CLASS = 128;
const KIND_INTERFACE = 256;
const KIND_CONSTRUCTOR = 512;
const KIND_PROPERTY = 1024;
const KIND_METHOD = 2048;
const KIND_ACCESSOR = 262144;
const KIND_TYPE_ALIAS = 2097152;

const KIND_CALL_SIGNATURE = 4096;
const KIND_CONSTRUCTOR_SIGNATURE = 16384;

// Member kinds that we render as H3 sub-blocks under their parent
// class or interface.
const MEMBER_KINDS = new Set<number>([
  KIND_CONSTRUCTOR,
  KIND_PROPERTY,
  KIND_METHOD,
  KIND_ACCESSOR,
]);

const TARGET_KINDS = new Set<number>([
  KIND_ENUM,
  KIND_VARIABLE,
  KIND_FUNCTION,
  KIND_CLASS,
  KIND_INTERFACE,
  KIND_TYPE_ALIAS,
]);

const CONTAINER_KINDS = new Set<number>([
  KIND_PROJECT,
  KIND_MODULE,
  KIND_NAMESPACE,
]);

// === TypeDoc JSON-model shapes (subset used by the renderer) ===

type LiteralValue =
  | string
  | number
  | boolean
  | null
  | { value: string; negative: boolean };

interface SummaryDisplayPart {
  kind: "text" | "code" | "inline-tag";
  text: string;
  tag?: string;
}

interface Comment {
  summary?: SummaryDisplayPart[];
  blockTags?: { tag: string; content?: SummaryDisplayPart[] }[];
}

type TDType =
  | { type: "intrinsic"; name: string }
  | { type: "literal"; value: LiteralValue }
  | {
      type: "reference";
      name: string;
      qualifiedName?: string;
      typeArguments?: TDType[];
    }
  | { type: "array"; elementType: TDType }
  | { type: "union"; types: TDType[] }
  | { type: "intersection"; types: TDType[] }
  | { type: "tuple"; elements?: TDType[] }
  | {
      type: "namedTupleMember";
      name: string;
      isOptional?: boolean;
      element: TDType;
    }
  | {
      type: "conditional";
      checkType: TDType;
      extendsType: TDType;
      trueType: TDType;
      falseType: TDType;
    }
  | { type: "indexedAccess"; indexType: TDType; objectType: TDType }
  | { type: "inferred"; name: string; constraint?: TDType }
  | {
      type: "mapped";
      parameter: string;
      parameterType: TDType;
      templateType: TDType;
      optionalModifier?: "+" | "-";
      readonlyModifier?: "+" | "-";
      nameType?: TDType;
    }
  | { type: "optional"; elementType: TDType }
  | { type: "predicate"; name: string; asserts: boolean; targetType?: TDType }
  | { type: "query"; queryType: TDType }
  | { type: "reflection"; declaration: Reflection }
  | { type: "rest"; elementType: TDType }
  | { type: "templateLiteral"; head: string; tail: [TDType, string][] }
  | {
      type: "typeOperator";
      operator: "keyof" | "unique" | "readonly";
      target: TDType;
    }
  | { type: "unknown"; name: string };

interface ReflectionFlags {
  isStatic?: boolean;
  isOptional?: boolean;
  isRest?: boolean;
  isReadonly?: boolean;
  isConst?: boolean;
  isPrivate?: boolean;
  isProtected?: boolean;
}

interface SourceLocation {
  fileName: string;
  line: number;
}

interface Reflection {
  id: number;
  name: string;
  kind: number;
  flags?: ReflectionFlags;
  sources?: SourceLocation[];
  children?: Reflection[];
  comment?: Comment;
  signatures?: Reflection[];
  parameters?: Reflection[];
  type?: TDType;
  extendedTypes?: TDType[];
  implementedTypes?: TDType[];
  typeParameters?: Reflection[];
  defaultValue?: string;
  varianceModifier?: "in" | "out" | "in out";
  default?: TDType;
  indexSignature?: Reflection;
  indexSignatures?: Reflection[];
  // Accessor reflections (kind 262144) carry getter/setter as
  // dedicated signature fields instead of `signatures[]`.
  getSignature?: Reflection;
  setSignature?: Reflection;
}

interface SymbolRecord {
  qname: string;
  kind: number;
  bucket: BucketName;
  sourceFilePath: string;
  sourceLine: number;
  refl: Reflection;
  // Public members of a class or interface, attached at walk time so
  // `renderSymbolBlock` can emit a class body declaration plus H3
  // sub-blocks per member. Empty/absent for non-class/interface kinds.
  members?: Reflection[];
}

interface UnmappedSymbol {
  qname: string;
  kind: number;
  sourceFilePath: string;
  sourceLine: number;
}

function collectPublicMembers(refl: Reflection): Reflection[] {
  return (refl.children ?? []).filter(
    (child) =>
      MEMBER_KINDS.has(child.kind) &&
      child.flags?.isPrivate !== true &&
      child.flags?.isProtected !== true,
  );
}

function walkReflection(
  refl: Reflection,
  path: string[],
  collected: SymbolRecord[],
  unmapped: UnmappedSymbol[],
): void {
  if (TARGET_KINDS.has(refl.kind)) {
    const qname =
      path.length > 0 ? `${path.join(".")}.${refl.name}` : refl.name;
    const source = refl.sources?.[0];
    const sourceFilePath = source?.fileName ?? "";
    const sourceLine = source?.line ?? 0;
    const route = bucketForPath(sourceFilePath);
    if (route === "external") {
      // Silently skip type augmentations from third-party packages
      // and generated XDR (already excluded via typedoc.json).
    } else if (route === "unmapped") {
      unmapped.push({ qname, kind: refl.kind, sourceFilePath, sourceLine });
    } else {
      const record: SymbolRecord = {
        qname,
        kind: refl.kind,
        bucket: route,
        sourceFilePath,
        sourceLine,
        refl,
      };
      if (refl.kind === KIND_CLASS || refl.kind === KIND_INTERFACE) {
        record.members = collectPublicMembers(refl);
      }
      collected.push(record);
    }
  }

  if (CONTAINER_KINDS.has(refl.kind)) {
    const childPath = refl.kind === KIND_PROJECT ? path : [...path, refl.name];
    for (const child of refl.children ?? []) {
      walkReflection(child, childPath, collected, unmapped);
    }
  }
}

// === Type AST rendering ===

// Wrap a subterm in parens when it would otherwise reparse incorrectly
// in an array/typeOperator/indexedAccess host context.
function needsParens(t: TDType): boolean {
  if (
    t.type === "union" ||
    t.type === "intersection" ||
    t.type === "conditional"
  ) {
    return true;
  }
  if (t.type === "reflection") {
    const sig = t.declaration.signatures?.[0];
    if (
      sig !== undefined &&
      (sig.kind === KIND_CALL_SIGNATURE ||
        sig.kind === KIND_CONSTRUCTOR_SIGNATURE)
    ) {
      return true;
    }
  }
  return false;
}

function renderTypeAtom(t: TDType): string {
  return needsParens(t) ? `(${renderType(t)})` : renderType(t);
}

function renderType(t: TDType): string {
  switch (t.type) {
    case "intrinsic":
      return t.name;
    case "literal":
      return renderLiteralValue(t.value);
    case "reference": {
      const args = t.typeArguments;
      if (args !== undefined && args.length > 0) {
        return `${t.name}<${args.map(renderType).join(", ")}>`;
      }
      return t.name;
    }
    case "array":
      return `${renderTypeAtom(t.elementType)}[]`;
    case "union":
      return t.types.map(renderTypeAtom).join(" | ");
    case "intersection":
      return t.types.map(renderTypeAtom).join(" & ");
    case "tuple":
      return `[${(t.elements ?? []).map(renderType).join(", ")}]`;
    case "namedTupleMember":
      return `${t.name}${t.isOptional === true ? "?" : ""}: ${renderType(t.element)}`;
    case "conditional":
      return `${renderTypeAtom(t.checkType)} extends ${renderTypeAtom(t.extendsType)} ? ${renderType(t.trueType)} : ${renderType(t.falseType)}`;
    case "indexedAccess":
      return `${renderTypeAtom(t.objectType)}[${renderType(t.indexType)}]`;
    case "inferred":
      return t.constraint !== undefined
        ? `infer ${t.name} extends ${renderType(t.constraint)}`
        : `infer ${t.name}`;
    case "mapped":
      return renderMappedType(t);
    case "optional":
      return `${renderType(t.elementType)}?`;
    case "predicate":
      return renderPredicateType(t);
    case "query":
      return `typeof ${renderType(t.queryType)}`;
    case "reflection":
      return renderReflectionType(t.declaration);
    case "rest":
      return `...${renderTypeAtom(t.elementType)}`;
    case "templateLiteral":
      return renderTemplateLiteralType(t);
    case "typeOperator":
      return `${t.operator} ${renderTypeAtom(t.target)}`;
    case "unknown":
      return t.name;
    default: {
      const exhaustive: never = t;
      void exhaustive;
      throw new Error(
        `Unhandled TypeDoc type kind: ${JSON.stringify(t).slice(0, 200)}`,
      );
    }
  }
}

function renderLiteralValue(value: LiteralValue): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);
  if (typeof value === "object" && "value" in value) {
    return `${value.negative ? "-" : ""}${value.value}n`;
  }
  throw new Error(`Unhandled literal value: ${JSON.stringify(value)}`);
}

function renderMappedType(t: {
  parameter: string;
  parameterType: TDType;
  templateType: TDType;
  optionalModifier?: "+" | "-";
  readonlyModifier?: "+" | "-";
  nameType?: TDType;
}): string {
  const readonlyMod =
    t.readonlyModifier === "+"
      ? "readonly "
      : t.readonlyModifier === "-"
        ? "-readonly "
        : "";
  const optMod =
    t.optionalModifier === "+" ? "?" : t.optionalModifier === "-" ? "-?" : "";
  const nameClause =
    t.nameType !== undefined ? ` as ${renderType(t.nameType)}` : "";
  return `{ ${readonlyMod}[${t.parameter} in ${renderType(t.parameterType)}${nameClause}]${optMod}: ${renderType(t.templateType)} }`;
}

function renderPredicateType(t: {
  name: string;
  asserts: boolean;
  targetType?: TDType;
}): string {
  if (t.asserts) {
    return t.targetType !== undefined
      ? `asserts ${t.name} is ${renderType(t.targetType)}`
      : `asserts ${t.name}`;
  }
  if (t.targetType !== undefined) {
    return `${t.name} is ${renderType(t.targetType)}`;
  }
  throw new Error(
    `Predicate type with no targetType and not asserts: ${t.name}`,
  );
}

function renderTemplateLiteralType(t: {
  head: string;
  tail: [TDType, string][];
}): string {
  let out = t.head;
  for (const [tt, suffix] of t.tail) {
    out += "${" + renderType(tt) + "}" + suffix;
  }
  return "`" + out + "`";
}

function renderReflectionType(decl: Reflection): string {
  const sig = decl.signatures?.[0];
  if (
    sig !== undefined &&
    (sig.kind === KIND_CALL_SIGNATURE ||
      sig.kind === KIND_CONSTRUCTOR_SIGNATURE)
  ) {
    const newPrefix = sig.kind === KIND_CONSTRUCTOR_SIGNATURE ? "new " : "";
    const tparams = renderTypeParameters(sig.typeParameters);
    const params = renderParameters(sig.parameters ?? []);
    const ret = sig.type !== undefined ? renderType(sig.type) : "unknown";
    return `${newPrefix}${tparams}(${params}) => ${ret}`;
  }
  // Object literal type: properties, methods, and (optionally) index sigs.
  const members: string[] = [];
  for (const child of decl.children ?? []) {
    if (child.signatures !== undefined && child.signatures.length > 0) {
      const childSig = child.signatures[0];
      const tparams = renderTypeParameters(childSig.typeParameters);
      const params = renderParameters(childSig.parameters ?? []);
      const ret =
        childSig.type !== undefined ? renderType(childSig.type) : "unknown";
      members.push(`${child.name}${tparams}(${params}): ${ret}`);
    } else if (child.type !== undefined) {
      const optional = child.flags?.isOptional === true ? "?" : "";
      const readonly = child.flags?.isReadonly === true ? "readonly " : "";
      members.push(
        `${readonly}${child.name}${optional}: ${renderType(child.type)}`,
      );
    }
  }
  const indexSigs =
    decl.indexSignatures ??
    (decl.indexSignature !== undefined ? [decl.indexSignature] : []);
  for (const idx of indexSigs) {
    const params = renderParameters(idx.parameters ?? []);
    const ret = idx.type !== undefined ? renderType(idx.type) : "unknown";
    members.push(`[${params}]: ${ret}`);
  }
  if (members.length === 0) return "{}";
  return `{ ${members.join("; ")} }`;
}

function renderTypeParameters(tps: Reflection[] | undefined): string {
  if (tps === undefined || tps.length === 0) return "";
  const parts = tps.map((tp) => {
    const variance =
      tp.varianceModifier !== undefined ? `${tp.varianceModifier} ` : "";
    const constraint =
      tp.type !== undefined ? ` extends ${renderType(tp.type)}` : "";
    const def = tp.default !== undefined ? ` = ${renderType(tp.default)}` : "";
    return `${variance}${tp.name}${constraint}${def}`;
  });
  return `<${parts.join(", ")}>`;
}

function renderParameters(params: Reflection[]): string {
  return params
    .map((p) => {
      const rest = p.flags?.isRest === true ? "..." : "";
      const optional = p.flags?.isOptional === true ? "?" : "";
      const typeStr = p.type !== undefined ? renderType(p.type) : "unknown";
      const defaultStr =
        p.defaultValue !== undefined ? ` = ${p.defaultValue}` : "";
      return `${rest}${p.name}${optional}: ${typeStr}${defaultStr}`;
    })
    .join(", ");
}

// === Per-symbol signature rendering ===

// Per-line declaration of a class/interface member, used inside the
// synthesized class/interface body. No trailing semicolon — caller adds.
function renderMemberDeclarationLine(m: Reflection): string {
  const isStatic = m.flags?.isStatic === true;
  const staticPrefix = isStatic ? "static " : "";

  if (m.kind === KIND_CONSTRUCTOR) {
    const sig = m.signatures?.[0];
    if (sig === undefined) {
      throw new Error(`Constructor reflection has no signatures`);
    }
    const params = renderParameters(sig.parameters ?? []);
    return `constructor(${params})`;
  }

  if (m.kind === KIND_PROPERTY) {
    const readonly = m.flags?.isReadonly === true ? "readonly " : "";
    const optional = m.flags?.isOptional === true ? "?" : "";
    const t = m.type !== undefined ? renderType(m.type) : "unknown";
    return `${staticPrefix}${readonly}${m.name}${optional}: ${t}`;
  }

  if (m.kind === KIND_METHOD) {
    const sig = m.signatures?.[0];
    if (sig === undefined) {
      throw new Error(`Method reflection ${m.name} has no signatures`);
    }
    const tparams = renderTypeParameters(sig.typeParameters);
    const params = renderParameters(sig.parameters ?? []);
    const ret = sig.type !== undefined ? renderType(sig.type) : "unknown";
    return `${staticPrefix}${m.name}${tparams}(${params}): ${ret}`;
  }

  if (m.kind === KIND_ACCESSOR) {
    // TypeDoc represents accessors as kind 262144 with getSignature
    // and/or setSignature sub-reflections. For the body declaration
    // we surface the accessor as a property; readonly when only a
    // getter exists.
    const getter = m.getSignature;
    const setter = m.setSignature;
    if (getter !== undefined) {
      const t = getter.type !== undefined ? renderType(getter.type) : "unknown";
      const readonly = setter === undefined ? "readonly " : "";
      return `${staticPrefix}${readonly}${m.name}: ${t}`;
    }
    if (setter !== undefined) {
      const param = setter.parameters?.[0];
      const t = param?.type !== undefined ? renderType(param.type) : "unknown";
      return `${staticPrefix}${m.name}: ${t}`;
    }
    throw new Error(
      `Accessor ${m.name} has neither getSignature nor setSignature`,
    );
  }

  throw new Error(
    `Unhandled member kind ${m.kind} for ${m.name} (expected constructor, property, method, or accessor)`,
  );
}

// Sort key for class/interface members. Primary order:
// constructor → static → instance properties → instance accessors →
// instance methods. Within each group, TypeDoc's emitted order is
// preserved (Array.prototype.sort is stable in modern V8).
function memberSortKey(m: Reflection): number {
  if (m.kind === KIND_CONSTRUCTOR) return 0;
  const isStatic = m.flags?.isStatic === true;
  if (isStatic) return 1;
  if (m.kind === KIND_PROPERTY) return 2;
  if (m.kind === KIND_ACCESSOR) return 3;
  if (m.kind === KIND_METHOD) return 4;
  return 5;
}

function sortMembers(members: Reflection[]): Reflection[] {
  return [...members].sort((a, b) => memberSortKey(a) - memberSortKey(b));
}

// Synthesize a full class declaration with all public members on
// individual lines inside the body. Used as the main code-fence
// content for an H2 class block.
function renderClassDeclaration(
  refl: Reflection,
  members: Reflection[],
): string {
  const tparams = renderTypeParameters(refl.typeParameters);
  const ext =
    refl.extendedTypes !== undefined && refl.extendedTypes.length > 0
      ? ` extends ${refl.extendedTypes.map(renderType).join(", ")}`
      : "";
  const impl =
    refl.implementedTypes !== undefined && refl.implementedTypes.length > 0
      ? ` implements ${refl.implementedTypes.map(renderType).join(", ")}`
      : "";
  const head = `class ${refl.name}${tparams}${ext}${impl}`;
  if (members.length === 0) return head;
  const lines = sortMembers(members).map(
    (m) => `  ${renderMemberDeclarationLine(m)};`,
  );
  return `${head} {\n${lines.join("\n")}\n}`;
}

function renderInterfaceDeclaration(
  refl: Reflection,
  members: Reflection[],
): string {
  const tparams = renderTypeParameters(refl.typeParameters);
  const ext =
    refl.extendedTypes !== undefined && refl.extendedTypes.length > 0
      ? ` extends ${refl.extendedTypes.map(renderType).join(", ")}`
      : "";
  const head = `interface ${refl.name}${tparams}${ext}`;
  if (members.length === 0) return head;
  const lines = sortMembers(members).map(
    (m) => `  ${renderMemberDeclarationLine(m)};`,
  );
  return `${head} {\n${lines.join("\n")}\n}`;
}

function renderSignature(refl: Reflection): string {
  switch (refl.kind) {
    case KIND_TYPE_ALIAS: {
      const tparams = renderTypeParameters(refl.typeParameters);
      const rhs = refl.type !== undefined ? renderType(refl.type) : "unknown";
      return `type ${refl.name}${tparams} = ${rhs}`;
    }
    case KIND_FUNCTION: {
      const sig = refl.signatures?.[0];
      if (sig === undefined) {
        throw new Error(`Function reflection ${refl.name} has no signatures`);
      }
      const tparams = renderTypeParameters(sig.typeParameters);
      const params = renderParameters(sig.parameters ?? []);
      const ret = sig.type !== undefined ? renderType(sig.type) : "unknown";
      return `${refl.name}${tparams}(${params}): ${ret}`;
    }
    case KIND_VARIABLE: {
      const t = refl.type !== undefined ? renderType(refl.type) : "unknown";
      return `const ${refl.name}: ${t}`;
    }
    case KIND_ENUM:
      return `enum ${refl.name}`;
  }
  throw new Error(
    `renderSignature: unexpected kind ${refl.kind} for ${refl.name} (classes/interfaces use renderClassDeclaration/renderInterfaceDeclaration)`,
  );
}

// === Summary rendering ===

// Slugifier matching Starlight's heading-id rule: lowercase, collapse
// runs of whitespace into `-`, then strip everything that isn't
// `[a-z0-9-]`. Verified against built `dist/site/reference/*.html`
// anchor ids — must stay aligned with Starlight's behavior, since
// `{@link}` resolution emits anchors that those rendered pages
// expose.
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

interface ResolvedLink {
  bucket: BucketName;
  slug: string;
  anchor: string;
}

interface LinkResolver {
  resolve(target: string, currentBucket: BucketName): string | undefined;
}

function buildLinkResolver(records: SymbolRecord[]): LinkResolver {
  const map = new Map<string, ResolvedLink>();
  for (const record of records) {
    const slug = BUCKET_TO_SLUG[record.bucket];
    map.set(record.qname, {
      bucket: record.bucket,
      slug,
      anchor: slugifyHeading(record.qname),
    });
    for (const m of record.members ?? []) {
      const memberQname = `${record.qname}.${m.name}`;
      const headingText = memberHeadingText(m, record.refl.name);
      map.set(memberQname, {
        bucket: record.bucket,
        slug,
        anchor: slugifyHeading(headingText),
      });
    }
  }
  return {
    resolve(target, currentBucket) {
      const entry = map.get(target);
      if (entry === undefined) return undefined;
      // Same-file links keep the relative path empty; cross-file links
      // emit `./<slug>.md#<anchor>` so raw markdown viewers (e.g. plain
      // GitHub view) follow the link to the right file regardless of
      // any specific docs-platform URL scheme.
      const anchor = `#${entry.anchor}`;
      return entry.bucket === currentBucket
        ? anchor
        : `./${entry.slug}.md${anchor}`;
    },
  };
}

// Module-level state set during the rendering pass so renderSummary
// can resolve `{@link}` parts without threading the resolver through
// every render-function signature. Cleared after the pass for safety.
let currentLinkResolver: LinkResolver | undefined;
let currentRenderBucket: BucketName | undefined;

// Match `{@link Target}` or `{@link Target | display}` — used to
// recover link references that TypeDoc emitted as code parts because
// the source TSDoc wrapped them in backticks. The captured groups are
// (target, optionalDisplay).
const BACKTICKED_LINK_RE =
  /^`?\{@(?:link|linkcode|linkplain)\s+([^}|]+?)(?:\s*\|\s*([^}]+?))?\s*\}`?$/;

function resolveLinkPart(target: string, display: string): string {
  if (currentLinkResolver !== undefined && currentRenderBucket !== undefined) {
    const url = currentLinkResolver.resolve(target, currentRenderBucket);
    if (url !== undefined) {
      return `[\`${display}\`](${url})`;
    }
  }
  // Unresolved: render as inline code so the reference at least
  // visually distinguishes itself from prose, even without a link.
  return `\`${display}\``;
}

function renderSummary(parts: SummaryDisplayPart[] | undefined): string {
  if (parts === undefined || parts.length === 0) return "";
  return parts
    .map((p) => {
      if (p.kind === "text") return p.text;
      if (p.kind === "code") {
        // Recovery for source TSDoc that wraps `{@link Foo}` in
        // backticks. TypeDoc emits the whole thing as a single `code`
        // part instead of an `inline-tag`, so we re-parse it here and
        // resolve to a styled markdown link if we can.
        const m = BACKTICKED_LINK_RE.exec(p.text);
        if (m !== null) {
          const target = m[1].trim();
          const display = (m[2] ?? m[1]).trim();
          return resolveLinkPart(target, display);
        }
        return p.text;
      }
      if (p.kind === "inline-tag") {
        if (p.tag === undefined) {
          throw new Error(
            `Inline tag part missing tag: ${JSON.stringify(p).slice(0, 200)}`,
          );
        }
        if (
          p.tag === "@link" ||
          p.tag === "@linkcode" ||
          p.tag === "@linkplain"
        ) {
          // `{@link Foo | display}` parts arrive with `text` already
          // resolved to the display text by TypeDoc; `target` carries
          // the symbol path. Use `target` for resolution and `text`
          // for display, falling back to `text` for both when
          // `target` is absent.
          const target = (p as SummaryDisplayPart & { target?: string }).target;
          return resolveLinkPart(target ?? p.text, p.text);
        }
        return `{${p.tag} ${p.text}}`;
      }
      throw new Error(
        `Unhandled summary part kind: ${JSON.stringify(p).slice(0, 200)}`,
      );
    })
    .join("")
    .trim();
}

function findComment(refl: Reflection): Comment | undefined {
  return refl.comment ?? refl.signatures?.[0]?.comment;
}

// === Block-tag extraction and section rendering ===

interface ExtractedTags {
  deprecated?: SummaryDisplayPart[];
  returns?: SummaryDisplayPart[];
  warning?: SummaryDisplayPart[];
  throws: SummaryDisplayPart[][];
  examples: SummaryDisplayPart[][];
  see: SummaryDisplayPart[][];
}

function extractTags(comment: Comment | undefined): ExtractedTags {
  const tags: ExtractedTags = { throws: [], examples: [], see: [] };
  if (comment === undefined) return tags;
  for (const bt of comment.blockTags ?? []) {
    const content = bt.content ?? [];
    if (bt.tag === "@deprecated") tags.deprecated = content;
    else if (bt.tag === "@returns") tags.returns = content;
    else if (bt.tag === "@warning") tags.warning = content;
    else if (bt.tag === "@throws") tags.throws.push(content);
    else if (bt.tag === "@example") tags.examples.push(content);
    else if (bt.tag === "@see") tags.see.push(content);
  }
  return tags;
}

function renderDeprecatedParagraph(
  content: SummaryDisplayPart[] | undefined,
): string {
  if (content === undefined) return "";
  const desc = renderSummary(content);
  return desc.length > 0 ? `**Deprecated.** ${desc}` : "**Deprecated.**";
}

// Stripe-style parameter rendering: bullet per param with bold name,
// code-spanned type, required/optional indicator, and prose
// description from `@param` if present. Multi-line descriptions
// (e.g. with embedded sub-bullets describing object fields) are
// re-indented so nested markdown still parses as a continuation of
// the param's bullet.
function renderParametersSection(sig: Reflection | undefined): string {
  const params = sig?.parameters ?? [];
  if (params.length === 0) return "";
  const bullets: string[] = [];
  for (const p of params) {
    const rest = p.flags?.isRest === true ? "..." : "";
    const optional =
      p.flags?.isOptional === true || p.defaultValue !== undefined;
    const requiredTag = optional ? "optional" : "required";
    const typeStr = p.type !== undefined ? renderType(p.type) : "unknown";
    const defaultStr =
      p.defaultValue !== undefined ? ` (default: \`${p.defaultValue}\`)` : "";
    const desc = renderSummary(p.comment?.summary);
    const head = `- **\`${rest}${p.name}\`** — \`${typeStr}\` (${requiredTag})${defaultStr}`;
    if (desc.length === 0) {
      bullets.push(head);
    } else {
      const indented = desc
        .split("\n")
        .map((line, i) => (i === 0 ? line : `  ${line}`))
        .join("\n");
      bullets.push(`${head} — ${indented}`);
    }
  }
  return `**Parameters**\n\n${bullets.join("\n")}`;
}

function renderReturnsSection(
  content: SummaryDisplayPart[] | undefined,
): string {
  if (content === undefined) return "";
  const desc = renderSummary(content);
  if (desc.length === 0) return "";
  return `**Returns**\n\n${desc}`;
}

function renderThrowsSection(contents: SummaryDisplayPart[][]): string {
  const bullets: string[] = [];
  for (const c of contents) {
    const desc = renderSummary(c);
    if (desc.length === 0) continue;
    bullets.push(`- ${desc}`);
  }
  if (bullets.length === 0) return "";
  return `**Throws**\n\n${bullets.join("\n")}`;
}

// TypeDoc emits the entire `@example` fence as a single `code`-kind
// summary part. When the source omits the language tag, prepend `ts`
// so the rendered markdown highlights as TypeScript.
function ensureExampleLanguageHint(text: string): string {
  return text.replace(/^```\n/, "```ts\n");
}

function renderExamplesSection(contents: SummaryDisplayPart[][]): string {
  const blocks: string[] = [];
  for (const c of contents) {
    const text = renderSummary(c);
    if (text.length === 0) continue;
    blocks.push(`**Example**\n\n${ensureExampleLanguageHint(text)}`);
  }
  return blocks.join("\n\n");
}

function renderSeeSection(contents: SummaryDisplayPart[][]): string {
  const bullets: string[] = [];
  for (const c of contents) {
    const desc = renderSummary(c);
    if (desc.length === 0) continue;
    bullets.push(`- ${desc}`);
  }
  if (bullets.length === 0) return "";
  return `**See also**\n\n${bullets.join("\n")}`;
}

function renderWarningSection(
  content: SummaryDisplayPart[] | undefined,
): string {
  if (content === undefined) return "";
  const desc = renderSummary(content);
  if (desc.length === 0) return "";
  return `**Warning**\n\n${desc}`;
}

// === Per-symbol block ===

// H3 heading text (without the `### ` prefix or backtick wrappers)
// for a class/interface member. Used both for emitting the heading
// and for computing its anchor slug for `{@link}` resolution.
// Conveys static vs instance via heading shape (no separate `static`
// indicator):
//   - constructor:           `new ClassName(args)`
//   - static method:         `ClassName.method(args)`
//   - static property:       `ClassName.prop`
//   - instance method:       `instance.method(args)` (lower-cased ClassName)
//   - instance property:     `instance.prop`
function memberHeadingText(m: Reflection, parentName: string): string {
  const isStatic = m.flags?.isStatic === true;
  const instanceReceiver =
    parentName.charAt(0).toLowerCase() + parentName.slice(1);

  if (m.kind === KIND_CONSTRUCTOR) {
    const sig = m.signatures?.[0];
    const paramNames = (sig?.parameters ?? []).map((p) => p.name).join(", ");
    return `new ${parentName}(${paramNames})`;
  }

  if (m.kind === KIND_PROPERTY || m.kind === KIND_ACCESSOR) {
    const receiver = isStatic ? parentName : instanceReceiver;
    return `${receiver}.${m.name}`;
  }

  if (m.kind === KIND_METHOD) {
    const receiver = isStatic ? parentName : instanceReceiver;
    const sig = m.signatures?.[0];
    const paramNames = (sig?.parameters ?? []).map((p) => p.name).join(", ");
    return `${receiver}.${m.name}(${paramNames})`;
  }

  throw new Error(`memberHeadingText: unhandled kind ${m.kind} for ${m.name}`);
}

function renderMemberHeading(m: Reflection, parentName: string): string {
  return `### \`${memberHeadingText(m, parentName)}\``;
}

// One H3 sub-block per public member: heading, summary, ts code fence
// of the member's own signature, params/returns/throws/examples
// sections, source link.
function renderMemberBlock(
  m: Reflection,
  parentName: string,
  sourceRef: string,
): string {
  const heading = renderMemberHeading(m, parentName);

  // Comment lives on the member directly for properties, on the
  // first signature for callable members.
  const comment =
    m.comment ??
    m.signatures?.[0]?.comment ??
    m.getSignature?.comment ??
    m.setSignature?.comment;
  const tags = extractTags(comment);

  const deprecated = renderDeprecatedParagraph(tags.deprecated);
  const summary = renderSummary(comment?.summary);
  const fence = `\`\`\`ts\n${renderMemberDeclarationLine(m)};\n\`\`\``;

  // For callable members, use signatures[0] for params/returns. For
  // accessors, use getSignature for return-shape.
  const callable = m.signatures?.[0] ?? m.getSignature;
  const params =
    callable !== undefined ? renderParametersSection(callable) : "";
  const returnsTag =
    tags.returns ??
    callable?.comment?.blockTags?.find((t) => t.tag === "@returns")?.content;
  const returns = renderReturnsSection(returnsTag);
  const throwsSection = renderThrowsSection(tags.throws);
  const examples = renderExamplesSection(tags.examples);
  const see = renderSeeSection(tags.see);
  const warning = renderWarningSection(tags.warning);

  const memberSource = m.sources?.[0];
  const sourceLink =
    memberSource !== undefined
      ? `**Source:** [${memberSource.fileName}:${memberSource.line}](https://github.com/${REPO_SLUG}/blob/${sourceRef}/${memberSource.fileName}#L${memberSource.line})`
      : "";

  const sections = [
    heading,
    deprecated,
    summary,
    fence,
    params,
    returns,
    throwsSection,
    examples,
    see,
    warning,
    sourceLink,
  ];
  return sections.filter((s) => s.length > 0).join("\n\n");
}

function renderSymbolBlock(record: SymbolRecord, sourceRef: string): string {
  try {
    const comment = findComment(record.refl);
    const tags = extractTags(comment);

    const heading = `## ${record.qname}`;
    const deprecated = renderDeprecatedParagraph(tags.deprecated);
    const summary = renderSummary(comment?.summary);

    // Class/interface get a synthesized full-body declaration in the
    // code fence; everything else uses renderSignature.
    const isClassLike =
      record.kind === KIND_CLASS || record.kind === KIND_INTERFACE;
    const decl = isClassLike
      ? record.kind === KIND_CLASS
        ? renderClassDeclaration(record.refl, record.members ?? [])
        : renderInterfaceDeclaration(record.refl, record.members ?? [])
      : renderSignature(record.refl);
    const fence = `\`\`\`ts\n${decl}\n\`\`\``;

    // Top-level params/returns only apply to function-like top-level
    // symbols. For classes/interfaces, those sections live on the
    // per-member H3 blocks instead.
    const params = isClassLike
      ? ""
      : renderParametersSection(record.refl.signatures?.[0]);
    const returns = isClassLike ? "" : renderReturnsSection(tags.returns);
    const throwsSection = isClassLike ? "" : renderThrowsSection(tags.throws);

    const examples = renderExamplesSection(tags.examples);
    const see = renderSeeSection(tags.see);
    const warning = renderWarningSection(tags.warning);
    const sourceLink = `**Source:** [${record.sourceFilePath}:${record.sourceLine}](https://github.com/${REPO_SLUG}/blob/${sourceRef}/${record.sourceFilePath}#L${record.sourceLine})`;

    const memberBlocks = isClassLike
      ? sortMembers(record.members ?? []).map((m) =>
          renderMemberBlock(m, record.refl.name, sourceRef),
        )
      : [];

    const sections = [
      heading,
      deprecated,
      summary,
      fence,
      params,
      returns,
      throwsSection,
      examples,
      see,
      warning,
      sourceLink,
      ...memberBlocks,
    ];
    return sections.filter((s) => s.length > 0).join("\n\n");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Failed to render symbol ${record.qname} at ${record.sourceFilePath}:${record.sourceLine}: ${msg}`,
    );
  }
}

// === File rendering ===

function compareSymbols(a: SymbolRecord, b: SymbolRecord): number {
  if (a.qname !== b.qname) return a.qname < b.qname ? -1 : 1;
  if (a.sourceFilePath !== b.sourceFilePath) {
    return a.sourceFilePath < b.sourceFilePath ? -1 : 1;
  }
  return a.sourceLine - b.sourceLine;
}

function renderFile(
  bucketName: BucketName,
  symbols: SymbolRecord[],
  sourceRef: string,
): string {
  const sorted = [...symbols].sort(compareSymbols);
  const header = [
    "---",
    `title: ${bucketName}`,
    "---",
    "",
    `# ${bucketName}`,
  ].join("\n");
  if (sorted.length === 0) {
    return `${header}\n`;
  }
  // Set the current bucket so `renderSummary` can decide same-file vs
  // cross-file `{@link}` resolution. Cleared in `main()` after all
  // files render.
  currentRenderBucket = bucketName;
  const blocks = sorted
    .map((s) => renderSymbolBlock(s, sourceRef))
    .join("\n\n");
  return `${header}\n\n${blocks}\n`;
}

function main(): void {
  console.log("Running typedoc to refresh api.json...");
  execSync("pnpm exec typedoc", { stdio: "inherit", cwd: REPO_ROOT });

  const pkg = JSON.parse(
    readFileSync(join(REPO_ROOT, "package.json"), "utf8"),
  ) as { version: string };
  console.log(
    `Building reference docs: SDK v${pkg.version} with source ref '${DOCS_SOURCE_REF}'`,
  );

  const project = JSON.parse(readFileSync(TYPEDOC_JSON, "utf8")) as Reflection;

  const collected: SymbolRecord[] = [];
  const unmapped: UnmappedSymbol[] = [];
  walkReflection(project, [], collected, unmapped);

  if (unmapped.length > 0) {
    console.error(
      `[error] ${unmapped.length} target-kind symbol(s) live in src/ but match no FILE_OVERRIDES or DIRECTORY_PREFIXES rule:`,
    );
    for (const u of unmapped) {
      console.error(
        `  [unmapped] ${u.qname} at ${u.sourceFilePath}:${u.sourceLine}: add a routing rule in scripts/build-docs.ts.`,
      );
    }
    process.exit(1);
  }

  const byBucket = new Map<BucketName, SymbolRecord[]>(
    (Object.keys(BUCKET_TO_SLUG) as BucketName[]).map((b) => [b, []]),
  );
  for (const r of collected) {
    const list = byBucket.get(r.bucket);
    if (list === undefined) {
      throw new Error(
        `Internal: missing bucket for "${r.bucket}" — pre-population gap`,
      );
    }
    list.push(r);
  }

  // Build the qname → bucket/anchor map after collection so that
  // `{@link Foo}` references in any TSDoc summary can resolve to a
  // relative markdown URL during rendering. Set as module-level state
  // since renderSummary is called transitively from many sites and
  // threading the resolver as a parameter would touch every layer.
  currentLinkResolver = buildLinkResolver(collected);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  let totalSymbols = 0;
  for (const [bucket, slug] of Object.entries(BUCKET_TO_SLUG) as [
    BucketName,
    string,
  ][]) {
    const list = byBucket.get(bucket);
    if (list === undefined) {
      throw new Error(`Internal: bucket "${bucket}" not pre-populated`);
    }
    const content = renderFile(bucket, list, DOCS_SOURCE_REF);
    writeFileSync(join(OUTPUT_DIR, `${slug}.md`), content, "utf8");
    console.log(`  ${slug}.md: ${list.length} symbol(s)`);
    totalSymbols += list.length;
  }
  currentLinkResolver = undefined;
  currentRenderBucket = undefined;
  console.log(
    `Wrote 16 reference files (${totalSymbols} symbols) to ${OUTPUT_DIR}.`,
  );
}

main();
