#!/usr/bin/env node
/**
 * Event-bindings test harness.
 *
 * Uses https://github.com/stellar-experimental/contract-wasms (real mainnet
 * contracts) to exercise the SDK's TypeScript bindings generator, focusing on
 * event bindings. Pipeline:
 *
 *   1. Scan the repo's specs/*.json (stellar-cli JSON specs — an independent
 *      source of truth, not produced by this SDK) for contracts that declare
 *      events. Dedupe identical specs.
 *   2. Fetch just those .wasm blobs via git sparse-checkout.
 *   3. Generate bindings in-process for every contract (plus a control group
 *      of no-event contracts).
 *   4. Structural checks: compare generated client.ts/types.ts against what
 *      the JSON spec says must exist (parseEvent, one filter method per
 *      event, ContractEvent union arity, per-event `name:` discriminant,
 *      param field keys, map-format optionality).
 *   5. Typecheck all generated output with tsc against the local SDK build.
 *
 * Usage:
 *   pnpm build && node scripts/test-event-bindings.mjs [--limit N] [--no-typecheck] [--controls N]
 *
 * Env:
 *   WASMS_DIR path to contract-wasms clone (default: .contract-wasms-test/,
 *             cloned there if missing; gitignored so reruns reuse the cache)
 */

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SDK_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const WORK_DIR = path.join(SDK_DIR, ".contract-wasms-test");
const WASMS_DIR =
  process.env.WASMS_DIR ?? path.join(WORK_DIR, "contract-wasms");
const WASMS_URL = "https://github.com/stellar-experimental/contract-wasms.git";
const OUT_DIR = path.join(WORK_DIR, "event-bindings-out");

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : dflt;
};
const LIMIT = Number(opt("--limit", "Infinity"));
const CONTROLS = Number(opt("--controls", "10"));
const TYPECHECK = !flag("--no-typecheck");

// ---------------------------------------------------------------- utilities

const git = (...a) =>
  execFileSync("git", ["-C", WASMS_DIR, ...a], { encoding: "utf8" });

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Mirrors escapeStringLiteral in the generator only for the discriminant
// check; the raw JSON name is what the spec guarantees.
const escapeStr = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

// ------------------------------------------------------- step 0: preflight

if (!fs.existsSync(path.join(SDK_DIR, "lib/esm/cli/util.js"))) {
  fail(`SDK build missing — run 'pnpm build' in ${SDK_DIR} first`);
}
const { createGenerator } = await import(
  pathToFileURL(path.join(SDK_DIR, "lib/esm/cli/util.js")).href
);

fs.mkdirSync(WORK_DIR, { recursive: true });
if (!fs.existsSync(WASMS_DIR)) {
  console.log("Cloning contract-wasms (sparse, specs only)...");
  execFileSync("git", [
    "clone",
    "--filter=blob:none",
    "--sparse",
    "--depth=1",
    WASMS_URL,
    WASMS_DIR,
  ]);
  git("sparse-checkout", "set", "specs");
}

// ----------------------------------------------- step 1: scan + dedupe specs

console.log("Scanning specs for event definitions...");
const specFiles = fs
  .readdirSync(path.join(WASMS_DIR, "specs"))
  .filter((f) => f.endsWith(".json"));

/** @type {Map<string, {hash: string, events: any[], entries: any[]}>} byContentHash */
const uniqueWithEvents = new Map();
const noEventHashes = [];

for (const file of specFiles) {
  const raw = fs.readFileSync(path.join(WASMS_DIR, "specs", file), "utf8");
  let entries;
  try {
    entries = JSON.parse(raw);
  } catch {
    continue; // a handful of specs fail stellar-cli parsing too; skip
  }
  const hash = file.replace(/\.json$/, "");
  const events = entries
    .filter((e) => e && typeof e === "object" && "event_v0" in e)
    .map((e) => e.event_v0);
  if (events.length === 0) {
    noEventHashes.push(hash);
    continue;
  }
  const contentKey = createHash("sha256").update(raw).digest("hex");
  if (!uniqueWithEvents.has(contentKey)) {
    uniqueWithEvents.set(contentKey, { hash, events, entries });
  }
}

