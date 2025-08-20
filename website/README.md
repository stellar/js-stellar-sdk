# Publish the website
We use jsdoc to generate a static doc website for this project. As of 5/26/15 we're
using the master branch of jsdoc to generate the static doc page, as it has the only
support for ES6 classes that we need.
We use github pages to host the static site. For the publish script to work, you need to have a folder at the same level as ```js-stellar-lib``` called ```js-stellar-lib-gh-pages````.

Assuming you're in this folder on the command line, follow these steps:

```
cd ../../
git clone git@github.com:stellar/js-stellar-lib.git js-stellar-lib-gh-pages
cd js-stellar-lib-gh-pages
git checkout origin/gh-pages
git checkout -b gh-pages
git push --set-upstream origin gh-pages
cd ../js-stellar-lib/website
```

Then, run the publish script to build the static site and publish it to the gh-pages branch.

```
./publish.sh
```