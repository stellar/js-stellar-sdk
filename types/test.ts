import * as StellarSdk from 'stellar-sdk';

StellarSdk.StellarTomlResolver.resolve('example.com', {
  allowHttp: true,
  timeout: 100
}).then((toml: any) => toml.FEDERATION_SERVER);
