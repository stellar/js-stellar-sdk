import {
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  vi,
  assert,
} from "vitest";

import { serverUrl } from "../../../constants";
import { StellarSdk } from "../../../test-utils/stellar-sdk-import";

const {
  Account,
  Keypair,
  rpc,
  SorobanDataBuilder,
  authorizeInvocation,
  authorizeEntry,
  xdr,
} = StellarSdk;
const { Server, parseRawSimulation } = StellarSdk.rpc;

const randomSecret = Keypair.random().secret();

function cloneSimulation(sim: any) {
  return {
    id: sim.id,
    events: Array.from(sim.events),
    latestLedger: sim.latestLedger,
    minResourceFee: sim.minResourceFee,
    transactionData: new SorobanDataBuilder(sim.transactionData.build()),
    result: {
      auth: sim.result.auth.map((entry: any) =>
        xdr.SorobanAuthorizationEntry.fromXDR(entry.toXDR()),
      ),
      retval: xdr.ScVal.fromXDR(sim.result.retval.toXDR()),
    },
    stateChanges: sim.stateChanges?.map((change: any) => ({
      type: change.type,
      key: xdr.LedgerKey.fromXDR(change.key.toXDR()),
      before: change.before
        ? xdr.LedgerEntry.fromXDR(change.before.toXDR())
        : null,
      after: change.after
        ? xdr.LedgerEntry.fromXDR(change.after.toXDR())
        : null,
    })),
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
    transactionData: new SorobanDataBuilder().build().toXDR("base64"),
    ...(results !== undefined && { results }),
    stateChanges: [
      {
        type: 2,
        key: xdr.LedgerKey.account(
          new xdr.LedgerKeyAccount({
            accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
          }),
        ).toXDR("base64"),
        before: new xdr.LedgerEntry({
          lastModifiedLedgerSeq: 0,
          data: xdr.LedgerEntryData.account(
            new xdr.AccountEntry({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: xdr.Int64.fromString("1000000000"),
              seqNum: xdr.Int64.fromString("1234"),
              numSubEntries: 0,
              inflationDest: undefined as any,
              flags: 0,
              homeDomain: Buffer.from(""),
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: new (xdr.AccountEntryExt as any)(0),
            }),
          ),
          ext: new (xdr.LedgerEntryExt as any)(0),
        }).toXDR("base64"),
        after: new xdr.LedgerEntry({
          lastModifiedLedgerSeq: 0,
          data: xdr.LedgerEntryData.account(
            new xdr.AccountEntry({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: xdr.Int64.fromString("1000000000"),
              seqNum: xdr.Int64.fromString("1234"),
              numSubEntries: 0,
              inflationDest: undefined as any,
              flags: 0,
              homeDomain: Buffer.from(""),
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: new (xdr.AccountEntryExt as any)(0),
            }),
          ),
          ext: new (xdr.LedgerEntryExt as any)(0),
        }).toXDR("base64"),
      },
    ],
  };
}

function buildAuthEntry(address: any) {
  if (!address) {
    throw new Error("where address?");
  }

  // Basic fake invocation
  const root = new xdr.SorobanAuthorizedInvocation({
    subInvocations: [],
    function:
      xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
        new xdr.InvokeContractArgs({
          contractAddress: address,
          functionName: "test",
          args: [],
        }),
      ),
  });

  // do some voodoo to make this return a deterministic auth entry
  const kp = Keypair.fromSecret(randomSecret);
  return authorizeInvocation(kp, 1, root).then((entry: any) => {
    entry.credentials().address().nonce(new xdr.Int64(0xdeadbeef));
    return authorizeEntry(entry, kp, 1); // overwrites signature w/ above nonce
  });
}

