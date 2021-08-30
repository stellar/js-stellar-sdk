// Helper function to deep-copy JSON responses.
function copyJson(js) {
  return JSON.parse(JSON.stringify(js));
}

const BASE_URL = "https://horizon-live.stellar.org:1337";
const LP_URL = BASE_URL + "/liquidity_pools"


describe('/liquidity_pools tests', function() {
  beforeEach(function() {
    this.server = new StellarSdk.Server(BASE_URL);
    this.axiosMock = sinon.mock(HorizonAxiosClient);
    StellarSdk.Config.setDefault();
  });

  afterEach(function() {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it('can create a LiquidityPoolCallBuilder', function() {
    expect(this.server.liquidityPools()).not.to.be.undefined;
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

      it('filters by asset(s) ' + description, function(done) {
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

    const lpId = "ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a";

    it('checks for valid IDs', function() {
      expect(() => this.server.liquidityPools().liquidityPoolId("nonsense")).to.throw();
      expect(() => this.server.liquidityPools().liquidityPoolId(lpId)).not.to.throw();
    });

    it('filters by specific ID', function(done) {
      const poolResponse = {
        "id": "ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a",
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
          },
        ]
      };

      this.axiosMock
        .expects('get')
        .withArgs(sinon.match(`${LP_URL}/${lpId}`))
        .returns(Promise.resolve({ data: poolResponse }))

      this.server
        .liquidityPools()
        .liquidityPoolId(lpId)
        .call()
        .then((pool) => {
          expect(pool).to.deep.equal(poolResponse);
          done();
        })
        .catch(done);
    });
  });
});
