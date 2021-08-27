// Helper function to deep-copy JSON responses.
function copyJson(js) {
  return JSON.parse(JSON.stringify(js));
}

describe('/liquidity_pools tests', function() {
  beforeEach(function() {
    this.server = new StellarSdk.Server(
      'https://horizon-live.stellar.org:1337'
    );
    this.axiosMock = sinon.mock(HorizonAxiosClient);
    StellarSdk.Config.setDefault();
  });

  afterEach(function() {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  const BASE_URL = "https://horizon-live.stellar.org:1337";
  const LP_URL = BASE_URL + "/liquidity_pools"
  const server = new StellarSdk.Server(BASE_URL);

  it('can create a call builder', function() {
    let builder = server.liquidityPools();
    expect(StellarSdk.LiquidityPoolCallBuilder).to.not.be.undefined;
    expect(builder).to.be.an.instanceof(StellarSdk.LiquidityPoolCallBuilder);
  });

  const rootResponse = {
    "_links": {
      "self": {
        "href": "https://private-33c60-amm3.apiary-mock.com/liquidity_pools?cursor=113725249324879873&limit=10&order=asc"
      },
      "next": {
        "href": "https://private-33c60-amm3.apiary-mock.com/liquidity_pools?cursor=113725249324879873&limit=10&order=asc"
      },
      "prev": {
        "href": "https://private-33c60-amm3.apiary-mock.com/liquidity_pools?cursor=113725249324879873&limit=10&order=desc"
      }
    },
    "_embedded": {
      "records": [
        {
          "id": "1",
          "paging_token": "113725249324879873",
          "fee_bp": 30,
          "type": "constant_product",
          "total_trustlines": "300",
          "total_shares": "5000",
          "reserves": [
            {
              "amount": "1000.0000005",
              "asset": "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S"
            },
            {
              "amount": "2000.0000000",
              "asset": "PHP:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S"
            }
          ]
        },
        {
          "id": "2",
          "paging_token": "113725249324879874",
          "fee_bp": 30,
          "type": "constant_product",
          "total_trustlines": "200",
          "total_shares": "3500",
          "reserves": [
            {
              "amount": "1000.0000005",
              "asset": "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S"
            },
            {
              "amount": "1200.0000000",
              "asset": "USDC:GC5W3BH2MQRQK2H4A6LP3SXDSAAY2W2W64OWKKVNQIAOVWSAHFDEUSDC"
            }
          ]
        }
      ]
    }
  }

  let emptyResponse = copyJson(rootResponse);
  emptyResponse._embedded.records = [];

  let phpResponse = copyJson(rootResponse);
  phpResponse._embedded.records.pop();  // last elem doesn't have PHP asset

  const EURT = new StellarSdk.Asset("EURT", "GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S")
  const PHP  = new StellarSdk.Asset("PHP",  "GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S")

  it('returns the right root response', function(done) {
    this.axiosMock
      .expects('get')
      .withArgs(sinon.match(LP_URL))
      .returns(Promise.resolve({ data: rootResponse }));

    this.server
      .liquidityPools()
      .call()
      .then((pools) => {
        expect(pools.records).to.deep.equal(rootResponse._embedded.records);
        done();
      })
      .catch(done);
  });

  describe('filtering by asset', function() {
    const testCases = [
      {
        assets: [StellarSdk.Asset.native()],
        response: emptyResponse,
      }, {
        assets: [EURT],
        response: rootResponse,
      }, {
        assets: [PHP],
        response: phpResponse,
      }, {
        assets: [EURT, PHP],
        response: rootResponse,
      },
    ];

    testCases.forEach((testCase) => {
      const queryStr = testCase.assets.map(asset => asset.toString()).join(',');
      const description = testCase.assets.map(asset => asset.getCode()).join(' + ');

      it('can filter by asset(s) ' + description, function(done) {
        this.axiosMock
          .expects('get')
          .withArgs(sinon.match(`${LP_URL}?reserves=${encodeURIComponent(queryStr)}`))
          .returns(Promise.resolve({ data: testCase.response }))

        this.server
          .liquidityPools()
          .forAssets(...testCase.assets)
          .call()
          .then((pools) => {
            expect(pools.records).to.deep.equal(testCase.response._embedded.records);
            done();
          })
          .catch(done);
      });
    });
  });
});
