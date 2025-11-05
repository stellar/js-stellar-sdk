# Soroban RPC Server Examples

Comprehensive examples for all methods in the `Server` class (also known as `RpcServer`).

## Table of Contents

- [Server Initialization](#server-initialization)
- [Account Methods](#account-methods)
- [Ledger Entry Methods](#ledger-entry-methods)
- [Contract Methods](#contract-methods)
- [Transaction Methods](#transaction-methods)
- [Network Methods](#network-methods)
- [Event Methods](#event-methods)
- [Utility Methods](#utility-methods)

---

## Server Initialization

### Basic Setup

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';

// Testnet
const server = new Server('https://soroban-testnet.stellar.org');

// Mainnet (Production)
const server = new Server('https://soroban.stellar.org', {
  allowHttp: false // Always false in production!
});

// Local development
const server = new Server('http://localhost:8000/soroban/rpc', {
  allowHttp: true // Only for local development
});
```

### With Custom Headers

```typescript
const server = new Server('https://soroban-testnet.stellar.org', {
  headers: {
    'Authorization': 'Bearer your-token',
    'X-Custom-Header': 'value'
  }
});
```

### Using HTTP Client Interceptors

```typescript
const server = new Server('https://soroban-testnet.stellar.org');

// Add request logging
server.httpClient.interceptors.request.use((config) => {
  console.log('Request:', config.url);
  return config;
});

// Add response logging
server.httpClient.interceptors.response.use((response) => {
  console.log('Response:', response.status);
  return response;
});
```

---

## Account Methods

### `getAccount()`

Fetch account details needed for building transactions.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';
import { TransactionBuilder, Networks } from '@stellar/stellar-sdk';

const server = new Server('https://soroban-testnet.stellar.org');
const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";

const account = await server.getAccount(accountId);
console.log("Sequence number:", account.sequenceNumber());
console.log("Account ID:", account.accountId());

// Use with TransactionBuilder
const transaction = new TransactionBuilder(account, {
  fee: '100',
  networkPassphrase: Networks.TESTNET
})
  .setTimeout(30)
  .build();
```

### `getAccountEntry()`

Fetch the full on-chain account entry.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';

const server = new Server('https://soroban-testnet.stellar.org');
const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";

const entry = await server.getAccountEntry(accountId);
console.log("Balance:", entry.balance().toString());
console.log("Sequence:", entry.seqNum().toString());
console.log("Number of subentries:", entry.numSubEntries());
console.log("Flags:", entry.flags());
```

### `getTrustline()`

Fetch a specific trustline for an account.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';
import { Asset } from '@stellar/stellar-sdk';

const server = new Server('https://soroban-testnet.stellar.org');
const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
const asset = new Asset(
  "TEST",
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
);

const trustline = await server.getTrustline(accountId, asset);
console.log("Balance:", trustline.balance().toString());
console.log("Limit:", trustline.limit().toString());
console.log("Flags:", trustline.flags());
```

---

## Ledger Entry Methods

### `getLedgerEntries()`

Fetch arbitrary ledger entries directly.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';
import { xdr, Address, nativeToScVal, scValToNative } from '@stellar/stellar-sdk';

const server = new Server('https://soroban-testnet.stellar.org');

// Contract data key
const contractId = 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM';
const key = xdr.LedgerKey.contractData(
  new xdr.LedgerKeyContractData({
    contract: new Address(contractId).toScAddress(),
    key: nativeToScVal('counter', { type: 'symbol' }),
    durability: xdr.ContractDataDurability.persistent(),
  })
);

const response = await server.getLedgerEntries(key, key);
const entry = response.entries[0];
console.log('Latest ledger:', response.latestLedger);
if (entry) {
  const entryValue = entry.val;
  const contractData = entryValue.contractData();

  const key = contractData.key();
  const val = contractData.val();
  console.log('Key:', scValToNative(key));
  console.log('Val:', scValToNative(val));
  console.log('Last modified:', entry.lastModifiedLedgerSeq);
  console.log('Live until:', entry.liveUntilLedgerSeq);
}
```

### `getLedgerEntry()`

Fetch a single ledger entry.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';
import { xdr, scValToNative } from '@stellar/stellar-sdk';

const server = new Server('https://soroban-testnet.stellar.org');
const key = xdr.LedgerKey.contractData(/* ... */);
const entry = await server.getLedgerEntry(key);

if (entry) {
  const entryValue = entry.val;
  const contractData = entryValue.contractData();

  const key = contractData.key();
  const val = contractData.val();
  console.log('Key:', scValToNative(key));
  console.log('Val:', scValToNative(val));
  console.log('Last modified:', entry.lastModifiedLedgerSeq);
  console.log('Live until:', entry.liveUntilLedgerSeq);
} else {
  console.log("Entry not found");
}
```

### `getClaimableBalance()`

Fetch a claimable balance entry.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';

const server = new Server('https://soroban-testnet.stellar.org');

// Using hex ID
const hexId = "00000000178826fbfe339e1f5c53417c6fedfe2c05e8bec14303143ec46b38981b09c3f9";
const entry = await server.getClaimableBalance(hexId);

console.log("Asset:", entry.asset());
console.log("Amount:", entry.amount().toString());
console.log("Claimants:", entry.claimants());

// Using strkey ID (B...)
const strkeyId = "BAAAAAAA...";
const entry2 = await server.getClaimableBalance(strkeyId);
```

---

## Contract Methods

### `getContractData()`

Read contract storage data directly.

```typescript
import { Server, Durability } from '@stellar/stellar-sdk/rpc';
import { nativeToScVal, scValToNative } from '@stellar/stellar-sdk';

const server = new Server('https://soroban-testnet.stellar.org');
const contractId = 'CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5';
const key = nativeToScVal('example-key', { type: 'symbol' });

// Persistent storage (default)
const data = await server.getContractData(contractId, key);
console.log('Value:', scValToNative(data.val.contractData().val()));
console.log('Live until ledger:', data.liveUntilLedgerSeq);

// Temporary storage
const tempData = await server.getContractData(contractId, key, Durability.Temporary);
console.log('Temp value:', scValToNative(tempData.val.contractData().val()));

```

### `getContractWasmByContractId()`

Fetch WASM bytecode by contract ID.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';
import fs from 'fs';

const server = new Server('https://soroban-testnet.stellar.org');
const contractId = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";

const wasmBuffer = await server.getContractWasmByContractId(contractId);
console.log("WASM size:", wasmBuffer.length, "bytes");

```

### `getContractWasmByHash()`

Fetch WASM bytecode by hash.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';

const server = new Server('https://soroban-testnet.stellar.org');

// Using Buffer
const wasmHash = Buffer.from("abc123...", 'hex');
const wasmBuffer = await server.getContractWasmByHash(wasmHash);

// Using hex string
const wasmBuffer2 = await server.getContractWasmByHash(
  "abc123...",
  "hex"
);

// Using base64 string
const wasmBuffer3 = await server.getContractWasmByHash(
  "YWJjMTIz...",
  "base64"
);

console.log("WASM bytecode:", wasmBuffer);
```

---

## Transaction Methods

### `sendTransaction()`

Submit a transaction to the network.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';
import { Keypair, TransactionBuilder, Networks } from '@stellar/stellar-sdk';

const server = new Server('https://soroban-testnet.stellar.org');
const keypair = Keypair.random();
const account = await server.getAccount(keypair.publicKey());

const transaction = new TransactionBuilder(account, {
  fee: '100',
  networkPassphrase: Networks.TESTNET
})
  .addOperation(/* ... */)
  .setTimeout(30)
  .build();

transaction.sign(keypair);

const response = await server.sendTransaction(transaction);
console.log("Status:", response.status);
console.log("Hash:", response.hash);
console.log("Latest ledger:", response.latestLedger);
console.log("Latest ledger close time:", response.latestLedgerCloseTime);

if (response.status === "ERROR") {
  console.error("Error:", response.errorResult);
}
```

### `getTransaction()`

Fetch transaction status and details.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';

const server = new Server('https://soroban-testnet.stellar.org');
const txHash = "c4515e3bdc0897f21cc5dbec8c82cf0a936d4741cb74a8e158eb51b9fb00411a";

const tx = await server.getTransaction(txHash);
console.log("Status:", tx.status);
console.log("Application order:", tx.applicationOrder);
console.log("Fee charged:", tx.feeBump);
console.log("Envelope XDR:", tx.envelopeXdr);
console.log("Result XDR:", tx.resultXdr);
console.log("Result meta XDR:", tx.resultMetaXdr);

if (tx.status === "SUCCESS") {
  console.log("Ledger:", tx.ledger);
  console.log("Created at:", tx.createdAt);
}
```

### `pollTransaction()`

Poll for transaction completion.

```typescript
import { Server, BasicSleepStrategy, LinearSleepStrategy } from '@stellar/stellar-sdk/rpc';

const server = new Server('https://soroban-testnet.stellar.org');
const txHash = "c4515e3bdc0897f21cc5dbec8c82cf0a936d4741cb74a8e158eb51b9fb00411a";

// Basic polling (1 second between attempts)
const result = await server.pollTransaction(txHash, {
  attempts: 10,
  sleepStrategy: BasicSleepStrategy
});

console.log("Final status:", result.status);

// Linear backoff (1s, 2s, 3s, etc.)
const result2 = await server.pollTransaction(txHash, {
  attempts: 5,
  sleepStrategy: LinearSleepStrategy
});

// Custom sleep strategy
const customStrategy = (iter: number) => 500 * iter; // 500ms, 1s, 1.5s, etc.
const result3 = await server.pollTransaction(txHash, {
  attempts: 10,
  sleepStrategy: customStrategy
});
```

### `simulateTransaction()`

Simulate a transaction before sending.

```typescript
import { Api, Server } from '@stellar/stellar-sdk/rpc';
import { TransactionBuilder, Networks, Contract, Keypair } from '@stellar/stellar-sdk';

const server = new Server('https://soroban-testnet.stellar.org');
const sourceKeypair = Keypair.random();
const contractId = 'CCONT...';

const account = await server.getAccount(sourceKeypair.publicKey());
const contract = new Contract(contractId);

const transaction = new TransactionBuilder(account, {
  fee: '100',
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(contract.call('increment'))
  .setTimeout(30)
  .build();

const simulation = await server.simulateTransaction(transaction);

if (Api.isSimulationSuccess(simulation) && simulation.result) {
  console.log('Return value:', simulation.result.retval);
  console.log('Events:', simulation.events);
  console.log('Minimum resource fee:', simulation.minResourceFee);
}

if (Api.isSimulationError(simulation)) {
  console.error('Simulation error:', simulation.error);
}
```

### `prepareTransaction()`

Prepare a transaction for submission (simulate + assemble).

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';
import { TransactionBuilder, Networks, Contract, Keypair } from '@stellar/stellar-sdk';

const server = new Server('https://soroban-testnet.stellar.org');
const sourceKeypair = Keypair.random();
const contractId = "CCONT...";
const account = await server.getAccount(sourceKeypair.publicKey());
const contract = new Contract(contractId);

const transaction = new TransactionBuilder(account, {
  fee: '100',
  networkPassphrase: Networks.TESTNET
})
  .addOperation(contract.call('transfer', ...[]))
  .setTimeout(30)
  .build();

const prepared = await server.prepareTransaction(transaction);

prepared.sign(sourceKeypair);
const response = await server.sendTransaction(prepared);
console.log("Transaction sent:", response.hash);
```

### `getTransactions()`

Fetch transactions in a ledger range.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';

const server = new Server('https://soroban-testnet.stellar.org');

// Get transactions starting from a specific ledger
const response = await server.getTransactions({
  startLedger: 100000,
  pagination: { limit: 10 },
});

console.log('Latest ledger:', response.latestLedger);
console.log('Oldest ledger:', response.oldestLedger);
console.log('Cursor:', response.cursor);

response.transactions.forEach((tx) => {
  console.log('Hash:', tx.txHash);
  console.log('Status:', tx.status);
  console.log('Ledger:', tx.ledger);
  console.log('Application order:', tx.applicationOrder);
});

// Pagination using cursor
const nextPage = await server.getTransactions({
  pagination: { cursor: response.cursor, limit: 10 },
});

```

---

## Network Methods

### `getHealth()`

Check server health status.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';

const server = new Server('https://soroban-testnet.stellar.org');
const health = await server.getHealth();
console.log("Status:", health.status); // "healthy"
```

### `getNetwork()`

Get network information.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';

const server = new Server('https://soroban-testnet.stellar.org');
const network = await server.getNetwork();
console.log("Friendbot URL:", network.friendbotUrl);
console.log("Passphrase:", network.passphrase);
console.log("Protocol version:", network.protocolVersion);
```

### `getLatestLedger()`

Get the latest ledger information.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';

const server = new Server('https://soroban-testnet.stellar.org');
const ledger = await server.getLatestLedger();
console.log("Sequence:", ledger.sequence);
console.log("Hash:", ledger.id);
console.log("Protocol version:", ledger.protocolVersion);
```

### `getLedgers()`

Fetch ledger details in a range.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';

const server = new Server('https://soroban-testnet.stellar.org');

// Get specific ledgers
const response = await server.getLedgers({
  startLedger: 1000,
  pagination: {
    limit: 5,
  },
});

console.log('Latest ledger:', response.latestLedger);
console.log('Oldest ledger:', response.oldestLedger);
console.log('Cursor:', response.cursor);

response.ledgers.forEach((ledger) => {
  console.log('Sequence:', ledger.sequence);
  console.log('Hash:', ledger.hash);
  console.log('Close time:', ledger.ledgerCloseTime);
  console.log('Metadata XDR:', ledger.metadataXdr);
});

// Pagination
const nextPage = await server.getLedgers({
  pagination: {
    cursor: response.cursor,
    limit: 5,
  },
});

```

### `getVersionInfo()`

Get RPC server version information.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';

const server = new Server('https://soroban-testnet.stellar.org');

const version = await server.getVersionInfo();
console.log("Version:", version.version);
console.log("Commit hash:", version.commitHash);
console.log("Build timestamp:", version.buildTimestamp);
console.log("Captive core version:", version.captiveCoreVersion);
console.log("Protocol version:", version.protocolVersion);
```

### `getFeeStats()`

Get fee statistics for the network.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';

const server = new Server('https://soroban-testnet.stellar.org');

const feeStats = await server.getFeeStats();
console.log("Soroban inclusion fee:", {
  max: feeStats.sorobanInclusionFee.max,
  min: feeStats.sorobanInclusionFee.min,
  mode: feeStats.sorobanInclusionFee.mode,
  p10: feeStats.sorobanInclusionFee.p10,
  p50: feeStats.sorobanInclusionFee.p50,
  p90: feeStats.sorobanInclusionFee.p90,
  p99: feeStats.sorobanInclusionFee.p99
});

console.log("Inclusion fee:", feeStats.inclusionFee);
console.log("Latest ledger:", feeStats.latestLedger);
```

---

## Event Methods

### `getEvents()`

Query contract events.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';
import { nativeToScVal } from '@stellar/stellar-sdk';

const server = new Server('https://soroban-testnet.stellar.org');

// Get all events for a contract
const events = await server.getEvents({
  startLedger: 1000,
  endLedger: 2000,
  filters: [
    {
      contractIds: ['CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5'],
    },
  ],
  limit: 100,
});

console.log('Latest ledger:', events.latestLedger);
events.events.forEach((event) => {
  console.log('Type:', event.type);
  console.log('Ledger:', event.ledger);
  console.log('Contract ID:', event.contractId);
  console.log('Topic:', event.topic);
  console.log('Value:', event.value);
  console.log('In successful contract call:', event.inSuccessfulContractCall);
});

// Filter by topic
const filteredEvents = await server.getEvents({
  startLedger: 1000,
  endLedger: 2000,

  filters: [
    {
      contractIds: ['CCONT...'],
      topics: [
        [
          nativeToScVal('transfer', { type: 'symbol' }).toXDR('base64'),
          nativeToScVal('G...', { type: 'address' }).toXDR('base64'),
        ],
      ],
    },
  ],
});

// Pagination
const nextEvents = await server.getEvents({
  filters: [],
  cursor: events.cursor,
  limit: 100,
});

```

---

## Utility Methods

### `requestAirdrop()`

Request testnet tokens from friendbot.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';
import { Keypair } from '@stellar/stellar-sdk';

const server = new Server('https://soroban-testnet.stellar.org');

const keypair = Keypair.random();
console.log('Public key:', keypair.publicKey());
console.log('Secret:', keypair.secret());

// Request airdrop
const account = await server.requestAirdrop(keypair.publicKey());
console.log('Account funded!');
console.log('Sequence:', account.sequenceNumber());

// Custom friendbot URL
const account2 = await server.requestAirdrop(
  keypair.publicKey(),
  'https://friendbot-futurenet.stellar.org/'
);
```

### `getSACBalance()`

Get Stellar Asset Contract (SAC) balance for an account.

```typescript
import { Server } from '@stellar/stellar-sdk/rpc';
import { Asset, Networks, Address } from '@stellar/stellar-sdk';

const server = new Server('https://soroban-testnet.stellar.org');

const address = 'GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4';
const usdc = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');

const balance = await server.getSACBalance(address, usdc, Networks.TESTNET);

console.log('Balance:', balance.balanceEntry);
console.log('Latest ledger:', balance.latestLedger);

// Using Address object
const addr = new Address(address);
const balance2 = await server.getSACBalance(addr, usdc, Networks.TESTNET);
```

---

## Complete Examples

### Simple Contract Call Flow

```typescript
import { Keypair, Contract, TransactionBuilder, Networks, xdr } from '@stellar/stellar-sdk';
import { Api, Server } from '@stellar/stellar-sdk/rpc';

const server = new Server('https://soroban-testnet.stellar.org');
const keypair = Keypair.random();
const contractId = 'CCONT...';

// 1. Get account
const account = await server.getAccount(keypair.publicKey());

// 2. Build transaction
const contract = new Contract(contractId);
const transaction = new TransactionBuilder(account, {
  fee: '100',
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(contract.call('increment'))
  .setTimeout(30)
  .build();

// 3. Simulate
const simulation = await server.simulateTransaction(transaction);
if (Api.isSimulationSuccess(simulation)) {
  if (simulation.result) {
    console.log('Simulated result:', simulation.result.retval);
  }
} else {
  throw new Error('Simulation failed');
}

// 4. Prepare (adds soroban data and auth)
const prepared = await server.prepareTransaction(transaction);

// 5. Sign
prepared.sign(keypair);

// 6. Send
const response = await server.sendTransaction(prepared);
console.log('Sent:', response.hash);

// 7. Poll for result
const result = await server.pollTransaction(response.hash);
console.log('Final status:', result.status);

```

### Deploy Contract Example

```typescript
import {
  Keypair,
  Operation,
  TransactionBuilder,
  Networks,
  Address,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';
import { Server } from '@stellar/stellar-sdk/rpc';
import fs from 'fs';

const server = new Server('https://soroban-testnet.stellar.org');
  const keypair = Keypair.random();

  // 1. Fund account
  await server.requestAirdrop(keypair.publicKey());

  // 2. Upload WASM
  const account = await server.getAccount(keypair.publicKey());
  const wasmBytes = fs.readFileSync('./contract.wasm');

  const uploadTx = new TransactionBuilder(account, {
    fee: '1000000',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.uploadContractWasm({ wasm: wasmBytes }))
    .setTimeout(30)
    .build();

  const preparedUpload = await server.prepareTransaction(uploadTx);
  preparedUpload.sign(keypair);

  const uploadResponse = await server.sendTransaction(preparedUpload);
  const uploadResult = await server.pollTransaction(uploadResponse.hash);
  console.log('WASM uploaded:', uploadResult.status);

  // 3. Deploy contract
  const account2 = await server.getAccount(keypair.publicKey());
  const wasmHash =
    uploadResult.status === 'SUCCESS' &&
    scValToNative(uploadResult.returnValue || xdr.ScVal.scvVoid());

  const deployTx = new TransactionBuilder(account2, {
    fee: '100000',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.createCustomContract({
        address: Address.fromString(keypair.publicKey()),
        wasmHash,
        salt: Buffer.alloc(32),
      })
    )
    .setTimeout(30)
    .build();

  const preparedDeploy = await server.prepareTransaction(deployTx);
  preparedDeploy.sign(keypair);

  const deployResponse = await server.sendTransaction(preparedDeploy);
  const deployResult = await server.pollTransaction(deployResponse.hash);
  console.log('Contract deployed:', deployResult.status);
```

