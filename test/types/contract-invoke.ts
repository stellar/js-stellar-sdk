// Compile-time tests for calls by on-chain name (#1875): `rpc.Server.queryContract`
// and `contract.Client.invoke` take `null` args, which mean no arguments.
// This file only has to typecheck; it never runs.

import type { RpcServer } from "../../src/rpc/server.js";
import { Client } from "../../src/contract/client.js";

export function args(server: RpcServer, client: Client) {
  void server.queryContract("C", "balance");
  void server.queryContract("C", "balance", { id: "G" });
  void server.queryContract("C", "balance", null);
  void Client.invoke(client, "balance");
  void Client.invoke(client, "balance", null, { fee: "100" });
  // @ts-expect-error args are an object, not a list
  void server.queryContract("C", "balance", ["G"]);
}
