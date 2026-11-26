// Compile-time tests for `rpc.inspectDiagnosticEvents`, through the public
// entry point. This file only has to typecheck; it never runs.

import { rpc } from "../../src/index.js";

// Every parsed response that can carry diagnostic events is accepted as is,
// with no narrowing by status first.
export function diagnostics(
  sent: rpc.Api.SendTransactionResponse,
  got: rpc.Api.GetTransactionResponse,
  entry: rpc.Api.TransactionInfo,
  simulated: rpc.Api.SimulateTransactionResponse,
): rpc.DiagnosticEventInfo[] {
  const input: rpc.DiagnosticEventsInput = sent;
  const [first] = rpc.inspectDiagnosticEvents(input);
  const flag: boolean = first.inSuccessfulContractCall;
  const type: "contract" | "diagnostic" | "system" = first.type;
  const contractId: string | undefined = first.contractId;
  void [flag, type, contractId];

  // @ts-expect-error a raw response holds base64 strings, not parsed events
  rpc.inspectDiagnosticEvents({ events: ["AAAA"] });

  return [
    ...rpc.inspectDiagnosticEvents(got),
    ...rpc.inspectDiagnosticEvents(entry),
    ...rpc.inspectDiagnosticEvents(simulated),
  ];
}
