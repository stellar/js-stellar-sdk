const fs = require('fs');
const path = require('path');
const buildConfig = require('./config/build.config');
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

  const config = {
    comments: process.env.NODE_ENV !== 'production',
    presets,
    plugins,
    targets: process.env.NODE_ENV === 'production' 
      ? { node: 16, browsers: ["> 2%", "ie 11", "not op_mini all"] }
      : { browsers: ["> 2%"] }
  };

  config.plugins.push([
    'transform-define',
    {
      __USE_AXIOS__: buildConfig.useAxios,
      __USE_EVENTSOURCE__: buildConfig.useEventSource,
      __PACKAGE_VERSION__: version,
    }
  ]);

  if (process.env.VARIANT_FILES_ONLY === 'true') {
    const variantFiles = [
      'http-client/index.ts',
      'horizon/call_builder.ts'
    ];

    config.only = variantFiles.map(file => 
      path.resolve(__dirname, 'src', file)
    );
  }

  return config;
};
