import {
  Account,
  FeeBumpTransaction,
  Operation,
  Transaction,
  TransactionBuilder,
  xdr,
} from "stellar-base";

import { SorobanRpc } from "./soroban_rpc";

// TODO: Transaction is immutable, so we need to re-build it here. :(
export function assembleTransaction(
  raw: Transaction | FeeBumpTransaction,
  networkPassphrase: string,
  simulation: SorobanRpc.SimulateTransactionResponse
): Transaction {
  if ("innerTransaction" in raw) {
    // TODO: Handle feebump transactions
    return assembleTransaction(
      raw.innerTransaction,
      networkPassphrase,
      simulation
    );
  }

  if (!isSorobanTransaction(raw)) {
    throw new TypeError(
      "unsupported transaction: must contain exactly one " +
        "invokeHostFunction, bumpFootprintExpiration, or restoreFootprint " +
        "operation"
    );
  }

  if (simulation.results.length !== 1) {
    throw new Error(`simulation results invalid: ${simulation.results}`);
  }

  const source = new Account(raw.source, `${parseInt(raw.sequence, 10) - 1}`);
  const classicFeeNum = parseInt(raw.fee, 10) || 0;
  const minResourceFeeNum = parseInt(simulation.minResourceFee, 10) || 0;
  const txnBuilder = new TransactionBuilder(source, {
    // automatically update the tx fee that will be set on the resulting tx to
    // the sum of 'classic' fee provided from incoming tx.fee and minResourceFee
    // provided by simulation.
    //
    // 'classic' tx fees are measured as the product of tx.fee * 'number of
    // operations', In soroban contract tx, there can only be single operation
    // in the tx, so can make simplification of total classic fees for the
    // soroban transaction will be equal to incoming tx.fee + minResourceFee.
    fee: (classicFeeNum + minResourceFeeNum).toString(),
    memo: raw.memo,
    networkPassphrase,
    timebounds: raw.timeBounds,
    ledgerbounds: raw.ledgerBounds,
    minAccountSequence: raw.minAccountSequence,
    minAccountSequenceAge: raw.minAccountSequenceAge,
    minAccountSequenceLedgerGap: raw.minAccountSequenceLedgerGap,
    extraSigners: raw.extraSigners,
  });

  switch (raw.operations[0].type) {
    case "invokeHostFunction":
      const invokeOp: Operation.InvokeHostFunction = raw.operations[0];
      txnBuilder.addOperation(
        Operation.invokeHostFunction({
          source: invokeOp.source,
          func: invokeOp.func,
          // apply the auth from the simulation
          auth: (invokeOp.auth ?? []).concat(
            simulation.results[0].auth?.map((a: string) =>
              xdr.SorobanAuthorizationEntry.fromXDR(a, "base64")
            ) ?? []
          ),
        })
      );
      break;

    case "bumpFootprintExpiration":
      txnBuilder.addOperation(Operation.bumpFootprintExpiration(raw.operations[0]));
      break;

    case "restoreFootprint":
      txnBuilder.addOperation(Operation.restoreFootprint(raw.operations[0]));
      break;
  }

  // apply the pre-built Soroban Tx Data from simulation onto the Tx
  const sorobanTxData = xdr.SorobanTransactionData.fromXDR(
    simulation.transactionData,
    "base64"
  );
  txnBuilder.setSorobanData(sorobanTxData);

  return txnBuilder.build();
}

function isSorobanTransaction(tx: Transaction): boolean {
  if (tx.operations.length !== 1) {
    return false;
  }

  switch (tx.operations[0].type) {
    case "invokeHostFunction":
    case "bumpFootprintExpiration":
    case "restoreFootprint":
      return true;

    default:
      return false;
  }
}
