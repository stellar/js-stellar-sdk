import {
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  vi,
  assert,
} from "vitest";

import { serverUrl } from "../../../constants.js";
import {
  Account,
  Keypair,
  Networks,
  rpc,
  SorobanDataBuilder,
  authorizeInvocation,
  authorizeEntry,
  xdr,
  Contract,
  Operation,
  TimeoutInfinite,
  TransactionBuilder,
} from "../../../../src/index.js";

const { Server, parseRawSimulation } = rpc;

const randomSecret = Keypair.random().secret();
const networkPassphrase = Networks.TESTNET;

function cloneSimulation(
  sim: rpc.Api.SimulateTransactionSuccessResponse,
): rpc.Api.SimulateTransactionSuccessResponse {
  return {
    id: sim.id,
    events: Array.from(sim.events),
    latestLedger: sim.latestLedger,
    minResourceFee: sim.minResourceFee,
    transactionData: new SorobanDataBuilder(sim.transactionData.build()),
    result: {
      auth: sim.result
        ? sim.result.auth.map((entry) =>
            xdr.SorobanAuthorizationEntry.fromXDR(
              xdr.SorobanAuthorizationEntry.toXDR(entry),
            ),
          )
        : [],
      retval: sim.result
        ? xdr.ScVal.fromXDR(xdr.ScVal.toXDR(sim.result.retval))
        : xdr.ScVal.scvVoid(),
    },
    stateChanges: sim.stateChanges
      ? sim.stateChanges?.map((change) => ({
          type: change.type,
          key: xdr.LedgerKey.fromXDR(xdr.LedgerKey.toXDR(change.key)),
          before: change.before
            ? xdr.LedgerEntry.fromXDR(xdr.LedgerEntry.toXDR(change.before))
            : null,
          after: change.after
            ? xdr.LedgerEntry.fromXDR(xdr.LedgerEntry.toXDR(change.after))
            : null,
        }))
      : [],
    _parsed: sim._parsed,
  };
}

function baseSimulationResponse(results?: any) {
  const accountId = "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";

  return {
    id: "1",
    events: [],
    latestLedger: 3,
    minResourceFee: "15",
    transactionData: xdr.SorobanTransactionData.toXDR(
      new SorobanDataBuilder().build(),
      "base64",
    ),
    ...(results !== undefined && { results }),
    stateChanges: [
      {
        type: 2,
        key: xdr.LedgerKey.toXDR(
          xdr.LedgerKey.account({
            accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
          }),
          "base64",
        ),
        before: xdr.LedgerEntry.toXDR(
          {
            lastModifiedLedgerSeq: 0,
            data: xdr.LedgerEntryData.account({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: BigInt("1000000000"),
              seqNum: BigInt("1234"),
              numSubEntries: 0,
              inflationDest: null,
              flags: 0,
              homeDomain: "",
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: { type: "case0" },
            }),
            ext: { type: "case0" },
          },
          "base64",
        ),
        after: xdr.LedgerEntry.toXDR(
          {
            lastModifiedLedgerSeq: 0,
            data: xdr.LedgerEntryData.account({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: BigInt("1000000000"),
              seqNum: BigInt("1234"),
              numSubEntries: 0,
              inflationDest: null,
              flags: 0,
              homeDomain: "",
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: { type: "case0" },
            }),
            ext: { type: "case0" },
          },
          "base64",
        ),
      },
    ],
  };
}

function buildAuthEntry(address: any) {
  if (!address) {
    throw new Error("where address?");
  }

  // Basic fake invocation
  const root = {
    subInvocations: [],
    function:
      xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn({
        contractAddress: address,
        functionName: "test",
        args: [],
      }),
  };

  // do some voodoo to make this return a deterministic auth entry
  const kp = Keypair.fromSecret(randomSecret);
  return authorizeInvocation({
    signer: kp,
    validUntilLedgerSeq: 1,
    invocation: root,
    networkPassphrase,
  }).then((entry) => {
    if (entry.credentials.type === "sorobanCredentialsSourceAccount") {
      expect.fail("Expected nonce to be a BigInt, got function");
    }
    (entry.credentials.address.nonce as any) = BigInt(0xdeadbeef);
    return authorizeEntry(entry, kp, 1, networkPassphrase); // overwrites signature w/ above nonce
  });
}

async function invokeSimulationResponse(address: any) {
  return baseSimulationResponse([
    {
      auth: [await buildAuthEntry(address)].map((entry) =>
        xdr.SorobanAuthorizationEntry.toXDR(entry, "base64"),
      ),
      xdr: xdr.ScVal.toXDR(xdr.ScVal.scvU32(0), "base64"),
    },
  ]);
}

