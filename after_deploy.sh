git clone -b gh-pages "https://stellar-jenkins@github.com/stellar/js-stellar-sdk.git" jsdoc

if [ ! -d "jsdoc" ]; then
  echo "Error cloning"
  exit 1
fi

npm run docs
cd jsdoc
git add .
git commit -m $TRAVIS_TAG
git push origin gh-pages
