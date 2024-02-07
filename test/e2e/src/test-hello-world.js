const test = require('ava')
const fs = require('node:fs')
const { ContractSpec, SorobanRpc } = require('../../..')
const { root, wallet, rpcUrl, networkPassphrase } = require('./util')
const xdr = require('../wasms/specs/test_hello_world.json')

const spec = new ContractSpec(xdr)
const contractId = fs.readFileSync(`${__dirname}/../contract-id-hello-world.txt`, "utf8").trim()
const contract = spec.generateContractClient({
  networkPassphrase,
  contractId,
  rpcUrl,
  wallet,
});

test("hello", async (t) => {
  t.deepEqual((await contract.hello({ world: "tests" })).result, ["Hello", "tests"]);
});

test("auth", async (t) => {
  t.deepEqual(
    (await contract.auth({
      addr: root.keypair.publicKey(),
      world: 'lol'
    })).result,
    root.address.toString()
  )
});

test("inc", async (t) => {
  const { result: startingBalance } = await contract.getCount()
  const inc = await contract.inc()
  t.is((await inc.signAndSend()).result, startingBalance + 1)
  t.is((await contract.getCount()).result, startingBalance + 1)
});
