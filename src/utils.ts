import randomBytes from "randombytes";
import {
  Account,
  BASE_FEE,
  Keypair,
  Operation,
  Transaction,
  TransactionBuilder,
} from "stellar-base";
import { InvalidSep10ChallengeError } from "./errors";

/**
 * @namespace Utils
 */
export namespace Utils {
  /**
   * Returns a valid [SEP0010](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md)
   * challenge transaction which you can use for Stellar Web Authentication.
   *
   * @see [SEP0010: Stellar Web Authentication](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md)
   * @function
   * @memberof Utils
   * @param {Keypair} serverKeypair Keypair for server's signing account.
   * @param {string} clientAccountID The stellar account that the wallet wishes to authenticate with the server.
   * @param {string} anchorName Anchor's name to be used in the manage_data key.
   * @param {number} [timeout=300] Challenge duration (default to 5 minutes).
   * @example
   * import { Utils, Keypair, Network }  from 'stellar-sdk'
   *
   * Network.useTestNetwork();
   *
   * let serverKeyPair = Keypair.fromSecret("server-secret")
   * let challenge = Utils.buildChallengeTx(serverKeyPair, "client-stellar-account-id", "SDF", 300)
   * @returns {string} A base64 encoded string of the raw TransactionEnvelope xdr struct for the transaction.
   */
  export function buildChallengeTx(
    serverKeypair: Keypair,
    clientAccountID: string,
    anchorName: string,
    timeout: number = 300,
  ): string {
    const account = new Account(serverKeypair.publicKey(), "-1");
    const now = Math.floor(Date.now() / 1000);

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      timebounds: {
        minTime: now,
        maxTime: now + timeout,
      },
    })
      .addOperation(
        Operation.manageData({
          name: `${anchorName} auth`,
          value: randomBytes(64),
          source: clientAccountID,
        }),
      )
      .build();

    transaction.sign(serverKeypair);

    return transaction
      .toEnvelope()
      .toXDR("base64")
      .toString();
  }

  /**
   * Verifies if a transaction is a valid [SEP0010](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md)
   * challenge transaction.
   *
   * This function performs the following checks:
   *
   *   1. Verifies that the transaction's source is the same as the server account id.
   *   2. Verifies that the number of operations in the transaction is equal to one and of type manageData.
   *   3. Verifies if timeBounds are still valid.
   *   4. Verifies if the transaction has been signed by the server and the client.
   *   5. Verifies that the sequenceNumber is equal to zero.
   *
   *
   * @see [SEP0010: Stellar Web Authentication](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md)
   * @function
   * @memberof Utils
   * @param {string} challengeTx SEP0010 transaction challenge transaction in base64.
   * @param {string} serverAccountID The server's stellar account.
   * @example
   * import { Utils, Network }  from 'stellar-sdk'
   *
   * Network.useTestNetwork();
   *
   * let challenge = Utils.verifyChallengeTx("base64tx", "server-account-id")
   * @returns {boolean}
   */
  export function verifyChallengeTx(
    challengeTx: string,
    serverAccountId: string,
  ): boolean {
    const transaction = new Transaction(challengeTx);

    const sequence = Number.parseInt(transaction.sequence, 10);

    if (sequence !== 0) {
      throw new InvalidSep10ChallengeError(
        "The transaction sequence number should be zero",
      );
    }

    if (transaction.source !== serverAccountId) {
      throw new InvalidSep10ChallengeError(
        "The transaction source account is not equal to the server's account",
      );
    }

    if (transaction.operations.length !== 1) {
      throw new InvalidSep10ChallengeError(
        "The transaction should contain only one operation",
      );
    }

    const [operation] = transaction.operations;

    if (!operation.source) {
      throw new InvalidSep10ChallengeError(
        "The transaction's operation should contain a source account",
      );
    }

    if (operation.type !== "manageData") {
      throw new InvalidSep10ChallengeError(
        "The transaction's operation should be manageData",
      );
    }

    if (!verifyTxSignedBy(transaction, serverAccountId)) {
      throw new InvalidSep10ChallengeError(
        "The transaction is not signed by the server",
      );
    }

    if (!verifyTxSignedBy(transaction, operation.source as string)) {
      throw new InvalidSep10ChallengeError(
        "The transaction is not signed by the client",
      );
    }

    if (!validateTimebounds(transaction)) {
      throw new InvalidSep10ChallengeError("The transaction has expired");
    }

    return true;
  }

  /**
   * Verifies if a transaction was signed by the given account id.
   *
   * @function
   * @memberof Utils
   * @param {Transaction} transaction
   * @param {string} accountID
   * @example
   * let keypair = Keypair.random();
   * const account = new StellarSdk.Account(keypair.publicKey(), "-1");
   *
   * const transaction = new TransactionBuilder(account, { fee: 100 })
   *    .setTimeout(30)
   *    .build();
   *
   * transaction.sign(keypair)
   * Utils.verifyTxSignedBy(transaction, keypair.publicKey())
   * @returns {boolean}.
   */
  export function verifyTxSignedBy(
    transaction: Transaction,
    accountId: string,
  ): boolean {
    const hashedSignatureBase = transaction.hash();

    const keypair = Keypair.fromPublicKey(accountId);

    return !!transaction.signatures.find((sig) => {
      return keypair.verify(hashedSignatureBase, sig.signature());
    });
  }

  function validateTimebounds(transaction: Transaction): boolean {
    if (!transaction.timeBounds) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const { minTime, maxTime } = transaction.timeBounds;

    return (
      now >= Number.parseInt(minTime, 10) && now <= Number.parseInt(maxTime, 10)
    );
  }
}
