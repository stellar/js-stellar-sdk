#!/usr/bin/env node
// One-shot helper: walks src/ and adds an `@category <Bucket>` TSDoc tag
// to every top-level exported declaration, per the routing rule encoded
// below. Idempotent: re-running on an annotated file is a no-op.
//
// Usage:
//   node scripts/add-categories.mjs           # apply
//   node scripts/add-categories.mjs --dry-run # report only

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const SPECIAL_FILES = {
  "src/webauth/errors.ts": "Errors",
};

const FILE_PATTERNS = [
  ["src/config.ts", "Cross-cutting"],
  ["src/utils.ts", "Cross-cutting"],
  ["src/base/util/bignumber.ts", "Cross-cutting"],
  ["src/base/util/util.ts", "Cross-cutting"],
  ["src/base/util/checksum.ts", "Core / Keys"],
  ["src/base/util/continued_fraction.ts", "Core / Transactions"],
  ["src/base/util/decode_encode_muxed_account.ts", "Core / Transactions"],
  ["src/base/util/operations.ts", "Core / Transactions"],
  ["src/utils/url.ts", "Network / HTTP"],
  ["src/base/keypair.ts", "Core / Keys"],
  ["src/base/signing.ts", "Core / Keys"],
  ["src/base/strkey.ts", "Core / Keys"],
  ["src/base/signerkey.ts", "Core / Keys"],
  ["src/base/asset.ts", "Core / Assets"],
  ["src/base/liquidity_pool_asset.ts", "Core / Assets"],
  ["src/base/liquidity_pool_id.ts", "Core / Assets"],
  ["src/base/claimant.ts", "Core / Assets"],
  ["src/base/get_liquidity_pool_id.ts", "Core / Assets"],
  ["src/base/transaction.ts", "Core / Transactions"],
  ["src/base/transaction_base.ts", "Core / Transactions"],
  ["src/base/fee_bump_transaction.ts", "Core / Transactions"],
  ["src/base/transaction_builder.ts", "Core / Transactions"],
  ["src/base/operation.ts", "Core / Transactions"],
  ["src/base/memo.ts", "Core / Transactions"],
  ["src/base/network.ts", "Core / Transactions"],
  ["src/base/account.ts", "Core / Transactions"],
  ["src/base/muxed_account.ts", "Core / Transactions"],
  ["src/base/xdr.ts", "Core / XDR"],
  ["src/base/jsxdr.ts", "Core / XDR"],
  ["src/base/hashing.ts", "Core / XDR"],
  ["src/base/address.ts", "Core / Soroban Primitives"],
  ["src/base/contract.ts", "Core / Soroban Primitives"],
  ["src/base/scval.ts", "Core / Soroban Primitives"],
  ["src/base/auth.ts", "Core / Soroban Primitives"],
  ["src/base/invocation.ts", "Core / Soroban Primitives"],
  ["src/base/events.ts", "Core / Soroban Primitives"],
  ["src/base/sorobandata_builder.ts", "Core / Soroban Primitives"],
  ["src/base/soroban.ts", "Core / Soroban Primitives"],
];

