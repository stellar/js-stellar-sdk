import clone from "lodash/clone";
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
import { ServerApi } from "./server_api";

/**
 * @namespace Utils
 */
export namespace Utils {
  /**
   * Returns a valid [SEP0010](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md)
   * challenge transaction which you can use for Stellar Web Authentication.
   *
   * @see [SEP0010: Stellar Web Authentication](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md).
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
   * It also verifies that the transaction has been signed by the server.
   *
   * It does not verify that the transaction has been signed by the client or
   * that any signatures other than the server's on the transaction are valid. Use
   * one of the following functions to completely verify the transaction:
   * - verifyChallengeTxThreshold
   * - verifyChallengeTxSigners
   *
   * @see [SEP0010: Stellar Web Authentication](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md).
   * @function
   * @memberof Utils
   * @param {string} challengeTx SEP0010 challenge transaction in base64.
   * @param {string} serverAccountID The server's stellar account (public key).
   * @param {string} networkPassphrase The network passphrase, e.g.: 'Test SDF Network ; September 2015'.
   * @returns {Transaction, string} the actual submited transaction and the stellar public key (master key) used to sign the Manage Data operation.
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
   * verifyChallengeTxThreshold verifies that for a SEP 10 challenge transaction
   * all signatures on the transaction are accounted for and that the signatures
   * meet a threshold on an account. A transaction is verified if it is signed by
   * the server account, and all other signatures match a signer that has been
   * provided as an argument, and those signatures meet a threshold on the
   * account.
   *
   * Signers that are not prefixed as an address/account ID strkey (G...) will be
   * ignored.
   *
   * Errors will be raised if:
   *  - The transaction is invalid according to ReadChallengeTx.
   *  - No client signatures are found on the transaction.
   *  - One or more signatures in the transaction are not identifiable as the
   *    server account or one of the signers provided in the arguments.
   *  - The signatures are all valid but do not meet the threshold.
   *
   * @see [SEP0010: Stellar Web Authentication](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md).
   * @function
   * @memberof Utils
   * @param {string} challengeTx SEP0010 challenge transaction in base64.
   * @param {string} serverAccountID The server's stellar account (public key).
   * @param {string} networkPassphrase The network passphrase, e.g.: 'Test SDF Network ; September 2015'.
   * @param {number} threshold The required signatures threshold for verifying this transaction.
   * @param {ServerApi.AccountRecordSigners[]} signerSummary a map of all authorized signers to their weights. It's used to validate if the transaction signatures have met the given threshold.
   * @returns {string[]} The list of signers public keys that have signed the transaction, excluding the server account ID, given that the threshold was met.
   * @example
   *
   * import { Networks, Transaction, Utils }  from 'stellar-sdk';
   *
   * const serverKP = Keypair.random();
   * const clientKP1 = Keypair.random();
   * const clientKP2 = Keypair.random();
   *
   * // Challenge, possibly built in the server side
   * const challenge = Utils.buildChallengeTx(
   *   serverKP,
   *   clientKP1.publicKey(),
   *   "SDF",
   *   300,
   *   Networks.TESTNET
   * );
   *
   * // clock.tick(200);  // Simulates a 200 ms delay when communicating from server to client
   *
   * // Transaction gathered from a challenge, possibly from the client side
   * const transaction = new Transaction(challenge, Networks.TESTNET);
   * transaction.sign(clientKP1, clientKP2);
   * const signedChallenge = transaction
   *         .toEnvelope()
   *         .toXDR("base64")
   *         .toString();
   *
   * // Defining the threshold and signerSummary
   * const threshold = 3;
   * const signerSummary = [
   *    {
   *      key: this.clientKP1.publicKey(),
   *      weight: 1,
   *    },
   *    {
   *      key: this.clientKP2.publicKey(),
   *      weight: 2,
   *    },
   *  ];
   *
   * // The result below should be equal to [clientKP1.publicKey(), clientKP2.publicKey()]
   * Utils.verifyChallengeTxThreshold(signedChallenge, serverKP.publicKey(), Networks.TESTNET, threshold, signerSummary);
   */
  export function verifyChallengeTxThreshold(
    challengeTx: string,
    serverAccountID: string,
    networkPassphrase: string,
    threshold: number,
    signerSummary: ServerApi.AccountRecordSigners[],
  ): string[] {
    const signers = signerSummary.map((signer) => signer.key);

    const signersFound = verifyChallengeTxSigners(
      challengeTx,
      serverAccountID,
      networkPassphrase,
      signers,
    );

    let weight = 0;
    for (const signer of signersFound) {
      const sigWeight =
        signerSummary.find((s) => s.key === signer)?.weight || 0;
      weight += sigWeight;
    }

    if (weight < threshold) {
      throw new InvalidSep10ChallengeError(
        `signers with weight ${weight} do not meet threshold ${threshold}"`,
      );
    }

    return signersFound;
  }

