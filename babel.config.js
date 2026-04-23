import path from "path";
import buildConfig from "./config/build.config.js";
import fs from "fs";
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const version = packageJson.version;

export default function (api) {

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
};
