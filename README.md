# js-stellar-lib
[![Build Status](https://travis-ci.org/stellar/js-stellar-lib.svg?branch=master)](https://travis-ci.org/stellar/js-stellar-lib)
### Note: This library is still under development and subject to breaking changes.

js-stellar-lib is a client side Stellar Javascript Library for communicating with a [Stellar Horizon Server](https://github.com/stellar/go-horizon). It is used for building Stellar apps either on Node.js or in the browser.

It provides:
- a networking layer API for Horizon endpoints
- facilities for building and signing transactions, and communicating with a Stellar Horizon instance, for submitting transactions or querying network history.

### js-stellar-lib vs js-stellar-base

This library (js-stellar-lib) is a "high level" library that serves as an API for various Stellar services (currently just Horizon). This library makes extensive use of the "lower level" library [js-stellar-base](https://github.com/stellar/js-stellar-base) and exposes js-stellar-base classes via its export object. Many examples will use js-stellar-base classes (such as TransactionBuilder, Operation, etc) that are exposed through this library. This is to make it easier for developers who don't want to have to pull both js-stellar-base and js-stellar-lib as dependencies. However, js-stellar-base can be used as a standalone library for creating Stellar primitive constructs via XDR helpers and wrappers.


## Quick start

Using npm to include js-stellar-lib in your own project:
```shell
npm install --save stellar-lib
```

For browsers, use the webpacked version in the [dist folder](dist). It exports a
variable `StellarLib`. The example below assumes you have `stellar-lib.js`
relative to your html file.

```html
<script src="stellar-lib.js"></script>
<script>console.log(StellarLib);</script>
```

## Install
### Node.js prerequisite
Node.js version 0.10 is required. If you don't have version 0.10, use
[nvm](https://github.com/creationix/nvm) to easily switch between versions.

### To use as a module in a Node.js project
1. Install it using npm:
  ```shell
  npm install --save stellar-lib
  ```

2. require/import it in your JavaScript:
  ```js
  var StellarLib = require('stellar-lib');
  ```

### To use in the browser
1. Save the `stellar-lib.js` or `stellar-lib.min.js` accessible to your html file
2. Include it in the browser:
  ```html
  <script src="./path/to/stellar-lib.js"></script>
  <script>console.log(StellarLib);</script>
  ```

### To develop and test js-stellar-lib itself
1. Clone the repo
  ```shell
  git clone https://github.com/stellar/js-stellar-lib.git
  ```

2. Install dependencies inside js-stellar-lib folder
  ```shell
  cd js-stellar-lib
  npm install
  ```

## Usage
For information on how to use js-stellar-lib, take a look at the docs in the [docs folder](./docs).

There is also API Documentation [here](http://stellar.github.io/js-stellar-lib).

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
For information on how to contribute, please refer to our [CONTRIBUTING](./CONTRIBUTING.md) file.

## License
js-stellar-lib is licensed under an Apache-2.0 license. See the [LICENSE](./LICENSE) file for details.



