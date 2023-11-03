const { nativeToScVal, SorobanRpc } = StellarSdk;
const { Server, AxiosClient } = StellarSdk.SorobanRpc;

describe("Server#getEvents", function () {
  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("requests the correct endpoint", function (done) {
    let result = { latestLedger: 0, events: [] };
    setupMock(
      this.axiosMock,
      {
        filters: [],
        pagination: {},
        startLedger: "1",
      },
      result,
    );

    this.server
      .getEvents({ startLedger: 1 })
      .then(function (response) {
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("can build wildcard filters", function (done) {
    let result = {
      latestLedger: 1,
      events: filterEvents(getEventsResponseFixture, "*/*"),
    };
    expect(result.events).to.not.have.lengthOf(0, JSON.stringify(result));

    setupMock(
      this.axiosMock,
      {
        startLedger: "1",
        filters: [
          {
            topics: [["*", "*"]],
          },
        ],
        pagination: {},
      },
      result,
    );

    this.server
      .getEvents({
        startLedger: 1,
        filters: [
          {
            topics: [["*", "*"]],
          },
        ],
      })
      .then(function (response) {
        expect(response).to.be.deep.equal(parseEvents(result));
        done();
      })
      .catch(done);
  });

  it("can build matching filters", function (done) {
    let result = {
      latestLedger: 1,
      events: filterEvents(
        getEventsResponseFixture,
        `${topicVals[0]}/${topicVals[1]}`,
      ),
    };
    expect(result.events).to.not.have.lengthOf(0, JSON.stringify(result));

    setupMock(
      this.axiosMock,
      {
        startLedger: "1",
        filters: [
          {
            topics: [[topicVals[0], topicVals[1]]],
          },
        ],
        pagination: {},
      },
      result,
    );

    this.server
      .getEvents({
        startLedger: 1,
        filters: [
          {
            topics: [[topicVals[0], topicVals[1]]],
          },
        ],
      })
      .then(function (response) {
        expect(response).to.be.deep.equal(parseEvents(result));
        done();
      })
      .catch(done);
  });

  it("can build mixed filters", function (done) {
    let result = {
      latestLedger: 3,
      events: filterEventsByLedger(
        filterEvents(getEventsResponseFixture, `${topicVals[0]}/*`),
        2,
      ),
    };
    expect(result.events).to.not.have.lengthOf(0, JSON.stringify(result));

    setupMock(
      this.axiosMock,
      {
        startLedger: "2",
        filters: [
          {
            topics: [[topicVals[0], "*"]],
          },
        ],
        pagination: {},
      },
      result,
    );

    this.server
      .getEvents({
        startLedger: 2,
        filters: [
          {
            topics: [[topicVals[0], "*"]],
          },
        ],
      })
      .then(function (response) {
        expect(response).to.be.deep.equal(parseEvents(result));
        done();
      })
      .catch(done);
  });

  it("can paginate", function (done) {
    let result = {
      latestLedger: 3,
      events: filterEventsByLedger(
        filterEvents(getEventsResponseFixture, "*/*"),
        2,
      ),
    };
    expect(result.events).to.not.have.lengthOf(0, JSON.stringify(result));

    setupMock(
      this.axiosMock,
      {
        filters: [
          {
            topics: [["*", "*"]],
          },
        ],
        pagination: {
          limit: 10,
          cursor: "0164090849041387521-0000000000",
        },
      },
      result,
    );

    this.server
      .getEvents({
        filters: [
          {
            topics: [["*", "*"]],
          },
        ],
        cursor: "0164090849041387521-0000000000",
        limit: 10,
      })
      .then(function (response) {
        expect(response).to.be.deep.equal(parseEvents(result));
        done();
      })
      .catch(done);
  });
});

function filterEvents(events, filter) {
  const parts = filter.split("/");
  return events.filter(
    (e, i) =>
      e.topic.length == parts.length &&
      e.topic.every((s, j) => s === parts[j] || parts[j] === "*"),
  );
}

function filterEventsByLedger(events, start) {
  return events.filter((e) => {
    return parseInt(e.ledger) >= start;
  });
}

function setupMock(axiosMock, params, result) {
  axiosMock
    .expects("post")
    .withArgs(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getEvents",
      params: params,
    })
    .returns(Promise.resolve({ data: { result } }));
}

function parseEvents(result) {
  return SorobanRpc.parseRawEvents(result);
}

const contractId = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
const topicVals = [
  nativeToScVal("transfer", { type: "symbol" }).toXDR("base64"),
  nativeToScVal(contractId, { type: "address" }).toXDR("base64"),
  nativeToScVal(1234).toXDR("base64"),
];
let eventVal = nativeToScVal("wassup").toXDR("base64");
let getEventsResponseFixture = [
  {
    type: "system",
    ledger: "1",
    ledgerClosedAt: "2022-11-16T16:10:41Z",
    contractId,
    id: "0164090849041387521-0000000003",
    pagingToken: "164090849041387521-3",
    inSuccessfulContractCall: true,
    topic: topicVals.slice(0, 2),
    value: {
      xdr: eventVal,
    },
  },
  {
    type: "contract",
    ledger: "2",
    ledgerClosedAt: "2022-11-16T16:10:41Z",
    contractId,
    id: "0164090849041387521-0000000003",
    pagingToken: "164090849041387521-3",
    inSuccessfulContractCall: true,
    topic: topicVals.slice(0, 2),
    value: {
      xdr: eventVal,
    },
  },
  {
    type: "diagnostic",
    ledger: "2",
    ledgerClosedAt: "2022-11-16T16:10:41Z",
    contractId,
    id: "0164090849041387521-0000000003",
    pagingToken: "164090849041387521-3",
    inSuccessfulContractCall: true,
    topic: [topicVals[0]],
    value: {
      xdr: eventVal,
    },
  },
  {
    type: "contract",
    ledger: "3",
    ledgerClosedAt: "2022-12-14T01:01:20Z",
    contractId,
    id: "0000000171798695936-0000000001",
    pagingToken: "0000000171798695936-0000000001",
    inSuccessfulContractCall: true,
    topic: topicVals,
    value: {
      xdr: eventVal,
    },
  },
];
