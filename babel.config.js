const buildConfig = require('./config/build.config');
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const version = packageJson.version;

module.exports = function(api) {
  api.cache(true);

  const presets = [
    "@babel/preset-env",
    "@babel/typescript"
  ];

  const plugins = [];

  if (process.env.NODE_ENV === 'development') {
    plugins.push('istanbul');
  }

  // Add the define plugin
  plugins.push([
    'babel-plugin-transform-define',
    {
      __USE_AXIOS__: buildConfig.useAxios,
      __USE_EVENTSOURCE__: buildConfig.useEventSource,
      __PACKAGE_VERSION__: version,
    }
  ]);

  const config = {
    comments: process.env.NODE_ENV !== 'production',
    presets,
    plugins,
    targets: process.env.NODE_ENV === 'production'
      ? { node: 20, browsers: ["> 2%", "ie 11", "not op_mini all"] }
      : { browsers: ["> 2%"] }
  };

  return config;
};
