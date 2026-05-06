import { StrKey } from "./strkey.js";
import { scValToNative } from "./scval.js";
import type { xdr } from "./index.js";

interface SorobanEvent {
  type: "contract" | "diagnostic" | "system";
  contractId?: string;

  topics: any[];

  data: any;
}

function extractEvent(event: xdr.ContractEvent): SorobanEvent {
  const contractId =
    typeof event.contractId === "function" ? event.contractId() : null;

  return {
    ...(contractId !== null &&
      contractId !== undefined && {
        contractId: StrKey.encodeContract(contractId as unknown as Buffer),
      }),
    type: event.type().name,
    topics: event
      .body()
      .value()
      .topics()

      .map((t: xdr.ScVal) => scValToNative(t)),

    data: scValToNative(event.body().value().data()),
  };
}

/**
 * Converts raw diagnostic or contract events into something with a flatter,
 * human-readable, and understandable structure.
 *
 * Each element in the returned list has the following properties:
 *  - `type`: one of `'system'`, `'contract'`, `'diagnostic'`
 *  - `contractId`: optionally, a `C...` encoded strkey
 *  - `topics`: a list of {@link scValToNative} invocations on the topics
 *  - `data`: a {@link scValToNative} invocation on the raw event data
 *
 * @param events - either contract events or diagnostic events to parse into a
 *    friendly format
 * @category Core / Soroban Primitives
 */
export function humanizeEvents(
  events: xdr.ContractEvent[] | xdr.DiagnosticEvent[],
): SorobanEvent[] {
  return events.map((e) => {
    // A pseudo-instanceof check for xdr.DiagnosticEvent more reliable
    // in mixed SDK environments:
    if ("inSuccessfulContractCall" in e) {
      return extractEvent(e.event());
    }

    return extractEvent(e);
  });
}
