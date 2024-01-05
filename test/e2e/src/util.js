const { spawnSync } = require('node:child_process')
const { Address, Keypair, TransactionBuilder, hash } = require('../../..')

const rootKeypair = Keypair.fromSecret(spawnSync("./target/bin/soroban", ["config", "identity", "show"], { shell: true, encoding: "utf8" }).stdout.trim());
const aliceKeypair = Keypair.fromSecret(spawnSync("./target/bin/soroban", ["config", "identity", "show", "alice"], { shell: true, encoding: "utf8" }).stdout.trim());
const bobKeypair = Keypair.fromSecret(spawnSync("./target/bin/soroban", ["config", "identity", "show", "bob"], { shell: true, encoding: "utf8" }).stdout.trim());

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

function getKeypair(pk) {
  return Keypair.fromSecret({
    [root.keypair.publicKey()]: root.keypair.secret(),
    [alice.keypair.publicKey()]: alice.keypair.secret(),
    [bob.keypair.publicKey()]: bob.keypair.secret(),
  }[pk])
}

const rpcUrl = process.env.SOROBAN_RPC_URL ?? "http://localhost:8000/";
module.exports.rpcUrl = rpcUrl
const networkPassphrase = process.env.SOROBAN_NETWORK_PASSPHRASE ?? "Standalone Network ; February 2017";
module.exports.networkPassphrase = networkPassphrase

class Wallet {
  constructor(publicKey) {
    this.publicKey = publicKey
  }

  isConnected = () => Promise.resolve(true) // eslint-disable-line class-methods-use-this

  isAllowed = () => Promise.resolve(true) // eslint-disable-line class-methods-use-this

  getUserInfo = () => Promise.resolve({ publicKey: this.publicKey })

  signTransaction = async (tx) => {
    const t = TransactionBuilder.fromXDR(tx, networkPassphrase);
    t.sign(getKeypair(this.publicKey));
    return t.toXDR();
  }

  signAuthEntry = async (entryXdr, opts) => (
    getKeypair(opts?.accountToSign ?? this.publicKey)
      .sign(hash(Buffer.from(entryXdr, "base64")))
      .toString('base64')
  )
}
module.exports.Wallet = Wallet

module.exports.wallet = new Wallet(root.keypair.publicKey())
