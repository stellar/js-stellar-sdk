const {
  Account,
  Keypair,
  Networks,
  SorobanServer,
  SorobanDataBuilder,
  authorizeInvocation,
  xdr,
} = StellarSdk;

describe("Server#simulateTransaction", function () {
  let keypair = Keypair.random();
  let contractId = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";
  let contract = new StellarSdk.Contract(contractId);
  let address = contract.address().toScAddress();

  const simulationResponse = invokeSimulationResponse(address);
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
    this.server = new SorobanServer(serverUrl);
    this.axiosMock = sinon.mock(SorobanAxiosClient);
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

    const parsed = StellarSdk.parseRawSimulation(simResponse);
    expect(parsed).to.deep.equal(parsedCopy);
    expect(StellarSdk.SorobanRpc.isSimulationSuccess(parsed)).to.be.true;
  });

  it("works with no auth", function () {
    const simResponse = invokeSimulationResponse(address);
    delete simResponse.results[0].auth;

    const parsedCopy = cloneSimulation(parsedSimulationResponse);
    parsedCopy.result.auth = [];
    const parsed = StellarSdk.parseRawSimulation(simResponse);

    // FIXME: This is a workaround for an xdrgen bug that does not allow you to
    // build "perfectly-equal" xdr.ExtensionPoint instances (but they're still
    // binary-equal, so the test passes).
    parsedCopy.transactionData = parsedCopy.transactionData.build();
    parsed.transactionData = parsed.transactionData.build();

    expect(parsed).to.be.deep.equal(parsedCopy);
    expect(StellarSdk.SorobanRpc.isSimulationSuccess(parsed)).to.be.true;
  });

  xit("works with restoration", function () {
    const simResponse = invokeSimulationResponseWithRestoration(address);

    const expected = cloneSimulation(parsedSimulationResponse);
    expected.restorePreamble = {
      minResourceFee: "51",
      transactionData: new SorobanDataBuilder(),
    };

    const parsed = StellarSdk.parseRawSimulation(simResponse);
    expect(parsed).to.be.deep.equal(expected);
    expect(StellarSdk.SorobanRpc.isSimulationRestore(parsed)).to.be.true;
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

    const parsed = StellarSdk.parseRawSimulation(simResponse);
    expect(parsed).to.be.deep.equal(expected);
    expect(StellarSdk.SorobanRpc.isSimulationError(parsed)).to.be.true;
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

function buildAuthEntry(address) {
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

  const kp = Keypair.random();
  return authorizeInvocation(kp, Networks.FUTURENET, 1, root);
}

function invokeSimulationResponse(address) {
  return baseSimulationResponse([
    {
      auth: [buildAuthEntry(address)].map((entry) => entry.toXDR("base64")),
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

function invokeSimulationResponseWithRestoration(address) {
  return {
    ...invokeSimulationResponse(address),
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
    expect(StellarSdk.isSimulationRaw(schema)).to.be.true;

    const parsed = StellarSdk.parseRawSimulation(schema);

    expect(parsed.results).to.be.undefined;
    expect(parsed.result.auth).to.be.empty;
    expect(parsed.result.retval).to.be.instanceOf(xdr.ScVal);
    expect(parsed.transactionData).to.be.instanceOf(SorobanDataBuilder);
    expect(parsed.events).to.be.lengthOf(2);
    expect(parsed.events[0]).to.be.instanceOf(xdr.DiagnosticEvent);
    expect(parsed.restorePreamble).to.be.undefined;
  });
});
