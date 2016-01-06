describe("federation-server.js tests", function () {
  beforeEach(function () {
    this.server = new StellarSdk.FederationServer('https://acme.com:1337/federation', 'stellar.org');
    this.axiosMock = sinon.mock(axios);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  describe('FederationServer.forAddress', function () {
    beforeEach(function () {
      this.axiosMock.expects('get')
        .withArgs(sinon.match('https://acme.com:1337/federation?type=name&q=bob%2Astellar.org'))
        .returns(Promise.resolve({
          data: {
            stellar_address: 'bob*stellar.org',
            account_id: 'GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS'
          }
        }));
    });

    it("requests is correct", function (done) {
      this.server.forAddress('bob*stellar.org')
        .then(response => {
          expect(response.stellar_address).equals('bob*stellar.org');
          expect(response.account_id).equals('GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS');
          done();
        })
        .catch(function (err) {
          done(err);
        });
    });

    it("requests is correct for username as stellar address", function (done) {
      this.server.forAddress('bob')
        .then(response => {
          expect(response.stellar_address).equals('bob*stellar.org');
          expect(response.account_id).equals('GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS');
          done();
        })
        .catch(function (err) {
          done(err);
        });
    });
  });

  describe('FederationServer.forAccountId', function () {
    beforeEach(function () {
      this.axiosMock.expects('get')
        .withArgs(sinon.match('https://acme.com:1337/federation?type=id&q=GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS'))
        .returns(Promise.resolve({
          data: {
            stellar_address: 'bob*stellar.org',
            account_id: 'GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS'
          }
        }));
    });

    it("requests is correct", function (done) {
      this.server.forAccountId('GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS')
        .then(response => {
          expect(response.stellar_address).equals('bob*stellar.org');
          expect(response.account_id).equals('GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS');
          done();
        })
        .catch(function (err) {
          done(err);
        });
    });
  });

  describe('FederationServer.forTransactionId', function () {
    beforeEach(function () {
      this.axiosMock.expects('get')
        .withArgs(sinon.match('https://acme.com:1337/federation?type=txid&q=3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889'))
        .returns(Promise.resolve({
          data: {
            stellar_address: 'bob*stellar.org',
            account_id: 'GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS'
          }
        }));
    });

    it("requests is correct", function (done) {
      this.server.forTransactionId('3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889')
        .then(response => {
          expect(response.stellar_address).equals('bob*stellar.org');
          expect(response.account_id).equals('GB5XVAABEQMY63WTHDQ5RXADGYF345VWMNPTN2GFUDZT57D57ZQTJ7PS');
          done();
        })
        .catch(function (err) {
          done(err);
        });
    });
  });

  describe('FederationServer.createForDomain', function () {
    it("creates correct object", function (done) {
      this.axiosMock.expects('get')
        .withArgs(sinon.match('https://www.acme.com/.well-known/stellar.toml'))
        .returns(Promise.resolve({
          data: `
#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.stellar.org/federation"
`
        }));

      StellarSdk.FederationServer.createForDomain('acme.com')
        .then(federationServer => {
          expect(federationServer.serverURL.protocol()).equals('https');
          expect(federationServer.serverURL.hostname()).equals('api.stellar.org');
          expect(federationServer.serverURL.path()).equals('/federation');
          expect(federationServer.domain).equals('acme.com');
          done();
        });
    });

    it("fails when stellar.toml does not contain federation server info", function (done) {
      this.axiosMock.expects('get')
        .withArgs(sinon.match('https://www.acme.com/.well-known/stellar.toml'))
        .returns(Promise.resolve({
          data: ''
        }));

      StellarSdk.FederationServer.createForDomain('acme.com').should.be.rejectedWith(/stellar.toml does not contain FEDERATION_SERVER field/).and.notify(done);
    });
  });

  describe('(static) FederationServer.forAddress', function () {
    it("fails for invalid Stellar address", function (done) {
      StellarSdk.FederationServer.forAddress('bob*stellar.org*test').should.be.rejectedWith(/Invalid Stellar address/).and.notify(done);
    });
  });
});
