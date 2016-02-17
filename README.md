# js-stellar-sdk
[![Build Status](https://travis-ci.org/stellar/js-stellar-sdk.svg?branch=master)](https://travis-ci.org/stellar/js-stellar-sdk)
[![Coverage Status](https://coveralls.io/repos/stellar/js-stellar-sdk/badge.svg?branch=master&service=github)](https://coveralls.io/github/stellar/js-stellar-sdk?branch=master)
[![Dependency Status](https://david-dm.org/stellar/js-stellar-sdk.svg)](https://david-dm.org/stellar/js-stellar-sdk)



js-stellar-sdk is a client-side Stellar Javascript library for communicating with a [Stellar Horizon server](https://github.com/stellar/horizon). It is used for building Stellar apps either on Node.js or in the browser.

It provides:
- a networking layer API for Horizon endpoints.
- facilities for building and signing transactions, for communicating with a Stellar Horizon instance, and for submitting transactions or querying network history.

### js-stellar-sdk vs js-stellar-base

js-stellar-sdk is a high-level library that serves as client side API for [Horizon](https://github.com/stellar/horizon). This library makes extensive use of the lower-level [js-stellar-base](https://github.com/stellar/js-stellar-base) and exposes js-stellar-base classes via its export object.  js-stellar-base can be used as a standalone library for creating Stellar primitive constructs via XDR helpers and wrappers. js-stellar-base doesn't depend on connecting to Horizon.

js-stellar-sdk exposes all js-stellar-base classes so you don't have to install js-stellar-base along js-stellar-sdk.

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

### To use as a module in a Node.js project
1. Install it using npm:
  ```shell
  npm install --save stellar-sdk
  ```

2. require/import it in your JavaScript:
  ```js
  var StellarSdk = require('stellar-sdk');
  ```

### To self host for use in the browser
1. Install it using [bower](http://bower.io):

  ```shell
  bower install stellar-sdk
  ```

2. Include it in the browser:

  ```html
  <script src="./bower_components/stellar-sdk/stellar-sdk.js"></script>
  <script>console.log(StellarSdk);</script>
  ```

If you don't want to use install Bower, you can copy built JS files from the [bower-js-stellar-sdk repo](https://github.com/stellar/bower-js-stellar-sdk).

### To use the [cdnjs](https://cdnjs.com/libraries/stellar-sdk) hosted script in the browser
1. Instruct the browser to fetch the library from [cdnjs](https://cdnjs.com/libraries/stellar-sdk), a 3rd party service that hosts js libraries:

  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/stellar-sdk/{version}/stellar-sdk.js"></script>
  <script>console.log(StellarSdk);</script>
  ```

Note that this method relies using a third party to host the JS library. This may not be entirely secure.

Make sure that you are using the latest version number. They can be found on the [releases page in Github](https://github.com/stellar/js-stellar-sdk/releases).

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
For information on how to use js-stellar-sdk, take a look at the [Developers site](https://www.stellar.org/developers/js-stellar-sdk/learn/index.html).

There is also API Documentation [here](https://github.com/stellar/horizon/blob/master/docs/Readme.md).

## Testing
To run all tests:
```shell
gulp test
```

To run a specific set of tests:
```shell
gulp test:node
gulp test:browser
```

## Documentation
Documentation for this repo lives in [Developers site](https://www.stellar.org/developers/js-stellar-sdk/learn/index.html).

## Contributing
For information on how to contribute, please refer to our [contribution guide](https://github.com/stellar/js-stellar-sdk/blob/master/CONTRIBUTING.md).

## Publishing to npm
```
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease]
```
A new version will be published to npm **and** Bower by Travis CI.

npm >=2.13.0 required.
Read more about [npm version](https://docs.npmjs.com/cli/version).

## License
js-stellar-sdk is licensed under an Apache-2.0 license. See the [LICENSE](https://github.com/stellar/js-stellar-sdk/blob/master/LICENSE) file for details.
