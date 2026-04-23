// Writes a package.json sentinel into an output directory declaring the
// module type so Node and TypeScript interpret the emitted .js files in the
// intended format. Used after Babel's per-format passes to flip subtrees
// (lib/cjs, lib/axios/cjs) to CJS under a root "type":"module" package.

import fs from "node:fs";
import path from "node:path";

const [dir, type] = process.argv.slice(2);
if (!dir || !type) {
  console.error("usage: write-module-type.js <dir> <module|commonjs>");
  process.exit(1);
}
if (type !== "module" && type !== "commonjs") {
  console.error(`invalid type '${type}' (must be 'module' or 'commonjs')`);
  process.exit(1);
}

const target = path.resolve(dir);
fs.mkdirSync(target, { recursive: true });
fs.writeFileSync(
  path.join(target, "package.json"),
  JSON.stringify({ type }, null, 2) + "\n",
);
console.log(`wrote ${path.join(target, "package.json")} ({type:${type}})`);