function simulationResponseError(events?: any) {
  return {
    id: "1",
    ...(events !== undefined && { events }),
    latestLedger: 3,
    error: "This is an error",
  };
}

async function invokeSimulationResponseWithRestoration(address: any) {
  return {
    ...(await invokeSimulationResponse(address)),
    restorePreamble: {
      minResourceFee: "51",
      transactionData: xdr.SorobanTransactionData.toXDR(
        new SorobanDataBuilder().build(),
        "base64",
      ),
    },
  };
}

async function invokeSimulationResponseWithStateChanges(address: any) {
  const accountId = "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";

  return {
    ...(await invokeSimulationResponse(address)),
    stateChanges: [
      {
        type: 2,
        key: xdr.LedgerKey.toXDR(
          xdr.LedgerKey.account({
            accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
          }),
          "base64",
        ),
        before: xdr.LedgerEntry.toXDR(
          {
            lastModifiedLedgerSeq: 0,
            data: xdr.LedgerEntryData.account({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: BigInt("1000000000"),
              seqNum: BigInt("1234"),
              numSubEntries: 0,
              inflationDest: null,
              flags: 0,
              homeDomain: "",
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: { type: "case0" },
            }),
            ext: { type: "case0" },
          },
          "base64",
        ),
        after: xdr.LedgerEntry.toXDR(
          {
            lastModifiedLedgerSeq: 0,
            data: xdr.LedgerEntryData.account({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: BigInt("1000000000"),
              seqNum: BigInt("1234"),
              numSubEntries: 0,
              inflationDest: null,
              flags: 0,
              homeDomain: "",
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: { type: "case0" },
            }),
            ext: { type: "case0" },
          },
          "base64",
        ),
      },
      {
        type: 1,
        key: xdr.LedgerKey.toXDR(
          xdr.LedgerKey.account({
            accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
          }),
          "base64",
        ),
        before: null,
        after: xdr.LedgerEntry.toXDR(
          {
            lastModifiedLedgerSeq: 0,
            data: xdr.LedgerEntryData.account({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: BigInt("1000000000"),
              seqNum: BigInt("1234"),
              numSubEntries: 0,
              inflationDest: null,
              flags: 0,
              homeDomain: "",
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: { type: "case0" },
            }),
            ext: { type: "case0" },
          },
          "base64",
        ),
      },
      {
        type: 3,
        key: xdr.LedgerKey.toXDR(
          xdr.LedgerKey.account({
            accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
          }),
          "base64",
        ),
        before: xdr.LedgerEntry.toXDR(
          {
            lastModifiedLedgerSeq: 0,
            data: xdr.LedgerEntryData.account({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: BigInt("1000000000"),
              seqNum: BigInt("1234"),
              numSubEntries: 0,
              inflationDest: null,
              flags: 0,
              homeDomain: "",
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: { type: "case0" },
            }),
            ext: { type: "case0" },
          },
          "base64",
        ),
        after: null,
      },
    ],
  };
}

