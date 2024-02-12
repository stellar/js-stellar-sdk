const { spawnSync } = require('node:child_process')
const { Address, Keypair, SorobanRpc } = require('../../..')

const rootKeypair = Keypair.fromSecret(spawnSync("./target/bin/soroban", ["keys", "show", "root"], { shell: true, encoding: "utf8" }).stdout.trim());
const aliceKeypair = Keypair.fromSecret(spawnSync("./target/bin/soroban", ["keys", "show", "alice"], { shell: true, encoding: "utf8" }).stdout.trim());
const bobKeypair = Keypair.fromSecret(spawnSync("./target/bin/soroban", ["keys", "show", "bob"], { shell: true, encoding: "utf8" }).stdout.trim());

const root = {
  keypair: rootKeypair,
  address: Address.fromString(rootKeypair.publicKey()),
}
module.exports.root = root

const alice = {
  keypair: aliceKeypair,
  address: Address.fromString(aliceKeypair.publicKey()),
}
module.exports.alice = alice

const bob = {
  keypair: bobKeypair,
  address: Address.fromString(bobKeypair.publicKey()),
}
module.exports.bob = bob

const rpcUrl = process.env.SOROBAN_RPC_URL ?? "http://localhost:8000/";
module.exports.rpcUrl = rpcUrl
const networkPassphrase = process.env.SOROBAN_NETWORK_PASSPHRASE ?? "Standalone Network ; February 2017";
module.exports.networkPassphrase = networkPassphrase

module.exports.wallet = new SorobanRpc.ExampleNodeWallet(root.keypair, networkPassphrase)
