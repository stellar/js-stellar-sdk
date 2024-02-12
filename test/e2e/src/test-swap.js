const test = require('ava')
const fs = require('node:fs')
const { SorobanRpc, ContractSpec } = require('../../..')
const { wallet, rpcUrl, alice, bob, networkPassphrase, root } = require('./util')
const swapXdr = require('../wasms/specs/test_swap.json')
const tokenXdr = require('../wasms/specs/test_token.json')

const swapSpec = new ContractSpec(swapXdr)
const tokenSpec = new ContractSpec(tokenXdr)

const swapId = fs.readFileSync(`${__dirname}/../contract-id-swap.txt`, "utf8").trim()
const tokenAId = fs.readFileSync(`${__dirname}/../contract-id-token-a.txt`, "utf8").trim()
const tokenBId = fs.readFileSync(`${__dirname}/../contract-id-token-b.txt`, "utf8").trim()

// `root` is the invoker of all contracts
const tokenA = tokenSpec.generateContractClient({
  contractId: tokenAId,
  networkPassphrase,
  rpcUrl,
  wallet,
})
const tokenB = tokenSpec.generateContractClient({
  contractId: tokenBId,
  networkPassphrase,
  rpcUrl,
  wallet,
})
function swapContractAs(invoker) {
  return swapSpec.generateContractClient({
    contractId: swapId,
    networkPassphrase,
    rpcUrl,
    wallet: new SorobanRpc.ExampleNodeWallet(invoker.keypair, networkPassphrase),
  })
}

const amountAToSwap = 2n
const amountBToSwap = 1n
const alicePk = alice.keypair.publicKey()
const bobPk = bob.keypair.publicKey()

test('calling `signAndSend()` too soon throws descriptive error', async t => {
  const swapContract = swapContractAs(root)
  const tx = await swapContract.swap({
    a: alicePk,
    b: bobPk,
    token_a: tokenAId,
    token_b: tokenBId,
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
  const swapContractAsRoot = swapContractAs(root)
  const [
    { result: aliceStartingABalance },
    { result: aliceStartingBBalance },
    { result: bobStartingABalance },
    { result: bobStartingBBalance },
  ] = await Promise.all([
    tokenA.balance({ id: alicePk }),
    tokenB.balance({ id: alicePk }),
    tokenA.balance({ id: bobPk }),
    tokenB.balance({ id: bobPk }),
  ])
  t.true(aliceStartingABalance >= amountAToSwap, `alice does not have enough Token A! aliceStartingABalance: ${aliceStartingABalance}`)
  t.true(bobStartingBBalance >= amountBToSwap, `bob does not have enough Token B! bobStartingBBalance: ${bobStartingBBalance}`)

  const tx = await swapContractAsRoot.swap({
    a: alicePk,
    b: bobPk,
    token_a: tokenAId,
    token_b: tokenBId,
    amount_a: amountAToSwap,
    min_a_for_b: amountAToSwap,
    amount_b: amountBToSwap,
    min_b_for_a: amountBToSwap,
  })

  const needsNonInvokerSigningBy = await tx.needsNonInvokerSigningBy()
  t.is(needsNonInvokerSigningBy.length, 2)
  t.is(needsNonInvokerSigningBy.indexOf(alicePk), 0, 'needsNonInvokerSigningBy does not have alice\'s public key!')
  t.is(needsNonInvokerSigningBy.indexOf(bobPk), 1, 'needsNonInvokerSigningBy does not have bob\'s public key!')


  // root serializes & sends to alice
  const jsonFromRoot = tx.toJSON()
  const txAlice = swapContractAs(alice).txFromJSON(jsonFromRoot)
  await txAlice.signAuthEntries()

  // alice serializes & sends to bob
  const jsonFromAlice = txAlice.toJSON()
  const txBob = swapContractAs(bob).txFromJSON(jsonFromAlice)
  await txBob.signAuthEntries()

  // bob serializes & sends back to root
  const jsonFromBob = txBob.toJSON()
  const txRoot = swapContractAsRoot.txFromJSON(jsonFromBob)
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
    (await tokenA.balance({ id: alicePk })).result,
    aliceStartingABalance - amountAToSwap
  )
  t.is(
    (await tokenB.balance({ id: alicePk })).result,
    aliceStartingBBalance + amountBToSwap
  )
  t.is(
    (await tokenA.balance({ id: bobPk })).result,
    bobStartingABalance + amountAToSwap
  )
  t.is(
    (await tokenB.balance({ id: bobPk })).result,
    bobStartingBBalance - amountBToSwap
  )
})