const DIR_PATTERNS = [
  [/^src\/base\/operations\//, "Core / Transactions"],
  [/^src\/base\/numbers\//, "Core / Transactions"],
  [/^src\/horizon\//, "Network / Horizon"],
  [/^src\/rpc\//, "Network / RPC"],
  [/^src\/friendbot\//, "Network / Friendbot"],
  [/^src\/http-client\//, "Network / HTTP"],
  [/^src\/contract\//, "Contracts / Client"],
  [/^src\/bindings\//, "Contracts / Bindings"],
  [/^src\/cli\//, "Contracts / Bindings"],
  [/^src\/stellartoml\//, "SEPs / Toml"],
  [/^src\/federation\//, "SEPs / Federation"],
  [/^src\/webauth\//, "SEPs / WebAuth"],
  [/^src\/errors\//, "Errors"],
];

function bucketForFile(filePath) {
  const norm = filePath.replace(/\\/g, "/");
  if (SPECIAL_FILES[norm]) return SPECIAL_FILES[norm];
  for (const [pattern, bucket] of FILE_PATTERNS) {
    if (norm === pattern) return bucket;
  }
  for (const [regex, bucket] of DIR_PATTERNS) {
    if (regex.test(norm)) return bucket;
  }
  return null;
}

function isBarrel(filePath) {
  const base = path.basename(filePath);
  return base === "index.ts" || base === "browser.ts" || base === "browser-axios.ts";
}

function getDeclName(node) {
  if (
    ts.isClassDeclaration(node) ||
    ts.isFunctionDeclaration(node) ||
    ts.isInterfaceDeclaration(node) ||
    ts.isTypeAliasDeclaration(node) ||
    ts.isEnumDeclaration(node) ||
    ts.isModuleDeclaration(node)
  ) {
    return node.name?.text ?? null;
  }
  if (ts.isVariableStatement(node)) {
    const decl = node.declarationList.declarations[0];
    if (decl && ts.isIdentifier(decl.name)) return decl.name.text;
  }
  return null;
}

function isExported(node) {
  const mods = node.modifiers ?? [];
  return mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

function leadingJsdocRange(node, content) {
  const ranges = ts.getLeadingCommentRanges(content, node.getFullStart()) ?? [];
  const jsdocs = ranges.filter(
    (r) => content.substring(r.pos, r.pos + 3) === "/**",
  );
  return jsdocs.length ? jsdocs[jsdocs.length - 1] : null;
}

function findExports(sourceFile, content) {
  const out = [];
  const seen = new Set();
  ts.forEachChild(sourceFile, (node) => {
    if (!isExported(node)) return;
    const name = getDeclName(node);
    if (!name) return;
    if (seen.has(name)) return; // skip overloads
    seen.add(name);
    const jsdoc = leadingJsdocRange(node, content);
    out.push({ node, name, jsdoc });
  });
  return out;
}

function processFile(filePath, dryRun) {
  if (isBarrel(filePath)) return { skipped: "barrel" };
  const bucket = bucketForFile(filePath);
  if (!bucket) return { skipped: "no-bucket" };

  let content = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
  );

  const exports = findExports(sourceFile, content);
  const edits = [];
  let added = 0;
  let updated = 0;
  let hadCategory = 0;

  for (const { node, jsdoc } of exports) {
    if (jsdoc) {
      const text = content.substring(jsdoc.pos, jsdoc.end);
      if (/@category\b/.test(text)) {
        hadCategory++;
        continue;
      }
      const isSingleLine = !text.includes("\n");
      if (isSingleLine) {
        const insertPos = jsdoc.end - 2; // before `*/`
        const charBefore = content[insertPos - 1];
        const sep = charBefore === " " ? "" : " ";
        edits.push({
          pos: insertPos,
          insert: `${sep}@category ${bucket} `,
        });
      } else {
        const endIdx = jsdoc.end;
        const lineStart = content.lastIndexOf("\n", endIdx - 1) + 1;
        const closingLine = content.substring(lineStart, endIdx);
        const m = closingLine.match(/^([ \t]*)\*\//);
        if (!m) continue;
        const indent = m[1];
        edits.push({
          pos: lineStart,
          insert: `${indent}* @category ${bucket}\n`,
        });
      }
      updated++;
    } else {
      const startPos = node.getStart(sourceFile);
      const lineStart = content.lastIndexOf("\n", startPos - 1) + 1;
      const indent = content.substring(lineStart, startPos);
      if (!/^[ \t]*$/.test(indent)) continue;
      edits.push({
        pos: lineStart,
        insert: `${indent}/** @category ${bucket} */\n`,
      });
      added++;
    }
  }

  if (edits.length === 0) {
    return { added, updated, hadCategory, bucket };
  }

  edits.sort((a, b) => b.pos - a.pos);
  for (const e of edits) {
    content = content.substring(0, e.pos) + e.insert + content.substring(e.pos);
  }
  if (!dryRun) fs.writeFileSync(filePath, content);
  return { edited: true, added, updated, hadCategory, bucket };
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const norm = full.replace(/\\/g, "/");
      if (norm.includes("src/base/generated")) continue;
      walk(full, files);
    } else if (entry.name.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

const dryRun = process.argv.includes("--dry-run");
const files = walk("src");
let totalAdded = 0;
let totalUpdated = 0;
let totalHadCategory = 0;
let filesEdited = 0;
const noBuckets = [];
const byBucket = new Map();

for (const file of files) {
  const r = processFile(file, dryRun);
  if (r.skipped === "barrel") continue;
  if (r.skipped === "no-bucket") {
    noBuckets.push(file);
    continue;
  }
  totalAdded += r.added || 0;
  totalUpdated += r.updated || 0;
  totalHadCategory += r.hadCategory || 0;
  if (r.edited) filesEdited++;
  if (r.bucket) {
    const cur = byBucket.get(r.bucket) ?? { added: 0, updated: 0, files: 0 };
    cur.added += r.added || 0;
    cur.updated += r.updated || 0;
    if (r.edited) cur.files += 1;
    byBucket.set(r.bucket, cur);
  }
}

console.log(dryRun ? "[DRY RUN]" : "[APPLIED]");
console.log(`Files edited: ${filesEdited}`);
console.log(`  New JSDoc blocks added: ${totalAdded}`);
console.log(`  Existing JSDoc blocks updated: ${totalUpdated}`);
console.log(`  Already had @category: ${totalHadCategory}`);
console.log("");
console.log("Per bucket:");
for (const [bucket, stats] of [...byBucket.entries()].sort()) {
  console.log(
    `  ${bucket.padEnd(30)}  files=${stats.files}  added=${stats.added}  updated=${stats.updated}`,
  );
}
if (noBuckets.length > 0) {
  console.log("\nFiles with no bucket assignment (skipped):");
  for (const f of noBuckets) console.log("  ", f);
}