let targets = [...uniqueWithEvents.values()];
targets.sort((a, b) => a.hash.localeCompare(b.hash));
if (Number.isFinite(LIMIT)) targets = targets.slice(0, LIMIT);

// Control group: contracts with NO events must not grow event machinery.
const controls = noEventHashes.sort().slice(0, CONTROLS);

console.log(
  `${specFiles.length} specs scanned; ${uniqueWithEvents.size} unique event-bearing ` +
    `specs (testing ${targets.length}); ${controls.length} no-event controls`,
);

// ---------------------------------------------------- step 2: fetch wasms

console.log("Fetching wasm blobs via sparse-checkout...");
const wanted = [...targets.map((t) => t.hash), ...controls];
const patterns = ["/specs/", ...wanted.map((h) => `/contracts/${h}.wasm`)];
execFileSync(
  "git",
  ["-C", WASMS_DIR, "sparse-checkout", "set", "--no-cone", "--stdin"],
  { input: patterns.join("\n"), encoding: "utf8" },
);
const missing = wanted.filter(
  (h) => !fs.existsSync(path.join(WASMS_DIR, "contracts", `${h}.wasm`)),
);
if (missing.length) {
  console.warn(`⚠ ${missing.length} wasms missing from repo, skipping them`);
}

// ------------------------------------------- step 3 + 4: generate + verify

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT_DIR, "gen"), { recursive: true });

const results = {
  generated: 0,
  genFailed: [], // {hash, error} — any generate() throw is a failure
  checkFailed: [], // {hash, problems: string[]}
  renamed: 0, // outputs where a collision rename kicked in
  census: {
    map: 0,
    vec: 0,
    singleVal: 0,
    dataParams: 0,
    oddNames: 0,
    zeroParam: 0,
  },
};

