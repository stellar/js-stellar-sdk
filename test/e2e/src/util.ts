import { spawnSync } from "node:child_process";
import path from "node:path";
import { contract, Keypair, rpc } from "../../../lib";

/*
 * Run a Bash command, returning stdout, stderr, and status code.
 */
const run = (command: string) => {
  const [cmd, ...args]: string[] = command.split(" ");
  const result = spawnSync(cmd as string, args, {
    shell: true,
    encoding: "utf8",
  });
  return {
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
    status: result.status,
  };
};

export const stellar = process.env.GITHUB_ACTIONS
  ? "stellar"
  : "./target/bin/stellar";

export { run };

const basePath = path.resolve(
  `${__dirname}/../test-contracts/target/wasm32v1-none/release`,
);

const contracts = {
  customTypes: {
    hash: run(`${stellar} contract upload --wasm ${basePath}/custom_types.wasm`)
      .stdout,
    path: `${basePath}/custom_types.wasm`,
  },
  increment: {
    hash: run(`${stellar} contract upload --wasm ${basePath}/increment.wasm`)
      .stdout,
    path: `${basePath}/increment.wasm`,
    constructorArgs: {
      counter: 0,
    },
  },
  swap: {
    hash: run(`${stellar} contract upload --wasm ${basePath}/atomic_swap.wasm`)
      .stdout,
    path: `${basePath}/atomic_swap.wasm`,
  },
  token: {
    hash: run(`${stellar} contract upload --wasm ${basePath}/token.wasm`)
      .stdout,
    path: `${basePath}/token.wasm`,
  },
  needsSignature: {
    hash: run(
      `${stellar} contract upload --wasm ${basePath}/needs_a_signature.wasm`,
    ).stdout,
    path: `${basePath}/needs_a_signature.wasm`,
  },
  doesSigning: {
    hash: run(
      `${stellar} contract upload --wasm ${basePath}/this_one_signs.wasm`,
    ).stdout,
    path: `${basePath}/this_one_signs.wasm`,
  },
};
export { contracts };

const rpcUrl =
  process.env.SOROBAN_RPC_URL ?? "http://localhost:8000/soroban/rpc";
export { rpcUrl };
const networkPassphrase =
  process.env.SOROBAN_NETWORK_PASSPHRASE ??
  "Standalone Network ; February 2017";

export const server = new rpc.Server(rpcUrl, {
  allowHttp: rpcUrl.startsWith("http://") ?? false,
});

export { networkPassphrase };

const generateFundedKeypair = async () => {
  const keypair = Keypair.random();
  await server.requestAirdrop(keypair.publicKey());
  return keypair;
};
export { generateFundedKeypair };

/**
 * Generates a Client for the contract with the given name.
 * Also generates a new account to use as as the keypair of this contract. This
 * account is funded by friendbot. You can pass in an account to re-use the
 * same account with multiple contract clients.
 *
 * By default, will re-deploy the contract every time. Pass in the same
 * `contractId` again if you want to re-use the a contract instance.
 */
const installContract = async (
  name: keyof typeof contracts,
  { keypair }: { keypair?: Keypair } = {},
) => {
  if (!contracts[name]) {
    throw new Error(
      `Contract ${name} not found. ` +
        `Pick one of: ${Object.keys(contracts).join(", ")}`,
    );
  }

  const internalKeypair = keypair ?? (await generateFundedKeypair());

  let wasmHash = contracts[name].hash;
  if (!wasmHash) {
    wasmHash = run(
      `${stellar} contract upload --wasm ${contracts[name].path}`,
    ).stdout;
  }
  return { keypair: internalKeypair, wasmHash };
};

const clientFor = async (
  name: keyof typeof contracts,
  { keypair, contractId }: { keypair?: Keypair; contractId?: string } = {},
) => {
  const internalKeypair = keypair ?? (await generateFundedKeypair());
  const signer = contract.basicNodeSigner(internalKeypair, networkPassphrase);

  if (contractId) {
    return {
      client: await contract.Client.from({
        contractId,
        networkPassphrase,
        rpcUrl,
        allowHttp: true,
        publicKey: internalKeypair.publicKey(),
        ...signer,
      }),
      contractId,
      keypair,
    };
  }

  const { wasmHash } = await installContract(name, {
    keypair: internalKeypair,
  });

  const deploy = await contract.Client.deploy(
    (contracts[name] as any).constructorArgs ?? null,
    {
      networkPassphrase,
      rpcUrl,
      allowHttp: true,
      wasmHash,
      publicKey: internalKeypair.publicKey(),
      ...signer,
    },
  );
  const { result: client } = await deploy.signAndSend();

  return {
    keypair: internalKeypair,
    client,
    contractId: client.options.contractId,
  };
};
export { clientFor };

export { installContract };
