const {
  Account,
  Keypair,
  Networks,
  SorobanRpc,
  SorobanDataBuilder,
  authorizeInvocation,
  authorizeEntry,
  xdr,
} = StellarSdk;
const { Server, AxiosClient, parseRawSimulation } = StellarSdk.SorobanRpc;

const randomSecret = Keypair.random().secret();

describe("Server#simulateTransaction", async function (done) {
  let keypair = Keypair.random();
  let contractId = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";
  let contract = new StellarSdk.Contract(contractId);
  let address = contract.address().toScAddress();

  const simulationResponse = await invokeSimulationResponse(address);
  const parsedSimulationResponse = {
    id: simulationResponse.id,
    events: simulationResponse.events,
    latestLedger: simulationResponse.latestLedger,
    minResourceFee: simulationResponse.minResourceFee,
    transactionData: new SorobanDataBuilder(simulationResponse.transactionData),
    result: {
      auth: simulationResponse.results[0].auth.map((entry) =>
        xdr.SorobanAuthorizationEntry.fromXDR(entry, "base64"),
      ),
      retval: xdr.ScVal.fromXDR(simulationResponse.results[0].xdr, "base64"),
    },
    cost: simulationResponse.cost,
    _parsed: true,
  };

  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
    const source = new Account(
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
      "1",
    );
    function emptyContractTransaction() {
      return new StellarSdk.TransactionBuilder(source, { fee: 100 })
        .setNetworkPassphrase("Test")
        .setTimeout(StellarSdk.TimeoutInfinite)
        .addOperation(
          StellarSdk.Operation.invokeHostFunction({
            func: new xdr.HostFunction.hostFunctionTypeInvokeContract(
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

    const transaction = emptyContractTransaction();
    transaction.sign(keypair);

    this.transaction = transaction;
    this.hash = this.transaction.hash().toString("hex");
    this.blob = transaction.toEnvelope().toXDR().toString("base64");
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("simulates a transaction", function (done) {
    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "simulateTransaction",
        params: [this.blob],
      })
      .returns(
        Promise.resolve({ data: { id: 1, result: simulationResponse } }),
      );

    this.server
      .simulateTransaction(this.transaction)
      .then(function (response) {
        expect(response).to.be.deep.equal(parsedSimulationResponse);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("works when there are no results", function () {
    const simResponse = baseSimulationResponse();
    const parsedCopy = cloneSimulation(parsedSimulationResponse);
    delete parsedCopy.result;

    const parsed = parseRawSimulation(simResponse);
    expect(parsed).to.deep.equal(parsedCopy);
    expect(SorobanRpc.Api.isSimulationSuccess(parsed)).to.be.true;
  });

  it("works with no auth", async function () {
    return invokeSimulationResponse(address).then((simResponse) => {
      delete simResponse.results[0].auth;

      const parsedCopy = cloneSimulation(parsedSimulationResponse);
      parsedCopy.result.auth = [];
      const parsed = parseRawSimulation(simResponse);

      expect(parsed).to.be.deep.equal(parsedCopy);
      expect(SorobanRpc.Api.isSimulationSuccess(parsed)).to.be.true;
    });
  });

  it("works with restoration", async function () {
    return invokeSimulationResponseWithRestoration(address).then(
      (simResponse) => {
        const expected = cloneSimulation(parsedSimulationResponse);
        expected.restorePreamble = {
          minResourceFee: "51",
          transactionData: new SorobanDataBuilder(),
        };

        const parsed = parseRawSimulation(simResponse);
        expect(SorobanRpc.Api.isSimulationRestore(parsed)).to.be.true;
        expect(parsed).to.be.deep.equal(expected);
      },
    );
  });

  it("works with errors", function () {
    let simResponse = simulationResponseError();

    const expected = cloneSimulation(parsedSimulationResponse);
    // drop fields that go away with errors
    delete expected.result;
    delete expected.cost;
    delete expected.transactionData;
    delete expected.minResourceFee;
    expected.error = "This is an error";
    expected.events = [];

    const parsed = parseRawSimulation(simResponse);
    expect(parsed).to.be.deep.equal(expected);
    expect(SorobanRpc.Api.isSimulationError(parsed)).to.be.true;
  });

  xit("simulates fee bump transactions");
});

function cloneSimulation(sim) {
  return {
    id: sim.id,
    events: Array.from(sim.events),
    latestLedger: sim.latestLedger,
    minResourceFee: sim.minResourceFee,
    transactionData: new SorobanDataBuilder(sim.transactionData.build()),
    result: {
      auth: sim.result.auth.map((entry) =>
        xdr.SorobanAuthorizationEntry.fromXDR(entry.toXDR()),
      ),
      retval: xdr.ScVal.fromXDR(sim.result.retval.toXDR()),
    },
    cost: sim.cost,
    _parsed: sim._parsed,
  };
}

async function buildAuthEntry(address) {
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
  return authorizeInvocation(kp, 1, root).then((entry) => {
    entry.credentials().address().nonce(new xdr.Int64(0xdeadbeef));
    return authorizeEntry(entry, kp, 1); // overwrites signature w/ above nonce
  });
}

async function invokeSimulationResponse(address) {
  return baseSimulationResponse([
    {
      auth: [await buildAuthEntry(address)].map((entry) =>
        entry.toXDR("base64"),
      ),
      xdr: xdr.ScVal.scvU32(0).toXDR("base64"),
    },
  ]);
}

function simulationResponseError(events) {
  return {
    id: 1,
    ...(events !== undefined && { events }),
    latestLedger: 3,
    error: "This is an error",
  };
}

function baseSimulationResponse(results) {
  return {
    id: 1,
    events: [],
    latestLedger: 3,
    minResourceFee: "15",
    transactionData: new SorobanDataBuilder().build().toXDR("base64"),
    ...(results !== undefined && { results }),
    cost: {
      cpuInsns: "1",
      memBytes: "2",
    },
  };
}

async function invokeSimulationResponseWithRestoration(address) {
  return {
    ...(await invokeSimulationResponse(address)),
    restorePreamble: {
      minResourceFee: "51",
      transactionData: new SorobanDataBuilder().build().toXDR("base64"),
    },
  };
}

describe("works with real responses", function () {
  const schema = {
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
    cost: {
      cpuInsns: "1322134",
      memBytes: "1207047",
    },
    restorePreamble: {
      transactionData: "",
      minResourceFee: "0",
    },
    latestLedger: "2634",
  };

  it("parses the schema", function () {
    expect(SorobanRpc.Api.isSimulationRaw(schema)).to.be.true;

    const parsed = parseRawSimulation(schema);

    expect(parsed.results).to.be.undefined;
    expect(parsed.result.auth).to.be.empty;
    expect(parsed.result.retval).to.be.instanceOf(xdr.ScVal);
    expect(parsed.transactionData).to.be.instanceOf(SorobanDataBuilder);
    expect(parsed.events).to.be.lengthOf(2);
    expect(parsed.events[0]).to.be.instanceOf(xdr.DiagnosticEvent);
    expect(parsed.restorePreamble).to.be.undefined;
  });
});
