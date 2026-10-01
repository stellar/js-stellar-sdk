/**
 * The code blocks for docs/guides/05-handle-errors.md. The guide contains
 * only `<!-- snippet: handle-errors.ts#name -->` markers; the docs build
 * replaces each marker with the matching `#region` below (see
 * config/snippets.ts), and test/guides/snippets.test.ts executes this file
 * top to bottom.
 *
 * This is ONE program. The guide's "Put it together" block is the `full`
 * region spanning it, and the result-codes and not-found blocks are
 * overlapping views of the same lines. The reject and inspect blocks run
 * after it and submit `tx` again: Horizon answers a resubmitted transaction
 * with its original result, so they see the same failure.
 */
// #region full
import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  BASE_FEE,
} from "@stellar/stellar-sdk";
// #region result-codes
import { TransactionFailedError } from "@stellar/stellar-sdk";
// #endregion result-codes
// #region not-found
import { NotFoundError } from "@stellar/stellar-sdk";
// #endregion not-found
// #endregion full
// #region inspect
import { NetworkError } from "@stellar/stellar-sdk";
// #endregion inspect

// #region full
const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

const sender = Keypair.random();
await horizon.friendbot(sender.publicKey()).call();
const account = await horizon.loadAccount(sender.publicKey());

// Pay an account that does not exist -> the transaction fails.
const tx = new TransactionBuilder(account, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.payment({
      destination: Keypair.random().publicKey(),
      asset: Asset.native(),
      amount: "1",
    }),
  )
  .setTimeout(30)
  .build();
tx.sign(sender);
// #endregion full

let codes: { transaction: string; operations: string[] } | undefined;

// #region full
// #region result-codes
try {
  await horizon.submitTransaction(tx);
} catch (error) {
  if (error instanceof TransactionFailedError) {
    const { transaction, operations } = error.getResultCodes();
    console.error("transaction:", transaction); // e.g. "tx_failed"
    console.error("operations:", operations); // e.g. ["op_no_destination"]
    // #endregion result-codes
    // #endregion full
    codes = { transaction, operations };
    // #region full
    // #region result-codes
  } else {
    throw error;
  }
}
// #endregion result-codes
// #endregion full

if (codes?.transaction !== "tx_failed") {
  throw new Error(`guide payment failed with ${codes?.transaction}`);
}
if (codes.operations.join() !== "op_no_destination") {
  throw new Error(`guide payment failed with ${codes.operations.join()}`);
}

let notFound = false;

// #region full
// Loading a non-existent account throws NotFoundError.
const accountId = Keypair.random().publicKey();
// #region not-found
try {
  await horizon.loadAccount(accountId);
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error("That account does not exist yet (fund it first).");
    // #endregion not-found
    // #endregion full
    notFound = true;
    // #region full
    // #region not-found
  } else {
    throw error;
  }
}
// #endregion not-found
// #endregion full

if (!notFound) {
  throw new Error("guide loadAccount did not throw NotFoundError");
}

let rejected: unknown;

// #region reject
try {
  await horizon.submitTransaction(tx);
} catch (error) {
  // #endregion reject
  rejected = error;
  // #region reject
  // inspect the error (below)
}
// #endregion reject

if (!(rejected instanceof TransactionFailedError)) {
  throw new Error(
    "guide submission did not reject with TransactionFailedError",
  );
}

let inspected: unknown;

// #region inspect
try {
  await horizon.submitTransaction(tx);
} catch (error) {
  // #endregion inspect
  inspected = error;
  // #region inspect
  console.error(
    error instanceof NetworkError ? (error.response.data ?? error) : error,
  );
}
// #endregion inspect

if (
  !(inspected instanceof NetworkError) ||
  inspected.response.data?.title !== "Transaction Failed"
) {
  throw new Error("guide error body is not a Transaction Failed problem");
}
