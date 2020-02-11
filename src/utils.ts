import randomBytes from "randombytes";
import {
  Account,
  BASE_FEE,
  Keypair,
  Operation,
  StrKey,
  TimeoutInfinite,
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
   * @param {string} [networkPassphrase] The network passphrase. If you pass this argument then timeout is required.
   * @example
   * import { Utils, Keypair, Networks }  from 'stellar-sdk'
   *
   * let serverKeyPair = Keypair.fromSecret("server-secret")
   * let challenge = Utils.buildChallengeTx(serverKeyPair, "client-stellar-account-id", "SDF", 300, Networks.TESTNET)
   * @returns {string} A base64 encoded string of the raw TransactionEnvelope xdr struct for the transaction.
   */
  export function buildChallengeTx(
    serverKeypair: Keypair,
    clientAccountID: string,
    anchorName: string,
    timeout: number = 300,
    networkPassphrase?: string,
  ): string {
    const account = new Account(serverKeypair.publicKey(), "-1");
    const now = Math.floor(Date.now() / 1000);

    // A Base64 digit represents 6 bits, to generate a random 64 bytes
    // base64 string, we need 48 random bytes = (64 * 6)/8
    //
    // Each Base64 digit is in ASCII and each ASCII characters when
    // turned into binary represents 8 bits = 1 bytes.
    const value = randomBytes(48).toString("base64");

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase,
      timebounds: {
        minTime: now,
        maxTime: now + timeout,
      },
    })
      .addOperation(
        Operation.manageData({
          name: `${anchorName} auth`,
          value,
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
   * readChallengeTx reads a SEP 10 challenge transaction and returns the decoded
   * transaction and client account ID contained within.
   *
   * It also verifies that transaction is signed by the server.
   *
   * It does not verify that the transaction has been signed by the client or
   * that any signatures other than the servers on the transaction are valid. Use
   * one of the following functions to completely verify the transaction:
   * - verifyChallengeTxThreshold
   * - verifyChallengeTxSigners
   * @function
   * @memberof Utils
   * @param {string} challengeTx SEP0010 transaction challenge transaction in base64.
   * @param {string} serverAccountID The server's stellar account.
   * @param {string} [networkPassphrase] The network passphrase.
   * @returns {Transaction} the actual submited Transaction
   * @returns {string} The stellar clientAccountID that the wallet wishes to authenticate with the server.
   */
  export function readChallengeTx(
    challengeTx: string,
    serverAccountId: string,
    networkPassphrase?: string,
  ): { tx: Transaction; clientAccountID: string } {
    const transaction = new Transaction(challengeTx, networkPassphrase);

    // verify sequence number
    const sequence = Number.parseInt(transaction.sequence, 10);

    if (sequence !== 0) {
      throw new InvalidSep10ChallengeError(
        "The transaction sequence number should be zero",
      );
    }

    // verify transaction source
    if (transaction.source !== serverAccountId) {
      throw new InvalidSep10ChallengeError(
        "The transaction source account is not equal to the server's account",
      );
    }

    // verify operation
    if (transaction.operations.length !== 1) {
      throw new InvalidSep10ChallengeError(
        "The transaction should contain exactly one operation",
      );
    }

    const [operation] = transaction.operations;

    if (!operation.source) {
      throw new InvalidSep10ChallengeError(
        "The transaction's operation should contain a source account",
      );
    }
    const clientAccountID: string = operation.source!;

    if (operation.type !== "manageData") {
      throw new InvalidSep10ChallengeError(
        "The transaction's operation type should be 'manageData'",
      );
    }

    // verify timebounds
    if (
      transaction.timeBounds &&
      Number.parseInt(transaction.timeBounds?.maxTime, 10) === TimeoutInfinite
    ) {
      throw new InvalidSep10ChallengeError(
        "The transaction requires non-infinite timebounds",
      );
    }

    if (!validateTimebounds(transaction)) {
      throw new InvalidSep10ChallengeError("The transaction has expired");
    }

    // verify base64
    if (Buffer.from(operation.value.toString(), "base64").length !== 48) {
      throw new InvalidSep10ChallengeError(
        "The transaction's operation value should be a 64 bytes base64 random string",
      );
    }

    return { tx: transaction, clientAccountID };
  }

  /**
   * VerifyChallengeTxSigners verifies that for a SEP 10 challenge transaction
   * all signatures on the transaction are accounted for. A transaction is
   * verified if it is signed by the server account, and all other signatures
   * match a signer that has been provided as an argument. Additional signers can
   * be provided that do not have a signature, but all signatures must be matched
   * to a signer for verification to succeed. If verification succeeds a list of
   * signers that were found is returned, not including the server account ID.
   *
   * @function
   * @memberof Utils
   * @param {string} challengeTx SEP0010 transaction challenge transaction in base64.
   * @param {string} serverAccountID The server's stellar account.
   * @param {string} network The network passphrase.
   * @param {string[]} accountIDs The stellar account public keys that have supposedly been used to sign the transaction
   * @example
   * // TODO
   * @returns {string[]} The list of signers that were found, excluding the server account ID
   */
  export function verifyChallengeTxSigners(
    challengeTx: string,
    serverAccountID: string,
    network: string,
    ...accountIDs: string[]
  ): string[] {
    // Read the transaction which validates its structure.
    const { tx } = readChallengeTx(challengeTx, serverAccountID, network);

    // Ensure the server account ID is an address and not a seed.
    const serverKP = Keypair.fromPublicKey(serverAccountID); // can throw 'Invalid Stellar public key'

    // Deduplicate the client signers and ensure the server is not included
    // anywhere we check or output the list of signers.
    const clientSigners: string[] = new Array();
    const clientSignersSeen = new Map<string, boolean>();
    for (const signer of accountIDs) {
      // Ignore the server signer if it is in the signers list. It's
      // important when verifying signers of a challenge transaction that we
      // only verify and return client signers. If an account has the server
      // as a signer the server should not play a part in the authentication
      // of the client.
      if (signer === serverKP.publicKey()) {
        continue;
      }

      // Deduplicate.
      if (clientSignersSeen.get(signer) !== undefined) {
        continue;
      }

      // Ignore non-G... account/address signers.
      if (!StrKey.isValidEd25519PublicKey(signer)) {
        continue;
      }

      clientSigners.push(signer);
      clientSignersSeen.set(signer, true);
    }

    // Don't continue if none of the signers provided are in the final list.
    if (clientSigners.length === 0) {
      throw new InvalidSep10ChallengeError(
        "No verifiable client signers provided, at least one G... address must be provided",
      );
    }

    // Verify all the transaction's signers (server and client) in one
    // hit. We do this in one hit here even though the server signature was
    // checked in the ReadChallengeTx to ensure that every signature and signer
    // are consumed only once on the transaction.
    const allSigners: string[] = [serverKP.publicKey(), ...clientSigners];
    const allSignersFound: string[] = verifyTxMultiSignedBy(tx, ...allSigners);

    // Confirm the server is in the list of signers found and remove it.
    let serverSignerFound: boolean = false;
    const signersFound: string[] = new Array();
    for (const signer of allSignersFound) {
      if (signer === serverKP.publicKey()) {
        serverSignerFound = true;
        continue;
      }
      signersFound.push(signer);
    }

    // Confirm we matched a signature to the server signer.
    if (!serverSignerFound) {
      throw new InvalidSep10ChallengeError(
        "Transaction not signed by server: '" + serverKP.publicKey() + "'",
      );
    }

    // Confirm we matched a signature to the server signer.
    if (signersFound.length === 0) {
      throw new InvalidSep10ChallengeError(
        "Transaction not signed by clients: '" + clientSigners.join() + "'",
      );
    }

    // Confirm all signatures were consumed by a signer.
    if (allSignersFound.length !== tx.signatures.length) {
      throw new InvalidSep10ChallengeError(
        "Transaction has unrecognized signatures",
      );
    }

    return signersFound;
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
   * @param {string} [networkPassphrase] The network passphrase.
   * @example
   * import { Utils, Networks }  from 'stellar-sdk'
   *
   * let challenge = Utils.verifyChallengeTx("base64tx", "server-account-id", Networks.TESTNET)
   * @returns {boolean}
   */
  export function verifyChallengeTx(
    challengeTx: string,
    serverAccountId: string,
    networkPassphrase?: string,
  ): boolean {
    const transaction = new Transaction(challengeTx, networkPassphrase);

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

    if (Buffer.from(operation.value.toString(), "base64").length !== 48) {
      throw new InvalidSep10ChallengeError(
        "The transaction's operation value should be a 64 bytes base64 random string",
      );
    }

    // ------- ALL ABOVE ARE TESTEDm

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

    // ------- ALL BELOW ARE TESTED

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
    return verifyTxMultiSignedBy(transaction, accountId).length !== 0;
  }

  /**
   * Verifies if a transaction was signed by the given account IDs.
   *
   * @function
   * @memberof Utils
   * @param {Transaction} transaction
   * @param {string[]} accountIds
   * @example
   * let keypair1 = Keypair.random();
   * let keypair2 = Keypair.random();
   * const account = new StellarSdk.Account(keypair1.publicKey(), "-1");
   *
   * const transaction = new TransactionBuilder(account, { fee: 100 })
   *    .setTimeout(30)
   *    .build();
   *
   * transaction.sign(keypair1, keypair2)
   * Utils.verifyTxMultiSignedBy(transaction, [keypair1.publicKey(), keypair2.publicKey()])
   * @returns {string[]}.
   */
  export function verifyTxMultiSignedBy(
    transaction: Transaction,
    ...accountIDs: string[]
  ): string[] {
    const hashedSignatureBase = transaction.hash();

    const usedSignatures: boolean[] = new Array(transaction.signatures.length);
    const signersFound = new Map<string, boolean>();

    accountIDs.forEach((signer) => {
      const keypair = Keypair.fromPublicKey(signer);

      for (let i = 0; i < transaction.signatures.length; i++) {
        if (usedSignatures[i]) {
          continue;
        }

        const decSeg = transaction.signatures[i];

        if (!decSeg.hint().equals(keypair.signatureHint())) {
          continue;
        }

        if (keypair.verify(hashedSignatureBase, decSeg.signature())) {
          usedSignatures[i] = true;
          signersFound.set(signer, true);
        }
      }
    });

    return Array.from(signersFound.keys());
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