function verifyContract(hash, events, clientSrc, typesSrc) {
  const problems = [];
  const n = events.length;

  // client.ts: parseEvent delegate present exactly when events exist
  const parseEventDefs = clientSrc.match(/^ {2}parseEvent\w*\(topics:/gm) ?? [];
  if (n > 0 && parseEventDefs.length !== 1) {
    problems.push(
      `expected 1 parseEvent method, found ${parseEventDefs.length}`,
    );
  }
  if (n === 0 && parseEventDefs.length !== 0) {
    problems.push("parseEvent generated for event-less contract");
  }

  // client.ts: one filter method per event. Count eventTopicFilter delegate
  // calls rather than method names — a contract function can legitimately be
  // named like "transferEventFilter" and would inflate a name-based count.
  const filterDefs =
    clientSrc.match(/return this\.spec\.eventTopicFilter\(/g) ?? [];
  if (filterDefs.length !== n) {
    problems.push(
      `expected ${n} event filter methods, found ${filterDefs.length}`,
    );
  }

  // types.ts: ContractEvent union arity
  const unionMatch = typesSrc.match(/^\s*export type ContractEvent = (.+);$/m);
  if (n > 0) {
    if (!unionMatch) {
      problems.push("missing ContractEvent union");
    } else {
      const members = unionMatch[1].split("|").length;
      if (members !== n) {
        problems.push(`ContractEvent has ${members} members, expected ${n}`);
      }
    }
  } else if (unionMatch) {
    problems.push("ContractEvent union generated for event-less contract");
  }

  // types.ts: per-event discriminant + param field keys + map optionality
  for (const ev of events) {
    const disc = `name: "${escapeStr(ev.name)}";`;
    if (!typesSrc.includes(disc)) {
      problems.push(`missing event interface discriminant ${disc}`);
      continue;
    }
    for (const p of ev.params ?? []) {
      const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(p.name)
        ? p.name
        : `"${escapeStr(p.name)}"`;
      const optional = ev.data_format === "map" && p.location === "data";
      const fieldRe = new RegExp(
        `^\\s*${escapeRe(key)}${optional ? "\\?" : ""}: `,
        "m",
      );
      if (!fieldRe.test(typesSrc)) {
        problems.push(
          `event "${ev.name}": missing field ${key}${optional ? "?" : ""}`,
        );
      }
    }
  }

  return problems;
}

function censusUpdate(events) {
  for (const ev of events) {
    if (ev.data_format === "map") results.census.map += 1;
    if (ev.data_format === "vec") results.census.vec += 1;
    if (
      ev.data_format === "single_value" ||
      ev.data_format === "single-value"
    ) {
      results.census.singleVal += 1;
    }
    if ((ev.params ?? []).some((p) => p.location === "data")) {
      results.census.dataParams += 1;
    }
    if ((ev.params ?? []).length === 0) results.census.zeroParam += 1;
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(ev.name))
      results.census.oddNames += 1;
  }
}

async function runOne(hash, events) {
  const wasmPath = path.join(WASMS_DIR, "contracts", `${hash}.wasm`);
  if (!fs.existsSync(wasmPath)) return;
  let bindings;
  try {
    const { generator } = await createGenerator({ wasm: wasmPath });
    bindings = generator.generate({ contractName: `c${hash.slice(0, 8)}` });
  } catch (error) {
    results.genFailed.push({ hash, error: String(error?.message ?? error) });
    return;
  }
  results.generated += 1;
  censusUpdate(events);

  const dir = path.join(OUT_DIR, "gen", hash);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "client.ts"), bindings.client);
  fs.writeFileSync(path.join(dir, "index.ts"), bindings.index);
  if (bindings.types.trim()) {
    fs.writeFileSync(path.join(dir, "types.ts"), bindings.types);
  }

  if (/renamed from "/.test(bindings.client + bindings.types)) {
    results.renamed += 1;
  }

  const problems = verifyContract(
    hash,
    events,
    bindings.client,
    bindings.types,
  );
  if (problems.length) results.checkFailed.push({ hash, problems });
}

console.log("Generating bindings + running structural checks...");
let done = 0;
for (const t of targets) {
  await runOne(t.hash, t.events);
  done += 1;
  if (done % 100 === 0) console.log(`  ${done}/${targets.length}`);
}
for (const hash of controls) {
  await runOne(hash, []); // no events expected
}

// --------------------------------------------------- step 5: typecheck all

