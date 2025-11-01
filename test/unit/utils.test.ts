import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import randomBytes from "randombytes";
import {
  StellarSdk,
  type TransactionBuilder,
} from "../test-utils/stellar-sdk-import";

const { WebAuth } = StellarSdk;

function newClientSigner(key: string, weight: number) {
  return { key, weight, type: "ed25519_public_key" };
}

describe("Utils", () => {
  let txBuilderOpts: TransactionBuilder.TransactionBuilderOptions;

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
    txBuilderOpts = {
      fee: "100",
      networkPassphrase: StellarSdk.Networks.TESTNET,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("WebAuth.buildChallengeTx", () => {
    it("allows non-muxed accounts", () => {
      const keypair = StellarSdk.Keypair.random();
      const muxedAddress =
        "MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6";
      const challenge = WebAuth.buildChallengeTx(
        keypair,
        "MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6",
        "testanchor.stellar.org",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );
      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      expect(transaction.operations[0]).toBeDefined();
      expect(transaction.operations[0]!.source).toBe(muxedAddress);
    });

    it("allows ID memos", () => {
      const keypair = StellarSdk.Keypair.random();
      const challenge = WebAuth.buildChallengeTx(
        keypair,
        StellarSdk.Keypair.random().publicKey(),
        "testanchor.stellar.org",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
        "8884404377665521220",
      );
      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      expect(transaction.memo.value).toBe("8884404377665521220");
    });

    it("disallows non-ID memos", () => {
      const keypair = StellarSdk.Keypair.random();
      expect(() => {
        WebAuth.buildChallengeTx(
          keypair,
          StellarSdk.Keypair.random().publicKey(),
          "testanchor.stellar.org",
          300,
          StellarSdk.Networks.TESTNET,
          "testanchor.stellar.org",
          "memo text",
        );
      }).toThrow();
    });

    it("disallows memos with muxed accounts", () => {
      const keypair = StellarSdk.Keypair.random();
      const muxedAddress =
        "MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6";
      expect(() => {
        WebAuth.buildChallengeTx(
          keypair,
          muxedAddress,
          "testanchor.stellar.org",
          300,
          StellarSdk.Networks.TESTNET,
          "testanchor.stellar.org",
          "8884404377665521220",
        );
      }).toThrow("memo cannot be used if clientAccountID is a muxed account");
    });

    it("returns challenge which follows SEP0010 spec", () => {
      const keypair = StellarSdk.Keypair.random();
      const clientSigningKeypair = StellarSdk.Keypair.random();

      const challenge = WebAuth.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "testanchor.stellar.org",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
        null,
        "testdomain",
        clientSigningKeypair.publicKey(),
      );

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );

      expect(transaction.sequence).toEqual("0");
      expect(transaction.source).toEqual(keypair.publicKey());
      expect(transaction.operations.length).toEqual(3);

      expect(transaction.timeBounds).toBeDefined();
      const { maxTime, minTime } = transaction.timeBounds!;

      expect(parseInt(maxTime) - parseInt(minTime)).toEqual(300);

      const [operation1, operation2, operation3] = transaction.operations;
      expect(operation1).toBeDefined();
      expect((operation1 as any).name).toEqual("testanchor.stellar.org auth");
      expect(operation1!.source).toEqual(
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
      );
      expect(operation1!.type).toEqual("manageData");
      expect((operation1 as any).value.length).toEqual(64);
      expect(
        Buffer.from((operation1 as any).value.toString(), "base64").length,
      ).toEqual(48);

      expect((operation2 as any).name).toBe("web_auth_domain");
      expect(operation2!.source).toEqual(keypair.publicKey());
      expect(operation2!.type).toEqual("manageData");
      expect((operation2 as any).value.toString()).toEqual(
        "testanchor.stellar.org",
      );

      expect((operation3 as any).name).toEqual("client_domain");
      expect(operation3!.source).toEqual(clientSigningKeypair.publicKey());
      expect(operation3!.type).toEqual("manageData");
      expect((operation3 as any).value.toString()).toEqual("testdomain");
    });

    it("uses the passed-in timeout", () => {
      const keypair = StellarSdk.Keypair.random();

      const challenge = WebAuth.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "testanchor.stellar.org",
        600,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );

      expect(transaction.timeBounds).toBeDefined();
      const maxTime = parseInt(transaction.timeBounds!.maxTime);
      const minTime = parseInt(transaction.timeBounds!.minTime);

      expect(minTime).toEqual(0);
      expect(maxTime).toEqual(600);
      expect(maxTime - minTime).toEqual(600);
    });

    it("throws an error if a muxed account and memo is passed", () => {
      const keypair = StellarSdk.Keypair.random();
      const muxedAddress =
        "MCQQMHTBRF2NPCEJWO2JMDT2HBQ2FGDCYREY2YIBSHLTXDG54Y3KTWX3R7NBER62VBELC";
      expect(() =>
        WebAuth.buildChallengeTx(
          keypair,
          muxedAddress,
          "testanchor.stellar.org",
          600,
          StellarSdk.Networks.TESTNET,
          "testanchor.stellar.org",
          "10154623012567072189",
        ),
      ).toThrow("memo cannot be used if clientAccountID is a muxed account");
    });

    it("throws an error if clientSigningKey is not passed", () => {
      expect(() =>
        WebAuth.buildChallengeTx(
          StellarSdk.Keypair.random(),
          StellarSdk.Keypair.random().publicKey(),
          "testanchor.stellar.org",
          600,
          StellarSdk.Networks.TESTNET,
          "testanchor.stellar.org",
          null,
          "testdomain",
          null,
        ),
      ).toThrow("clientSigningKey is required if clientDomain is provided");
    });
  });

  describe("WebAuth.readChallengeTx", () => {
    it("requires a envelopeTypeTxV0 or envelopeTypeTx", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();

      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      const innerTx = new StellarSdk.TransactionBuilder(
        new StellarSdk.Account(clientKP.publicKey(), "0"),
        {
          fee: "100",
          networkPassphrase: StellarSdk.Networks.TESTNET,
          timebounds: {
            minTime: 0,
            maxTime: 0,
          },
        },
      )
        .addOperation(
          StellarSdk.Operation.payment({
            destination: clientKP.publicKey(),
            asset: StellarSdk.Asset.native(),
            amount: "10.000",
          }),
        )
        .build();

      const feeBump = StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
        serverKP,
        "300",
        innerTx,
        StellarSdk.Networks.TESTNET,
      ).toXDR();

      expect(() =>
        WebAuth.readChallengeTx(
          feeBump,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(WebAuth.InvalidChallengeError);

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).not.toThrow(WebAuth.InvalidChallengeError);
      expect(() =>
        WebAuth.readChallengeTx(
          feeBump,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(WebAuth.InvalidChallengeError);
    });
    it("returns the transaction and the clientAccountID (client's pubKey) if the challenge was created successfully", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();

      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );

      expect(
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual({
        tx: transaction,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "SDF",
        memo: null,
      });
    });

    it("returns the clientAccountID and memo if the challenge includes a memo", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const clientMemo = "7659725268483412096";

      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
        clientMemo,
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );

      expect(
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual({
        tx: transaction,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "SDF",
        memo: clientMemo,
      });
    });

    it("returns the muxed clientAccountID if included in the challenge", () => {
      const serverKP = StellarSdk.Keypair.random();
      const muxedAddress =
        "MCQQMHTBRF2NPCEJWO2JMDT2HBQ2FGDCYREY2YIBSHLTXDG54Y3KTWX3R7NBER62VBELC";

      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        muxedAddress,
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );

      expect(
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual({
        tx: transaction,
        clientAccountID: muxedAddress,
        matchedHomeDomain: "SDF",
        memo: null,
      });
    });

    it("throws an error if the transaction uses a muxed account and has a memo", () => {
      const serverKP = StellarSdk.Keypair.random();
      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");
      const clientMuxedAddress =
        "MCQQMHTBRF2NPCEJWO2JMDT2HBQ2FGDCYREY2YIBSHLTXDG54Y3KTWX3R7NBER62VBELC";
      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientMuxedAddress,
            name: "testanchor.stellar.org auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addMemo(StellarSdk.Memo.id("5842698851377328257"))
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "testanchor.stellar.org",
          "testanchor.stellar.org",
        ),
      ).toThrow(WebAuth.InvalidChallengeError);
    });

    it("throws an error if the server hasn't signed the transaction", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();

      const transaction = new StellarSdk.TransactionBuilder(
        new StellarSdk.Account(serverKP.publicKey(), "-1"),
        { fee: "100", networkPassphrase: StellarSdk.Networks.TESTNET },
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "SDF-test auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF-test",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          `Transaction not signed by server: '${serverKP.publicKey()}'`,
        ),
      );
    });

    it("throws an error if transaction sequenceNumber is different to zero", () => {
      const keypair = StellarSdk.Keypair.random();

      const account = new StellarSdk.Account(keypair.publicKey(), "100");
      const transaction = new StellarSdk.TransactionBuilder(
        account,
        txBuilderOpts,
      )
        .setTimeout(30)
        .build();

      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          keypair.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "The transaction sequence number should be zero",
        ),
      );
    });

    it("throws an error if transaction source account is different to server account id", () => {
      const keypair = StellarSdk.Keypair.random();

      const challenge = WebAuth.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      const serverAccountId = StellarSdk.Keypair.random().publicKey();

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          serverAccountId,
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "The transaction source account is not equal to the server's account",
        ),
      );
    });

    it("throws an error if transaction doesn't contain any operation", () => {
      const keypair = StellarSdk.Keypair.random();
      const account = new StellarSdk.Account(keypair.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        account,
        txBuilderOpts,
      )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          keypair.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "The transaction should contain at least one operation",
        ),
      );
    });

    it("throws an error if operation does not contain the source account", () => {
      const keypair = StellarSdk.Keypair.random();
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
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          keypair.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "The transaction's operation should contain a source account",
        ),
      );
    });

    it("throws an error if operation is not manage data", () => {
      const keypair = StellarSdk.Keypair.random();
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
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          keypair.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "The transaction's operation type should be 'manageData'",
        ),
      );
    });

    it("throws an error if transaction.timeBounds.maxTime is infinite", () => {
      const serverKeypair = StellarSdk.Keypair.random();
      const clientKeypair = StellarSdk.Keypair.random();

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
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

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
        WebAuth.readChallengeTx(
          signedChallenge,
          serverKeypair.publicKey(),
          StellarSdk.Networks.TESTNET,
          anchorName,
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "The transaction requires non-infinite timebounds",
        ),
      );
    });

    it("throws an error if operation value is not a 64 bytes base64 string", () => {
      const keypair = StellarSdk.Keypair.random();
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
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          keypair.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "The transaction's operation value should be a 64 bytes base64 random string",
        ),
      );
    });

    it("throws an error if transaction does not contain valid timeBounds", () => {
      const keypair = StellarSdk.Keypair.random();
      const clientKeypair = StellarSdk.Keypair.random();

      const challenge = WebAuth.buildChallengeTx(
        keypair,
        clientKeypair.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      // Note that this is greater than the grace period of 5 minutes (600 seconds)
      vi.advanceTimersByTime(1000 * 1000);

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
        WebAuth.readChallengeTx(
          signedChallenge,
          keypair.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "The transaction has expired",
        ),
      );
    });

    it("does NOT throw errors when the user is slightly out of minTime", () => {
      vi.advanceTimersByTime(1626888681 * 1000);

      // this challenge from Stablex's testnet env, collected 2021-07-21T17:31:21.530Z,
      // is erroring, and we want to know if it's a bug on our side or in the sdk
      const signedChallenge =
        "AAAAAgAAAADZJunw2QO9LzjqagEjh/mpWG8Us5nOb+gc6wOex8G+IwAAAGQAAAAAAAAAAAAAAAEAAAAAYPhZ6gAAAXrKHz2UAAAAAAAAAAEAAAABAAAAAJyknd/qYHdzX6iV3TkHlh/usJUr5/U8cRsfVNqaruBAAAAACgAAAB50ZXN0bmV0LXNlcC5zdGFibGV4LmNsb3VkIGF1dGgAAAAAAAEAAABAaEs3QUZieUFCZzBEekx0WnpTVXJkcEhWOXdkdExXUkwxUHFFOW5QRVIrZVlaZzQvdDJlc3drclpBc0ZnTnp5UQAAAAAAAAABx8G+IwAAAEA8I5qQ+/HHXoHrULlg1ODTiCEQ92GQrVBFaB40OKxJhTf1c597AuKLHhJ3c4TNdSp1rjLGbk7qUuhjauxUuH0N";

      expect(() =>
        WebAuth.readChallengeTx(
          signedChallenge,
          "GDMSN2PQ3EB32LZY5JVACI4H7GUVQ3YUWOM4437IDTVQHHWHYG7CGA5Z",
          StellarSdk.Networks.TESTNET,
          "testnet-sep.stablex.cloud",
          "staging-transfer-server.zetl.network",
        ),
      ).not.toThrow();
    });

    it("home domain string matches transaction's operation key name", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.stellar.org auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      const transactionRoundTripped = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );

      expect(
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "testanchor.stellar.org",
          "testanchor.stellar.org",
        ),
      ).toEqual({
        tx: transactionRoundTripped,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "testanchor.stellar.org",
        memo: null,
      });
    });

    it("home domain in array matches transaction's operation key name", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.stellar.org auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      const transactionRoundTripped = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );

      expect(
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          ["SDF", "Test", "testanchor.stellar.org", "SDF-test"],
          "testanchor.stellar.org",
        ),
      ).toEqual({
        tx: transactionRoundTripped,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "testanchor.stellar.org",
        memo: null,
      });
    });

    it("throws an error if home domain string does not match transaction's operation key name", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "does.not.match auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "testanchor.stellar.org",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "Invalid homeDomains: the transaction's operation key name does not match the expected home domain",
        ),
      );
    });

    it("throws an error if home domain array does not have a match to transaction's operation key name", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "does.not.match auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          ["SDF", "Test", "testanchor.stellar.org", "SDF-test"],
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "Invalid homeDomains: the transaction's operation key name does not match the expected home domain",
        ),
      );
    });

    it("allows transaction to contain subsequent manage data ops with server account as source account", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "SDF auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: serverKP.publicKey(),
            name: "a key",
            value: "a value",
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      const transactionRoundTripped = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );

      expect(
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual({
        tx: transactionRoundTripped,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "SDF",
        memo: null,
      });
    });

    it("throws an error if the transaction contain subsequent manage data ops without the server account as the source account", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "SDF auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "a key",
            value: "a value",
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "The transaction has operations that are unrecognized",
        ),
      );
    });

    it("throws an error if the transaction contain subsequent ops that are not manage data ops", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "SDF auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          StellarSdk.Operation.bumpSequence({
            source: clientKP.publicKey(),
            bumpTo: "0",
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "The transaction has operations that are not of type 'manageData'",
        ),
      );
    });

    it("throws an error if the provided webAuthDomain does not match the 'web_auth_domain' operation's value", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.stellar.org auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: serverKP.publicKey(),
            name: "web_auth_domain",
            value: "unexpected_web_auth_domain",
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "testanchor.stellar.org",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "'web_auth_domain' operation value does not match testanchor.stellar.org",
        ),
      );
    });

    it("throws an error if the 'web_auth_domain' operation's source account is not the server's public key", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.stellar.org auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "web_auth_domain",
            value: "testanchor.stellar.org",
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      expect(() =>
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "testanchor.stellar.org",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "The transaction has operations that are unrecognized",
        ),
      );
    });

    it("allows transaction to omit the 'web_auth_domain' operation", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.stellar.org auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      const transactionRoundTripped = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );

      expect(
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "testanchor.stellar.org",
          "testanchor.stellar.org",
        ),
      ).toEqual({
        tx: transactionRoundTripped,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "testanchor.stellar.org",
        memo: null,
      });
    });

    it("matches the 'web_auth_domain' operation value with webAuthDomain", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.stellar.org auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: serverKP.publicKey(),
            name: "web_auth_domain",
            value: "auth.stellar.org",
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      const transactionRoundTripped = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );

      expect(
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "testanchor.stellar.org",
          "auth.stellar.org",
        ),
      ).toEqual({
        tx: transactionRoundTripped,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "testanchor.stellar.org",
        memo: null,
      });
    });

    it("allows subsequent manageData operations to have undefined values", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.stellar.org auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: serverKP.publicKey(),
            name: "nonWebAuthDomainKey",
            value: null,
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      const transactionRoundTripped = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );

      expect(
        WebAuth.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          "testanchor.stellar.org",
          "auth.stellar.org",
        ),
      ).toEqual({
        tx: transactionRoundTripped,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "testanchor.stellar.org",
        memo: null,
      });
    });

    it("validates a challenge containing a 'client_domain' manageData operation", () => {
      const serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");
      const clientSigningKeypair = StellarSdk.Keypair.random();

      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.stellar.org auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientSigningKeypair.publicKey(),
            name: "client_domain",
            value: "testdomain",
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      WebAuth.readChallengeTx(
        challenge,
        serverKP.publicKey(),
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
        "testanchor.stellar.org",
      );
    });
  });

  describe("WebAuth.verifyChallengeTxThreshold", () => {
    let serverKP: any;
    let clientKP1: any;
    let clientKP2: any;
    let clientKP3: any;
    let txAccount: any;
    let operation: any;

    beforeEach(() => {
      serverKP = StellarSdk.Keypair.random();
      clientKP1 = StellarSdk.Keypair.random();
      clientKP2 = StellarSdk.Keypair.random();
      clientKP3 = StellarSdk.Keypair.random();

      txAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");

      operation = StellarSdk.Operation.manageData({
        source: clientKP1.publicKey(),
        name: "SDF-test auth",
        value: randomBytes(48).toString("base64"),
      });

      txBuilderOpts = {
        fee: "100",
        networkPassphrase: StellarSdk.Networks.TESTNET,
      };
    });

    afterEach(() => {
      serverKP = null;
      clientKP1 = null;
      clientKP2 = null;
      txAccount = null;
      operation = null;
    });

    it("throws an error if the server hasn't signed the transaction", () => {
      const transaction = new StellarSdk.TransactionBuilder(
        txAccount,
        txBuilderOpts,
      )
        .addOperation(operation)
        .setTimeout(30)
        .build();

      const threshold = 1;
      const signerSummary = [newClientSigner(clientKP1.publicKey(), 1)];

      transaction.sign(clientKP1);

      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      expect(() =>
        WebAuth.verifyChallengeTxThreshold(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          signerSummary,
          "SDF-test",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          `Transaction not signed by server: '${serverKP.publicKey()}'`,
        ),
      );
    });

    it("successfully validates server and client key meeting threshold", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP1);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 1;
      const signerSummary = [newClientSigner(clientKP1.publicKey(), 1)];

      expect(
        WebAuth.verifyChallengeTxThreshold(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          signerSummary,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual([clientKP1.publicKey()]);
    });

    it("successfully validates server and multiple client keys, meeting threshold", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP1, clientKP2);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 3;
      const signerSummary = [
        newClientSigner(clientKP1.publicKey(), 1),
        newClientSigner(clientKP2.publicKey(), 2),
      ];

      expect(
        WebAuth.verifyChallengeTxThreshold(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          signerSummary,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual([clientKP1.publicKey(), clientKP2.publicKey()]);
    });

    it("successfully validates server and multiple client keys, meeting threshold with more keys than needed", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP1, clientKP2);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 3;
      const signerSummary = [
        newClientSigner(clientKP1.publicKey(), 1),
        newClientSigner(clientKP2.publicKey(), 2),
        newClientSigner(clientKP3.publicKey(), 2),
      ];

      expect(
        WebAuth.verifyChallengeTxThreshold(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          signerSummary,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual([clientKP1.publicKey(), clientKP2.publicKey()]);
    });

    it("successfully validates server and multiple client keys, meeting threshold with more keys than needed but ignoring PreauthTxHash and XHash", () => {
      const preauthTxHash =
        "TAQCSRX2RIDJNHFIFHWD63X7D7D6TRT5Y2S6E3TEMXTG5W3OECHZ2OG4";
      const xHash = "XDRPF6NZRR7EEVO7ESIWUDXHAOMM2QSKIQQBJK6I2FB7YKDZES5UCLWD";
      const unknownSignerType =
        "?ARPF6NZRR7EEVO7ESIWUDXHAOMM2QSKIQQBJK6I2FB7YKDZES5UCLWD";

      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP1, clientKP2);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 3;
      const signerSummary = [
        newClientSigner(clientKP1.publicKey(), 1),
        newClientSigner(clientKP2.publicKey(), 2),
        newClientSigner(clientKP3.publicKey(), 2),
        newClientSigner(preauthTxHash, 10),
        newClientSigner(xHash, 10),
        newClientSigner(unknownSignerType, 10),
      ];

      expect(
        WebAuth.verifyChallengeTxThreshold(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          signerSummary,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual([clientKP1.publicKey(), clientKP2.publicKey()]);
    });

    it("throws an error if multiple client keys were not enough to meet the threshold", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP1, clientKP2);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 10;
      const signerSummary = [
        newClientSigner(clientKP1.publicKey(), 1),
        newClientSigner(clientKP2.publicKey(), 2),
        newClientSigner(clientKP3.publicKey(), 2),
      ];

      expect(() =>
        WebAuth.verifyChallengeTxThreshold(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          signerSummary,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          `signers with weight 3 do not meet threshold ${threshold}"`,
        ),
      );
    });

    it("throws an error if an unrecognized (not from the signerSummary) key has signed the transaction", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP1, clientKP2, clientKP3);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 10;
      const signerSummary = [
        newClientSigner(clientKP1.publicKey(), 1),
        newClientSigner(clientKP2.publicKey(), 2),
      ];

      expect(() =>
        WebAuth.verifyChallengeTxThreshold(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          signerSummary,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "Transaction has unrecognized signatures",
        ),
      );
    });

    it("throws an error if the signerSummary is empty", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP1, clientKP2, clientKP3);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 10;

      expect(() =>
        WebAuth.verifyChallengeTxThreshold(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          threshold,
          [],
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "No verifiable client signers provided, at least one G... address must be provided",
        ),
      );
    });
  });

  describe("WebAuth.verifyChallengeTxSigners", () => {
    let serverKP: any;
    let clientKP1: any;
    let clientKP2: any;
    let txAccount: any;
    let operation: any;

    beforeEach(() => {
      serverKP = StellarSdk.Keypair.random();
      clientKP1 = StellarSdk.Keypair.random();
      clientKP2 = StellarSdk.Keypair.random();

      txAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");

      operation = StellarSdk.Operation.manageData({
        source: clientKP1.publicKey(),
        name: "SDF-test auth",
        value: randomBytes(48).toString("base64"),
      });

      txBuilderOpts = {
        fee: "100",
        networkPassphrase: StellarSdk.Networks.TESTNET,
      };
    });

    afterEach(() => {
      serverKP = null;
      clientKP1 = null;
      clientKP2 = null;
      txAccount = null;
      operation = null;
    });

    it("successfully validates server and client master key signatures in the transaction", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP1);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [clientKP1.publicKey()],
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual([clientKP1.publicKey()]);
    });

    it("throws an error if the server hasn't signed the transaction", () => {
      const transaction = new StellarSdk.TransactionBuilder(
        txAccount,
        txBuilderOpts,
      )
        .addOperation(operation)
        .setTimeout(30)
        .build();

      transaction.sign(StellarSdk.Keypair.random()); // Signing with another key pair instead of the server's

      const invalidsServerSignedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        WebAuth.verifyChallengeTxSigners(
          invalidsServerSignedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [clientKP1.publicKey()],
          "SDF-test",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          `Transaction not signed by server: '${serverKP.publicKey()}'`,
        ),
      );
    });

    it("throws an error if the list of signers is empty", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      expect(() =>
        WebAuth.verifyChallengeTxSigners(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [],
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "No verifiable client signers provided, at least one G... address must be provided",
        ),
      );
    });

    it("throws an error if none of the given signers have signed the transaction", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(
        StellarSdk.Keypair.random(),
        StellarSdk.Keypair.random(),
      );
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [clientKP1.publicKey()],
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "None of the given signers match the transaction signatures",
        ),
      );
    });

    it("successfully validates server and multiple client signers in the transaction", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      const clientSigners = [clientKP1, clientKP2];
      transaction.sign(...clientSigners);
      const clientSignersPubKey = clientSigners.map((kp) => kp.publicKey());

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          clientSignersPubKey,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual(clientSignersPubKey);
    });

    it("successfully validates server and multiple client signers, in reverse order", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      const clientSigners = [clientKP1, clientKP2];
      transaction.sign(...clientSigners.reverse());
      const clientSignersPubKey = clientSigners.map((kp) => kp.publicKey());

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          clientSignersPubKey,
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual(expect.arrayContaining(clientSignersPubKey));
    });

    it("successfully validates server and non-masterkey client signer", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [clientKP2.publicKey()],
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual([clientKP2.publicKey()]);
    });

    it("successfully validates server and non-master key client signer, ignoring extra signer", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [clientKP2.publicKey(), StellarSdk.Keypair.random().publicKey()],
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual([clientKP2.publicKey()]);
    });

    it("throws an error if no client but instead the server has signed the transaction", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(serverKP);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [clientKP2.publicKey(), serverKP.publicKey()],
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "None of the given signers match the transaction signatures",
        ),
      );
    });

    it("successfully validates server and non-masterkey client signer, ignoring duplicated client signers", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [clientKP2.publicKey(), clientKP2.publicKey()],
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual([clientKP2.publicKey()]);
    });

    it("successfully validates server and non-masterkey client signer, ignoring preauthTxHash and xHash", () => {
      const preauthTxHash =
        "TAQCSRX2RIDJNHFIFHWD63X7D7D6TRT5Y2S6E3TEMXTG5W3OECHZ2OG4";
      const xHash = "XDRPF6NZRR7EEVO7ESIWUDXHAOMM2QSKIQQBJK6I2FB7YKDZES5UCLWD";
      const unknownSignerType =
        "?ARPF6NZRR7EEVO7ESIWUDXHAOMM2QSKIQQBJK6I2FB7YKDZES5UCLWD";

      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [clientKP2.publicKey(), preauthTxHash, xHash, unknownSignerType],
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toEqual([clientKP2.publicKey()]);
    });

    it("throws an error if duplicated signers have been provided and they haven't actually signed the transaction", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP1);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [clientKP2.publicKey(), clientKP2.publicKey()],
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "None of the given signers match the transaction signatures",
        ),
      );
    });

    it("throws an error if the same KP has signed the transaction more than once", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP2, clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [clientKP2.publicKey()],
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "Transaction has unrecognized signatures",
        ),
      );
    });

    it("throws an error if the client attempts to verify the transaction with a Seed instead of the Public Key", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP2, clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [clientKP2.secret()],
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "No verifiable client signers provided, at least one G... address must be provided",
        ),
      );
    });

    it("throws an error if no client has signed the transaction", () => {
      const transaction = new StellarSdk.TransactionBuilder(
        txAccount,
        txBuilderOpts,
      )
        .addOperation(operation)
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction.toEnvelope().toXDR("base64").toString();

      const clientSigners = [clientKP1.publicKey(), clientKP2.publicKey()];

      expect(() =>
        WebAuth.verifyChallengeTxSigners(
          challenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          clientSigners,
          "SDF-test",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "None of the given signers match the transaction signatures",
        ),
      );
    });

    it("throws an error if no public keys were provided to verify signatires", () => {
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP1.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );
      transaction.sign(clientKP1);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [],
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "No verifiable client signers provided, at least one G... address must be provided",
        ),
      );
    });

    it("validates challenges containing client domain signers", () => {
      serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const clientSigningKey = StellarSdk.Keypair.random();
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
        null,
        "testdomain",
        clientSigningKey.publicKey(),
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );

      transaction.sign(clientKP);
      transaction.sign(clientSigningKey);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const signersFound = WebAuth.verifyChallengeTxSigners(
        signedChallenge,
        serverKP.publicKey(),
        StellarSdk.Networks.TESTNET,
        [clientKP.publicKey()],
        "SDF",
        "testanchor.stellar.org",
      );

      expect(signersFound.indexOf(clientSigningKey.publicKey())).toEqual(-1);
    });

    it("throws an error if a challenge with a client_domain operation doesn't have a matching signature", () => {
      serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const clientSigningKeypair = StellarSdk.Keypair.random();
      const challenge = WebAuth.buildChallengeTx(
        serverKP,
        clientKP.publicKey(),
        "SDF",
        300,
        StellarSdk.Networks.TESTNET,
        "testanchor.stellar.org",
        null,
        "testdomain",
        clientSigningKeypair.publicKey(),
      );

      vi.advanceTimersByTime(200);

      const transaction = new StellarSdk.Transaction(
        challenge,
        StellarSdk.Networks.TESTNET,
      );

      transaction.sign(clientKP);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [clientKP.publicKey()],
          "SDF",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "Transaction not signed by the source account of the 'client_domain' ManageData operation",
        ),
      );
    });

    it("throws an error if a challenge has multiple client_domain operations", () => {
      serverKP = StellarSdk.Keypair.random();
      const clientKP = StellarSdk.Keypair.random();
      const clientSigningKeypair = StellarSdk.Keypair.random();

      const serverAccount = new StellarSdk.Account(serverKP.publicKey(), "-1");

      const transaction = new StellarSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.stellar.org auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientSigningKeypair.publicKey(),
            name: "client_domain",
            value: "testdomain",
          }),
        )
        .addOperation(
          StellarSdk.Operation.manageData({
            source: clientSigningKeypair.publicKey(),
            name: "client_domain",
            value: "testdomain2",
          }),
        )
        .setTimeout(30)
        .build();

      vi.advanceTimersByTime(200);

      transaction.sign(serverKP);
      transaction.sign(clientKP);
      transaction.sign(clientSigningKeypair);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        WebAuth.verifyChallengeTxSigners(
          signedChallenge,
          serverKP.publicKey(),
          StellarSdk.Networks.TESTNET,
          [clientKP.publicKey()],
          "testanchor.stellar.org",
          "testanchor.stellar.org",
        ),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "Found more than one client_domain operation",
        ),
      );
    });
  });

  describe("WebAuth.verifyTxSignedBy", () => {
    let keypair: any;
    let account: any;
    let transaction: any;

    beforeEach(() => {
      keypair = StellarSdk.Keypair.random();
      account = new StellarSdk.Account(keypair.publicKey(), "-1");
      transaction = new StellarSdk.TransactionBuilder(account, txBuilderOpts)
        .setTimeout(30)
        .build();
    });

    afterEach(() => {
      keypair = null;
      account = null;
      transaction = null;
    });

    it("returns true if the transaction was signed by the given account", () => {
      transaction.sign(keypair);

      expect(
        WebAuth.verifyTxSignedBy(transaction, keypair.publicKey()),
      ).toEqual(true);
    });

    it("returns false if the transaction was not signed by the given account", () => {
      transaction.sign(keypair);

      const differentKeypair = StellarSdk.Keypair.random();

      expect(
        WebAuth.verifyTxSignedBy(transaction, differentKeypair.publicKey()),
      ).toEqual(false);
    });

    it("works with an unsigned transaction", () => {
      expect(
        WebAuth.verifyTxSignedBy(transaction, keypair.publicKey()),
      ).toEqual(false);
    });
  });

  describe("WebAuth.gatherTxSigners", () => {
    let keypair1: any;
    let keypair2: any;
    let account: any;
    let transaction: any;

    beforeEach(() => {
      keypair1 = StellarSdk.Keypair.random();
      keypair2 = StellarSdk.Keypair.random();
      account = new StellarSdk.Account(keypair1.publicKey(), "-1");
      transaction = new StellarSdk.TransactionBuilder(account, txBuilderOpts)
        .setTimeout(30)
        .build();
    });

    afterEach(() => {
      keypair1 = null;
      keypair2 = null;
      account = null;
      transaction = null;
    });

    it("returns a list with the signatures used in the transaction", () => {
      transaction.sign(keypair1, keypair2);

      const expectedSignatures = [keypair1.publicKey(), keypair2.publicKey()];
      expect(WebAuth.gatherTxSigners(transaction, expectedSignatures)).toEqual(
        expectedSignatures,
      );
    });

    it("returns a list with the signatures used in the transaction, removing duplicates", () => {
      transaction.sign(
        keypair1,
        keypair1,
        keypair1,
        keypair2,
        keypair2,
        keypair2,
      );

      const expectedSignatures = [keypair1.publicKey(), keypair2.publicKey()];
      expect(
        WebAuth.gatherTxSigners(transaction, [
          keypair1.publicKey(),
          keypair2.publicKey(),
        ]),
      ).toEqual(expectedSignatures);
    });

    it("returns an empty list if the transaction was not signed by the given accounts", () => {
      transaction.sign(keypair1, keypair2);

      const wrongSignatures = [
        StellarSdk.Keypair.random().publicKey(),
        StellarSdk.Keypair.random().publicKey(),
        StellarSdk.Keypair.random().publicKey(),
      ];

      expect(WebAuth.gatherTxSigners(transaction, wrongSignatures)).toEqual([]);
    });

    it("calling gatherTxSigners with an unsigned transaction will return an empty list", () => {
      expect(
        WebAuth.gatherTxSigners(transaction, [
          keypair1.publicKey(),
          keypair2.publicKey(),
        ]),
      ).toEqual([]);
    });

    it("Raises an error in case one of the given signers is not a valid G signer", () => {
      transaction.sign(keypair1, keypair2);
      const preauthTxHash =
        "TAQCSRX2RIDJNHFIFHWD63X7D7D6TRT5Y2S6E3TEMXTG5W3OECHZ2OG4";
      expect(() =>
        WebAuth.gatherTxSigners(transaction, [
          preauthTxHash,
          keypair1.publicKey(),
        ]),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "Signer is not a valid address: invalid version byte. expected 48, got 152",
        ),
      );
    });

    it("Raises an error in case one of the given signers is an invalid G signer", () => {
      transaction.sign(keypair1, keypair2);
      const invalidGHash =
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CAAA";
      expect(() =>
        WebAuth.gatherTxSigners(transaction, [
          invalidGHash,
          keypair1.publicKey(),
        ]),
      ).toThrow(
        new StellarSdk.WebAuth.InvalidChallengeError(
          "Signer is not a valid address: invalid checksum",
        ),
      );
    });
  });
});
