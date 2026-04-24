import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { builtinModules } from "node:module";
import { fileURLToPath } from "node:url";

import commonjs from "@rollup/plugin-commonjs";
import inject from "@rollup/plugin-inject";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import esbuild from "rollup-plugin-esbuild";
import nodePolyfills from "rollup-plugin-polyfill-node";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8"),
);

const useAxios = process.env.USE_AXIOS === "true";

const externalPackages = new Set([
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
]);

const builtinPackageIds = new Set([
  ...builtinModules,
  ...builtinModules.map((moduleId) => `node:${moduleId}`),
]);

function isExternalDependency(id) {
  if (builtinPackageIds.has(id)) {
    return true;
  }

  for (const dependencyName of externalPackages) {
    if (id === dependencyName || id.startsWith(`${dependencyName}/`)) {
      return true;
    }
  }

  return false;
}

// Under TS module:nodenext, source imports are written with `.js` extensions
// that point at `.ts` files on disk. Teach rollup to try the `.ts` sibling when
// the `.js` file doesn't exist.
function resolveJsSourceSpecifier() {
  return {
    name: "resolve-js-source-specifier",
    resolveId(source, importer) {
      if (!importer || !source.startsWith(".") || !source.endsWith(".js")) {
        return null;
      }

      const resolvedSourcePath = path.resolve(path.dirname(importer), source);
      const sourceCandidates = [
        resolvedSourcePath,
        resolvedSourcePath.slice(0, -3) + ".ts",
      ];

      for (const candidatePath of sourceCandidates) {
        if (fs.existsSync(candidatePath)) {
          return candidatePath;
        }
      }

      return null;
    },
  };
}

// Axios variant: rewrite relative `./http-client/index.js` (or bare
// `./http-client`) imports to `./http-client/axios.js` so Horizon/rpc/
// stellartoml/federation wire up to the axios client. Mirrors the old
// babel plugin (config/babel-plugin-alias-http-client.js) and the webpack
// NormalModuleReplacementPlugin used for the browser bundle.
function aliasHttpClientToAxios() {
  const patterns = [
    {
      match: /(^|\/)http-client\/index\.js$/,
      replace: "$1http-client/axios.js",
    },
    { match: /(^|\/)http-client$/, replace: "$1http-client/axios" },
  ];
  const rewrite = (value) => {
    for (const { match, replace: r } of patterns) {
      if (match.test(value)) return value.replace(match, r);
    }
    return value;
  };

  return {
    name: "alias-http-client-to-axios",
    resolveId(source, importer) {
      if (!importer || !source.startsWith(".")) return null;
      const rewritten = rewrite(source);
      if (rewritten === source) return null;
      return this.resolve(rewritten, importer, { skipSelf: true });
    },
  };
}

// Browser bundle only: @stellar/stellar-base@15 ships a CJS `lib/index.js`
// that uses babel's runtime `Object.keys(_mod).forEach(...)` pattern for
// re-exports, which rollup's commonjs plugin cannot statically analyze.
// Consequently `export * from "@stellar/stellar-base"` in src/index.ts drops
// every named export (Keypair, Asset, xdr, ...). To fix this without touching
// source, we load stellar-base at config time, enumerate its runtime exports,
// and serve a virtual module with explicit `export { ... }` re-exports
// whenever `@stellar/stellar-base` is imported.
// This can be removed once stellar-base is merged into this repo
async function explicitStellarBaseExports() {
  const stellarBase = await import("@stellar/stellar-base");
  const names = Object.keys(stellarBase).filter(
    (key) => key !== "default" && key !== "__esModule",
  );
  const pkgDir = path.dirname(
    fileURLToPath(import.meta.resolve("@stellar/stellar-base/package.json")),
  );
  const realId = path.join(pkgDir, "lib", "index.js");
  const VIRTUAL_ID = "\0stellar-base-explicit-exports";

  return {
    name: "explicit-stellar-base-exports",
    resolveId(source) {
      if (source === "@stellar/stellar-base") return VIRTUAL_ID;
      return null;
    },
    load(id) {
      if (id !== VIRTUAL_ID) return null;
      const spec = JSON.stringify(realId);
      return [
        `export { ${names.join(", ")} } from ${spec};`,
        `import * as __ns from ${spec};`,
        `export default __ns;`,
      ].join("\n");
    },
  };
}

