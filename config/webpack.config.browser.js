import path from "path";
import webpack from "webpack";
import fs from "fs";

import ESLintPlugin from "eslint-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";
import buildConfig from "./build.config.js";

// Read the version from package.json
const packageJson = JSON.parse(
fs.readFileSync(path.resolve(import.meta.dirname, "../package.json"), "utf8"),
);
const version = packageJson.version;

// For the axios variant, the browser entry imports from `src/browser-axios.ts`
// so the initial `httpClient` re-export resolves to the axios adapter. The
// NormalModuleReplacementPlugin below then rewrites every downstream relative
// import of `./http-client` (or `../http-client`) to `./http-client/axios`,
// so Horizon/rpc/stellartoml/federation all pick up axios in the same bundle.
const entryPath = buildConfig.useAxios
  ? path.resolve(import.meta.dirname, "../src/browser-axios.ts")
  : path.resolve(import.meta.dirname, "../src/browser.ts");

const config = {
  target: 'web',
  // https://stackoverflow.com/a/34018909
  entry: {
    'stellar-sdk': entryPath,
    'stellar-sdk.min': entryPath
  },
  resolve: {
    fallback: {
      crypto: import.meta.resolve("crypto-browserify"),
      stream: import.meta.resolve("stream-browserify"),
      buffer: import.meta.resolve("buffer"),
    },
    extensions: [".ts", ".js"],
    // Under TS module:nodenext, source imports are written with `.js`
    // extensions that point at `.ts` files on disk. Tell webpack to try the
    // .ts sibling when it can't find a .js file, and likewise for .mjs/.cjs.
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".mjs": [".mjs", ".mts"],
      ".cjs": [".cjs", ".cts"],
    },
  },
  output: {
    clean: process.env.no_clean ? false: true,
    library: {
      name: 'StellarSdk',
      type: 'umd',
      umdNamedDefine: true
    },
    filename: (pathData) => {
      let name = pathData.chunk.name;
      let suffix = '';

      if (name.endsWith('.min')) {
        name = name.slice(0, -4); // Remove .min
        suffix = '.min.js';
      } else {
        suffix = '.js';
      }

      if (buildConfig.useAxios) name += '-axios';

      return name + suffix;
    },
    path: path.resolve(import.meta.dirname, "../dist"),
  },
  mode: process.env.NODE_ENV ?? 'development',
  devtool: process.env.NODE_ENV === 'production' ? false : 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.m?(ts|js)$/,
        exclude: /node_modules\/(?!(stellar-base|js-xdr))/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /node_modules\/https-proxy-agent\//,
        use: 'null-loader',
      },
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js$/,
        terserOptions: {
          format: {
            ascii_only: true
          }
        }
      })
    ]
  },
  plugins: [
    // ESLint plugin for code quality checks
    // TODO: this is not working, needs investigation
    new ESLintPlugin({
      overrideConfigFile: path.resolve(
        import.meta.dirname,
        "../eslint.config.js",
      ),
    }),
    // Ignore native modules (sodium-native)
    new webpack.IgnorePlugin({ resourceRegExp: /sodium-native/ }),
    new NodePolyfillPlugin({
      includeAliases: ['http', 'https'] // others aren't needed

    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      // process: 'process/browser.js',
    }),
    new webpack.DefinePlugin({
      __PACKAGE_VERSION__: JSON.stringify(version),
    }),
    ...(buildConfig.useAxios
      ? [
          new webpack.NormalModuleReplacementPlugin(
            /(^|\/)http-client$/,
            (resource) => {
              // `resource.request` is the import specifier as written in the
              // source file (e.g. "../http-client"). Only rewrite the bare
              // directory import; `../http-client/axios` and
              // `../http-client/types` don't match the regex and pass through.
              resource.request = resource.request.replace(
                /(^|\/)http-client$/,
                '$1http-client/axios',
              );
            },
          ),
        ]
      : []),
  ],
  watchOptions: {
    ignored: /(node_modules|coverage|lib|dist)/
  }
};

export default config;
