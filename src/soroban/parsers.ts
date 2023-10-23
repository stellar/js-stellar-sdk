import { xdr, Contract, SorobanDataBuilder } from 'stellar-base';
import { Api } from './soroban_rpc';

export function parseRawSendTransaction(
  r: Api.RawSendTransactionResponse
): Api.SendTransactionResponse {
  const errResult = r.errorResultXdr;
  delete r.errorResultXdr;

  if (!!errResult) {
    return {
      ...r,
      errorResult: xdr.TransactionResult.fromXDR(errResult, 'base64')
    };
  }

  return { ...r } as Api.BaseSendTransactionResponse;
}

export function parseRawEvents(
  r: Api.RawGetEventsResponse
): Api.GetEventsResponse {
  return {
    latestLedger: r.latestLedger,
    events: (r.events ?? []).map((evt) => {
      return {
        ...evt,
        contractId: new Contract(evt.contractId),
        topic: evt.topic.map((topic) => xdr.ScVal.fromXDR(topic, 'base64')),
        value: xdr.DiagnosticEvent.fromXDR(evt.value.xdr, 'base64')
      };
    })
  };
}

export function parseRawLedgerEntries(
  raw: Api.RawGetLedgerEntriesResponse
): Api.GetLedgerEntriesResponse {
  return {
    latestLedger: raw.latestLedger,
    entries: (raw.entries ?? []).map((rawEntry) => {
      if (!rawEntry.key || !rawEntry.xdr) {
        throw new TypeError(
          `invalid ledger entry: ${JSON.stringify(rawEntry)}`
        );
      }

      return {
        lastModifiedLedgerSeq: rawEntry.lastModifiedLedgerSeq,
        key: xdr.LedgerKey.fromXDR(rawEntry.key, 'base64'),
        val: xdr.LedgerEntryData.fromXDR(rawEntry.xdr, 'base64'),
        expirationLedgerSeq: rawEntry.expirationLedgerSeq
      };
    })
  };
}

/**
 * Converts a raw response schema into one with parsed XDR fields and a
 * simplified interface.
 *
 * @param raw   the raw response schema (parsed ones are allowed, best-effort
 *    detected, and returned untouched)
 *
 * @returns the original parameter (if already parsed), parsed otherwise
 *
 * @warning This API is only exported for testing purposes and should not be
 *          relied on or considered "stable".
 */
export function parseRawSimulation(
  sim:
    | Api.SimulateTransactionResponse
    | Api.RawSimulateTransactionResponse
): Api.SimulateTransactionResponse {
  const looksRaw = Api.isSimulationRaw(sim);
  if (!looksRaw) {
    // Gordon Ramsey in shambles
    return sim;
  }

  // shared across all responses
  let base: Api.BaseSimulateTransactionResponse = {
    _parsed: true,
    id: sim.id,
    latestLedger: sim.latestLedger,
    events:
      sim.events?.map((evt) => xdr.DiagnosticEvent.fromXDR(evt, 'base64')) ?? []
  };

  // error type: just has error string
  if (typeof sim.error === 'string') {
    return {
      ...base,
      error: sim.error
    };
  }

  return parseSuccessful(sim, base);
}

function parseSuccessful(
  sim: Api.RawSimulateTransactionResponse,
  partial: Api.BaseSimulateTransactionResponse
):
  | Api.SimulateTransactionRestoreResponse
  | Api.SimulateTransactionSuccessResponse {
  // success type: might have a result (if invoking) and...
  const success: Api.SimulateTransactionSuccessResponse = {
    ...partial,
    transactionData: new SorobanDataBuilder(sim.transactionData!),
    minResourceFee: sim.minResourceFee!,
    cost: sim.cost!,
    ...// coalesce 0-or-1-element results[] list into a single result struct
    // with decoded fields if present
    ((sim.results?.length ?? 0 > 0) && {
      result: sim.results!.map((row) => {
        return {
          auth: (row.auth ?? []).map((entry) =>
            xdr.SorobanAuthorizationEntry.fromXDR(entry, 'base64')
          ),
          // if return value is missing ("falsy") we coalesce to void
          retval: !!row.xdr
            ? xdr.ScVal.fromXDR(row.xdr, 'base64')
            : xdr.ScVal.scvVoid()
        };
      })[0]
    })
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
      )
    }
  };
}
