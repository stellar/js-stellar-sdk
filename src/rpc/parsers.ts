import { xdr, Contract, SorobanDataBuilder } from '@stellar/stellar-base';
import { Api } from './api';

/**
 * Parse the response from invoking the `submitTransaction` method of a RPC server.
 * @memberof module:rpc
 * @private
 *
 * @param {Api.RawSendTransactionResponse} raw the raw `submitTransaction` response from the RPC server to parse
 * @returns {Api.SendTransactionResponse} transaction response parsed from the RPC server's response
 */
export function parseRawSendTransaction(
  raw: Api.RawSendTransactionResponse
): Api.SendTransactionResponse {
  const { errorResultXdr, diagnosticEventsXdr } = raw;
  delete raw.errorResultXdr;
  delete raw.diagnosticEventsXdr;

  if (errorResultXdr) {
    return {
      ...raw,
      ...(
        diagnosticEventsXdr !== undefined &&
        diagnosticEventsXdr.length > 0 && {
          diagnosticEvents: diagnosticEventsXdr.map(
            evt => xdr.DiagnosticEvent.fromXDR(evt, 'base64')
          )
        }
      ),
      errorResult: xdr.TransactionResult.fromXDR(errorResultXdr, 'base64'),
    };
  }

  return { ...raw } as Api.BaseSendTransactionResponse;
}

export function parseTransactionInfo(
  raw: Api.RawTransactionInfo | Api.RawGetTransactionResponse
): Omit<Api.TransactionInfo, 'status' | 'txHash'> {
  const meta = xdr.TransactionMeta.fromXDR(raw.resultMetaXdr!, 'base64');
  const info: Omit<Api.TransactionInfo, 'status' | 'txHash'> = {
    ledger: raw.ledger!,
    createdAt: raw.createdAt!,
    applicationOrder: raw.applicationOrder!,
    feeBump: raw.feeBump!,
    envelopeXdr: xdr.TransactionEnvelope.fromXDR(raw.envelopeXdr!, 'base64'),
    resultXdr: xdr.TransactionResult.fromXDR(raw.resultXdr!, 'base64'),
    resultMetaXdr: meta,
    events: {
      contractEventsXdr: (raw.events?.contractEventsXdr ?? []).map(
        lst => lst.map(e => xdr.ContractEvent.fromXDR(e, "base64"))
      ),
      transactionEventsXdr: (raw.events?.transactionEventsXdr ?? []).map(
        e => xdr.TransactionEvent.fromXDR(e, "base64")
      ),
    },
  };

  switch (meta.switch()) {
    case 3:
    case 4:
      const metaV = meta.value() as xdr.TransactionMetaV3 | xdr.TransactionMetaV4;
      if (metaV.sorobanMeta() !== null) {
        info.returnValue = metaV.sorobanMeta()?.returnValue() ?? undefined;
      }
  }

  if (raw.diagnosticEventsXdr) {
    info.diagnosticEventsXdr = raw.diagnosticEventsXdr.map(
        e => xdr.DiagnosticEvent.fromXDR(e, 'base64')
    );
  }

  return info;
}

export function parseRawTransactions(
    r: Api.RawTransactionInfo
): Api.TransactionInfo {
  return {
    status: r.status,
    txHash: r.txHash,
    ...parseTransactionInfo(r),
  };
}

/**
 * Parse and return the retrieved events, if any, from a raw response from a
 * RPC server.
 * @memberof module:rpc
 *
 * @param {Api.RawGetEventsResponse} raw the raw `getEvents` response from the
 *    RPC server to parse
 * @returns {Api.GetEventsResponse} events parsed from the RPC server's
 *    response
 */
export function parseRawEvents(
  raw: Api.RawGetEventsResponse
): Api.GetEventsResponse {
  return {
    latestLedger: raw.latestLedger,
    oldestLedger: raw.oldestLedger,
    latestLedgerCloseTime: raw.latestLedgerCloseTime,
    oldestLedgerCloseTime: raw.oldestLedgerCloseTime,

    cursor: raw.cursor,
    events: (raw.events ?? []).map((evt) => {
      const clone: Omit<Api.RawEventResponse, 'contractId'> = { ...evt };
      delete (clone as any).contractId; // `as any` hack because contractId field isn't optional

      // the contractId may be empty so we omit the field in that case
      return {
        ...clone,
        ...(evt.contractId !== '' && { contractId: new Contract(evt.contractId) }),
        topic: evt.topic.map((topic) => xdr.ScVal.fromXDR(topic, 'base64')),
        value: xdr.ScVal.fromXDR(evt.value, 'base64')
      };
    })
  };
}

/**
 * Parse and return the retrieved ledger entries, if any, from a raw response
 * from a RPC server.
 * @memberof module:rpc
 * @private
 *
 * @param {Api.RawGetLedgerEntriesResponse} raw the raw `getLedgerEntries`
 *    response from the RPC server to parse
 * @returns {Api.GetLedgerEntriesResponse} ledger entries parsed from the
 *    RPC server's response
 */
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
        ...(rawEntry.liveUntilLedgerSeq !== undefined && {
          liveUntilLedgerSeq: rawEntry.liveUntilLedgerSeq
        })
      };
    })
  };
}

/**
 * Parse whether or not the transaction simulation was successful, returning the
 * relevant response.
 * @memberof module:rpc
 * @private
 *
 * @param {Api.RawSimulateTransactionResponse} sim a raw response from the
 *    `simulateTransaction` method of the RPC server to parse
 * @param {Api.BaseSimulateTransactionResponse} partial a partially built
 *    simulate transaction response that will be used to build the return
 *    response
 * @returns {Api.SimulateTransactionRestoreResponse |
 *    Api.SimulateTransactionSuccessResponse} Either a simulation response
 *    indicating what ledger entries should be restored, or if the simulation
 *    was successful.
 */
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
    // coalesce 0-or-1-element results[] list into a single result struct
    // with decoded fields if present
    // eslint-disable-next-line no-self-compare
    ...((sim.results?.length ?? 0 > 0) && {
      result: sim.results!.map((row) => ({
          auth: (row.auth ?? []).map((entry) =>
            xdr.SorobanAuthorizationEntry.fromXDR(entry, 'base64')
          ),
          // if return value is missing ("falsy") we coalesce to void
          retval: row.xdr
            ? xdr.ScVal.fromXDR(row.xdr, 'base64')
            : xdr.ScVal.scvVoid()
        }))[0]
    }),

    // eslint-disable-next-line no-self-compare
    ...(sim.stateChanges?.length ?? 0 > 0) && {
      stateChanges: sim.stateChanges?.map((entryChange) => ({
          type: entryChange.type,
          key: xdr.LedgerKey.fromXDR(entryChange.key, 'base64'),
          before: entryChange.before ? xdr.LedgerEntry.fromXDR(entryChange.before, 'base64') : null,
          after: entryChange.after ? xdr.LedgerEntry.fromXDR(entryChange.after, 'base64') : null,
        }))
    }

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

/**
 * Converts a raw response schema into one with parsed XDR fields and a simplified interface.
 * @warning This API is only exported for testing purposes and should not be relied on or considered "stable".
 * @memberof module:rpc
 *
 * @param {Api.SimulateTransactionResponse | Api.RawSimulateTransactionResponse} sim the raw response schema (parsed ones are allowed, best-effort
 *    detected, and returned untouched)
 * @returns {Api.SimulateTransactionResponse} the original parameter (if already parsed), parsed otherwise
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
  const base: Api.BaseSimulateTransactionResponse = {
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
