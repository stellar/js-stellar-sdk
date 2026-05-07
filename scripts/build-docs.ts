/**
 * Phase 1.b emitter. Walks api.json from typedoc, routes each public
 * symbol to a bucket by source file path, and writes one markdown
 * file per bucket to `docs/reference/`. Each symbol is rendered as
 * an H2 block with a summary, a TS-fenced declaration signature, and
 * a commit-pinned source link. See `.claude/notes/docs-plan.md` →
 * "scripts/build-docs.ts — phased implementation" for the full
 * multi-phase plan.
 */

import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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
const KIND_TYPE_ALIAS = 2097152;

const KIND_CALL_SIGNATURE = 4096;
const KIND_CONSTRUCTOR_SIGNATURE = 16384;

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
}

interface SymbolRecord {
  qname: string;
  kind: number;
  bucket: BucketName;
  sourceFilePath: string;
  sourceLine: number;
  refl: Reflection;
}

interface UnmappedSymbol {
  qname: string;
  kind: number;
  sourceFilePath: string;
  sourceLine: number;
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
      collected.push({
        qname,
        kind: refl.kind,
        bucket: route,
        sourceFilePath,
        sourceLine,
        refl,
      });
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

function renderSignature(refl: Reflection): string {
  switch (refl.kind) {
    case KIND_CLASS: {
      const tparams = renderTypeParameters(refl.typeParameters);
      const ext =
        refl.extendedTypes !== undefined && refl.extendedTypes.length > 0
          ? ` extends ${refl.extendedTypes.map(renderType).join(", ")}`
          : "";
      const impl =
        refl.implementedTypes !== undefined && refl.implementedTypes.length > 0
          ? ` implements ${refl.implementedTypes.map(renderType).join(", ")}`
          : "";
      return `class ${refl.name}${tparams}${ext}${impl}`;
    }
    case KIND_INTERFACE: {
      const tparams = renderTypeParameters(refl.typeParameters);
      const ext =
        refl.extendedTypes !== undefined && refl.extendedTypes.length > 0
          ? ` extends ${refl.extendedTypes.map(renderType).join(", ")}`
          : "";
      return `interface ${refl.name}${tparams}${ext}`;
    }
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
  throw new Error(`Unexpected target kind ${refl.kind} for ${refl.name}`);
}

// === Summary rendering ===

function renderSummary(parts: SummaryDisplayPart[] | undefined): string {
  if (parts === undefined || parts.length === 0) return "";
  return parts
    .map((p) => {
      if (p.kind === "text") return p.text;
      if (p.kind === "code") return p.text;
      if (p.kind === "inline-tag") {
        if (p.tag === undefined) {
          throw new Error(
            `Inline tag part missing tag: ${JSON.stringify(p).slice(0, 200)}`,
          );
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

// === Per-symbol block ===

function renderSymbolBlock(record: SymbolRecord, sha: string): string {
  try {
    const heading = `## ${record.qname}`;
    const summary = renderSummary(findComment(record.refl)?.summary);
    const signature = renderSignature(record.refl);
    const sourceLink = `**Source:** [${record.sourceFilePath}:${record.sourceLine}](https://github.com/${REPO_SLUG}/blob/${sha}/${record.sourceFilePath}#L${record.sourceLine})`;
    const fence = "```ts\n" + signature + "\n```";
    const blocks =
      summary.length > 0
        ? [heading, summary, fence, sourceLink]
        : [heading, fence, sourceLink];
    return blocks.join("\n\n");
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
  sha: string,
): string {
  const sorted = [...symbols].sort(compareSymbols);
  const header = [
    "---",
    `title: ${bucketName}`,
    `category: ${bucketName}`,
    "---",
    "",
    `# ${bucketName}`,
  ].join("\n");
  if (sorted.length === 0) {
    return `${header}\n`;
  }
  const blocks = sorted.map((s) => renderSymbolBlock(s, sha)).join("\n\n");
  return `${header}\n\n${blocks}\n`;
}

function main(): void {
  console.log("Running typedoc to refresh api.json...");
  execSync("pnpm exec typedoc", { stdio: "inherit", cwd: REPO_ROOT });

  const sha = execSync("git rev-parse HEAD", { cwd: REPO_ROOT })
    .toString()
    .trim();
  const pkg = JSON.parse(
    readFileSync(join(REPO_ROOT, "package.json"), "utf8"),
  ) as { version: string };
  console.log(
    `Building reference docs: SDK v${pkg.version} at ${sha.substring(0, 8)}`,
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
    const content = renderFile(bucket, list, sha);
    writeFileSync(join(OUTPUT_DIR, `${slug}.md`), content, "utf8");
    console.log(`  ${slug}.md: ${list.length} symbol(s)`);
    totalSymbols += list.length;
  }
  console.log(
    `Wrote 16 reference files (${totalSymbols} symbols) to ${OUTPUT_DIR}.`,
  );
}

main();
