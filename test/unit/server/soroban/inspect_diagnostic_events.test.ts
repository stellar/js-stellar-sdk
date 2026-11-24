import { describe, it, expect } from "vitest";
import * as StellarSdk from "../../../../src/index.js";
import {
  parseRawSendTransaction,
  parseRawSimulation,
} from "../../../../src/rpc/parsers.js";

const { StrKey, nativeToScVal, rpc, xdr } = StellarSdk;

const contractId = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";

function diagnosticEvent({
  inSuccessfulContractCall = false,
  type = xdr.ContractEventType.diagnostic,
  contract = contractId as string | null,
  topics,
  data,
}: {
  inSuccessfulContractCall?: boolean;
  type?: StellarSdk.xdr.ContractEventType;
  contract?: string | null;
  topics: StellarSdk.xdr.ScVal[];
  data: StellarSdk.xdr.ScVal;
}) {
  return new xdr.DiagnosticEvent({
    inSuccessfulContractCall,
    event: new xdr.ContractEvent({
      ext: xdr.ExtensionPoint.v0(),
      contractId:
        contract === null
          ? null
          : new xdr.ContractId(StrKey.decodeContract(contract)),
      type,
      body: xdr.ContractEventBody.v0(new xdr.ContractEventV0({ topics, data })),
    }),
  });
}

// The events a failed call leaves: the call into the contract, then the
// host's report of the contract error.
const fnCall = diagnosticEvent({
  contract: null,
  topics: [
    nativeToScVal("fn_call", { type: "symbol" }),
    nativeToScVal(StrKey.decodeContract(contractId)),
    nativeToScVal("increment", { type: "symbol" }),
  ],
  data: nativeToScVal(5, { type: "u32" }),
});
const hostError = diagnosticEvent({
  topics: [
    nativeToScVal("error", { type: "symbol" }),
    xdr.ScVal.scvError(xdr.ScError.sceContract(3)),
  ],
  data: nativeToScVal("escalating error to panic"),
});
const events = [fnCall, hostError];
const eventsXdr = events.map((e) => e.toXdr("base64"));

const inspected = [
  {
    inSuccessfulContractCall: false,
    type: "diagnostic",
    topics: ["fn_call", StrKey.decodeContract(contractId), "increment"],
    data: 5,
  },
  {
    inSuccessfulContractCall: false,
    type: "diagnostic",
    contractId,
    topics: ["error", { type: "contract", code: 3 }],
    data: "escalating error to panic",
  },
];

const errorResultXdr = new xdr.TransactionResult({
  feeCharged: 100n,
  result: xdr.TransactionResultResult.txSorobanInvalid(),
  ext: xdr.TransactionResultExt.v0(),
}).toXdr("base64");

const sent = {
  status: "ERROR" as const,
  hash: "ab".repeat(32),
  latestLedger: 100,
  latestLedgerCloseTime: 12345,
};

function metaV4(diagnosticEvents: StellarSdk.xdr.DiagnosticEvent[]) {
  return xdr.TransactionMeta.v4(
    new xdr.TransactionMetaV4({
      ext: xdr.ExtensionPoint.v0(),
      txChangesBefore: [],
      operations: [],
      txChangesAfter: [],
      sorobanMeta: null,
      events: [],
      diagnosticEvents,
    }),
  );
}

function metaV3(diagnosticEvents: StellarSdk.xdr.DiagnosticEvent[] | null) {
  return xdr.TransactionMeta.v3(
    new xdr.TransactionMetaV3({
      ext: xdr.ExtensionPoint.v0(),
      txChangesBefore: [],
      operations: [],
      txChangesAfter: [],
      sorobanMeta:
        diagnosticEvents === null
          ? null
          : new xdr.SorobanTransactionMeta({
              ext: xdr.SorobanTransactionMetaExt.v0(),
              events: [],
              returnValue: xdr.ScVal.scvVoid(),
              diagnosticEvents,
            }),
    }),
  );
}

// A failed getTransaction response, with only the fields the helper reads.
function landed(
  fields: Partial<
    Pick<
      StellarSdk.rpc.Api.GetFailedTransactionResponse,
      "diagnosticEventsXdr" | "resultMetaXdr"
    >
  >,
) {
  return {
    status: rpc.Api.GetTransactionStatus.FAILED,
    events: { contractEventsXdr: [], transactionEventsXdr: [] },
    ...fields,
  } as unknown as StellarSdk.rpc.Api.GetFailedTransactionResponse;
}

