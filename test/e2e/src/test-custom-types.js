const test = require('ava')
const { Address } = require('../../..')
const { Ok, Err } = require('../../../lib/rust_types')
const { clientFor } = require('./util')

test.before(async t => {
  const { client, keypair } = await clientFor('customTypes')
  const publicKey = keypair.publicKey()
  const addr = Address.fromString(publicKey)
  t.context = { client, publicKey, addr } // eslint-disable-line no-param-reassign
});

test('hello', async t => {
  const { result } = await t.context.client.hello({ hello: 'tests' })
  t.is(result, 'tests')
})

test('woid', async t => {
  t.is((await t.context.client.woid()).result, null)
})

test('u32_fail_on_even', async t => {
  t.deepEqual(
    (await t.context.client.u32_fail_on_even({ u32_: 1 })).result,
    new Ok(1)
  )
  t.deepEqual(
    (await t.context.client.u32_fail_on_even({ u32_: 2 })).result,
    new Err({ message: "Please provide an odd number" })
  )
})

test('u32', async t => {
  t.is((await t.context.client.u32_({ u32_: 1 })).result, 1) // eslint-disable-line no-underscore-dangle
})

test('i32', async t => {
  t.is((await t.context.client.i32_({ i32_: 1 })).result, 1) // eslint-disable-line no-underscore-dangle
})

test('i64', async t => {
  t.is((await t.context.client.i64_({ i64_: 1n })).result, 1n) // eslint-disable-line no-underscore-dangle
})

test("strukt_hel", async (t) => {
  const strukt = { a: 0, b: true, c: "world" }
  t.deepEqual((await t.context.client.strukt_hel({ strukt })).result, ["Hello", "world"])
})

test("strukt", async (t) => {
  const strukt = { a: 0, b: true, c: "hello" }
  t.deepEqual((await t.context.client.strukt({ strukt })).result, strukt)
})

test('simple first', async t => {
  const simple = { tag: 'First', values: undefined }
  const ret = { tag: 'First' }
  t.deepEqual((await t.context.client.simple({ simple })).result, ret)
})

test('simple second', async t => {
  const simple = { tag: 'Second', values: undefined }
  const ret = { tag: 'Second' }
  t.deepEqual((await t.context.client.simple({ simple })).result, ret)
})

test('simple third', async t => {
  const simple = { tag: 'Third', values: undefined }
  const ret = { tag: 'Third' }
  t.deepEqual((await t.context.client.simple({ simple })).result, ret)
})

test('complex with struct', async t => {
  const arg = { tag: 'Struct', values: [{ a: 0, b: true, c: 'hello' }] }
  t.deepEqual((await t.context.client.complex({ complex: arg })).result, arg)
})

test('complex with tuple', async t => {
  const arg = { tag: 'Tuple', values: [[{ a: 0, b: true, c: 'hello' }, { tag: 'First', values: undefined }]] }
  const ret = { tag: 'Tuple', values: [[{ a: 0, b: true, c: 'hello' }, { tag: 'First' }]] }
  t.deepEqual((await t.context.client.complex({ complex: arg })).result, ret)
})

test('complex with enum', async t => {
  const arg = { tag: 'Enum', values: [{ tag: 'First', values: undefined }] }
  const ret = { tag: 'Enum', values: [{ tag: 'First' }] }
  t.deepEqual((await t.context.client.complex({ complex: arg })).result, ret)
})

test('complex with asset', async t => {
  const arg = { tag: 'Asset', values: [t.context.publicKey, 1n] }
  t.deepEqual((await t.context.client.complex({ complex: arg })).result, arg)
})

test('complex with void', async t => {
  const complex = { tag: 'Void', values: undefined }
  const ret = { tag: 'Void' }
  t.deepEqual((await t.context.client.complex({ complex })).result, ret)
})

test('addresse', async t => {
  t.deepEqual((await t.context.client.addresse({ addresse: t.context.publicKey })).result, t.context.addr.toString())
})

test('bytes', async t => {
  const bytes = Buffer.from('hello')
  t.deepEqual((await t.context.client.bytes({ bytes })).result, bytes)
})

test('bytesN', async t => {
  const bytesN = Buffer.from('123456789') // what's the correct way to construct bytesN?
  t.deepEqual(
    (await t.context.client.bytes_n({ bytes_n: bytesN })).result,
    bytesN
  )
})

test('card', async t => {
  const card = 11
  t.is((await t.context.client.card({ card })).result, card)
})

test('boolean', async t => {
  t.is((await t.context.client.boolean({ boolean: true })).result, true)
})

test('not', async t => {
  t.is((await t.context.client.not({ boolean: true })).result, false)
})

test('i128', async t => {
  t.is((await t.context.client.i128({ i128: -1n })).result, -1n)
})

test('u128', async t => {
  t.is((await t.context.client.u128({ u128: 1n })).result, 1n)
})

test('multi_args', async t => {
  t.is((await t.context.client.multi_args({ a: 1, b: true })).result, 1)
  t.is((await t.context.client.multi_args({ a: 1, b: false })).result, 0)
})

test('map', async t => {
  const map = new Map()
  map.set(1, true)
  map.set(2, false)
  // map.set(3, 'hahaha') // should throw an error
  t.deepEqual((await t.context.client.map({ map })).result, Array.from(map.entries()))
})

test('vec', async t => {
  const vec = [1, 2, 3]
  t.deepEqual((await t.context.client.vec({ vec })).result, vec)
})

test('tuple', async t => {
  const tuple = ['hello', 1]
  t.deepEqual((await t.context.client.tuple({ tuple })).result, tuple)
})

test('option', async t => {
  // this makes sense
  t.deepEqual((await t.context.client.option({ option: 1 })).result, 1)

  // this passes but shouldn't
  t.deepEqual((await t.context.client.option({ option: undefined })).result, undefined)

  // this is the behavior we probably want, but fails
  // t.deepEqual(await t.context.client.option(), undefined) // typing and implementation require the object
  // t.deepEqual((await t.context.client.option({})).result, undefined) // typing requires argument; implementation would be fine with this
  // t.deepEqual((await t.context.client.option({ option: undefined })).result, undefined)
})

test('u256', async t => {
  t.is((await t.context.client.u256({ u256: 1n })).result, 1n)
})

test('i256', async t => {
  t.is((await t.context.client.i256({ i256: -1n })).result, -1n)
})

test('string', async t => {
  t.is((await t.context.client.string({ string: 'hello' })).result, 'hello')
})

test('tuple_strukt', async t => {
  const arg = [{ a: 0, b: true, c: 'hello' }, { tag: 'First', values: undefined }]
  const res = [{ a: 0, b: true, c: 'hello' }, { tag: 'First' }]
  t.deepEqual((await t.context.client.tuple_strukt({ tuple_strukt: arg })).result, res)
})
