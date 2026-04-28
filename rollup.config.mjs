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

// Bundle these dependencies into the lib output instead of leaving bare
// imports. `@stellar/js-xdr` ships a webpack UMD bundle as `main`, which
// hides its named exports from Node ESM's cjs-module-lexer; inlining it
// at build time sidesteps the interop entirely.
// TODO: remove this once js-xdr ships an ESM build with proper named exports. Until then, it converts js-xdr's UMD export into a shape rollup can analyze and re-export from our ESM output.
const inlinedDependencies = new Set(["@stellar/js-xdr"]);

const externalPackages = new Set(
  [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ].filter((name) => !inlinedDependencies.has(name)),
);

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

// Browser bundle only: rollup-plugin-polyfill-node ships a legacy `buffer-es6`
// polyfill that lacks BigInt accessors (readBigUInt64BE, writeBigInt64BE, ...).
// SDK source uses bare `Buffer.from(...)` etc. which our `inject` plugin rewrites
// into `import { Buffer } from "buffer"`. If polyfill-node resolves that
// specifier first, `Buffer.from()` returns a legacy buffer instance; js-xdr's
// `Buffer.isBuffer(t)` duck-types it as a Buffer (it sets `_isBuffer = true`),
// stores it as `_buffer`, and later `_buffer.readBigUInt64BE(...)` throws
// `is not a function`. Pin `buffer` (and `node:buffer`) to the real npm package
// (`buffer@6.0.3+`) before polyfill-node has a chance to intercept.
function aliasBufferToNpmBuffer() {
  return {
    name: "alias-buffer-to-npm-buffer",
    resolveId(source, importer) {
      if (source !== "buffer" && source !== "node:buffer") return null;
      return this.resolve("buffer/index.js", importer, { skipSelf: true });
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

  // TODO: remove this plugin once js-xdr ships an ESM build with proper named exports. Until then, it converts js-xdr's UMD export into a shape rollup can analyze and re-export from our ESM output.
  // resolve + commonjs are needed to pull `@stellar/js-xdr` into the bundle.
  // External deps short-circuit before reaching these plugins, so other
  // dependencies remain bare imports.
  resolve({
    extensions: [".ts", ".mjs", ".js", ".json"],
  }),
  // TODO: remove this plugin once js-xdr ships an ESM build with proper named exports. Until then, it converts js-xdr's UMD export into a shape rollup can analyze and re-export from our ESM output.
  commonjs(),
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

const libBaseDir = useAxios ? "lib/axios" : "lib";

// Additional entry points beyond src/index.ts. These ensure their output
// files exist even when rollup's tree-shaking would otherwise inline their
// exports: the `exports` map in package.json references `http-client/axios`
// as a public subpath, and tests import `http-client` directly. Listing them
// as entries guarantees emission without relying on graph reachability.
const libEntries = {
  index: "src/index.ts",
  "http-client/index": "src/http-client/index.ts",
  "http-client/axios": "src/http-client/axios.ts",
  "cli/index": "src/cli/index.ts",
};

/** Library build — preserves modules, externalizes dependencies. */
const libConfig = {
  input: libEntries,
  external: isExternalDependency,
  plugins: libSharedPlugins,
  output: [
    createOutput(`${libBaseDir}/esm`, "esm"),
    createOutput(`${libBaseDir}/cjs`, "cjs"),
  ],
};

/** Bundled dist build — single UMD file with all dependencies included.
 * Intended for direct use in browsers or via CDNs. */
const distEntry = useAxios ? "src/browser-axios.ts" : "src/browser.ts";
const distBaseName = useAxios ? "stellar-sdk-axios" : "stellar-sdk";

const distPlugins = [
  ...(useAxios ? [aliasHttpClientToAxios()] : []),
  resolveJsSourceSpecifier(),
  aliasBufferToNpmBuffer(),
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
