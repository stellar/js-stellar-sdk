import { StrKey } from "./strkey.js";
import { scValToNative } from "./scval.js";
import { ContractEvent, DiagnosticEvent, ScVal } from "./generated/index.js";

interface SorobanEvent {
  type: "contract" | "diagnostic" | "system";
  contractId?: string;

  topics: any[];

  data: any;
}

function extractEvent(event: ContractEvent): SorobanEvent {
  const contractId = event.contractId;
  const body = event.body.v0;

  return {
    ...(contractId !== null &&
      contractId !== undefined && {
        contractId: StrKey.encodeContract(Buffer.from(contractId)),
      }),
    type: event.type,
    topics: body.topics.map((t: ScVal) => scValToNative(t)),

    data: scValToNative(body.data),
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
 */
export function humanizeEvents(
  events: ContractEvent[] | DiagnosticEvent[],
): SorobanEvent[] {
  return events.map((e) => {
    // A pseudo-instanceof check for DiagnosticEvent more reliable
    // in mixed SDK environments:
    if ("inSuccessfulContractCall" in e) {
      return extractEvent(e.event);
    }

    return extractEvent(e);
  });
}
