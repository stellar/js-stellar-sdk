import { randomBytes } from "crypto";
import { Account, Keypair, Operation, TransactionBuilder } from "stellar-base";

/**
 * Collection on util functions
 *
 * @namespace Utils
 */
export namespace Utils {
  /**
   * Returns a valid SEP0010 challenge which you can use for Stellar Web Authentication.
   *
   * @see [SEP0010: Stellar Web Authentication](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md)
   * @param {Keypair} serverKeypair Server's keypair.
   * @param {string} clientAccountID Client's Stellar account.
   * @param {string} anchorName.
   * @param {number} [timeout=300] Challenge duration (default to 5 minutes).
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
      fee: 100,
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
}
