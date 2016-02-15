# Changelog

As this project is pre 1.0, breaking changes may happen for minor version bumps. A breaking change will get clearly notified in this log.

## 0.5.0 - unreleased

* **Breaking change** `Server` and `FederationServer` constructors no longer accept object as `serverUrl` parameter.
* **Breaking change** Removed `AccountCallBuilder.address` method. Use `AccountCallBuilder.accountId` instead.
* **Breaking change** It's no longer possible to connect to insecure server in `Server` or `FederationServer` unless `allowHttp` flag in `opts` is set.

## Unreleased

* Added tests.
* Added `CHANGELOG.md` file.

## 0.4.1

* `stellar-base` bump. (c90c68f)

## 0.4.0

* **Breaking change** Bumped `stellar-base` to [0.5.0](https://github.com/stellar/js-stellar-base/blob/master/CHANGELOG.md#050). (b810aef)
