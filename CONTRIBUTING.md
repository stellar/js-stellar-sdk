# How to contribute

Please read the [Contribution Guide](https://github.com/stellar/docs/blob/master/CONTRIBUTING.md).

Then please [sign the Contributor License Agreement](https://docs.google.com/forms/d/1g7EF6PERciwn7zfmfke5Sir2n10yddGGSXyZsq98tVY/viewform?usp=send_form).


# Releasing
Just like with the [js-stellar-base](https://github.com/stellar/js-stellar-base) library, there are a few important things to remember when releasing a new version of the library.

In fact, you should follow [the steps there](https://github.com/stellar/js-stellar-base/blob/master/CONTRIBUTING.md#Releasing), first, except for this repository. Then, **if base has been updated**, you want to follow the additional steps here:

 - [ ] First, bump its version accordingly. This is straightforward: change the version field of `"stellar-base"` under the `"dependencies"` section in the SDK's [package.json](https://github.com/stellar/js-stellar-sdk/blob/master/package.json#L140), e.g.:

```diff
  "dependencies": {
     ...
-    "stellar-base": "^1.0.0",
+    "stellar-base": "^2.0.0",
  }
```

  - [ ] Finally, run `yarn` so that the dependency is pulled (ensuring its a valid version) and the lockfile is updated with the latest integrity details. You can now commit the change and PR accordingly.
