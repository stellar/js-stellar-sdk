---
title: Examples
---

- [Creating a payment Transaction](#creating-a-payment-transaction)
- [Loading an account's transaction history](#loading-an-accounts-transaction-history)
- [Streaming payment events](#streaming-payment-events)



## Creating a payment transaction

js-stellar-sdk exposes the [`TransactionBuilder`](https://github.com/stellar/js-stellar-base/blob/master/src/transaction_builder.js) class from js-stellar-base.  There are more examples of [building transactions here](https://www.stellar.org/developers/js-stellar-base/learn/base-examples.html). All those examples can be signed and submitted to Stellar in a similar manner as is done below.

In this example you must ensure that the destination account exists

```javascript
// Create, sign, and submit a transaction using JS Stellar SDK.

// Assumes that you have:
// 1. Secret key of a funded account to be the source account
// 2. Public key of an existing account as a recipient
// 3. Access to JS Stellar SDK (https://github.com/stellar/js-stellar-sdk)

// This code can be run in the browser at https://www.stellar.org/developers/
// That site exposes a global StellarSdk object you can use.
// To run this code in the Chrome, open the console tab in the DevTools.
// The hotkey to open the DevTools console is Ctrl+Shift+J or (Cmd+Opt+J on Mac).
// Note: run this in incognito mode so the input history is not saved

// To use in node, do `npm install stellar-sdk` and uncomment the following line.
// var StellarSdk = require('stellar-sdk')

// The source account is the account we will be sending from.
var sourceSecretKey = 'SCC2GLOCQLDIJPTQB6O2K2GVUXW52IWLSCKE76EMU5ILMED3CYQFHUFC';
var receiverPublicKey = 'GAIRISXKPLOWZBMFRPU5XRGUUX3VMA3ZEWKBM5MSNRU3CHV6P4PYZ74D';

// This is where the fun begins.

// Calculate the source account's public key
var sourceKeypair = StellarSdk.Keypair.fromSeed(sourceSecretKey);
var sourcePublicKey = sourceKeypair.accountId()

// Configure StellarSdk to talk to the horizon instance hosted by Stellar.org
// To use the live network, set the hostname to 'horizon.stellar.org'
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// Uncomment the following line to build transactions for the live network. Be
// sure to also change the horizon hostname.
// StellarSdk.Network.usePublicNetwork();

// Transactions need a valid sequence number inside the transaction to prevent
// the transaction from being included in the ledger twice.
// We can fetch the current sequence number for the source account from Horizon.
server.loadAccount(sourcePublicKey)
  .then(function(account) {
    var transaction = new StellarSdk.TransactionBuilder(account)
      // Add a payment operation to the transaction
      .addOperation(StellarSdk.Operation.payment({
        destination: receiverPublicKey,
        // The term native asset refers to lumens
        asset: StellarSdk.Asset.native(),
        // Specify 350.1234567 lumens. Lumens are divisible to seven digits past
        // the decimal. They are represented in JS Stellar SDK in string format
        // to avoid errors from the use of the JavaScript Number data structure.
        amount: '350.1234567',
      }))
      // Uncomment to add a memo (https://www.stellar.org/developers/learn/concepts/transactions.html)
      // .addMemo(StellarSdk.Memo.text('Hello world!'))
      .build()

    // Sign this transaction with the secret key
    transaction.sign(sourceKeypair)

    // Let's see the XDR (encoded in base64) of the transaction we just built
    console.log(transaction.toEnvelope().toXDR('base64'))

    // Submit the transaction to the Horizon server. The Horizon server will then
    // submit the transaction into the network for us.
    server.submitTransaction(transaction)
      .then(function(transactionResult) {
        console.log('Success!')
        console.log(transactionResult);
      })
      .catch(function (err){
        console.log('error')
        console.log(err);
      });
  })
```

## Loading an account's transaction history

Let's say you want to look at an account's transaction history.  You can use the `transactions()` command and pass in the account address to `forAccount` as the resource you're interested in.

```javascript
var StellarSdk = require('stellar-sdk')
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org);

server.transactions()
    .forAccount(accountAddress)
    .call()
    .then(function (page) {
        // page 1
        console.log(page.records);
        return page.next();
    })
    .then(function (page) {
        // page 2
        console.log(page.records);
    })
    .catch(function (err) {
        console.log(err);
    });
```

## Streaming payment events

js-stellar-sdk provides streaming support for Horizon endpoints using `EventSource`.  You can pass a function to handle any events that occur on the stream.

```javascript
var StellarSdk = require('stellar-sdk')
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

var streamingMessageHandler = function (message) {
    console.log(message);
};

// Get a message anytime one account sends to another
// cursor is set to "now" to get notified of new payments than from the beginning of time
var es = server.payments()
    .cursor('now')  
    .stream({
        onmessage: streamingMessageHandler
    })
```

For more on streaming events, please check out [the Horizon responses documentation](https://www.stellar.org/developers/horizon/learn/responses.html#streaming) and this [guide to server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events).

