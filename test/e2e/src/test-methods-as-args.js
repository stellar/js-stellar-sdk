const test = require('ava')
const fs = require('node:fs')
const { ContractSpec } = require('../../..')
const { wallet, rpcUrl, networkPassphrase } = require('./util')
const xdr = require('../wasms/specs/test_hello_world.json')

const spec = new ContractSpec(xdr)
const contractId = fs.readFileSync(`${__dirname}/../contract-id-hello-world.txt`, "utf8").trim()
const contract = spec.generateContractClient({
  networkPassphrase,
  contractId,
  rpcUrl,
  wallet,
});

// this test checks that apps can pass methods as arguments to other methods and have them still work
const { hello } = contract

test("hello", async (t) => {
  t.deepEqual((await hello({ world: "tests" })).result, ["Hello", "tests"]);
});