let tscOk = null;
if (TYPECHECK) {
  console.log("Typechecking all generated bindings with tsc...");
  const nm = path.join(OUT_DIR, "node_modules");
  fs.mkdirSync(path.join(nm, "@stellar"), { recursive: true });
  const links = [
    ["@stellar/stellar-sdk", SDK_DIR],
    ["buffer", path.join(SDK_DIR, "node_modules/buffer")],
    ["@types/node", path.join(SDK_DIR, "node_modules/@types/node")],
  ];
  for (const [name, target] of links) {
    const dest = path.join(nm, name);
    if (!fs.existsSync(dest)) {
      if (!fs.existsSync(target)) {
        console.warn(`⚠ cannot link ${name}: ${target} missing`);
        continue;
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.symlinkSync(fs.realpathSync(target), dest);
    }
  }
  fs.writeFileSync(
    path.join(OUT_DIR, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          noEmit: true,
          target: "es2022",
          module: "esnext",
          moduleResolution: "bundler",
          skipLibCheck: true,
          types: ["node"],
        },
        include: ["gen/**/*.ts"],
      },
      null,
      2,
    ),
  );
  const tsc = spawnSync(
    path.join(SDK_DIR, "node_modules/.bin/tsc"),
    ["-p", OUT_DIR],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  tscOk = tsc.status === 0;
  if (!tscOk) {
    const lines = (tsc.stdout + tsc.stderr).trim().split("\n");
    fs.writeFileSync(path.join(OUT_DIR, "tsc-errors.txt"), lines.join("\n"));

    // Classify: does the error touch event machinery (types.ts event
    // interfaces / ContractEvent union, or an EventFilter/parseEvent line in
    // client.ts), or is it unrelated generator output (e.g. error enums)?
    const srcCache = new Map();
    const errLine = /^(.+\.ts)\((\d+),\d+\): error (TS\d+): (.*)$/;
    const byCode = new Map();
    const eventErrors = [];
    for (const line of lines) {
      const m = line.match(errLine);
      if (!m) continue;
      const [, file, lineNo, code, msg] = m;
      byCode.set(code, (byCode.get(code) ?? 0) + 1);
      const abs = path.join(OUT_DIR, file);
      if (!srcCache.has(abs)) {
        srcCache.set(
          abs,
          fs.existsSync(abs) ? fs.readFileSync(abs, "utf8").split("\n") : [],
        );
      }
      const src = srcCache.get(abs)[Number(lineNo) - 1] ?? "";
      if (
        /EventFilter|parseEvent|ContractEvent/.test(src) ||
        (file.endsWith("types.ts") &&
          /name: "|export interface \w*Event/.test(src))
      ) {
        eventErrors.push(line);
      }
    }
    console.log(
      `  tsc errors: ${lines.length} lines (${eventErrors.length} touch event code)` +
        ` — full list in ${path.join(OUT_DIR, "tsc-errors.txt")}`,
    );
    console.log(
      "  by code: " + [...byCode].map(([c, n]) => `${c}×${n}`).join(" "),
    );
    if (eventErrors.length) {
      console.log("  event-related errors (first 10):");
      console.log(
        eventErrors
          .slice(0, 10)
          .map((l) => `    ${l}`)
          .join("\n"),
      );
      fs.writeFileSync(
        path.join(OUT_DIR, "tsc-event-errors.txt"),
        eventErrors.join("\n"),
      );
    }
    tscOk =
      eventErrors.length === 0
        ? "PASS (event code); other errors exist"
        : false;
  }
}

// -------------------------------------------------------------- reporting

console.log("\n================ RESULTS ================");
console.log(
  `generated OK:        ${results.generated}/${targets.length + controls.length}`,
);
console.log(`generation failures: ${results.genFailed.length}`);
console.log(`structural failures: ${results.checkFailed.length}`);
console.log(
  `typecheck:           ${
    tscOk === null ? "skipped" : tscOk === true ? "PASS" : tscOk || "FAIL"
  }`,
);
console.log(`collision renames:   ${results.renamed} contracts`);
console.log(
  `event census: map=${results.census.map} vec=${results.census.vec} ` +
    `single=${results.census.singleVal} dataParams=${results.census.dataParams} ` +
    `zeroParam=${results.census.zeroParam} nonIdentNames=${results.census.oddNames}`,
);

if (results.genFailed.length) {
  console.log("\nGeneration failures (grouped):");
  const groups = new Map();
  for (const f of results.genFailed) {
    groups.set(f.error, [...(groups.get(f.error) ?? []), f.hash]);
  }
  for (const [err, hashes] of groups) {
    console.log(`  [${hashes.length}] ${err}\n    e.g. ${hashes[0]}`);
  }
}
if (results.checkFailed.length) {
  console.log("\nStructural check failures:");
  for (const f of results.checkFailed.slice(0, 20)) {
    console.log(`  ${f.hash}`);
    for (const p of f.problems.slice(0, 5)) console.log(`    - ${p}`);
  }
  fs.writeFileSync(
    path.join(OUT_DIR, "structural-failures.json"),
    JSON.stringify(results.checkFailed, null, 2),
  );
}

const ok =
  results.genFailed.length === 0 &&
  results.checkFailed.length === 0 &&
  tscOk !== false;
console.log(ok ? "\n✓ ALL CHECKS PASSED" : "\n✗ FAILURES — see above");
process.exit(ok ? 0 : 1);
