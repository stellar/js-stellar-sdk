import {
  FeeBumpTransaction,
  Operation,
  Transaction,
  TransactionBuilder,
  SorobanDataBuilder,
  xdr
} from "stellar-base";

import { SorobanRpc } from "./soroban_rpc";

/**
 * Combines the given raw transaction alongside the simulation results.
 *
 * @param raw   the initial transaction, w/o simulation applied
 * @param networkPassphrase  the network this simulation applies to (see
 *    {@link Networks} for options)
 * @param simulation  the Soroban RPC simulation result (see
 *    {@link Server.simulateTransaction})
 *
 * @returns a new, cloned transaction with the proper auth and resource (fee,
 *    footprint) simulation data applied
 *
 * @note if the given transaction already has authorization entries in a host
 *    function invocation (see {@link Operation.invokeHostFunction}), **the
 *    simulation entries are ignored**.
 *
 * @see {Server.simulateTransaction}
 * @see {Server.prepareTransaction}
 */
export function assembleTransaction(
  raw: Transaction | FeeBumpTransaction,
  networkPassphrase: string,
  simulation:
    | SorobanRpc.SimulateTransactionResponse
    | SorobanRpc.RawSimulateTransactionResponse
): TransactionBuilder {
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

  let success = parseRawSimulation(simulation);
  if (!SorobanRpc.isSimulationSuccess(success)) {
    throw new Error(`simulation incorrect: ${JSON.stringify(success)}`);
  }

  const classicFeeNum = parseInt(raw.fee) || 0;
  const minResourceFeeNum = parseInt(success.minResourceFee) || 0;
  const txnBuilder = TransactionBuilder.cloneFrom(raw, {
    // automatically update the tx fee that will be set on the resulting tx to
    // the sum of 'classic' fee provided from incoming tx.fee and minResourceFee
    // provided by simulation.
    //
    // 'classic' tx fees are measured as the product of tx.fee * 'number of
    // operations', In soroban contract tx, there can only be single operation
    // in the tx, so can make simplification of total classic fees for the
    // soroban transaction will be equal to incoming tx.fee + minResourceFee.
    fee: (classicFeeNum + minResourceFeeNum).toString(),
    // apply the pre-built Soroban Tx Data from simulation onto the Tx
    sorobanData: success.transactionData.build(),
    networkPassphrase
  });

  switch (raw.operations[0].type) {
    case "invokeHostFunction":
      // In this case, we don't want to clone the operation, so we drop it.
      txnBuilder.clearOperations();

      const invokeOp: Operation.InvokeHostFunction = raw.operations[0];
      const existingAuth = invokeOp.auth ?? [];
      txnBuilder.addOperation(
        Operation.invokeHostFunction({
          source: invokeOp.source,
          func: invokeOp.func,
          // if auth entries are already present, we consider this "advanced
          // usage" and disregard ALL auth entries from the simulation
          //
          // the intuition is "if auth exists, this tx has probably been
          // simulated before"
          auth: existingAuth.length > 0 ? existingAuth : success.result!.auth,
        })
      );
      break;
  }

  return txnBuilder;
}

/**
 * Converts a raw response schema into one with parsed XDR fields and a
 * simplified interface.
 *
 * @param raw   the raw response schema (parsed ones are allowed, best-effort
 *    detected, and returned untouched)
 *
 * @returns the original parameter (if already parsed), parsed otherwise
 */
export function parseRawSimulation(
  sim:
    | SorobanRpc.SimulateTransactionResponse
    | SorobanRpc.RawSimulateTransactionResponse
): SorobanRpc.SimulateTransactionResponse {
  const looksRaw = isSimulationRaw(sim);
  if (!looksRaw) {
    // Gordon Ramsey in shambles
    return sim;
  }

  // shared across all responses
  let base: SorobanRpc.BaseSimulateTransactionResponse = {
    _parsed: true,
    id: sim.id,
    latestLedger: sim.latestLedger,
    events: sim.events?.map(
      evt => xdr.DiagnosticEvent.fromXDR(evt, 'base64')
    ) ?? [],
  };

  // error type: just has error string
  if (typeof sim.error === 'string') {
    return {
      ...base,
      error: sim.error,
    };
  }

  return parseSuccessful(sim, base);
}

function parseSuccessful(
  sim: SorobanRpc.RawSimulateTransactionResponse,
  partial: SorobanRpc.BaseSimulateTransactionResponse
):
  | SorobanRpc.SimulateTransactionRestoreResponse
  | SorobanRpc.SimulateTransactionSuccessResponse {

  // success type: might have a result (if invoking) and...
  const success: SorobanRpc.SimulateTransactionSuccessResponse = {
    ...partial,
    transactionData: new SorobanDataBuilder(sim.transactionData!),
    minResourceFee: sim.minResourceFee!,
    cost: sim.cost!,
    ...(
      // coalesce 0-or-1-element results[] list into a single result struct
      // with decoded fields if present
      (sim.results?.length ?? 0 > 0) &&
      {
        result: sim.results!.map(row => {
          return {
            auth: (row.auth ?? []).map((entry) =>
              xdr.SorobanAuthorizationEntry.fromXDR(entry, 'base64')),
            // if return value is missing ("falsy") we coalesce to void
            retval: !!row.xdr
              ? xdr.ScVal.fromXDR(row.xdr, 'base64')
              : xdr.ScVal.scvVoid()
          }
        })[0],
      }
    )
  };

  if (!sim.restorePreamble || sim.restorePreamble.transactionData === '') {
    return success;
  }

  // ...might have a restoration hint (if some state is expired)
  return {
    ...success,
    restorePreamble: {
      minResourceFee: sim.restorePreamble!.minResourceFee,
      transactionData: new SorobanDataBuilder(
        sim.restorePreamble!.transactionData
      ),
    }
  };
}

export function isSimulationRaw(
  sim:
    | SorobanRpc.SimulateTransactionResponse
    | SorobanRpc.RawSimulateTransactionResponse
): sim is SorobanRpc.RawSimulateTransactionResponse {
  return !(sim as SorobanRpc.SimulateTransactionResponse)._parsed;
}

function isSorobanTransaction(tx: Transaction): boolean {
  if (tx.operations.length !== 1) {
    return false;
  }

  switch (tx.operations[0].type) {
    case "invokeHostFunction":
    case "bumpFootprintExpiration":
    case "restoreFootprint":
      return true

    default:
      return false;
  }
}