  /**
   * verifyChallengeTxSigners verifies that for a SEP 10 challenge transaction all
   * signatures on the transaction are accounted for. A transaction is verified
   * if it is signed by the server account, and all other signatures match a signer
   * that has been provided as an argument (as the accountIDs list). Additional signers
   * can be provided that do not have a signature, but all signatures must be matched
   * to a signer (accountIDs) for verification to succeed. If verification succeeds,
   * a list of signers that were found is returned, not including the server account ID.
   *
   * Signers that are not prefixed as an address/account ID strkey (G...) will be ignored.
   *
   * Errors will be raised if:
   *  - The transaction is invalid according to ReadChallengeTx.
   *  - No client signatures are found on the transaction.
   *  - One or more signatures in the transaction are not identifiable as the
   *    server account or one of the signers provided in the arguments.
   *
   * @see [SEP0010: Stellar Web Authentication](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md).
   * @function
   * @memberof Utils
   * @param {string} challengeTx SEP0010 challenge transaction in base64.
   * @param {string} serverAccountID The server's stellar account (public key).
   * @param {string} networkPassphrase The network passphrase, e.g.: 'Test SDF Network ; September 2015'.
   * @param {string[]} signers The signers public keys. This list should contain the public keys for all signers that have signed the transaction.
   * @returns {string[]} The list of signers public keys that have signed the transaction, excluding the server account ID.
   * @example
   *
   * import { Networks, Transaction, Utils }  from 'stellar-sdk';
   *
   * const serverKP = Keypair.random();
   * const clientKP1 = Keypair.random();
   * const clientKP2 = Keypair.random();
   *
   * // Challenge, possibly built in the server side
   * const challenge = Utils.buildChallengeTx(
   *   serverKP,
   *   clientKP1.publicKey(),
   *   "SDF",
   *   300,
   *   Networks.TESTNET
   * );
   *
   * // clock.tick(200);  // Simulates a 200 ms delay when communicating from server to client
   *
   * // Transaction gathered from a challenge, possibly from the client side
   * const transaction = new Transaction(challenge, Networks.TESTNET);
   * transaction.sign(clientKP1, clientKP2);
   * const signedChallenge = transaction
   *         .toEnvelope()
   *         .toXDR("base64")
   *         .toString();
   *
   * // The result below should be equal to [clientKP1.publicKey(), clientKP2.publicKey()]
   * Utils.verifyChallengeTxSigners(signedChallenge, serverKP.publicKey(), Networks.TESTNET, threshold, [clientKP1.publicKey(), clientKP2.publicKey()]);
   */
  export function verifyChallengeTxSigners(
    challengeTx: string,
    serverAccountID: string,
    networkPassphrase: string,
    signers: string[],
  ): string[] {
    // Read the transaction which validates its structure.
    const { tx } = readChallengeTx(
      challengeTx,
      serverAccountID,
      networkPassphrase,
    );

    // Ensure the server account ID is an address and not a seed.
    let serverKP: Keypair;
    try {
      serverKP = Keypair.fromPublicKey(serverAccountID); // can throw 'Invalid Stellar public key'
    } catch (err) {
      throw new Error(
        "Couldn't infer keypair from the provided 'serverAccountID': " +
          err.message,
      );
    }

    // Deduplicate the client signers and ensure the server is not included
    // anywhere we check or output the list of signers.
    const clientSigners = new Set<string>();
    for (const signer of signers) {
      // Ignore the server signer if it is in the signers list. It's
      // important when verifying signers of a challenge transaction that we
      // only verify and return client signers. If an account has the server
      // as a signer the server should not play a part in the authentication
      // of the client.
      if (signer === serverKP.publicKey()) {
        continue;
      }

      // Ignore non-G... account/address signers.
      if (!StrKey.isValidEd25519PublicKey(signer)) {
        continue;
      }

      clientSigners.add(signer);
    }

    // Don't continue if none of the signers provided are in the final list.
    if (clientSigners.size === 0) {
      throw new InvalidSep10ChallengeError(
        "No verifiable client signers provided, at least one G... address must be provided",
      );
    }

    // Verify all the transaction's signers (server and client) in one
    // hit. We do this in one hit here even though the server signature was
    // checked in the ReadChallengeTx to ensure that every signature and signer
    // are consumed only once on the transaction.
    const allSigners: string[] = [
      serverKP.publicKey(),
      ...Array.from(clientSigners),
    ];

    const signersFound: string[] = gatherTxSigners(tx, allSigners);

    // Confirm we matched a signature to the server signer.
    if (!signersFound.includes(serverKP.publicKey())) {
      throw new InvalidSep10ChallengeError(
        "Transaction not signed by server: '" + serverKP.publicKey() + "'",
      );
    }

    // Confirm we matched at least one given signer with the transaction signatures
    if (signersFound.length === 1) {
      throw new InvalidSep10ChallengeError(
        "None of the given signers match the transaction signatures",
      );
    }

    // Confirm all signatures, including the server signature, were consumed by a signer:
    if (signersFound.length !== tx.signatures.length) {
      throw new InvalidSep10ChallengeError(
        "Transaction has unrecognized signatures",
      );
    }

    // Remove the server public key before returning
    signersFound.splice(signersFound.indexOf(serverKP.publicKey()), 1);

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
   * @see [SEP0010: Stellar Web Authentication](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md).
   * @function
   * @memberof Utils
   * @param {string} challengeTx SEP0010 transaction challenge transaction in base64.
   * @param {string} serverAccountID The server's stellar account.
   * @param {string} networkPassphrase The network passphrase.
   * @example
   * import { Utils, Networks }  from 'stellar-sdk'
   *
   * let challenge = Utils.verifyChallengeTx("base64tx", "server-account-id", Networks.TESTNET)
   * @returns {boolean}
   *
   * @deprecated Use {@link Utils#verifyChallengeTxThreshold}
   */
  export function verifyChallengeTx(
    challengeTx: string,
    serverAccountId: string,
    networkPassphrase?: string,
  ): boolean {
    console.warn(
      "`Utils#verifyChallengeTx` is deprecated. Please use `Utils#verifyChallengeTxThreshold`.",
    );

    const { tx, clientAccountID } = readChallengeTx(
      challengeTx,
      serverAccountId,
      networkPassphrase,
    );

    if (!verifyTxSignedBy(tx, serverAccountId)) {
      throw new InvalidSep10ChallengeError(
        "The transaction is not signed by the server",
      );
    }

    if (!verifyTxSignedBy(tx, clientAccountID)) {
      throw new InvalidSep10ChallengeError(
        "The transaction is not signed by the client",
      );
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
    accountID: string,
  ): boolean {
    return gatherTxSigners(transaction, [accountID]).length !== 0;
  }

  /**
   *
   * gatherTxSigners checks if a transaction has been signed by one or more of
   * the given signers, returning a list of non-repeated signers that were found to have
   * signed the given transaction.
   *
   * @function
   * @memberof Utils
   * @param {Transaction} transaction the signed transaction.
   * @param {string[]} signers The signers public keys.
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
   * Utils.gatherTxSigners(transaction, [keypair1.publicKey(), keypair2.publicKey()])
   * @returns {string[]} a list of signers that were found to have signed the transaction.
   */
  export function gatherTxSigners(
    transaction: Transaction,
    signers: string[],
  ): string[] {
    const hashedSignatureBase = transaction.hash();

    const txSignatures = clone(transaction.signatures);
    const signersFound = new Set<string>();

    for (const signer of signers) {
      if (txSignatures.length === 0) {
        break;
      }

      const keypair = Keypair.fromPublicKey(signer);

      for (let i = 0; i < txSignatures.length; i++) {
        const decSig = txSignatures[i];

        if (!decSig.hint().equals(keypair.signatureHint())) {
          continue;
        }

        if (keypair.verify(hashedSignatureBase, decSig.signature())) {
          signersFound.add(signer);
          txSignatures.splice(i, 1);
          break;
        }
      }
    }

    return Array.from(signersFound);
  }

  /**
   * Verifies if the current date is within the transaction's timebonds
   *
   * @function
   * @memberof Utils
   * @param {Transaction} transaction the transaction whose timebonds will be validated.
   * @returns {boolean} returns true if the current time is within the transaction's [minTime, maxTime] range.
   */
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
