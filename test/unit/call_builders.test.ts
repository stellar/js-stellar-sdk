/* eslint-disable @typescript-eslint/dot-notation */
import { describe, it, expect } from "vitest";
import URI from "urijs";
import { CallBuilder } from "../../lib/horizon/call_builder";

describe("CallBuilder functions", () => {
  it("doesn't mutate the constructor passed url argument (it clones it instead)", () => {
    const arg = URI("https://onedom.ain/");
    const builder = new CallBuilder(arg);
    builder["url"].segment("one_segment");
    builder["checkFilter"]();

    expect(arg.toString()).not.toEqual("https://onedom.ain/one_segment"); // https://onedom.ain/
    expect(builder["url"].toString()).toEqual("https://onedom.ain/one_segment");
  });
});
