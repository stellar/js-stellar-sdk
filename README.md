# js-stellar-sdk
[![Build Status](https://travis-ci.org/stellar/js-stellar-sdk.svg?branch=master)](https://travis-ci.org/stellar/js-stellar-sdk)
### Note: This library is still under development and subject to breaking changes.

js-stellar-sdk is a client-side Stellar Javascript library for communicating with a [Stellar Horizon server](https://github.com/stellar/go-horizon). It is used for building Stellar apps either on Node.js or in the browser.

It provides:
- a networking layer API for Horizon endpoints.
- facilities for building and signing transactions, for communicating with a Stellar Horizon instance, and for submitting transactions or querying network history.

### js-stellar-sdk vs js-stellar-base

This library (js-stellar-sdk) is a high-level library that serves as an API for various Stellar services (currently only Horizon). This library makes extensive use of the lower-level library [js-stellar-base](https://github.com/stellar/js-stellar-base) and exposes js-stellar-base classes via its export object. To make it easier for developers who don't want to have to pull both js-stellar-base and js-stellar-sdk as dependencies, many examples will use js-stellar-base classes (such as TransactionBuilder and Operation) that are exposed through this library. However, js-stellar-base can be used as a standalone library for creating Stellar primitive constructs via XDR helpers and wrappers.


## Quick start

Using npm to include js-stellar-sdk in your own project:
```shell
npm install --save stellar-sdk
```

For browsers, [use Bower to install js-stellar-sdk](#to-use-in-the-browser). It exports a
variable `StellarSdk`. The example below assumes you have `stellar-sdk.js`
relative to your html file.

```html
<script src="stellar-sdk.js"></script>
<script>console.log(StellarSdk);</script>

```

## Install
### Node.js prerequisite
Node.js version 0.10 is required. If you don't have version 0.10, use
[nvm](https://github.com/creationix/nvm) to easily switch between versions.

### To use as a module in a Node.js project
1. Install it using npm:
  ```shell
  npm install --save stellar-sdk
  ```

2. require/import it in your JavaScript:
  ```js
  var StellarSdk = require('stellar-sdk');
  ```

### To use in the browser
1. Install it using [bower](http://bower.io):

  ```shell
  bower install stellar-sdk
  ```

2. Include it in the browser:

  ```html
  <script src="./bower_components/stellar-sdk/stellar-sdk.js"></script>
  <script>console.log(StellarSdk);</script>
  ```

Note that, if you don't want to use Bower, you can also copy built JS files from [bower-js-stellar-sdk repo](https://github.com/stellar/bower-js-stellar-sdk).

### To develop and test js-stellar-sdk itself
1. Clone the repo:
  ```shell
  git clone https://github.com/stellar/js-stellar-sdk.git
  ```

2. Install dependencies inside js-stellar-sdk folder:
  ```shell
  cd js-stellar-sdk
  npm install
  ```

## Usage
For information on how to use js-stellar-sdk, take a look at the [docs folder](./docs).

There is also API Documentation [here](http://stellar.github.io/js-stellar-sdk).

## Testing
To run all tests:
```shell
./node_modules/.bin/gulp test
```

To run a specific set of tests:
```shell
gulp test:node
gulp test:browser
```

## Documentation
Documentation for this repo lives inside the [docs folder](./docs).

## Contributing
For information on how to contribute, please refer to our [contribution guide](./CONTRIBUTING.md).

## Publishing to npm
```
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease]
```
A new version will be published to npm **and** Bower by Travis CI.

npm >=2.13.0 required.
Read more about [npm version](https://docs.npmjs.com/cli/version).

## License
js-stellar-sdk is licensed under an Apache-2.0 license. See the [LICENSE](./LICENSE) file for details.