// Browser bundle only: rollup-plugin-polyfill-node's zlib polyfill omits the
// `constants` object that axios's HTTP adapter accesses at module init
// (`zlib.constants.Z_SYNC_FLUSH`). Back it with browserify-zlib, which has
// all the Z_* constants but exposes them as flat top-level exports. Wrap it
// in a virtual module that re-exports everything and also groups the
// constants into a `constants` namespace, matching Node's zlib shape.
function aliasZlibToBrowserifyZlib() {
  const VIRTUAL_ID = "\0zlib-with-constants";
  return {
    name: "alias-zlib-to-browserify-zlib",
    resolveId(source) {
      if (source === "zlib" || source === "node:zlib") return VIRTUAL_ID;
      return null;
    },
    load(id) {
      if (id !== VIRTUAL_ID) return null;
      return [
        `import * as __bz from "browserify-zlib";`,
        `export * from "browserify-zlib";`,
        `const constants = Object.fromEntries(`,
        `  Object.entries(__bz).filter(([k]) => /^(Z_|BROTLI_|DEFLATE|INFLATE|GZIP|GUNZIP|UNZIP)/.test(k))`,
        `);`,
        `export { constants };`,
        `export default { ...__bz, constants };`,
      ].join("\n");
    },
  };
}

function createOutput(dir, format) {
  return {
    dir,
    format,
    exports: "named",
    interop: format === "cjs" ? "auto" : undefined,
    preserveModules: true,
    preserveModulesRoot: "src",
    sourcemap: true,
    entryFileNames: "[name].js",
  };
}

const replaceVersion = replace({
  preventAssignment: true,
  values: {
    __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
  },
});

const libSharedPlugins = [
  // Alias plugin must run BEFORE resolveJsSourceSpecifier so it still sees
  // the original relative specifier (e.g. "../http-client/index.js").
  ...(useAxios ? [aliasHttpClientToAxios()] : []),
  resolveJsSourceSpecifier(),
  esbuild({
    sourceMap: true,
    target: "es2022",
    tsconfig: "config/tsconfig.json",
    loaders: {
      ".js": "js",
      ".ts": "ts",
    },
  }),
  inject({
    Buffer: ["buffer", "Buffer"],
  }),
  replaceVersion,
];

const libOutDir = useAxios ? "lib/axios" : "lib";

// Additional entry points beyond src/index.ts. These ensure their output
// files exist even when rollup's tree-shaking would otherwise inline their
// exports: the `exports` map in package.json references `http-client/axios`
// as a public subpath, and tests import `http-client` directly. Listing them
// as entries guarantees emission without relying on graph reachability.
const libEntries = {
  index: "src/index.ts",
  "http-client/index": "src/http-client/index.ts",
  "http-client/axios": "src/http-client/axios.ts",
};

/** Library build — preserves modules, externalizes dependencies. */
const libConfig = {
  input: libEntries,
  external: isExternalDependency,
  plugins: libSharedPlugins,
  output: [
    createOutput(`${libOutDir}`, "esm"),
    createOutput(`${libOutDir}/cjs`, "cjs"),
  ],
};

/** Bundled dist build — single UMD file with all dependencies included.
 * Intended for direct use in browsers or via CDNs. */
const distEntry = useAxios ? "src/browser-axios.ts" : "src/browser.ts";
const distBaseName = useAxios ? "stellar-sdk-axios" : "stellar-sdk";

const distPlugins = [
  ...(useAxios ? [aliasHttpClientToAxios()] : []),
  resolveJsSourceSpecifier(),
  await explicitStellarBaseExports(),
  aliasZlibToBrowserifyZlib(),
  resolve({
    browser: true,
    preferBuiltins: false,
    extensions: [".ts", ".mjs", ".js", ".json"],
  }),
  commonjs(),
  nodePolyfills(),
  esbuild({
    sourceMap: true,
    target: "es2022",
    tsconfig: "config/tsconfig.json",
    loaders: {
      ".js": "js",
      ".ts": "ts",
    },
  }),
  inject({
    Buffer: ["buffer", "Buffer"],
  }),
  replaceVersion,
];

const distConfig = {
  input: distEntry,
  plugins: distPlugins,
  output: [
    {
      file: `dist/${distBaseName}.js`,
      format: "umd",
      name: "StellarSdk",
      exports: "named",
      sourcemap: true,
    },
    {
      file: `dist/${distBaseName}.min.js`,
      format: "umd",
      name: "StellarSdk",
      exports: "named",
      sourcemap: true,
      plugins: [
        terser({
          format: { ascii_only: true },
        }),
      ],
    },
  ],
};

export default [libConfig, distConfig];