describe("Server#simulateTransaction", () => {
  let server: rpc.Server;
  let mockPost: any;
  let transaction: any;
  let blob: string;

  const keypair = Keypair.random();
  const contractId = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";
  const contract = new Contract(contractId);
  const address = contract.address().toScAddress();

  const accountId = "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
  const accountKey = xdr.LedgerKey.account({
    accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
  });

  let simulationResponse: any;
  let parsedSimulationResponse: any;

  beforeEach(async () => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
    const source = new Account(
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
      "1",
    );
    function emptyContractTransaction() {
      return new TransactionBuilder(source, { fee: "100" })
        .setNetworkPassphrase("Test")
        .setTimeout(TimeoutInfinite)
        .addOperation(
          Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeInvokeContract({
              contractAddress: address,
              functionName: "hello",
              args: [],
            }),
            auth: [],
          }),
        )
        .build();
    }

    const tx = emptyContractTransaction();
    tx.sign(keypair);

    transaction = tx;
    blob = xdr.TransactionEnvelope.toXDR(tx.toEnvelope(), "base64");
    simulationResponse = await invokeSimulationResponse(address);

    parsedSimulationResponse = {
      id: simulationResponse.id,
      events: simulationResponse.events,
      latestLedger: simulationResponse.latestLedger,
      minResourceFee: simulationResponse.minResourceFee,
      transactionData: new SorobanDataBuilder(
        simulationResponse.transactionData,
      ),
      result: {
        auth: simulationResponse.results[0].auth.map((entry: any) =>
          xdr.SorobanAuthorizationEntry.fromXDR(entry, "base64"),
        ),
        retval: xdr.ScVal.fromXDR(simulationResponse.results[0].xdr, "base64"),
      },
      stateChanges: [
        {
          type: 2,
          key: accountKey,
          before: {
            lastModifiedLedgerSeq: 0,
            data: xdr.LedgerEntryData.account({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: BigInt("1000000000"),
              seqNum: BigInt("1234"),
              numSubEntries: 0,
              inflationDest: null,
              flags: 0,
              homeDomain: "",
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: { type: "case0" },
            }),
            ext: { type: "case0" },
          },
          after: {
            lastModifiedLedgerSeq: 0,
            data: xdr.LedgerEntryData.account({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: BigInt("1000000000"),
              seqNum: BigInt("1234"),
              numSubEntries: 0,
              inflationDest: null,
              flags: 0,
              homeDomain: "",
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: { type: "case0" },
            }),
            ext: { type: "case0" },
          },
        },
      ],
      _parsed: true,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("simulates a transaction", async () => {
    const mockResponse = { data: { id: 1, result: simulationResponse } };
    mockPost.mockResolvedValue(mockResponse);

    const response = await server.simulateTransaction(transaction);
    const expected = cloneSimulation(parsedSimulationResponse);
    assert.deepEqual(response, expected);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "simulateTransaction",
      params: {
        transaction: blob,
        authMode: undefined,
      },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("simulates a transaction with add'l resource usage", async () => {
    const mockResponse = { data: { id: 1, result: simulationResponse } };
    mockPost.mockResolvedValue(mockResponse);

    const response = await server.simulateTransaction(transaction, {
      cpuInstructions: 100,
    });
    assert.deepEqual(response, parsedSimulationResponse);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "simulateTransaction",
      params: {
        transaction: blob,
        resourceConfig: { instructionLeeway: 100 },
        authMode: undefined,
      },
    });
  });

  it.skipIf(
    typeof window !== "undefined" &&
      (window as any).__STELLAR_SDK_BROWSER_TEST__,
  )("works when there are no results", () => {
    const simResponse = baseSimulationResponse();
    const parsedCopy = cloneSimulation(parsedSimulationResponse);
    delete (parsedCopy as any).result;

    const parsed = parseRawSimulation(simResponse);
    expect(parsed).toEqual(parsedCopy);
    expect(rpc.Api.isSimulationSuccess(parsed)).toBeTruthy();
  });

  it.skipIf(
    typeof window !== "undefined" &&
      (window as any).__STELLAR_SDK_BROWSER_TEST__,
  )("works with no auth", async () => {
    const simResponse = await invokeSimulationResponse(address);
    delete simResponse.results[0].auth;

    const parsedCopy = cloneSimulation(parsedSimulationResponse);
    parsedCopy.result!.auth = [];
    const parsed = parseRawSimulation(simResponse);

    expect(parsed).toEqual(parsedCopy);
    expect(rpc.Api.isSimulationSuccess(parsed)).toBeTruthy();
  });

  it.skipIf(
    typeof window !== "undefined" &&
      (window as any).__STELLAR_SDK_BROWSER_TEST__,
  )("works with restoration", async () => {
    const simResponse = await invokeSimulationResponseWithRestoration(address);
    const expected = cloneSimulation(parsedSimulationResponse);
    (expected as any).restorePreamble = {
      minResourceFee: "51",
      transactionData: new SorobanDataBuilder(),
    };

    const parsed = parseRawSimulation(simResponse);
    expect(rpc.Api.isSimulationRestore(parsed)).toBeTruthy();
    expect(parsed).toEqual(expected);
  });

  it("works with state changes", async () => {
    const simResponse = await invokeSimulationResponseWithStateChanges(address);
    const expected = cloneSimulation(parsedSimulationResponse) as any;
    expected.stateChanges = [
      {
        type: 2,
        key: accountKey,
        before: {
          lastModifiedLedgerSeq: 0,
          data: xdr.LedgerEntryData.account({
            accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
            balance: BigInt("1000000000"),
            seqNum: BigInt("1234"),
            numSubEntries: 0,
            inflationDest: null,
            flags: 0,
            homeDomain: "",
            thresholds: Buffer.from("AQAAAA==", "base64"),
            signers: [],
            ext: { type: "case0" },
          }),
          ext: { type: "case0" },
        },
        after: {
          lastModifiedLedgerSeq: 0,
          data: xdr.LedgerEntryData.account({
            accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
            balance: BigInt("1000000000"),
            seqNum: BigInt("1234"),
            numSubEntries: 0,
            inflationDest: null,
            flags: 0,
            homeDomain: "",
            thresholds: Buffer.from("AQAAAA==", "base64"),
            signers: [],
            ext: { type: "case0" },
          }),
          ext: { type: "case0" },
        },
      },
      {
        type: 1,
        key: accountKey,
        before: null,
        after: {
          lastModifiedLedgerSeq: 0,
          data: xdr.LedgerEntryData.account({
            accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
            balance: BigInt("1000000000"),
            seqNum: BigInt("1234"),
            numSubEntries: 0,
            inflationDest: null,
            flags: 0,
            homeDomain: "",
            thresholds: Buffer.from("AQAAAA==", "base64"),
            signers: [],
            ext: { type: "case0" },
          }),
          ext: { type: "case0" },
        },
      },
      {
        type: 3,
        key: accountKey,
        before: {
          lastModifiedLedgerSeq: 0,
          data: xdr.LedgerEntryData.account({
            accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
            balance: BigInt("1000000000"),
            seqNum: BigInt("1234"),
            numSubEntries: 0,
            inflationDest: null,
            flags: 0,
            homeDomain: "",
            thresholds: Buffer.from("AQAAAA==", "base64"),
            signers: [],
            ext: { type: "case0" },
          }),
          ext: { type: "case0" },
        },
        after: null,
      },
    ];

    const parsed = parseRawSimulation(simResponse);
    assert.deepEqual(parsed, expected);
  });

  it("works with errors", () => {
    const simResponse = simulationResponseError();

    const expected = cloneSimulation(parsedSimulationResponse);
    // drop fields that go away with errors
    delete (expected as any).result;
    delete (expected as any).transactionData;
    delete (expected as any).minResourceFee;
    delete (expected as any).stateChanges;
    (expected as any).error = "This is an error";
    expected.events = [];

    const parsed = parseRawSimulation(simResponse);
    expect(parsed).toEqual(expected);
    expect(rpc.Api.isSimulationError(parsed)).toBeTruthy();
  });

  it("simulates fee bump transactions");
});

