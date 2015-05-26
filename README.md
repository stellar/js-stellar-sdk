# js-stellar-lib
[![Build Status](https://travis-ci.org/stellar/js-stellar-lib.svg?branch=master)](https://travis-ci.org/stellar/js-stellar-lib)
### Note: This library is still under development and subject to breaking changes.

js-stellar-lib is a client side Stellar Javascript Library for communicating with a [Stellar Horizon Server](https://github.com/stellar/go-horizon). It provides a networking layer API for Horizon endpoints.

## Overview

js-stellar-lib is a client side Javascript library for building client side Stellar apps. These can be either node apps or in the browser. The library provides facillities for building and signing transactions, and communicating with a Stellar Horizon instance, for submitting transactions or querying network history.

## Get Started

### Install via npm

```
npm install js-stellar-lib
```

### Building the Browser Bundle

```sh
gulp build:browser
```

This will generate files named `js-stellar-lib.js` and `js-stellar-lib.min.js`.

## API Documentation

Check out the API Documentation [here](http://stellar.github.io/js-stellar-lib).

## js-stellar-lib vs js-stellar-base

This library (js-stellar-lib) is a "high level" library that serves as an API for various Stellar services (currently just Horizon). This library makes extensive use of the "lower level" library [js-stellar-base](https://github.com/stellar/js-stellar-base) and exposes js-stellar-base classes via its export object. Many examples will use js-stellar-base classes (such as TransactionBuilder, Operation, etc) that are exposed through this library. This is to make it easier for developers who don't want to have to pull in js-stellar-base as a dependency. However, js-stellar-base can be used as a standlone library for creating Stellar primitive constructs via XDR helpers and wrappers.


## Tests

Run all the tests:

```sh
gulp test
```
Just the browser or node tests:
```sh
gulp test:node
gulp test:browser
```
Create a coverage report:
```sh
gulp coverage
```

## Contributing

For information on how to contribute, please refer to our [CONTRIBUTING](https://github.com/stellar/js-stellar-lib/blob/master/CONTRIBUTING.md) file.

## License

Code released under [the Apache 2 license](https://github.com/stellar/js-stellar-lib/blob/master/LICENSE).