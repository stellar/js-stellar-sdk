import { describe, it, expect } from "vitest";
import { humanizeEvents } from "../../../src/base/events.js";
import { nativeToScVal, scValToNative } from "../../../src/base/scval.js";
import { StrKey } from "../../../src/base/strkey.js";
import xdr from "../../../src/base/xdr.js";
import { expectDefined, expectScVal } from "./support/expect_defined.js";

describe("humanizing raw events", () => {
  const contractId = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
  const scval = nativeToScVal([1, 2, 3]);
  const vec = expectDefined(expectScVal(scval, "scvVec").vec);
  const topics1 = vec.map((v) => v);
  const data1 = nativeToScVal({ hello: "world" });

  // workaround for xdr.ContractEventBody.0(...) being invalid
  const cloneAndSet = (newBody: {
    topics: xdr.ScVal[];
    data: xdr.ScVal;
  }): xdr.ContractEventBody => {
    const clone = xdr.ContractEventBody.v0({
      topics: [...newBody.topics], // placeholder, will be overwritten
      data: newBody.data, // will be overwritten
    });

    return clone;
  };

  const events: xdr.DiagnosticEvent[] = [
    {
      inSuccessfulContractCall: true,
      event: {
        ext: { type: "case0" },
        contractId: StrKey.decodeContract(contractId) as unknown as xdr.Hash,
        type: "contract",
        body: cloneAndSet({
          topics: topics1,
          data: data1,
        }),
      },
    },
    {
      inSuccessfulContractCall: true,
      event: {
        ext: { type: "case0" },
        contractId: null,
        type: "contract",
        body: cloneAndSet({
          topics: topics1,
          data: data1,
        }),
      },
    },
  ];

  it("built valid events for testing", () => {
    // sanity check: valid xdr
    events.map((e) => xdr.DiagnosticEvent.toXDR(e));
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
    const contractEvents: xdr.ContractEvent[] = [
      {
        ext: { type: "case0" },
        contractId: StrKey.decodeContract(contractId) as unknown as xdr.Hash,
        type: "contract",
        body: cloneAndSet({
          topics: topics1,
          data: data1,
        }),
      },
      {
        ext: { type: "case0" },
        contractId: null,
        type: "contract",
        body: cloneAndSet({
          topics: topics1,
          data: data1,
        }),
      },
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
    const systemEvents: xdr.ContractEvent[] = [
      {
        ext: { type: "case0" },
        contractId: null,
        type: "system",
        body: cloneAndSet({
          topics: topics1,
          data: data1,
        }),
      },
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