async function invokeSimulationResponse(address: any) {
  return baseSimulationResponse([
    {
      auth: [await buildAuthEntry(address)].map((entry) =>
        entry.toXDR("base64"),
      ),
      xdr: xdr.ScVal.scvU32(0).toXDR("base64"),
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
      transactionData: new SorobanDataBuilder().build().toXDR("base64"),
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
        key: xdr.LedgerKey.account(
          new xdr.LedgerKeyAccount({
            accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
          }),
        ).toXDR("base64"),
        before: new xdr.LedgerEntry({
          lastModifiedLedgerSeq: 0,
          data: xdr.LedgerEntryData.account(
            new xdr.AccountEntry({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: xdr.Int64.fromString("1000000000"),
              seqNum: xdr.Int64.fromString("1234"),
              numSubEntries: 0,
              inflationDest: undefined as any,
              flags: 0,
              homeDomain: Buffer.from(""),
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: new (xdr.AccountEntryExt as any)(0),
            }),
          ),
          ext: new (xdr.LedgerEntryExt as any)(0),
        }).toXDR("base64"),
        after: new xdr.LedgerEntry({
          lastModifiedLedgerSeq: 0,
          data: xdr.LedgerEntryData.account(
            new xdr.AccountEntry({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: xdr.Int64.fromString("1000000000"),
              seqNum: xdr.Int64.fromString("1234"),
              numSubEntries: 0,
              inflationDest: undefined as any,
              flags: 0,
              homeDomain: Buffer.from(""),
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: new (xdr.AccountEntryExt as any)(0),
            }),
          ),
          ext: new (xdr.LedgerEntryExt as any)(0),
        }).toXDR("base64"),
      },
      {
        type: 1,
        key: xdr.LedgerKey.account(
          new xdr.LedgerKeyAccount({
            accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
          }),
        ).toXDR("base64"),
        before: null,
        after: new xdr.LedgerEntry({
          lastModifiedLedgerSeq: 0,
          data: xdr.LedgerEntryData.account(
            new xdr.AccountEntry({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: xdr.Int64.fromString("1000000000"),
              seqNum: xdr.Int64.fromString("1234"),
              numSubEntries: 0,
              inflationDest: undefined as any,
              flags: 0,
              homeDomain: Buffer.from(""),
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: new (xdr.AccountEntryExt as any)(0),
            }),
          ),
          ext: new (xdr.LedgerEntryExt as any)(0),
        }).toXDR("base64"),
      },
      {
        type: 3,
        key: xdr.LedgerKey.account(
          new xdr.LedgerKeyAccount({
            accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
          }),
        ).toXDR("base64"),
        before: new xdr.LedgerEntry({
          lastModifiedLedgerSeq: 0,
          data: xdr.LedgerEntryData.account(
            new xdr.AccountEntry({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: xdr.Int64.fromString("1000000000"),
              seqNum: xdr.Int64.fromString("1234"),
              numSubEntries: 0,
              inflationDest: undefined as any,
              flags: 0,
              homeDomain: Buffer.from(""),
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: new (xdr.AccountEntryExt as any)(0),
            }),
          ),
          ext: new (xdr.LedgerEntryExt as any)(0),
        }).toXDR("base64"),
        after: null,
      },
    ],
  };
}

