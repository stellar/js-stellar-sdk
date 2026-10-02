import {
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  vi,
  type MockInstance,
} from "vitest";
import * as StellarSdk from "../../../../src/index.js";
import * as xdr from "../../../../src/xdr/index.js";

import { serverUrl } from "../../../constants.js";

const { Keypair, rpc } = StellarSdk;
const { Server } = rpc;

describe("Server#ledger entry absence errors", () => {
  let server: InstanceType<typeof Server>;
  let mockPost: MockInstance;

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const emptyEntries = { data: { result: { latestLedger: 0, entries: [] } } };

  const address = "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
  const accountLedgerKey = xdr.LedgerKey.account(
    new xdr.LedgerKeyAccount({
      accountId: Keypair.fromPublicKey(address).xdrPublicKey(),
    }),
  );
  const contractId = "CCN57TGC6EXFCYIQJ4UCD2UDZ4C3AQCHVMK74DGZ3JYCA5HD4BY7FNPC";
  const wasmHash = new Uint8Array(32);

  // "This entry does not exist" is an answer the caller can act on, and every
  // ledger lookup must give it in the same shape: a real `Error` (so it keeps
  // a stack and passes `instanceof Error` in logging and telemetry pipelines)
  // carrying a stable, machine-readable `.code`. Before #1763, these helpers
  // answered in three incompatible shapes: an `Error` with no code, a bare
  // `{ code: 404 }` object literal that is not an `Error` at all, and — behind
  // a catch-all — anything at all.
  it.each([
    ["getLedgerEntry", () => server.getLedgerEntry(accountLedgerKey)],
    ["getAccount", () => server.getAccount(address)],
    ["getAccountEntry", () => server.getAccountEntry(address)],
    ["getContractInstance", () => server.getContractInstance(contractId)],
    ["getContractWasmByHash", () => server.getContractWasmByHash(wasmHash)],
  ])(
    "%s rejects a missing entry with an Error carrying .code 404",
    async (_name, call) => {
      mockPost.mockResolvedValue(emptyEntries);

      const error: unknown = await call().then(
        () => {
          throw new Error("expected the lookup to reject");
        },
        (e: unknown) => e,
      );

      expect(error).toBeInstanceOf(Error);
      // guarded by the instanceof assertion above
      const coded = error as Error & { code?: number };
      expect(coded.code).toBe(404);
    },
  );

  // Absence and "could not ask" are different answers. Callers branch on the
  // first to decide whether an account or contract exists; for them a
  // transport error misread as absence is a wrong conclusion about on-chain
  // state rather than a retry. Public RPC endpoints rate-limit routinely, so
  // this fires on ordinary polling, not on an exotic edge.
  it.each([
    [
      "a rate limit",
      { response: { status: 429, data: { error: "too many requests" } } },
    ],
    [
      "a server error",
      { response: { status: 503, data: { error: "unavailable" } } },
    ],
    [
      "a network failure",
      Object.assign(new Error("socket hang up"), { code: "ECONNRESET" }),
    ],
  ])(
    "getAccount surfaces %s instead of reporting a missing account",
    async (_label, transportError) => {
      mockPost.mockRejectedValue(transportError);

      await expect(server.getAccount(address)).rejects.toBe(transportError);
    },
  );
});
