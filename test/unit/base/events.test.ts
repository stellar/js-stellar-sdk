import { describe, it, expect } from "vitest";
import { humanizeEvents } from "../../src/events.js";
import { nativeToScVal, scValToNative } from "../../src/scval.js";
import { StrKey } from "../../src/strkey.js";
import xdr from "../../src/xdr.js";

describe("humanizing raw events", () => {
  const contractId = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
  const topics1 = nativeToScVal([1, 2, 3]).value() as xdr.ScVal[];
  const data1 = nativeToScVal({ hello: "world" });

  // workaround for xdr.ContractEventBody.0(...) being invalid
  const cloneAndSet = (newBody: {
    topics: xdr.ScVal[];
    data: xdr.ScVal;
  }): xdr.ContractEventBody => {
    const clone = new xdr.ContractEventBody(
      0,
      new xdr.ContractEventV0({
        topics: [],
        data: xdr.ScVal.scvVoid(),
      }),
    );
    clone.v0().topics(newBody.topics);
    clone.v0().data(newBody.data);
    return clone;
  };

  const events = [
    new xdr.DiagnosticEvent({
      inSuccessfulContractCall: true,
      event: new xdr.ContractEvent({
        ext: new xdr.ExtensionPoint(0),
        contractId: StrKey.decodeContract(contractId) as unknown as xdr.Hash,
        type: xdr.ContractEventType.contract(),
        body: cloneAndSet({
          topics: topics1,
          data: data1,
        }),
      }),
    }),
    new xdr.DiagnosticEvent({
      inSuccessfulContractCall: true,
      event: new xdr.ContractEvent({
        ext: new xdr.ExtensionPoint(0),
        contractId: null,
        type: xdr.ContractEventType.contract(),
        body: cloneAndSet({
          topics: topics1,
          data: data1,
        }),
      }),
    }),
  ];

  it("built valid events for testing", () => {
    // sanity check: valid xdr
    events.map((e) => e.toXDR());
  });

  it("makes diagnostic events human-readable", () => {
    const readable = humanizeEvents(events);

    expect(readable.length).toBe(events.length);
    expect(readable[0]).toEqual({
      type: "contract",
      contractId: contractId,
      topics: topics1.map(scValToNative),
      data: scValToNative(data1),
    });
    expect(readable[1]).toEqual({
      type: "contract",
      topics: topics1.map(scValToNative),
      data: scValToNative(data1),
    });
  });

  it("makes contract events human-readable", () => {
    const contractEvents = [
      new xdr.ContractEvent({
        ext: new xdr.ExtensionPoint(0),
        contractId: StrKey.decodeContract(contractId) as unknown as xdr.Hash,
        type: xdr.ContractEventType.contract(),
        body: cloneAndSet({
          topics: topics1,
          data: data1,
        }),
      }),
      new xdr.ContractEvent({
        ext: new xdr.ExtensionPoint(0),
        contractId: null,
        type: xdr.ContractEventType.contract(),
        body: cloneAndSet({
          topics: topics1,
          data: data1,
        }),
      }),
    ];

    const readable = humanizeEvents(contractEvents);

    expect(readable.length).toBe(contractEvents.length);
    expect(readable[0]).toEqual({
      type: "contract",
      contractId: contractId,
      topics: topics1.map(scValToNative),
      data: scValToNative(data1),
    });
    expect(readable[1]).toEqual({
      type: "contract",
      topics: topics1.map(scValToNative),
      data: scValToNative(data1),
    });
  });

  it("handles system event type", () => {
    const systemEvents = [
      new xdr.ContractEvent({
        ext: new xdr.ExtensionPoint(0),
        contractId: null,
        type: xdr.ContractEventType.system(),
        body: cloneAndSet({
          topics: topics1,
          data: data1,
        }),
      }),
    ];

    const readable = humanizeEvents(systemEvents);

    expect(readable.length).toBe(1);
    expect(readable[0]).toEqual({
      type: "system",
      topics: topics1.map(scValToNative),
      data: scValToNative(data1),
    });
  });

  it("returns an empty array for empty input", () => {
    const readable = humanizeEvents([]);

    expect(readable).toEqual([]);
  });
});
