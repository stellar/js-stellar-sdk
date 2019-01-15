# js-kin-sdk
<!--
[![Build Status](https://travis-ci.org/kinecosystem/js-kin-sdk.svg?branch=master)](https://travis-ci.org/kinecosystem/js-kin-sdk)
[![Coverage Status](https://coveralls.io/repos/kinecosystem/js-kin-sdk/badge.svg?branch=master&service=github)](https://coveralls.io/github/kinecosystem/js-kin-sdk?branch=master)
[![Dependency Status](https://david-dm.org/kinecosystem/js-kin-sdk.svg)](https://david-dm.org/kinecosystem/js-kin-sdk)
-->

**Note: this is a fork of the [original Stellar SDK](https://github.com/stellar/js-stellar-sdk). This fork has been modified to be compatible with the Kin fork of the Stellar Network.**

js-kin-sdk is a JavaScript library for communicating with a [Stellar Horizon server](https://github.com/stellar/go/tree/master/services/horizon). It is used for building Kin apps either on Node.js or in the browser.

It provides:
- a networking layer API for Horizon endpoints.
- facilities for building and signing transactions, for communicating with a Stellar Horizon instance, and for submitting transactions or querying network history.

> **Warning!** Node version of `kin-base` (`kin-sdk` dependency) package is using [`ed25519`](https://www.npmjs.com/package/ed25519) package, a native implementation of [Ed25519](https://ed25519.cr.yp.to/) in Node.js, as an [optional dependency](https://docs.npmjs.com/files/package.json#optionaldependencies). This means that if for any reason installation of this package fails, `kin-base` (and `kin-sdk`) will fallback to the much slower implementation contained in [`tweetnacl`](https://www.npmjs.com/package/tweetnacl).
>
> If you are using `kin-sdk`/`kin-base` in a browser you can ignore this. However, for production backend deployments you should definitely be using `ed25519`. If `ed25519` is successfully installed and working `KinSdk.FastSigning` variable will be equal `true`. Otherwise it will be `false`.

### js-kin-sdk vs js-kin-base

js-kin-sdk is a high-level library that serves as client side API for [Horizon](https://github.com/stellar/go/tree/master/services/horizon). This library makes extensive use of the lower-level [js-kin-base](https://github.com/kinecosystem/js-kin-base) and exposes js-kin-base classes via its export object.  js-kin-base can be used as a standalone library for creating Stellar primitive constructs via XDR helpers and wrappers. js-kin-base doesn't depend on connecting to Horizon.

js-kin-sdk exposes all js-kin-base classes so you don't have to install js-kin-base along js-kin-sdk.

## Quick start

Using npm to include js-kin-sdk in your own project:
```shell
npm install --save @kinecosystem/kin-sdk
```

For browsers, [use Bower to install js-kin-sdk](#to-self-host-for-use-in-the-browser). It exports a
variable `KinSdk`. The example below assumes you have `kin-sdk.js`
relative to your html file.

```html
<script src="kin-sdk.js"></script>
<script>console.log(KinSdk);</script>

```

## Install

### To use as a module in a Node.js project
1. Install it using npm:
  ```shell
  npm install --save @kinecosystem/kin-sdk
  ```

2. require/import it in your JavaScript:
  ```js
  var SdkSdk = require('kin-sdk');
  ```

#### Help! I'm having trouble installing the SDK on Windows

Unfortunately, the Stellar platform development team mostly works on OS X and Linux, and so sometimes bugs creep through that are specific to windows.  When installing stellar-sdk on windows, you might see an error that looks similar to the following:

```shell
error MSB8020: The build tools for v120 (Platform Toolset = 'v120 ') cannot be found. To build using the v120 build tools, please install v120 build tools.  Alternatively, you may upgrade to the current Visual Studio tools by selecting the Project menu or right-click the solution, and then selecting "Retarget solution"
```

To resolve this issue, you should upgrade your version of nodejs, node-gyp and then re-attempt to install the offending package using `npm install -g --msvs_version=2015 ed25519`.  Afterwards, retry installing stellar-sdk as normal.

If you encounter the error: "failed to find C:\OpenSSL-Win64", You need to install OpenSSL. More information about this issue can be found [here](https://github.com/nodejs/node-gyp/wiki/Linking-to-OpenSSL).

In the event the above does not work, please join us on our community slack to get help resolving your issue.

### To self host for use in the browser
1. Install it using [bower](http://bower.io):

  ```shell
  bower install kin-sdk
  ```

2. Include it in the browser:

  ```html
  <script src="./bower_components/kin-sdk/kin-sdk.js"></script>
  <script>console.log(KinSdk);</script>
  ```

If you don't want to use install Bower, you can copy built JS files from the [bower-js-kin-sdk repo](https://github.com/kinecosystem/bower-js-kin-sdk).

<!--
### To use the [cdnjs](https://cdnjs.com/libraries/kin-sdk) hosted script in the browser
1. Instruct the browser to fetch the library from [cdnjs](https://cdnjs.com/libraries/kin-sdk), a 3rd party service that hosts js libraries:

  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/kin-sdk/{version}/kin-sdk.js"></script>
  <script>console.log(KinSdk);</script>
  ```

Note that this method relies using a third party to host the JS library. This may not be entirely secure.
-->

Make sure that you are using the latest version number. They can be found on the [releases page in Github](https://github.com/kinecosystem/js-kin-sdk/releases).

### To develop and test js-kin-sdk itself
1. Clone the repo:
  ```shell
  git clone https://github.com/kinecosystem/js-kin-sdk.git
  ```

2. Install dependencies inside js-kin-sdk folder:
  ```shell
  cd js-kin-sdk
  npm install
  ```

## Usage
For information on how to use js-kin-sdk, take a look at the [Stellar Developers site](https://www.stellar.org/developers/js-stellar-sdk/reference/).

There is also API Documentation [here](https://www.stellar.org/developers/reference/).

## Testing
To run all tests:
```shell
gulp test
```

To run a specific set of tests:
```shell
gulp test:node
gulp test:browser
gulp test:integration
```

## Documentation
Documentation for this repo lives in [Stellar Developers site](https://www.stellar.org/developers/js-stellar-sdk/learn/index.html).

<!--
## Contributing
For information on how to contribute, please refer to our [contribution guide](https://github.com/stellar/js-stellar-sdk/blob/master/CONTRIBUTING.md).
-->

## Publishing to npm
```
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease]
```
A new version will be published to npm **and** Bower by Travis CI.

npm >=2.13.0 required.
Read more about [npm version](https://docs.npmjs.com/cli/version).

## License
js-kin-sdk is licensed under an Apache-2.0 license. See the [LICENSE](https://github.com/kinecosystem/js-kin-sdk/blob/master/LICENSE) file for details.
