import { humanizeEvents } from "../base/index.js";
import type { DiagnosticEvent, TransactionMeta } from "../xdr/index.js";
import type { Api } from "./api.js";

/**
 * The input to {@link inspectDiagnosticEvents}: a parsed `sendTransaction`,
 * `getTransaction` or `simulateTransaction` response, or a `getTransactions`
 * entry.
 */
export type DiagnosticEventsInput =
  | Api.SendTransactionResponse
  | Api.GetTransactionResponse
  | Api.TransactionInfo
  | Api.SimulateTransactionResponse;

/** A diagnostic event with its topics and data converted to native values. */
export interface DiagnosticEventInfo {
  /** whether the contract call that emitted the event succeeded */
  inSuccessfulContractCall: boolean;
  type: "contract" | "diagnostic" | "system";
  /** the emitting contract (`C...`), absent for events from the host itself */
  contractId?: string;
  topics: any[];
  data: any;
}

/**
 * Returns the diagnostic events of an RPC response in a readable form, or an
 * empty list if it has none. It makes no network calls.
 *
 * It reads `diagnosticEvents` of a `sendTransaction` response and `events` of
 * a `simulateTransaction` response. For a `getTransaction` response or
 * `getTransactions` entry it reads `diagnosticEventsXdr`, or the events in
 * `resultMetaXdr` when that field is missing or empty.
 *
 * @param response - a parsed `sendTransaction`, `getTransaction` or
 * `simulateTransaction` response, or a `getTransactions` entry
 */
export function inspectDiagnosticEvents(
  response: DiagnosticEventsInput,
): DiagnosticEventInfo[] {
  const events = diagnosticEventsOf(response);
  return humanizeEvents(events).map((event, i) => ({
    ...event,
    inSuccessfulContractCall: events[i].inSuccessfulContractCall,
  }));
}

function diagnosticEventsOf(
  response: DiagnosticEventsInput,
): DiagnosticEvent[] {
  if ("diagnosticEvents" in response) {
    return response.diagnosticEvents ?? [];
  }
  if (
    "diagnosticEventsXdr" in response &&
    response.diagnosticEventsXdr?.length
  ) {
    return response.diagnosticEventsXdr;
  }
  // A getTransaction response also has `events`, but as an object of contract
  // and transaction events.
  if ("events" in response && Array.isArray(response.events)) {
    return response.events;
  }
  // The top-level field is deprecated, and the meta holds the same events.
  if ("resultMetaXdr" in response) {
    return diagnosticEventsOfMeta(response.resultMetaXdr);
  }
  return [];
}

function diagnosticEventsOfMeta(meta: TransactionMeta): DiagnosticEvent[] {
  switch (meta.type) {
    case "v4":
      return meta.value.diagnosticEvents;
    case "v3":
      return meta.value.sorobanMeta?.diagnosticEvents ?? [];
    default:
      return [];
  }
}
