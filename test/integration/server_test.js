describe("integration tests", function () {
  // We need to wait for a ledger to close
  this.timeout(20*1000);
  this.slow(10*10000);

  // Docker
  let server = new StellarSdk.Server('http://127.0.0.1:8000');
  let master = StellarSdk.Keypair.master();

  function createNewAccount(accountId) {
    return server.loadAccount(master.accountId())
      .then(source => {
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(StellarSdk.Operation.createAccount({
            destination: accountId,
            startingBalance: "20"
          }))
          .build();

        tx.sign(master);

        return server.submitTransaction(tx);
      });
  }

  describe("/transaction", function () {
    it("submits a new transaction", function (done) {
      createNewAccount(StellarSdk.Keypair.random().accountId())
        .then(result => {
          expect(result.ledger).to.be.not.null;
          done();
        })
        .catch(err => done(err));
    });

    it("submits a new transaction with error", function (done) {
      server.loadAccount(master.accountId())
        .then(source => {
          source.incrementSequenceNumber(); // This will cause an error
          let tx = new StellarSdk.TransactionBuilder(source)
            .addOperation(StellarSdk.Operation.createAccount({
              destination: StellarSdk.Keypair.random().accountId(),
              startingBalance: "20"
            }))
            .build();

          tx.sign(master);

          server.submitTransaction(tx)
            .then(result => done(new Error("This promise should be rejected.")))
            .catch(result => {
              expect(result.extras.result_codes.transaction).to.equal('tx_bad_seq');
              done();
            });
        });
    });
  });

  describe("/accounts", function () {
    it("lists all accounts", function (done) {
      server.accounts()
        .call()
        .then(accounts => {
          // The first account should be a master account
          expect(accounts.records[0].account_id).to.equal(master.accountId());
          done();
        });
    });

    it("stream accounts", function (done) {
      let randomAccount = StellarSdk.Keypair.random();

      server.accounts()
        .cursor('now')
        .stream({
          onmessage: account => {
            expect(account.account_id).to.equal(randomAccount.accountId());
            done();
          }
        });

      createNewAccount(randomAccount.accountId());
    });
  });
});