describe("works with real responses", () => {
  const schema = {
    id: "1",
    transactionData:
      "AAAAAAAAAAIAAAAGAAAAAa/6eoLeofDK5ksPljSZ7t/rAj/XR18e40fCB9LBugstAAAAFAAAAAEAAAAHqA0LEZLq3WL+N3rBQLTWuPqdV3Vv6XIAGeBJaz1wMdsAAAAAABg1gAAAAxwAAAAAAAAAAAAAAAk=",
    minResourceFee: "27889",
    events: [
      "AAAAAQAAAAAAAAAAAAAAAgAAAAAAAAADAAAADwAAAAdmbl9jYWxsAAAAAA0AAAAgr/p6gt6h8MrmSw+WNJnu3+sCP9dHXx7jR8IH0sG6Cy0AAAAPAAAABWhlbGxvAAAAAAAADwAAAAVBbG9oYQAAAA==",
      "AAAAAQAAAAAAAAABr/p6gt6h8MrmSw+WNJnu3+sCP9dHXx7jR8IH0sG6Cy0AAAACAAAAAAAAAAIAAAAPAAAACWZuX3JldHVybgAAAAAAAA8AAAAFaGVsbG8AAAAAAAAQAAAAAQAAAAIAAAAPAAAABUhlbGxvAAAAAAAADwAAAAVBbG9oYQAAAA==",
    ],
    results: [
      {
        auth: [],
        xdr: "AAAAEAAAAAEAAAACAAAADwAAAAVIZWxsbwAAAAAAAA8AAAAFQWxvaGEAAAA=",
      },
    ],
    restorePreamble: {
      transactionData: "",
      minResourceFee: "0",
    },
    latestLedger: 2634,
  };

  it("parses the schema", () => {
    expect(rpc.Api.isSimulationRaw(schema)).toBeTruthy();

    const parsed = parseRawSimulation(schema);

    if (!rpc.Api.isSimulationSuccess(parsed)) {
      expect.fail("Expected simulation to be successful");
    }
    if (rpc.Api.isSimulationError(parsed)) {
      expect.fail("Expected simulation to be successful, got error");
    }
    if (rpc.Api.isSimulationRestore(parsed)) {
      expect.fail("Expected simulation to be successful, got restore");
    }

    if (!parsed.result) {
      expect.fail("Expected result to be defined");
    }

    expect(parsed.result.auth).toHaveLength(0);

    expect(parsed.transactionData).toBeInstanceOf(SorobanDataBuilder);
    expect(parsed.events).toHaveLength(2);

    expect(parsed.result.retval).toHaveProperty("type");
    expect(parsed.result.retval).toHaveProperty("vec");

    expect(parsed.events[0]).toHaveProperty("inSuccessfulContractCall");
    expect(parsed.events[0]).toHaveProperty("event");
  });
});
