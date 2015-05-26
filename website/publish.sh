#!/bin/bash

set -e

cd ../../js-stellar-lib-gh-pages
git checkout -- .
git clean -dfx
git fetch
git rebase
rm -Rf *
cd ../js-stellar-lib/website
npm run-script docs
cp -R docs/* ../../js-stellar-lib-gh-pages/
rm -Rf docs/
cd ../../js-stellar-lib-gh-pages
git add --all
git commit -m "update website"
git push
cd ../js-stellar-lib/website