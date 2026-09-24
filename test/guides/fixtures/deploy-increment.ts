import { readFileSync } from "node:fs";
import {
  BASE_FEE,
  contract,
  hash,
  Keypair,
  Networks,
  Operation,
  rpc,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

// The deploy-in-hidden-setup pattern for guide snippets: upload the checked-in wasm, deploy it, then invoke it. A snippet puts these lines outside every region.
const rpcUrl = "https://soroban-testnet.stellar.org";
const networkPassphrase = Networks.TESTNET;
const server = new rpc.Server(rpcUrl);

interface IncrementContract {
  increment: (
    options?: contract.MethodOptions,
  ) => Promise<contract.AssembledTransaction<number>>;
}

const keypair = Keypair.random();
await server.fundAddress(keypair.publicKey());
const { signTransaction } = contract.basicNodeSigner(
  keypair,
  networkPassphrase,
);

const wasm = readFileSync(
  new URL("../../../examples/guides/wasm/increment.wasm", import.meta.url),
);

// Client.deploy reads the wasm back from the network by its hash, so the upload must be confirmed first.
const upload = await server.prepareTransaction(
  new TransactionBuilder(await server.getAccount(keypair.publicKey()), {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(Operation.uploadContractWasm({ wasm }))
    .setTimeout(30)
    .build(),
);
upload.sign(keypair);
const sent = await server.sendTransaction(upload);
if (sent.status !== "PENDING") {
  throw new Error(
    `wasm upload was not accepted: ${sent.status} ${sent.errorResult?.result.type ?? ""}`,
  );
}
const uploaded = await server.pollTransaction(sent.hash);
if (uploaded.status === rpc.Api.GetTransactionStatus.FAILED) {
  throw new Error(`wasm upload failed: ${uploaded.resultXdr.result.type}`);
}
if (uploaded.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
  throw new Error(`wasm upload failed: ${uploaded.status}`);
}

const deployTx = await contract.Client.deploy<
  contract.Client & IncrementContract
>(null, {
  wasmHash: hash(wasm),
  rpcUrl,
  networkPassphrase,
  publicKey: keypair.publicKey(),
  signTransaction,
});
const { result: client } = await deployTx.signAndSend();

for (const expected of [1, 2]) {
  const { result } = await (await client.increment()).signAndSend();
  if (result !== expected) {
    throw new Error(`increment returned ${result}, expected ${expected}`);
  }
}
