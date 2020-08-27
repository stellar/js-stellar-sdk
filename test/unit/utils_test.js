const randomBytes = require("randombytes");

function newClientSigner(key, weight) {
  return { key, weight }
}

describe('Utils', function() {
  let clock, txBuilderOpts;

  beforeEach(function() {
    clock = sinon.useFakeTimers();
    txBuilderOpts = {
      fee: 100,
      networkPassphrase: StellarSdk.Networks.TESTNET
    };
  });

  afterEach(() => {
    clock.restore();
  });

  describe('Utils.buildChallengeTx', function() {
    it('requires a non-muxed account', function() {
      let keypair = StellarSdk.Keypair.random();

      expect(() =>
        StellarSdk.Utils.buildChallengeTx(
          keypair,
          "MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6",
          "SDF",
          300,
          StellarSdk.Networks.TESTNET
        )
      ).to.throw(
        /Invalid clientAccountID: multiplexed accounts are not supported./
      );
    });
    it('returns challenge which follows SEP0010 <2.0 spec', function() {
      let keypair = StellarSdk.Keypair.random();

      const challenge = StellarSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "SDF",
        300,
        StellarSdk.Networks.TESTNET
      );

      const transaction = new StellarSdk.Transaction(challenge, StellarSdk.Networks.TESTNET);

      expect(transaction.sequence).to.eql("0");
      expect(transaction.source).to.eql(keypair.publicKey());
      expect(transaction.operations.length).to.eql(1);

      const { maxTime, minTime } = transaction.timeBounds;

      expect(parseInt(maxTime) - parseInt(minTime)).to.eql(300);

      const [ operation ] =  transaction.operations;

      expect(operation.name).to.eql("SDF auth");
      expect(operation.source).to.eql("GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF");
      expect(operation.type).to.eql("manageData");
      expect(operation.value.length).to.eql(64);
      expect(Buffer.from(operation.value.toString(), 'base64').length).to.eql(48);
    });

    it('returns challenge which follows SEP0010 ==2.0 spec', function() {
      let keypair = StellarSdk.Keypair.random();

      const challenge = StellarSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        null,
        300,
        StellarSdk.Networks.TESTNET,
        "https://testanchor.stellar.org"
      );

      const transaction = new StellarSdk.Transaction(challenge, StellarSdk.Networks.TESTNET);

      expect(transaction.sequence).to.eql("0");
      expect(transaction.source).to.eql(keypair.publicKey());
      expect(transaction.operations.length).to.eql(1);

      const { maxTime, minTime } = transaction.timeBounds;

      expect(parseInt(maxTime) - parseInt(minTime)).to.eql(300);

      const [ operation ] =  transaction.operations;

      expect(operation.name).to.eql("testanchor.stellar.org auth");
      expect(operation.source).to.eql("GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF");
      expect(operation.type).to.eql("manageData");
      expect(operation.value.length).to.eql(64);
      expect(Buffer.from(operation.value.toString(), 'base64').length).to.eql(48);
    });

    it('uses the passed-in timeout', function() {
      let keypair = StellarSdk.Keypair.random();

      const challenge = StellarSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "SDF",
        600,
        StellarSdk.Networks.TESTNET
      );

      const transaction = new StellarSdk.Transaction(challenge, StellarSdk.Networks.TESTNET);

      let maxTime = parseInt(transaction.timeBounds.maxTime);
      let minTime = parseInt(transaction.timeBounds.minTime);

      expect(minTime).to.eql(0);
      expect(maxTime).to.eql(600);
      expect(maxTime - minTime).to.eql(600);
    });
  });

  describe("Utils.readChallengeTx", function() {
    it('requires a non-muxed account', function() {
      expect(() =>
        StellarSdk.Utils.readChallengeTx(
          "avalidtx",
          "MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6",
          "SDF",
          300,
          StellarSdk.Networks.TESTNET
        )
      ).to.throw(
        /Invalid serverAccountID: multiplexed accounts are not supported./
      );
    });
    it("requires a envelopeTypeTxV0 or envelopeTypeTx", function(){
      let serverKP = StellarSdk.Keypair.random();
      let clientKP = StellarSdk.Keypair.random();

      const challenge = StellarSdk.Utils.buildChallengeTx(
        serverKP,
        clientKP.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET
      );

      const txV0 = StellarSdk.TransactionBuilder.fromXDR(challenge, StellarSdk.Networks.TESTNET);
      const txV1Raw = new StellarSdk.xdr.TransactionEnvelope.envelopeTypeTx(
        new StellarSdk.xdr.TransactionV1Envelope({
          tx: StellarSdk.xdr.Transaction.fromXDR(Buffer.concat([StellarSdk.xdr.PublicKeyType.publicKeyTypeEd25519().toXDR(), txV0.tx.toXDR()])),
          signatures: txV0.signatures
        })
      );
      const txV1 = StellarSdk.TransactionBuilder.fromXDR(
        txV1Raw.toXDR().toString('base64'),
        StellarSdk.Networks.TESTNET
      )
      
      let feeBump = StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
        serverKP, 
        "200", 
        txV1, 
        StellarSdk.Networks.TESTNET
      ).toXDR();

      expect(() =>
        StellarSdk.Utils.readChallengeTx(
          feeBump,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET
        )
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /Invalid challenge: expected a Transaction but received a FeeBumpTransaction/
      );

      expect(() =>
        StellarSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET
        )
      ).to.not.throw(StellarSdk.InvalidSep10ChallengeError);
      expect(() =>
        StellarSdk.Utils.readChallengeTx(
          txV1Raw.toXDR().toString('base64'),
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET
        )
      ).to.not.throw(StellarSdk.InvalidSep10ChallengeError);
    });
    it("returns the transaction and the clientAccountID (client's pubKey) if the challenge was created successfully", function() {
      let serverKP = StellarSdk.Keypair.random();
      let clientKP = StellarSdk.Keypair.random();

      const challenge = StellarSdk.Utils.buildChallengeTx(
        serverKP,
        clientKP.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );

      expect(
        StellarSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
        ),
      ).to.eql({
        tx: transaction,
        clientAccountID: clientKP.publicKey(),
      });
    });

    it("throws an error if transaction sequenceNumber is different to zero", function() {
      let keypair = StellarSdk.Keypair.random();

      const account = new StellarSdk.Account(keypair.publicKey(), "100");
      const transaction = new StellarSdk.TransactionBuilder(
        account,
        txBuilderOpts,
      )
        .setTimeout(30)
        .build();

      let challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.readChallengeTx(
          challenge,
          keypair.publicKey(),
          StellarSdk.Networks.TESTNET,
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /The transaction sequence number should be zero/,
      );
    });

    it("throws an error if transaction source account is different to server account id", function() {
      let keypair = StellarSdk.Keypair.random();

      const challenge = StellarSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      let serverAccountId = StellarSdk.Keypair.random().publicKey();

      expect(() =>
        StellarSdk.Utils.readChallengeTx(
          challenge,
          serverAccountId,
          StellarSdk.Networks.TESTNET,
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /The transaction source account is not equal to the server's account/,
      );
    });

    it("throws an error if transaction doestn't contain any operation", function() {
      let keypair = StellarSdk.Keypair.random();
      const account = new StellarSdk.Account(keypair.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        account,
        txBuilderOpts,
      )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.readChallengeTx(
          challenge,
          keypair.publicKey(),
          StellarSdk.Networks.TESTNET,
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /The transaction should contain exactly one operation/,
      );
    });

    it("throws an error if transaction contains more than one operation", function() {
      let keypair = StellarSdk.Keypair.random();
      const account = new StellarSdk.Account(keypair.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        account,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            name: "SDF auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          StellarSdk.Operation.manageData({
            name: "SDF auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.readChallengeTx(
          challenge,
          keypair.publicKey(),
          StellarSdk.Networks.TESTNET,
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /The transaction should contain exactly one operation/,
      );
    });

    it("throws an error if operation does not contain the source account", function() {
      let keypair = StellarSdk.Keypair.random();
      const account = new StellarSdk.Account(keypair.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        account,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            name: "SDF auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.readChallengeTx(
          challenge,
          keypair.publicKey(),
          StellarSdk.Networks.TESTNET,
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /The transaction\'s operation should contain a source account/,
      );
    });

    it("throws an error if operation is not manage data", function() {
      let keypair = StellarSdk.Keypair.random();
      const account = new StellarSdk.Account(keypair.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        account,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.accountMerge({
            destination: keypair.publicKey(),
            source: keypair.publicKey(),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.readChallengeTx(
          challenge,
          keypair.publicKey(),
          StellarSdk.Networks.TESTNET,
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /The transaction\'s operation type should be \'manageData\'/,
      );
    });

    it("throws an error if transaction.timeBounds.maxTime is infinite", function() {
      let serverKeypair = StellarSdk.Keypair.random();
      let clientKeypair = StellarSdk.Keypair.random();

      const anchorName = "SDF";
      const networkPassphrase = StellarSdk.Networks.TESTNET;

      const account = new StellarSdk.Account(serverKeypair.publicKey(), "-1");
      const now = Math.floor(Date.now() / 1000);

      const value = randomBytes(48).toString("base64");

      let transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase,
        timebounds: {
          minTime: now,
          maxTime: "0",
        },
      })
        .addOperation(
          StellarSdk.Operation.manageData({
            name: `${anchorName} auth`,
            value,
            source: clientKeypair.publicKey(),
          }),
        )
        .build();

      transaction.sign(serverKeypair);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKeypair);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.readChallengeTx(
          signedChallenge,
          serverKeypair.publicKey(),
          StellarSdk.Networks.TESTNET,
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /The transaction requires non-infinite timebounds/,
      );
    });

    it("throws an error if operation value is not a 64 bytes base64 string", function() {
      let keypair = StellarSdk.Keypair.random();
      const account = new StellarSdk.Account(keypair.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        account,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            name: "SDF auth",
            value: randomBytes(64),
            source: "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.readChallengeTx(
          challenge,
          keypair.publicKey(),
          StellarSdk.Networks.TESTNET,
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /The transaction\'s operation value should be a 64 bytes base64 random string/,
      );
    });

    it("throws an error if transaction does not contain valid timeBounds", function() {
      let keypair = StellarSdk.Keypair.random();
      let clientKeypair = StellarSdk.Keypair.random();

      const challenge = StellarSdk.Utils.buildChallengeTx(
        keypair,
        clientKeypair.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(350000);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKeypair);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.readChallengeTx(
          signedChallenge,
          keypair.publicKey(),
          StellarSdk.Networks.TESTNET,
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /The transaction has expired/,
      );
    });
  });

  describe("Utils.verifyChallengeTxThreshold", function() {
    beforeEach(function() {
      this.serverKP = StellarSdk.Keypair.random();
      this.clientKP1 = StellarSdk.Keypair.random();
      this.clientKP2 = StellarSdk.Keypair.random();
      this.clientKP3 = StellarSdk.Keypair.random();

      this.txAccount = new StellarSdk.Account(this.serverKP.publicKey(), "-1");
      this.opAccount = new StellarSdk.Account(this.clientKP1.publicKey(), "0");

      this.operation = StellarSdk.Operation.manageData({
        source: this.clientKP1.publicKey(),
        name: "SDF-test auth",
        value: randomBytes(48).toString("base64"),
      });

      this.txBuilderOpts = {
        fee: 100,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      };
    });

    afterEach(function() {
      this.serverKP, this.clientKP1, this.clientKP2, this.txAccount, this.opAccount, this.operation = null;
    });

    it("throws an error if the server hasn't signed the transaction", function() {
      const transaction = new StellarSdk.TransactionBuilder(
        this.txAccount,
        this.txBuilderOpts,
      )
        .addOperation(this.operation)
        .setTimeout(30)
        .build();

      const threshold = 1;
      const signerSummary = [
        newClientSigner(this.clientKP1.publicKey(), 1)
      ];

      transaction.sign(this.clientKP1);

      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.verifyChallengeTxThreshold(
          challenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          signerSummary,
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        "Transaction not signed by server: '" + this.serverKP.publicKey() + "'",
      );
    });

    it("successfully validates server and client key meeting threshold", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 1;
      const signerSummary = [
        newClientSigner(this.clientKP1.publicKey(), 1)
      ];

      expect(
        StellarSdk.Utils.verifyChallengeTxThreshold(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          signerSummary,
        ),
      ).to.eql([this.clientKP1.publicKey()]);
    });

    it("successfully validates server and multiple client keys, meeting threshold", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1, this.clientKP2);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 3;
      const signerSummary = [
        newClientSigner(this.clientKP1.publicKey(), 1),
        newClientSigner(this.clientKP2.publicKey(), 2)
      ];

      expect(
        StellarSdk.Utils.verifyChallengeTxThreshold(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          signerSummary,
        ),
      ).to.eql([this.clientKP1.publicKey(), this.clientKP2.publicKey()]);
    });

    it("successfully validates server and multiple client keys, meeting threshold with more keys than needed", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1, this.clientKP2);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 3;
      const signerSummary = [
        newClientSigner(this.clientKP1.publicKey(), 1),
        newClientSigner(this.clientKP2.publicKey(), 2),
        newClientSigner(this.clientKP3.publicKey(), 2)
      ];

      expect(
        StellarSdk.Utils.verifyChallengeTxThreshold(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          signerSummary,
        ),
      ).to.eql([this.clientKP1.publicKey(), this.clientKP2.publicKey()]);
    });

    it("successfully validates server and multiple client keys, meeting threshold with more keys than needed but ignoring PreauthTxHash and XHash", function() {
      const preauthTxHash = "TAQCSRX2RIDJNHFIFHWD63X7D7D6TRT5Y2S6E3TEMXTG5W3OECHZ2OG4";
      const xHash = "XDRPF6NZRR7EEVO7ESIWUDXHAOMM2QSKIQQBJK6I2FB7YKDZES5UCLWD";
      const unknownSignerType = "?ARPF6NZRR7EEVO7ESIWUDXHAOMM2QSKIQQBJK6I2FB7YKDZES5UCLWD";

      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1, this.clientKP2);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 3;
      const signerSummary = [
        newClientSigner(this.clientKP1.publicKey(), 1),
        newClientSigner(this.clientKP2.publicKey(), 2),
        newClientSigner(this.clientKP3.publicKey(), 2),
        newClientSigner(preauthTxHash, 10),
        newClientSigner(xHash, 10),
        newClientSigner(unknownSignerType, 10),
      ];

      expect(
        StellarSdk.Utils.verifyChallengeTxThreshold(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          signerSummary,
        ),
      ).to.eql([this.clientKP1.publicKey(), this.clientKP2.publicKey()]);
    });

    it("throws an error if multiple client keys were not enough to meet the threshold", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1, this.clientKP2);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 10;
      const signerSummary = [
        newClientSigner(this.clientKP1.publicKey(), 1),
        newClientSigner(this.clientKP2.publicKey(), 2),
        newClientSigner(this.clientKP3.publicKey(), 2),
      ];

      expect(() =>
        StellarSdk.Utils.verifyChallengeTxThreshold(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          signerSummary,
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        `signers with weight 3 do not meet threshold ${threshold}"`,
      );
    });

    it("throws an error if an unrecognized (not from the signerSummary) key has signed the transaction", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1, this.clientKP2, this.clientKP3);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 10;
      const signerSummary = [
        newClientSigner(this.clientKP1.publicKey(), 1),
        newClientSigner(this.clientKP2.publicKey(), 2),
      ];

      expect(() =>
        StellarSdk.Utils.verifyChallengeTxThreshold(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          signerSummary,
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /Transaction has unrecognized signatures/,
      );
    });

    it("throws an error if the signerSummary is empty", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1, this.clientKP2, this.clientKP3);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 10;

      expect(() =>
        StellarSdk.Utils.verifyChallengeTxThreshold(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          [],
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /No verifiable client signers provided, at least one G... address must be provided/,
      );
    });
  });

  describe("Utils.verifyChallengeTxSigners", function() {
    beforeEach(function() {
      this.serverKP = StellarSdk.Keypair.random();
      this.clientKP1 = StellarSdk.Keypair.random();
      this.clientKP2 = StellarSdk.Keypair.random();

      this.txAccount = new StellarSdk.Account(this.serverKP.publicKey(), "-1");
      this.opAccount = new StellarSdk.Account(this.clientKP1.publicKey(), "0");

      this.operation = StellarSdk.Operation.manageData({
        source: this.clientKP1.publicKey(),
        name: "SDF-test auth",
        value: randomBytes(48).toString("base64"),
      });

      this.txBuilderOpts = {
        fee: 100,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      };
    });

    afterEach(function() {
      this.serverKP, this.clientKP1, this.clientKP2, this.txAccount, this.opAccount, this.operation = null;
    });

    it("successfully validates server and client master key signatures in the transaction", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        StellarSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [this.clientKP1.publicKey()],
        ),
      ).to.eql([this.clientKP1.publicKey()]);
    });

    it("throws an error if the server hasn't signed the transaction", function() {
      const transaction = new StellarSdk.TransactionBuilder(
        this.txAccount,
        this.txBuilderOpts,
      )
        .addOperation(this.operation)
        .setTimeout(30)
        .build();

      transaction.sign(StellarSdk.Keypair.random()); // Signing with another key pair instead of the server's

      const invalidsServerSignedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.verifyChallengeTxSigners(
          invalidsServerSignedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [this.clientKP1.publicKey()],
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        "Transaction not signed by server: '" + this.serverKP.publicKey() + "'",
      );
    });

    it("throws an error if the list of signers is empty", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      expect(() =>
        StellarSdk.Utils.verifyChallengeTxSigners(
          challenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [],
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /No verifiable client signers provided, at least one G... address must be provided/,
      );
    });

    it("throws an error if none of the given signers have signed the transaction", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(StellarSdk.Keypair.random(), StellarSdk.Keypair.random());
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [this.clientKP1.publicKey()],
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /None of the given signers match the transaction signatures/,
      );
    });

    it("successfully validates server and multiple client signers in the transaction", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      const clientSigners = [this.clientKP1, this.clientKP2];
      transaction.sign(...clientSigners);
      const clientSignersPubKey = clientSigners.map(kp => kp.publicKey());

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        StellarSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          clientSignersPubKey,
        ),
      ).to.eql(clientSignersPubKey);
    });

    it("successfully validates server and multiple client signers, in reverse order", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      const clientSigners = [this.clientKP1, this.clientKP2];
      transaction.sign(...clientSigners.reverse());
      const clientSignersPubKey = clientSigners.map(kp => kp.publicKey());

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        StellarSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          clientSignersPubKey,
        ),
      ).to.have.same.members(clientSignersPubKey);
    });

    it("successfully validates server and non-masterkey client signer", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        StellarSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [this.clientKP2.publicKey()],
        ),
      ).to.eql([this.clientKP2.publicKey()]);
    });

    it("successfully validates server and non-master key client signer, ignoring extra signer", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        StellarSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [this.clientKP2.publicKey(), StellarSdk.Keypair.random().publicKey()],
        ),
      ).to.eql([this.clientKP2.publicKey()]);
    });

    it("throws an error if no client but insted the server has signed the transaction", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.serverKP);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [this.clientKP2.publicKey(), this.serverKP.publicKey()],
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /None of the given signers match the transaction signatures/,
      );
    });

    it("successfully validates server and non-masterkey client signer, ignoring duplicated client signers", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        StellarSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [this.clientKP2.publicKey(), this.clientKP2.publicKey()],
        ),
      ).to.eql([this.clientKP2.publicKey()]);
    });

    it("successfully validates server and non-masterkey client signer, ignoring preauthTxHash and xHash", function() {
      const preauthTxHash = "TAQCSRX2RIDJNHFIFHWD63X7D7D6TRT5Y2S6E3TEMXTG5W3OECHZ2OG4";
      const xHash = "XDRPF6NZRR7EEVO7ESIWUDXHAOMM2QSKIQQBJK6I2FB7YKDZES5UCLWD";
      const unknownSignerType = "?ARPF6NZRR7EEVO7ESIWUDXHAOMM2QSKIQQBJK6I2FB7YKDZES5UCLWD";

      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        StellarSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [this.clientKP2.publicKey(), preauthTxHash, xHash, unknownSignerType],
        ),
      ).to.eql([this.clientKP2.publicKey()]);
    });

    it("throws an error if duplicated signers have been provided and they haven't actually signed the transaction", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [this.clientKP2.publicKey(), this.clientKP2.publicKey()],
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /None of the given signers match the transaction signatures/,
      );
    });

    it("throws an error if the same KP has signed the transaction more than once", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP2, this.clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [this.clientKP2.publicKey()],
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /Transaction has unrecognized signatures/,
      );
    });

    it("throws an error if the client attempts to verify the transaction with a Seed instead of the Public Key", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP2, this.clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [this.clientKP2.secret()],
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /No verifiable client signers provided, at least one G... address must be provided/,
      );
    });

    it("throws an error if no client has signed the transaction", function() {
      const transaction = new StellarSdk.TransactionBuilder(
        this.txAccount,
        this.txBuilderOpts,
      )
        .addOperation(this.operation)
        .setTimeout(30)
        .build();

      transaction.sign(this.serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const clientSigners = [
        this.clientKP1.publicKey(),
        this.clientKP2.publicKey(),
      ];

      expect(() =>
        StellarSdk.Utils.verifyChallengeTxSigners(
          challenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          clientSigners,
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /None of the given signers match the transaction signatures/,
      );
    });

    it("throws an error if no public keys were provided to verify signatires", function() {
      const challenge = StellarSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
      );

      clock.tick(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        StellarSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [],
        ),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /No verifiable client signers provided, at least one G... address must be provided/,
      );
    });
  });

  describe('Utils.verifyTxSignedBy', function() {
    beforeEach(function() {
      this.keypair = StellarSdk.Keypair.random();
      this.account = new StellarSdk.Account(this.keypair.publicKey(), "-1");
      this.transaction = new StellarSdk.TransactionBuilder(this.account, txBuilderOpts)
        .setTimeout(30)
        .build();
    });

    afterEach(function() {
      this.keypair, this.account, this.transaction = null;
    });

    it('returns true if the transaction was signed by the given account', function() {
      this.transaction.sign(this.keypair);

      expect(StellarSdk.Utils.verifyTxSignedBy(this.transaction, this.keypair.publicKey())).to.eql(true);
    });

    it('returns false if the transaction was not signed by the given account', function() {
      this.transaction.sign(this.keypair);

      let differentKeypair = StellarSdk.Keypair.random();

      expect(StellarSdk.Utils.verifyTxSignedBy(this.transaction, differentKeypair.publicKey())).to.eql(false);
    });

    it('works with an unsigned transaction', function() {
      expect(StellarSdk.Utils.verifyTxSignedBy(this.transaction, this.keypair.publicKey())).to.eql(false);
    });
  });

  describe("Utils.gatherTxSigners", function() {
    beforeEach(function() {
      this.keypair1 = StellarSdk.Keypair.random();
      this.keypair2 = StellarSdk.Keypair.random();
      this.account = new StellarSdk.Account(this.keypair1.publicKey(), "-1");
      this.transaction = new StellarSdk.TransactionBuilder(
        this.account,
        txBuilderOpts,
      )
        .setTimeout(30)
        .build();
    });

    afterEach(function() {
      this.keypair1, this.keypair2, this.account, this.transaction = null;
    });

    it("returns a list with the signatures used in the transaction", function() {
      this.transaction.sign(this.keypair1, this.keypair2);

      const expectedSignatures = [
        this.keypair1.publicKey(),
        this.keypair2.publicKey(),
      ];
      expect(
        StellarSdk.Utils.gatherTxSigners(this.transaction, expectedSignatures),
      ).to.eql(expectedSignatures);
    });

    it("returns a list with the signatures used in the transaction, removing duplicates", function() {
      this.transaction.sign(
        this.keypair1,
        this.keypair1,
        this.keypair1,
        this.keypair2,
        this.keypair2,
        this.keypair2,
      );

      const expectedSignatures = [
        this.keypair1.publicKey(),
        this.keypair2.publicKey(),
      ];
      expect(
        StellarSdk.Utils.gatherTxSigners(this.transaction, [
          this.keypair1.publicKey(),
          this.keypair2.publicKey(),
        ]),
      ).to.eql(expectedSignatures);
    });

    it("returns an empty list if the transaction was not signed by the given accounts", function() {
      this.transaction.sign(this.keypair1, this.keypair2);

      let wrongSignatures = [
        StellarSdk.Keypair.random().publicKey(),
        StellarSdk.Keypair.random().publicKey(),
        StellarSdk.Keypair.random().publicKey(),
      ];

      expect(
        StellarSdk.Utils.gatherTxSigners(this.transaction, wrongSignatures),
      ).to.eql([]);
    });

    it("calling gatherTxSigners with an unsigned transaction will return an empty list", function() {
      expect(
        StellarSdk.Utils.gatherTxSigners(this.transaction, [
          this.keypair1.publicKey(),
          this.keypair2.publicKey(),
        ]),
      ).to.eql([]);
    });

    it("Raises an error in case one of the given signers is not a valid G signer", function() {
      this.transaction.sign(this.keypair1, this.keypair2);
      const preauthTxHash = "TAQCSRX2RIDJNHFIFHWD63X7D7D6TRT5Y2S6E3TEMXTG5W3OECHZ2OG4";
      expect(
        () => StellarSdk.Utils.gatherTxSigners(this.transaction, [preauthTxHash, this.keypair1.publicKey()]),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /Signer is not a valid address/
      );
    });

    it("Raises an error in case one of the given signers is an invalid G signer", function() {
      this.transaction.sign(this.keypair1, this.keypair2);
      const invalidGHash = "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CAAA";
      expect(
        () => StellarSdk.Utils.gatherTxSigners(this.transaction, [invalidGHash, this.keypair1.publicKey()]),
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /Signer is not a valid address/
      );
    });
  });
});
