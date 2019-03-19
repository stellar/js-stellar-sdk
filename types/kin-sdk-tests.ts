import * as KinSdk from 'kin-sdk';

KinSdk.StellarTomlResolver.resolve("example.com", {allowHttp: true, timeout: 100})
    .then(toml => toml.FEDERATION_SERVER);
