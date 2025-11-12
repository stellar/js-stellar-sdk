var path = require('path');
var webpack = require('webpack');
var fs = require('fs');

var ESLintPlugin = require('eslint-webpack-plugin');
var TerserPlugin = require('terser-webpack-plugin');
var NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
var buildConfig = require('./build.config');

// Read the version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;

const config = {
  target: 'web',
  // https://stackoverflow.com/a/34018909
  entry: {
    'stellar-sdk': path.resolve(__dirname, '../src/browser.ts'),
    'stellar-sdk.min': path.resolve(__dirname, '../src/browser.ts')
  },
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    },
    extensions: ['.ts', '.js'],
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

      if (!buildConfig.useAxios && !buildConfig.useEventSource) name += '-minimal';
      else if (!buildConfig.useAxios) name += '-no-axios';
      else if (!buildConfig.useEventSource) name += '-no-eventsource';
      
      return name + suffix;
    },
    path: path.resolve(__dirname, '../dist')
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
      overrideConfigFile: path.resolve(__dirname, "../eslint.config.js"),
    }),
    // Ignore native modules (sodium-native)
    new webpack.IgnorePlugin({ resourceRegExp: /sodium-native/ }),
    new NodePolyfillPlugin({
      includeAliases: ['http', 'https'] // others aren't needed
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      __USE_AXIOS__: JSON.stringify(buildConfig.useAxios),
      __USE_EVENTSOURCE__: JSON.stringify(buildConfig.useEventSource),
      __PACKAGE_VERSION__: version,
    })
  ],
  watchOptions: {
    ignored: /(node_modules|coverage|lib|dist)/
  }
};

module.exports = config;
