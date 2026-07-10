// Node ESM hooks that make `import * as XDR from "@stellar/js-xdr"` expose the
// package's named exports (`config`, `XdrReader`, …) under plain node/tsx.
//
// `@stellar/js-xdr`'s `main` is a babel/webpack CJS bundle. `require()` returns
// every export, but node's static CJS-named-export detection can't see them, so
// ESM `import * as XDR` yields a namespace where `XDR.config` is undefined —
// which breaks the legacy fixture (`test/fixtures/legacy-xdr/curr_generated.js`,
// which does `XDR.config(...)`). Bundlers like vitest sidestep this via their
// own interop; here we synthesize an ESM shim that `require()`s the CJS module
// and re-exports each of its keys as a proper named export.
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const ALIAS = "js-xdr-v4";
const require = createRequire(import.meta.url);
const SHIM_URL =
  pathToFileURL(require.resolve(ALIAS)).href + "?js-xdr-esm-shim";

export async function resolve(specifier, context, nextResolve) {
  if (specifier === ALIAS) {
    return { url: SHIM_URL, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url === SHIM_URL) {
    const cjs = require(ALIAS);
    const names = Object.keys(cjs).filter(
      (k) => k !== "default" && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k),
    );
    const source =
      `import { createRequire } from "node:module";\n` +
      `const require = createRequire(${JSON.stringify(import.meta.url)});\n` +
      `const m = require(${JSON.stringify(ALIAS)});\n` +
      `export default m;\n` +
      names
        .map((n) => `export const ${n} = m[${JSON.stringify(n)}];`)
        .join("\n") +
      `\n`;
    return { format: "module", source, shortCircuit: true };
  }
  return nextLoad(url, context);
}
