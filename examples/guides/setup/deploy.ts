/**
 * Hidden-setup helpers for guide snippets that need a contract on the network. Snippets import them outside every region, so no guide renders this file. It sits below examples/guides/, so test/guides/snippets.test.ts does not run it as a snippet.
 */
import { readFileSync } from "node:fs";
import {
  BASE_FEE,
  contract,
  hash,
  Keypair,
  Operation,
  rpc,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";

export interface Deployer {
  rpcUrl: string;
  networkPassphrase: string;
  /** A funded account that pays for and signs every setup transaction. */
  keypair: Keypair;
}

/** Submits one operation from the deployer's account and waits until it applies. */
export async function submit(
  { rpcUrl, networkPassphrase, keypair }: Deployer,
  op: xdr.Operation,
): Promise<void> {
  const server = new rpc.Server(rpcUrl);
  const prepared = await server.prepareTransaction(
    new TransactionBuilder(await server.getAccount(keypair.publicKey()), {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(30)
      .build(),
  );
  prepared.sign(keypair);
  const sent = await server.sendTransaction(prepared);
  if (sent.status !== "PENDING") {
    throw new Error(
      `setup transaction was not accepted: ${sent.status} ${sent.errorResult?.result.type ?? ""}`,
    );
  }
  const applied = await server.pollTransaction(sent.hash);
  if (applied.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error(
      `setup transaction failed: ${applied.resultXdr.result.type}`,
    );
  }
  if (applied.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`setup transaction failed: ${applied.status}`);
  }
}

/** Uploads and deploys a wasm from examples/guides/wasm/ (a contract with no constructor), and returns its contract ID. */
export async function deployWasm(
  deployer: Deployer,
  file: string,
): Promise<string> {
  const wasm = readFileSync(new URL(`../wasm/${file}`, import.meta.url));
  // Client.deploy reads the wasm back from the network by its hash, so the upload must be confirmed first.
  await submit(deployer, Operation.uploadContractWasm({ wasm }));
  const { rpcUrl, networkPassphrase, keypair } = deployer;
  const { signTransaction } = contract.basicNodeSigner(
    keypair,
    networkPassphrase,
  );
  const deployTx = await contract.Client.deploy(null, {
    wasmHash: hash(wasm),
    rpcUrl,
    networkPassphrase,
    publicKey: keypair.publicKey(),
    signTransaction,
  });
  const { result: deployed } = await deployTx.signAndSend();
  return deployed.options.contractId;
}
