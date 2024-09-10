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

  return config;
};
