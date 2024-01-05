const test = require('ava')
const fs = require('node:fs')
const { ContractSpec, SorobanRpc } = require('../../..')
const { root, wallet, rpcUrl, networkPassphrase } = require('./util')
const xdr = require('../wasms/specs/test_custom_types.json')

const spec = new ContractSpec(xdr)
const contractId = fs.readFileSync(`${__dirname}/../contract-id-custom-types.txt`, "utf8").trim()
const contract = spec.generateContractClient({
  networkPassphrase,
  contractId,
  rpcUrl,
  wallet,
});

const addr = root.address;
const publicKey = root.keypair.publicKey();

test('hello', async t => {
  const { result } = await contract.hello({ hello: 'tests' })
  t.is(result, 'tests')
})

test('woid', async t => {
  t.is((await contract.woid()).result, null)
})

test('u32_fail_on_even', async t => {
  t.deepEqual(
    (await contract.u32FailOnEven({ u32_: 1 })).result,
    new SorobanRpc.AssembledTransaction.Result.Ok(1)
  )
  t.deepEqual(
    (await contract.u32FailOnEven({ u32_: 2 })).result,
    new SorobanRpc.AssembledTransaction.Result.Err({ message: "Please provide an odd number" })
  )
})

test('u32', async t => {
  t.is((await contract.u32_({ u32_: 1 })).result, 1) // eslint-disable-line no-underscore-dangle
})

test('i32', async t => {
  t.is((await contract.i32_({ i32_: 1 })).result, 1) // eslint-disable-line no-underscore-dangle
})

test('i64', async t => {
  t.is((await contract.i64_({ i64_: 1n })).result, 1n) // eslint-disable-line no-underscore-dangle
})

test("strukt_hel", async (t) => {
  const strukt = { a: 0, b: true, c: "world" }
  t.deepEqual((await contract.struktHel({ strukt })).result, ["Hello", "world"])
})

test("strukt", async (t) => {
  const strukt = { a: 0, b: true, c: "hello" }
  t.deepEqual((await contract.strukt({ strukt })).result, strukt)
})

test('simple first', async t => {
  const simple = { tag: 'First', values: undefined }
  const ret = { tag: 'First' }
  t.deepEqual((await contract.simple({ simple })).result, ret)
})

test('simple second', async t => {
  const simple = { tag: 'Second', values: undefined }
  const ret = { tag: 'Second' }
  t.deepEqual((await contract.simple({ simple })).result, ret)
})

test('simple third', async t => {
  const simple = { tag: 'Third', values: undefined }
  const ret = { tag: 'Third' }
  t.deepEqual((await contract.simple({ simple })).result, ret)
})

test('complex with struct', async t => {
  const arg = { tag: 'Struct', values: [{ a: 0, b: true, c: 'hello' }] }
  t.deepEqual((await contract.complex({ complex: arg })).result, arg)
})

test('complex with tuple', async t => {
  const arg = { tag: 'Tuple', values: [[{ a: 0, b: true, c: 'hello' }, { tag: 'First', values: undefined }]] }
  const ret = { tag: 'Tuple', values: [[{ a: 0, b: true, c: 'hello' }, { tag: 'First' }]] }
  t.deepEqual((await contract.complex({ complex: arg })).result, ret)
})

test('complex with enum', async t => {
  const arg = { tag: 'Enum', values: [{ tag: 'First', values: undefined }] }
  const ret = { tag: 'Enum', values: [{ tag: 'First' }] }
  t.deepEqual((await contract.complex({ complex: arg })).result, ret)
})

test('complex with asset', async t => {
  const arg = { tag: 'Asset', values: [publicKey, 1n] }
  t.deepEqual((await contract.complex({ complex: arg })).result, arg)
})

test('complex with void', async t => {
  const complex = { tag: 'Void', values: undefined }
  const ret = { tag: 'Void' }
  t.deepEqual((await contract.complex({ complex })).result, ret)
})

test('addresse', async t => {
  t.deepEqual((await contract.addresse({ addresse: publicKey })).result, addr.toString())
})

test('bytes', async t => {
  const bytes = Buffer.from('hello')
  t.deepEqual((await contract.bytes({ bytes })).result, bytes)
})

test('bytesN', async t => {
  const bytesN = Buffer.from('123456789') // what's the correct way to construct bytesN?
  t.deepEqual((await contract.bytesN({ bytes_n: bytesN })).result, bytesN)
})

test('card', async t => {
  const card = 11
  t.is((await contract.card({ card })).result, card)
})

test('boolean', async t => {
  t.is((await contract.boolean({ boolean: true })).result, true)
})

test('not', async t => {
  t.is((await contract.not({ boolean: true })).result, false)
})

test('i128', async t => {
  t.is((await contract.i128({ i128: -1n })).result, -1n)
})

test('u128', async t => {
  t.is((await contract.u128({ u128: 1n })).result, 1n)
})

test('multi_args', async t => {
  t.is((await contract.multiArgs({ a: 1, b: true })).result, 1)
  t.is((await contract.multiArgs({ a: 1, b: false })).result, 0)
})

test('map', async t => {
  const map = new Map()
  map.set(1, true)
  map.set(2, false)
  // map.set(3, 'hahaha') // should throw an error
  t.deepEqual((await contract.map({ map })).result, Array.from(map.entries()))
})

test('vec', async t => {
  const vec = [1, 2, 3]
  t.deepEqual((await contract.vec({ vec })).result, vec)
})

test('tuple', async t => {
  const tuple = ['hello', 1]
  t.deepEqual((await contract.tuple({ tuple })).result, tuple)
})

test('option', async t => {
  // this makes sense
  t.deepEqual((await contract.option({ option: 1 })).result, 1)

  // this passes but shouldn't
  t.deepEqual((await contract.option({ option: undefined })).result, undefined)

  // this is the behavior we probably want, but fails
  // t.deepEqual(await contract.option(), undefined) // typing and implementation require the object
  // t.deepEqual((await contract.option({})).result, undefined) // typing requires argument; implementation would be fine with this
  // t.deepEqual((await contract.option({ option: undefined })).result, undefined)
})

test('u256', async t => {
  t.is((await contract.u256({ u256: 1n })).result, 1n)
})

test('i256', async t => {
  t.is((await contract.i256({ i256: -1n })).result, -1n)
})

test('string', async t => {
  t.is((await contract.string({ string: 'hello' })).result, 'hello')
})

test('tuple_strukt', async t => {
  const arg = [{ a: 0, b: true, c: 'hello' }, { tag: 'First', values: undefined }]
  const res = [{ a: 0, b: true, c: 'hello' }, { tag: 'First' }]
  t.deepEqual((await contract.tupleStrukt({ tuple_strukt: arg })).result, res)
})
