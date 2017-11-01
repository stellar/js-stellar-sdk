import http from "http";

describe("callbuilder.js tests", function () {

  beforeEach(function () {
    this.axiosMock = sinon.mock(axios);
    StellarSdk.Config.setDefault();
    StellarSdk.Network.useTestNetwork();
    let keypair = StellarSdk.Keypair.random();
    let account = new StellarSdk.Account(keypair.publicKey(), "56199647068161");
    this.transaction = new StellarSdk.TransactionBuilder(account)
      .addOperation(StellarSdk.Operation.payment({
        destination: "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
        asset: StellarSdk.Asset.native(),
        amount: "100.50"
      }))
      .build();
    this.transaction.sign(keypair)

  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  describe('server url without folder path: https://acme.com:1337', function () {
    let server = new StellarSdk.Server('https://acme.com:1337');

    let callbuilder = null;



    it("server.accounts()", function () {
      callbuilder = server.accounts();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/accounts");
    });


    it('server.accounts().accountId("fooAccountId")', function () {
      callbuilder = server.accounts().accountId("fooAccountId");
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/accounts/fooAccountId");
    });


    it('server.transactions()', function () {
      callbuilder = server.transactions();
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/transactions");
    });


    it('server.transactions().transaction("fooTransactionId")', function () {
      callbuilder = server.transactions().transaction("fooTransactionId");
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/transactions/fooTransactionId");

    });



    it('server.transactions().transaction("fooTransactionId")', function () {
      callbuilder = server.transactions().transaction("fooTransactionId");
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/transactions/fooTransactionId");

    });



    it('server.transactions().forAccount("fooAccountId")', function () {
      callbuilder = server.transactions().forAccount("fooAccountId");
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/accounts/fooAccountId/transactions");

    });

    it('server.submitTransaction', function (done) {

      this.axiosMock.expects('post')
        .withArgs(sinon.match('https://acme.com:1337/transactions', 'bogus'))
        .returns(Promise.resolve({
          ok: true
        }));

      server.submitTransaction(this.transaction)
        .then(response => {
          done();
        })
        .catch(function (err) {
          done(err);
        });

    });




  });


  describe('server url with folder path: https://acme.com:1337/folder/', function () {
    let server = new StellarSdk.Server('https://acme.com:1337/folder/');

    let callbuilder = null;

    it("server.accounts()", function () {
      callbuilder = server.accounts();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/folder/accounts");
    });


    it('server.accounts().accountId("fooAccountId")', function () {
      callbuilder = server.accounts().accountId("fooAccountId");
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/folder/accounts/fooAccountId");
    });


    it('server.transactions()', function () {
      callbuilder = server.transactions();
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/folder/transactions");
    });


    it('server.transactions().transaction("fooTransactionId")', function () {
      callbuilder = server.transactions().transaction("fooTransactionId");
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/folder/transactions/fooTransactionId");

    });



    it('server.transactions().transaction("fooTransactionId")', function () {
      callbuilder = server.transactions().transaction("fooTransactionId");
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/folder/transactions/fooTransactionId");

    });



    it('server.transactions().forAccount("fooAccountId")', function () {
      callbuilder = server.transactions().forAccount("fooAccountId");
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/folder/accounts/fooAccountId/transactions");

    });

    it('server.submitTransaction', function (done) {

      this.axiosMock.expects('post')
        .withArgs(sinon.match('https://acme.com:1337/folder/transactions', 'bogus'))
        .returns(Promise.resolve({
          ok: true
        }));

      server.submitTransaction(this.transaction)
        .then(response => {
          done();
        })
        .catch(function (err) {
          done(err);
        });

    });


  });

  describe('server url with folder and subfolder path: https://acme.com:1337/folder/subfolder', function () {
    let server = new StellarSdk.Server('https://acme.com:1337/folder/subfolder');

    let callbuilder = null;

    it("server.accounts()", function () {
      callbuilder = server.accounts();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/folder/subfolder/accounts");
    });


    it('server.accounts().accountId("fooAccountId")', function () {
      callbuilder = server.accounts().accountId("fooAccountId");
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/folder/subfolder/accounts/fooAccountId");
    });


    it('server.transactions()', function () {
      callbuilder = server.transactions();
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/folder/subfolder/transactions");
    });


    it('server.transactions().transaction("fooTransactionId")', function () {
      callbuilder = server.transactions().transaction("fooTransactionId");
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/folder/subfolder/transactions/fooTransactionId");

    });



    it('server.transactions().transaction("fooTransactionId")', function () {
      callbuilder = server.transactions().transaction("fooTransactionId");
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/folder/subfolder/transactions/fooTransactionId");

    });

    it('server.transactions().forAccount("fooAccountId")', function () {
      callbuilder = server.transactions().forAccount("fooAccountId");
      callbuilder.checkFilter();
      expect(callbuilder.url.toString()).to.be.equal("https://acme.com:1337/folder/subfolder/accounts/fooAccountId/transactions");

    });

    it('server.submitTransaction', function (done) {

      this.axiosMock.expects('post')
        .withArgs(sinon.match('https://acme.com:1337/folder/subfolder/transactions', 'bogus'))
        .returns(Promise.resolve({
          ok: true
        }));

      server.submitTransaction(this.transaction)
        .then(response => {
          done();
        })
        .catch(function (err) {
          done(err);
        });

    });

  });


});
