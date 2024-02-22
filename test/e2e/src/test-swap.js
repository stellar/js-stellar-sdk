const test = require('ava')
const { SorobanRpc } = require('../../..')
const { clientFor, generateFundedKeypair } = require('./util')

const amountAToSwap = 2n
const amountBToSwap = 1n

test.before(async t => {
  const alice = await generateFundedKeypair()
  const bob = await generateFundedKeypair()

  const { client: tokenA, contractId: tokenAId, keypair: root } = await clientFor('token')
  const { client: tokenB, contractId: tokenBId } = await clientFor('token', { keypair: root })
  const { client: swapContractAsRoot, contractId: swapId } = await clientFor('swap', { keypair: root })
  await (
    await tokenA.initialize({ admin: root.publicKey(), decimal: 0, name: 'Token A', symbol: 'A' })
  ).signAndSend()
  await (
    await tokenA.mint({ amount: amountAToSwap, to: alice.publicKey() })
  ).signAndSend()

  await (
    await tokenB.initialize({ admin: root.publicKey(), decimal: 0, name: 'Token B', symbol: 'B' })
  ).signAndSend()
  await (
    await tokenB.mint({ amount: amountBToSwap, to: bob.publicKey() })
  ).signAndSend()

  t.context = { // eslint-disable-line no-param-reassign
    root,
    alice,
    bob,
    swapContractAsRoot,
    swapId,
    tokenA,
    tokenAId,
    tokenB,
    tokenBId,
  }
})

test('calling `signAndSend()` too soon throws descriptive error', async t => {
  const tx = await t.context.swapContractAsRoot.swap({
    a: t.context.alice.publicKey(),
    b: t.context.bob.publicKey(),
    token_a: t.context.tokenAId,
    token_b: t.context.tokenBId,
    amount_a: amountAToSwap,
    min_a_for_b: amountAToSwap,
    amount_b: amountBToSwap,
    min_b_for_a: amountBToSwap,
  })
  const error = await t.throwsAsync(tx.signAndSend())
  t.true(error instanceof SorobanRpc.AssembledTransaction.Errors.NeedsMoreSignatures, `error is not of type 'NeedsMoreSignaturesError'; instead it is of type '${error?.constructor.name}'`)
  if (error) t.regex(error.message, /needsNonInvokerSigningBy/)
})

test('alice swaps bob 10 A for 1 B', async t => {
  const tx = await t.context.swapContractAsRoot.swap({
    a: t.context.alice.publicKey(),
    b: t.context.bob.publicKey(),
    token_a: t.context.tokenAId,
    token_b: t.context.tokenBId,
    amount_a: amountAToSwap,
    min_a_for_b: amountAToSwap,
    amount_b: amountBToSwap,
    min_b_for_a: amountBToSwap,
  })

  const needsNonInvokerSigningBy = await tx.needsNonInvokerSigningBy()
  t.is(needsNonInvokerSigningBy.length, 2)
  t.is(needsNonInvokerSigningBy.indexOf(t.context.alice.publicKey()), 0, 'needsNonInvokerSigningBy does not have alice\'s public key!')
  t.is(needsNonInvokerSigningBy.indexOf(t.context.bob.publicKey()), 1, 'needsNonInvokerSigningBy does not have bob\'s public key!')

  // root serializes & sends to alice
  const jsonFromRoot = tx.toJSON()
  const { client: clientAlice } = await clientFor('swap', {
    keypair: t.context.alice,
    contractId: t.context.swapId,
  })
  const txAlice = clientAlice.txFromJSON(jsonFromRoot)
  await txAlice.signAuthEntries()

  // alice serializes & sends to bob
  const jsonFromAlice = txAlice.toJSON()
  const { client: clientBob } = await clientFor('swap', {
    keypair: t.context.bob,
    contractId: t.context.swapId,
  })
  const txBob = clientBob.txFromJSON(jsonFromAlice)
  await txBob.signAuthEntries()

  // bob serializes & sends back to root
  const jsonFromBob = txBob.toJSON()
  const { client: clientRoot } = await clientFor('swap', {
    keypair: t.context.root,
    contractId: t.context.swapId,
  })
  const txRoot = clientRoot.txFromJSON(jsonFromBob)

  const result = await txRoot.signAndSend()

  t.truthy(result.sendTransactionResponse, `tx failed: ${JSON.stringify(result, null, 2)}`)
  t.is(result.sendTransactionResponse.status, 'PENDING', `tx failed: ${JSON.stringify(result, null, 2)}`)
  t.truthy(result.getTransactionResponseAll?.length, `tx failed: ${JSON.stringify(result.getTransactionResponseAll, null, 2)}`)
  t.not(result.getTransactionResponse.status, 'FAILED', `tx failed: ${JSON.stringify(
    result.getTransactionResponse.resultXdr.result().value().map(op =>
      op.value()?.value().switch()
    ), null, 2)}`
  )
  t.is(
    result.getTransactionResponse.status,
    SorobanRpc.Api.GetTransactionStatus.SUCCESS,
    `tx failed: ${JSON.stringify(result.getTransactionResponse, null, 2)}`
  )

  t.is(
    (await t.context.tokenA.balance({ id: t.context.alice.publicKey() })).result,
    0n
  )
  t.is(
    (await t.context.tokenB.balance({ id: t.context.alice.publicKey() })).result,
    amountBToSwap
  )
  t.is(
    (await t.context.tokenA.balance({ id: t.context.bob.publicKey() })).result,
    amountAToSwap
  )
  t.is(
    (await t.context.tokenB.balance({ id: t.context.bob.publicKey() })).result,
    0n
  )
})
