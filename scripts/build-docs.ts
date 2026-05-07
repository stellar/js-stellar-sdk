/**
 * Phase 1.a skeleton emitter. Writes one markdown file per bucket
 * to `docs/reference/`. Routes symbols to buckets by source file
 * path (see FILE_OVERRIDES / DIRECTORY_PREFIXES / bucketForPath).
 * See `.claude/notes/docs-plan.md` → "scripts/build-docs.ts —
 * phased implementation" for the full multi-phase plan.
 */

import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = process.cwd();
const TYPEDOC_JSON = join(REPO_ROOT, "tmp/typedoc-json/api.json");
const OUTPUT_DIR = join(REPO_ROOT, "docs/reference");

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

interface SourceLocation {
  fileName: string;
  line: number;
}

interface Reflection {
  id: number;
  name: string;
  kind: number;
  sources?: SourceLocation[];
  children?: Reflection[];
}

interface SymbolRecord {
  qname: string;
  kind: number;
  bucket: BucketName;
  sourceFilePath: string;
  sourceLine: number;
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
      unmapped.push({
        qname,
        kind: refl.kind,
        sourceFilePath,
        sourceLine,
      });
    } else {
      collected.push({
        qname,
        kind: refl.kind,
        bucket: route,
        sourceFilePath,
        sourceLine,
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

function compareSymbols(a: SymbolRecord, b: SymbolRecord): number {
  if (a.qname !== b.qname) return a.qname < b.qname ? -1 : 1;
  if (a.sourceFilePath !== b.sourceFilePath) {
    return a.sourceFilePath < b.sourceFilePath ? -1 : 1;
  }
  return a.sourceLine - b.sourceLine;
}

function renderFile(bucketName: BucketName, symbols: SymbolRecord[]): string {
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
  const bullets = sorted.map((s) => `- ${s.qname}`).join("\n");
  return `${header}\n\n${bullets}\n`;
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
    const content = renderFile(bucket, list);
    writeFileSync(join(OUTPUT_DIR, `${slug}.md`), content, "utf8");
    console.log(`  ${slug}.md: ${list.length} symbol(s)`);
    totalSymbols += list.length;
  }
  console.log(
    `Wrote 16 reference files (${totalSymbols} symbols) to ${OUTPUT_DIR}.`,
  );
}

main();
