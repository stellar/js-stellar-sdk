let axios = require('axios');

describe("integration tests", function () {
  const TIMEOUT = 20*1000;
  this.timeout(TIMEOUT);
  this.slow(TIMEOUT/2);

  const HORIZON = 'https://horizon-testnet.stellar.org';
  StellarSdk.Network.useTestNetwork();
  let server = new StellarSdk.Server(HORIZON);
  let master = StellarSdk.Keypair.random();

  before(function(done) {
    axios.get(`${HORIZON}/friendbot?addr=${master.publicKey()}`).then(() => done());
  });

  after(function(done) {
    // Merge account
    server.operations().forAccount(master.publicKey()).limit(1).order('asc')
      .call()
      .then(response => {
        let operation = response.records[0];
        
        return server.loadAccount(master.publicKey())
          .then(source => {
            let tx = new StellarSdk.TransactionBuilder(source)
              .addOperation(StellarSdk.Operation.accountMerge({
                destination: operation.funder
              }))
              .build();

            tx.sign(master);

            server.submitTransaction(tx).then(() => done());
          });
      });
  });

  function createNewAccount(accountId) {
    return server.loadAccount(master.publicKey())
      .then(source => {
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(StellarSdk.Operation.createAccount({
            destination: accountId,
            startingBalance: "1"
          }))
          .build();

        tx.sign(master);

        return server.submitTransaction(tx);
      });
  }

  describe("/transaction", function () {
    it("submits a new transaction", function (done) {
      createNewAccount(StellarSdk.Keypair.random().publicKey())
        .then(result => {
          expect(result.ledger).to.be.not.null;
          done();
        })
        .catch(err => done(err));
    });

    it("submits a new transaction with error", function (done) {
      server.loadAccount(master.publicKey())
        .then(source => {
          source.incrementSequenceNumber(); // This will cause an error
          let tx = new StellarSdk.TransactionBuilder(source)
            .addOperation(StellarSdk.Operation.createAccount({
              destination: StellarSdk.Keypair.random().publicKey(),
              startingBalance: "1"
            }))
            .build();

          tx.sign(master);

          server.submitTransaction(tx)
            .then(result => done(new Error("This promise should be rejected.")))
            .catch(error => {
              expect(error.response.data.extras.result_codes.transaction).to.equal('tx_bad_seq');
              done();
            });
        });
    });
  });

  describe("/accounts", function () {
    it("get account", function (done) {
      server.accounts().accountId(master.publicKey())
        .call()
        .then(account => {
          // The first account should be a master account
          expect(account.account_id).to.equal(master.publicKey());
          done();
        });
    });

    it("stream accounts", function (done) {
      this.timeout(10*1000);
      let randomAccount = StellarSdk.Keypair.random();

      let eventStreamClose = server.operations().forAccount(master.publicKey())
        .cursor('now')
        .stream({
          onmessage: operation => {
            expect(operation.type).to.equal('create_account');
            expect(operation.funder).to.equal(master.publicKey());
            expect(operation.account).to.equal(randomAccount.publicKey());
            eventStreamClose();
            done();
          }
        });

      createNewAccount(randomAccount.publicKey());
      setTimeout(() => eventStreamClose(), 10*1000);
    });
  });
});
