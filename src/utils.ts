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

    if (transaction.source !== serverAccountId) {
      throw new InvalidSep10ChallengeError(
        "Transaction source account is not equal to the server's account",
      );
    }

    return true;
  }
}
