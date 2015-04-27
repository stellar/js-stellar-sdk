# js-stellar-lib
=======

A client side Stellar Javascript Library for building and signing Stellar transactions, and communicating with a remote Stellar Horizon Server.

## Overview

js-stellar-lib is a client side Javascript library for building client side Stellar apps. These can be either node apps or in the browser. The library provides facillities for building and signing transactions, and communicating with a Stellar Horizon instance, for submitting transactions or querying network history.

## Get Started

```
npm install js-stellar-lib
```

## Documentation



## Building the Browser Bundle

To build the js-stellar-lib browser bundle:

```sh
gulp build:browser
```

This will generate files named `js-stellar-lib.js` and `js-stellar-lib.min.js`.
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

Code released under [the Apache 2 license](https://github.com/stellar/js-stellar-lib/blob/master/LICENSE.txt).