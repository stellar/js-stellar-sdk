module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai-as-promised', 'chai', 'sinon'],
    browsers : ["Firefox"],

    files: [
      'dist/stellar-sdk.js',
      'test/test-helper.js',
      'test/unit/**/*.js'
    ],

    preprocessors: {
      'test/**/*.js': ['webpack']
    },

    webpack: {
      module: {
        loaders: [
          { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
      }
    },

    webpackMiddleware: {
      noInfo: true
    },

    singleRun: true,

    reporters: ['dots']
  });
};
