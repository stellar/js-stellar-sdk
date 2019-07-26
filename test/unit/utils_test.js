const randomBytes = require("randombytes");

describe('Utils', function() {
  beforeEach(function() {
    StellarSdk.Network.useTestNetwork();
  });

  describe('Utils.buildChallengeTx', function() {
    it('returns challenge which follows SEP0010 spec', function() {
      let keypair = StellarSdk.Keypair.random();

      const challenge = StellarSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "SDF"
      );

      const transaction = new StellarSdk.Transaction(challenge);

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
    });

    it('uses the passed-in timeout', function() {
      let keypair = StellarSdk.Keypair.random();

      const challenge = StellarSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "SDF",
        600
      );

      const transaction = new StellarSdk.Transaction(challenge);
      const { maxTime, minTime } = transaction.timeBounds;
      expect(parseInt(maxTime) - parseInt(minTime)).to.eql(600);
    });
  });

  describe('Utils.verifyChallengeTx', function() {
    it('throws an error if transaction source account is different to server account id', function() {
      let keypair = StellarSdk.Keypair.random();

      const challenge = StellarSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "SDF"
      );

      let serverAccountId = StellarSdk.Keypair.random().publicKey();

      expect(
        () => StellarSdk.Utils.verifyChallengeTx(challenge, serverAccountId)
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /The transaction source account is not equal to the server's account/
      );
    });

    it('throws an error if transaction has no signatures', function() {
      let keypair = StellarSdk.Keypair.random();
      const account = new StellarSdk.Account(keypair.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(account, { fee: 100 })
            .setTimeout(30)
            .build();

      const challenge = transaction
            .toEnvelope()
            .toXDR("base64")
            .toString();

      expect(
        () => StellarSdk.Utils.verifyChallengeTx(challenge, keypair.publicKey())
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /The transaction is not signed/
      );
    });

    it('throws an error if transaction doestn\'t contain any operation', function() {
      let keypair = StellarSdk.Keypair.random();
      const account = new StellarSdk.Account(keypair.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(account, { fee: 100 })
            .setTimeout(30)
            .build();

      transaction.sign(keypair);
      const challenge = transaction
            .toEnvelope()
            .toXDR("base64")
            .toString();

      expect(
        () => StellarSdk.Utils.verifyChallengeTx(challenge, keypair.publicKey())
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /The transaction should contain only one operation/
      );
    });

    it('throws an error if operation does not contain the source account', function() {
      let keypair = StellarSdk.Keypair.random();
      const account = new StellarSdk.Account(keypair.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(account, { fee: 100 })
            .addOperation(
              StellarSdk.Operation.manageData({
                name: 'SDF auth',
                value: randomBytes(64)
              })
            )
            .setTimeout(30)
            .build();

      transaction.sign(keypair);
      const challenge = transaction
            .toEnvelope()
            .toXDR("base64")
            .toString();

      expect(
        () => StellarSdk.Utils.verifyChallengeTx(challenge, keypair.publicKey())
      ).to.throw(
        StellarSdk.InvalidSep10ChallengeError,
        /The transaction should contain a source account/
      );
    });
  });
});
