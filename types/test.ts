import * as StellarSdk from './src';

StellarSdk.StellarTomlResolver.resolve('example.com', {
  allowHttp: true,
  timeout: 100
}).then((toml) => toml.FEDERATION_SERVER);
