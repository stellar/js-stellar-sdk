/**
 * The code blocks for docs/guides/06-invoke-a-contract.md. The guide contains
 * only `<!-- snippet: invoke-a-contract.ts#name -->` markers; the docs build
 * replaces each marker with the matching `#region` below (see
 * config/snippets.ts), and test/guides/snippets.test.ts executes this file
 * top to bottom.
 *
 * This is ONE program. The guide's "Put it together" block is the `full`
 * region spanning it, and the connect, preview and send blocks are
 * overlapping views of the same lines. The guide assumes a deployed increment
 * contract and a token contract; hidden setup deploys the increment contract
 * and creates the native SAC if it is missing.
 */
// #region full
// #region connect
import { contract, Keypair, Networks } from "@stellar/stellar-sdk";
// #endregion connect
// #region query
import { rpc } from "@stellar/stellar-sdk";
// #endregion query
// #endregion full
import { Asset, Contract, Operation } from "@stellar/stellar-sdk";
import { deployWasm, submit } from "./setup/deploy.js";

// #region full
// #region connect
const rpcUrl = "https://soroban-testnet.stellar.org";
const networkPassphrase = Networks.TESTNET;
// #endregion connect
let contractId = "C..."; // your deployed increment contract (see Prerequisites)
// #endregion full

// #region connect
// Describe just the methods you call. `Client.from<T>()` uses this to type the
// returned client, so the calls below are checked and autocompleted — no code
// generation needed.
// #region full
interface IncrementContract {
  increment: (
    options?: contract.MethodOptions,
  ) => Promise<contract.AssembledTransaction<number>>;
}
// #endregion connect

// #region query
const server = new rpc.Server(rpcUrl);
// #endregion query
const keypair = Keypair.random();
// #region connect
const { signTransaction } = contract.basicNodeSigner(
  keypair,
  networkPassphrase,
);
// #endregion connect

// Fund a throwaway account to invoke from (the RPC-side friendbot).
await server.fundAddress(keypair.publicKey());
// #endregion full

const deployer = { rpcUrl, networkPassphrase, keypair };
contractId = await deployWasm(deployer, "increment.wasm");

// The native SAC can already exist (testnet), and creating it twice fails.
const tokenId = Asset.native().contractId(networkPassphrase);
const { entries } = await server.getLedgerEntries(
  new Contract(tokenId).getFootprint(),
);
if (entries.length === 0) {
  await submit(
    deployer,
    Operation.createStellarAssetContract({ asset: Asset.native() }),
  );
}

// #region full
// #region connect
const client = await contract.Client.from<IncrementContract>({
  contractId,
  rpcUrl,
  networkPassphrase,
  publicKey: keypair.publicKey(),
  signTransaction,
});
// #endregion connect
// #endregion full

// #region query
// Discover what the contract exposes, from just its ID.
const methods = await server.getContractMethods(tokenId);
// [
//   { name: "decimals", inputs: [], outputs: ["U32"] },
//   { name: "balance", inputs: [{ name: "id", type: "Address" }], outputs: ["I128"] },
//   { name: "transfer", inputs: [...], outputs: [] },
// ]

// Read one of its read-only methods in a single line.
const { result: decimals, isReadCall } = await server.queryContract<number>(
  tokenId,
  "decimals",
);

const { result: balance } = await server.queryContract<bigint>(
  tokenId,
  "balance",
  {
    id: keypair.publicKey(), // named arguments, keyed by the method's parameter names
  },
);
// #endregion query

for (const name of ["decimals", "balance", "transfer"]) {
  if (!methods.some((m) => m.name === name)) {
    throw new Error(`getContractMethods did not list ${name}`);
  }
}
if (decimals !== 7 || !isReadCall) {
  throw new Error(`decimals returned ${decimals}, isReadCall ${isReadCall}`);
}
if (typeof balance !== "bigint" || balance <= 0n) {
  throw new Error(`balance returned ${String(balance)}`);
}

// #region full
// Preview the call for free with simulation.
// #region preview
const tx = await client.increment();
// #endregion preview
console.log("preview:", tx.result);
// #endregion full
// #region preview
tx.result; // the value the call would return; nothing has been sent
// #endregion preview

if (tx.result !== 1 || tx.isReadCall) {
  throw new Error(`preview returned ${tx.result}, isReadCall ${tx.isReadCall}`);
}

// #region full
// Sign and send to apply it on-chain.
// #region send
const sent = await tx.signAndSend();
// #endregion send
console.log("applied:", sent.result);
// #endregion full
// #region send
sent.result; // the applied result; send again and the counter advances
// #endregion send

if (sent.result !== 1) {
  throw new Error(`increment applied ${sent.result}, expected 1`);
}