describe("rpc.inspectDiagnosticEvents", () => {
  it("reads diagnosticEvents of a sendTransaction error response", () => {
    const response = parseRawSendTransaction({
      ...sent,
      errorResultXdr,
      diagnosticEventsXdr: eventsXdr,
    });

    expect(response.diagnosticEvents).toHaveLength(2);
    expect(rpc.inspectDiagnosticEvents(response)).toEqual(inspected);
  });

  it("reads diagnosticEventsXdr of a getTransaction response", () => {
    const response = landed({ diagnosticEventsXdr: events });

    expect(rpc.inspectDiagnosticEvents(response)).toEqual(inspected);
  });

  it("reads diagnosticEventsXdr of a getTransactions entry", () => {
    const entry: Pick<
      StellarSdk.rpc.Api.TransactionInfo,
      "diagnosticEventsXdr" | "events"
    > = {
      diagnosticEventsXdr: events,
      events: { contractEventsXdr: [], transactionEventsXdr: [] },
    };

    expect(
      rpc.inspectDiagnosticEvents(entry as StellarSdk.rpc.Api.TransactionInfo),
    ).toEqual(inspected);
  });

  it("reads resultMetaXdr when diagnosticEventsXdr is missing or empty", () => {
    for (const resultMetaXdr of [metaV4(events), metaV3(events)]) {
      expect(rpc.inspectDiagnosticEvents(landed({ resultMetaXdr }))).toEqual(
        inspected,
      );
      expect(
        rpc.inspectDiagnosticEvents(
          landed({ resultMetaXdr, diagnosticEventsXdr: [] }),
        ),
      ).toEqual(inspected);
    }
  });

  it("prefers diagnosticEventsXdr over resultMetaXdr", () => {
    const response = landed({
      diagnosticEventsXdr: events,
      resultMetaXdr: metaV4([fnCall]),
    });

    expect(rpc.inspectDiagnosticEvents(response)).toEqual(inspected);
  });

  it("reads events of a failed simulateTransaction response", () => {
    const response = parseRawSimulation({
      id: "1",
      latestLedger: 100,
      error: "HostError: Error(Contract, #3)",
      events: eventsXdr,
    });

    expect(rpc.Api.isSimulationError(response)).toBe(true);
    expect(rpc.inspectDiagnosticEvents(response)).toEqual(inspected);
  });

  it("reads events of a successful simulateTransaction response", () => {
    const response: Pick<
      StellarSdk.rpc.Api.SimulateTransactionSuccessResponse,
      "events" | "minResourceFee"
    > = { events: [fnCall], minResourceFee: "100" };

    expect(
      rpc.inspectDiagnosticEvents(
        response as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse,
      ),
    ).toEqual([inspected[0]]);
  });

  it("keeps inSuccessfulContractCall and the event type of each event", () => {
    const contractEvent = diagnosticEvent({
      inSuccessfulContractCall: true,
      type: xdr.ContractEventType.contract,
      topics: [nativeToScVal("transfer", { type: "symbol" })],
      data: nativeToScVal(10n, { type: "i128" }),
    });

    expect(
      rpc.inspectDiagnosticEvents(
        landed({ diagnosticEventsXdr: [contractEvent, hostError] }),
      ),
    ).toEqual([
      {
        inSuccessfulContractCall: true,
        type: "contract",
        contractId,
        topics: ["transfer"],
        data: 10n,
      },
      inspected[1],
    ]);
  });

  it("returns the host error as the event with the error topic", () => {
    const error = rpc
      .inspectDiagnosticEvents(landed({ diagnosticEventsXdr: events }))
      .find((event) => event.topics[0] === "error");

    expect(error?.topics[1]).toEqual({ type: "contract", code: 3 });
    expect(error?.data).toBe("escalating error to panic");
  });

  describe("returns an empty list", () => {
    it("for a sendTransaction response that is not an error", () => {
      const response = parseRawSendTransaction({ ...sent, status: "PENDING" });

      expect(rpc.inspectDiagnosticEvents(response)).toEqual([]);
    });

    it("for a sendTransaction error without diagnostic events", () => {
      expect(
        rpc.inspectDiagnosticEvents(
          parseRawSendTransaction({ ...sent, errorResultXdr }),
        ),
      ).toEqual([]);
      expect(
        rpc.inspectDiagnosticEvents(
          parseRawSendTransaction({
            ...sent,
            errorResultXdr,
            diagnosticEventsXdr: [],
          }),
        ),
      ).toEqual([]);
    });

    it("for a getTransaction response without diagnosticEventsXdr", () => {
      expect(rpc.inspectDiagnosticEvents(landed({}))).toEqual([]);
      expect(
        rpc.inspectDiagnosticEvents(landed({ diagnosticEventsXdr: [] })),
      ).toEqual([]);
    });

    it("for a getTransaction response with no events in resultMetaXdr", () => {
      for (const resultMetaXdr of [
        metaV4([]),
        metaV3([]),
        metaV3(null),
        xdr.TransactionMeta.operations([]),
      ]) {
        expect(rpc.inspectDiagnosticEvents(landed({ resultMetaXdr }))).toEqual(
          [],
        );
      }
    });

    it("for a NOT_FOUND getTransaction response", () => {
      const response: StellarSdk.rpc.Api.GetMissingTransactionResponse = {
        status: rpc.Api.GetTransactionStatus.NOT_FOUND,
        txHash: "ab".repeat(32),
        latestLedger: 100,
        latestLedgerCloseTime: 12345,
        oldestLedger: 1,
        oldestLedgerCloseTime: 1,
      };

      expect(rpc.inspectDiagnosticEvents(response)).toEqual([]);
    });

    it("for a simulateTransaction response with no events", () => {
      const response = parseRawSimulation({
        id: "1",
        latestLedger: 100,
        error: "HostError: Error(Budget, ExceededLimit)",
      });

      expect(rpc.inspectDiagnosticEvents(response)).toEqual([]);
    });
  });
});
