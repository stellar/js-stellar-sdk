import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR = process.env.OUTPUT_DIR || "lib";
const configDir = import.meta.dirname;
const tempTsconfigPath = path.resolve(configDir, "tsconfig.tmp.json");

const tsconfig = JSON.parse(
  fs.readFileSync(path.resolve(configDir, "tsconfig.json"), "utf8"),
);
tsconfig.compilerOptions.outDir = path.resolve(configDir, "..", OUTPUT_DIR);
tsconfig.compilerOptions.declarationDir = path.resolve(
  configDir,
  "..",
  OUTPUT_DIR,
);

fs.writeFileSync(tempTsconfigPath, JSON.stringify(tsconfig, null, 2), "utf8");

console.log(
  `Set TypeScript outDir to ${OUTPUT_DIR} in temporary tsconfig file.`,
);
