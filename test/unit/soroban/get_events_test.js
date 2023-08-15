const MockAdapter = require("axios-mock-adapter");

describe("Server#getEvents", function () {
  beforeEach(function () {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("requests the correct endpoint", function (done) {
    let result = { events: [] };
    setupMock(
      this.axiosMock,
      {
        filters: [],
        pagination: {},
        startLedger: "1",
      },
      result
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
    let result = filterEvents(getEventsResponseFixture, "*/*");

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
      result
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
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch(done);
  });

  it("can build matching filters", function (done) {
    let result = filterEvents(
      getEventsResponseFixture,
      "AAAABQAAAAh0cmFuc2Zlcg==/AAAAAQB6Mcc="
    );

    setupMock(
      this.axiosMock,
      {
        startLedger: "1",
        filters: [
          {
            topics: [["AAAABQAAAAh0cmFuc2Zlcg==", "AAAAAQB6Mcc="]],
          },
        ],
        pagination: {},
      },
      result
    );

    this.server
      .getEvents({
        startLedger: 1,
        filters: [
          {
            topics: [["AAAABQAAAAh0cmFuc2Zlcg==", "AAAAAQB6Mcc="]],
          },
        ],
      })
      .then(function (response) {
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch(done);
  });

  it("can build mixed filters", function (done) {
    let result = filterEventsByLedger(
      filterEvents(getEventsResponseFixture, "AAAABQAAAAh0cmFuc2Zlcg==/*"),
      1
    );

    setupMock(
      this.axiosMock,
      {
        startLedger: "1",
        filters: [
          {
            topics: [["AAAABQAAAAh0cmFuc2Zlcg==", "*"]],
          },
        ],
        pagination: {},
      },
      result
    );

    this.server
      .getEvents({
        startLedger: 1,
        filters: [
          {
            topics: [["AAAABQAAAAh0cmFuc2Zlcg==", "*"]],
          },
        ],
      })
      .then(function (response) {
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch(done);
  });

  it("can paginate", function (done) {
    let result = filterEventsByLedger(
      filterEvents(getEventsResponseFixture, "*/*"),
      1
    );

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
      result
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
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch(done);
  });
});

function filterEvents(events, filter) {
  return events.filter(
    (e, i) =>
      e.topic.length == filter.length &&
      e.topic.every((s, j) => s === filter[j] || s === "*")
  );
}

function filterEventsByLedger(events, start) {
  return events.filter((e) => {
    return e.ledger.parseInt() >= start;
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

let getEventsResponseFixture = [
  {
    type: "system",
    ledger: "1",
    ledgerClosedAt: "2022-11-16T16:10:41Z",
    contractId:
      "e3e82a76cc316f6289fd1ffbdf315da0f2c6be9582b84b9983a402f02ea0fff7",
    id: "0164090849041387521-0000000003",
    pagingToken: "164090849041387521-3",
    topic: ["AAAABQAAAAh0cmFuc2Zlcg==", "AAAAAQB6Mcc="],
    inSuccessfulContractCall: true,
    value: {
      xdr: "AAAABQAAAApHaWJNb255UGxzAAA=",
    },
  },
  {
    type: "contract",
    ledger: "2",
    ledgerClosedAt: "2022-11-16T16:10:41Z",
    contractId:
      "e3e82a76cc316f6289fd1ffbdf315da0f2c6be9582b84b9983a402f02ea0fff7",
    id: "0164090849041387521-0000000003",
    pagingToken: "164090849041387521-3",
    topic: ["AAAAAQB6Mcc=", "AAAABQAAAAh0cmFuc2Zlcg=="],
    inSuccessfulContractCall: true,
    value: {
      xdr: "AAAABQAAAApHaWJNb255UGxzAAA=",
    },
  },
  {
    type: "diagnostic",
    ledger: "2",
    ledgerClosedAt: "2022-11-16T16:10:41Z",
    contractId:
      "a3e82a76cc316f6289fd1ffbdf315da0f2c6be9582b84b9983a402f02ea0fff7",
    id: "0164090849041387521-0000000003",
    pagingToken: "164090849041387521-3",
    inSuccessfulContractCall: true,
    topic: ["AAAAAQB6Mcc="],
    value: {
      xdr: "AAAABQAAAApHaWJNb255UGxzAAA=",
    },
  },
  {
    type: "contract",
    ledger: "3",
    ledgerClosedAt: "2022-12-14T01:01:20Z",
    contractId:
      "6ebe0114ae15f72f187f05d06dcb66b22bd97218755c9b4646b034ab961fc1d5",
    id: "0000000171798695936-0000000001",
    pagingToken: "0000000171798695936-0000000001",
    inSuccessfulContractCall: true,
    topic: ["AAAABQAAAAdDT1VOVEVSAA==", "AAAABQAAAAlpbmNyZW1lbnQAAAA="],
    value: {
      xdr: "AAAAAQAAAAE=",
    },
  },
];
