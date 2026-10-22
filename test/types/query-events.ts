// Compile-time tests for `rpc.Server.queryEvents`: a cursor continuation
// cannot carry range fields, and `isQueryEventsError` narrows the error data.
// This file only has to typecheck; it never runs.

import { Api } from "../../src/rpc/api.js";
import type { RpcServer } from "../../src/rpc/server.js";

export function requests(server: RpcServer) {
  server.queryEvents({ cursor: "a", limit: 10 });
  server.queryEvents({ minLedger: 1, maxLedger: 2, order: "asc", filters: [] });
  // @ts-expect-error cursor with minLedger
  server.queryEvents({ cursor: "a", minLedger: 1 });
  // @ts-expect-error cursor with maxLedger
  server.queryEvents({ cursor: "a", maxLedger: 1 });
  // @ts-expect-error cursor with order
  server.queryEvents({ cursor: "a", order: "asc" });
  // @ts-expect-error cursor with filters
  server.queryEvents({ cursor: "a", filters: [] });
  // @ts-expect-error raw requests keep the same split
  server._queryEvents({ cursor: "a", minLedger: 1 });
}

export function narrowing(err: unknown): number | undefined {
  if (!Api.isQueryEventsError(err)) {
    return undefined;
  }
  const reason: "invalid_params" | "ledger_out_of_range" | "cursor_malformed" =
    err.data.reason;
  if (reason === "ledger_out_of_range" && err.data.reason === reason) {
    return err.data.missingLedger;
  }
  return err.code;
}
