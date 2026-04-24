import path from "path";
import buildConfig from "./config/build.config.js";
import fs from "fs";
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const version = packageJson.version;

export default function (api) {
  // Different BABEL_MODULES values produce different output; don't cache across
  // invocations or the ESM pass will pick up transforms from the CJS pass.
  api.cache.using(() => process.env.BABEL_MODULES ?? "auto");

  // BABEL_MODULES: "false" → ESM output (modules: false), "commonjs" → CJS,
  // unset → preset-env's default ("auto", which detects ESM source & transforms
  // to CJS). Env vars are strings; "false" is mapped to the boolean.
  const modulesEnv = process.env.BABEL_MODULES;
  const presetEnvOptions = modulesEnv
    ? { modules: modulesEnv === "false" ? false : modulesEnv }
    : {};
  const presets = [
    ["@babel/preset-env", presetEnvOptions],
    "@babel/typescript",
  ];

  const plugins = [];

  if (process.env.NODE_ENV === "development") {
    plugins.push("istanbul");
  }

  // Add the define plugin
  plugins.push([
    "babel-plugin-transform-define",
    {
      __PACKAGE_VERSION__: version,
    },
  ]);

  if (buildConfig.useAxios) {
    plugins.push(
      path.resolve(
        import.meta.dirname,
        "config/babel-plugin-alias-http-client.js",
      ),
    );
  }

  const config = {
    comments: process.env.NODE_ENV !== "production",
    presets,
    plugins,
    targets:
      process.env.NODE_ENV === "production"
        ? { node: 20, browsers: ["> 2%", "ie 11", "not op_mini all"] }
        : { browsers: ["> 2%"] },
  };

  return config;
}