describe("Server#simulateTransaction", () => {
  let server: any;
  let mockPost: any;
  let transaction: any;
  let blob: string;

  const keypair = Keypair.random();
  const contractId = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";
  const contract = new StellarSdk.Contract(contractId);
  const address = contract.address().toScAddress();

  const accountId = "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
  const accountKey = xdr.LedgerKey.account(
    new xdr.LedgerKeyAccount({
      accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
    }),
  );

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
      return new StellarSdk.TransactionBuilder(source, { fee: "100" })
        .setNetworkPassphrase("Test")
        .setTimeout(StellarSdk.TimeoutInfinite)
        .addOperation(
          StellarSdk.Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeInvokeContract(
              new xdr.InvokeContractArgs({
                contractAddress: address,
                functionName: "hello",
                args: [],
              }),
            ),
            auth: [],
          }),
        )
        .build();
    }

    const tx = emptyContractTransaction();
    tx.sign(keypair);

    transaction = tx;
    blob = tx.toEnvelope().toXDR().toString("base64");
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
          before: new xdr.LedgerEntry({
            lastModifiedLedgerSeq: 0,
            data: xdr.LedgerEntryData.account(
              new xdr.AccountEntry({
                accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
                balance: xdr.Int64.fromString("1000000000"),
                seqNum: xdr.Int64.fromString("1234"),
                numSubEntries: 0,
                inflationDest: undefined as any,
                flags: 0,
                homeDomain: Buffer.from(""),
                thresholds: Buffer.from("AQAAAA==", "base64"),
                signers: [],
                ext: new (xdr.AccountEntryExt as any)(0),
              }),
            ),
            ext: new (xdr.LedgerEntryExt as any)(0),
          }),
          after: new xdr.LedgerEntry({
            lastModifiedLedgerSeq: 0,
            data: xdr.LedgerEntryData.account(
              new xdr.AccountEntry({
                accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
                balance: xdr.Int64.fromString("1000000000"),
                seqNum: xdr.Int64.fromString("1234"),
                numSubEntries: 0,
                inflationDest: undefined as any,
                flags: 0,
                homeDomain: Buffer.from(""),
                thresholds: Buffer.from("AQAAAA==", "base64"),
                signers: [],
                ext: new (xdr.AccountEntryExt as any)(0),
              }),
            ),
            ext: new (xdr.LedgerEntryExt as any)(0),
          }),
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
    parsedCopy.result.auth = [];
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
        before: new xdr.LedgerEntry({
          lastModifiedLedgerSeq: 0,
          data: xdr.LedgerEntryData.account(
            new xdr.AccountEntry({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: xdr.Int64.fromString("1000000000"),
              seqNum: xdr.Int64.fromString("1234"),
              numSubEntries: 0,
              inflationDest: undefined as any,
              flags: 0,
              homeDomain: Buffer.from(""),
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: new (xdr.AccountEntryExt as any)(0),
            }),
          ),
          ext: new (xdr.LedgerEntryExt as any)(0),
        }),
        after: new xdr.LedgerEntry({
          lastModifiedLedgerSeq: 0,
          data: xdr.LedgerEntryData.account(
            new xdr.AccountEntry({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: xdr.Int64.fromString("1000000000"),
              seqNum: xdr.Int64.fromString("1234"),
              numSubEntries: 0,
              inflationDest: undefined as any,
              flags: 0,
              homeDomain: Buffer.from(""),
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: new (xdr.AccountEntryExt as any)(0),
            }),
          ),
          ext: new (xdr.LedgerEntryExt as any)(0),
        }),
      },
      {
        type: 1,
        key: accountKey,
        before: null,
        after: new xdr.LedgerEntry({
          lastModifiedLedgerSeq: 0,
          data: xdr.LedgerEntryData.account(
            new xdr.AccountEntry({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: xdr.Int64.fromString("1000000000"),
              seqNum: xdr.Int64.fromString("1234"),
              numSubEntries: 0,
              inflationDest: undefined as any,
              flags: 0,
              homeDomain: Buffer.from(""),
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: new (xdr.AccountEntryExt as any)(0),
            }),
          ),
          ext: new (xdr.LedgerEntryExt as any)(0),
        }),
      },
      {
        type: 3,
        key: accountKey,
        before: new xdr.LedgerEntry({
          lastModifiedLedgerSeq: 0,
          data: xdr.LedgerEntryData.account(
            new xdr.AccountEntry({
              accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
              balance: xdr.Int64.fromString("1000000000"),
              seqNum: xdr.Int64.fromString("1234"),
              numSubEntries: 0,
              inflationDest: undefined as any,
              flags: 0,
              homeDomain: Buffer.from(""),
              thresholds: Buffer.from("AQAAAA==", "base64"),
              signers: [],
              ext: new (xdr.AccountEntryExt as any)(0),
            }),
          ),
          ext: new (xdr.LedgerEntryExt as any)(0),
        }),
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

    expect((parsed as any).results).toBeUndefined();
    expect((parsed as any).result.auth).toHaveLength(0);
    expect((parsed as any).result.retval).toBeInstanceOf(xdr.ScVal);
    expect((parsed as any).transactionData).toBeInstanceOf(SorobanDataBuilder);
    expect(parsed.events).toHaveLength(2);
    expect(parsed.events[0]).toBeInstanceOf(xdr.DiagnosticEvent);
    expect((parsed as any).restorePreamble).toBeUndefined();
  });
});
