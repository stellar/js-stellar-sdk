const test = require('ava')
const { clientFor } = require('./util')
const { Keypair } = require('../../..')

test("hello", async (t) => {
  const { client } = await clientFor('helloWorld')
  t.deepEqual((await client.hello({ world: "tests" })).result, ["Hello", "tests"]);
});

test("auth", async (t) => {
  const { client, keypair } = await clientFor('helloWorld')
  const publicKey = keypair.publicKey()
  const { result } = await client.auth({ addr: publicKey, world: 'lol' })
  t.deepEqual(result, publicKey)
});

test("inc", async (t) => {
  const { client } = await clientFor('helloWorld')
  const { result: startingBalance } = await client.get_count()
  const inc = await client.inc()
  t.is((await inc.signAndSend()).result, startingBalance + 1)
  t.is(startingBalance, 0)
  t.is((await client.get_count()).result, startingBalance + 1)
});

test("options for methods with no arguments", async (t) => {
  const { client } = await clientFor('helloWorld')
  // check that options object is FIRST, no need to pass `undefined` for the first argument
  const inc = await client.inc({ simulate: false })
  t.falsy(inc.simulation)
});
