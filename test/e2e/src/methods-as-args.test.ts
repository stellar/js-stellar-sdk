import { expect } from "vitest";
import { clientFor } from "./util";

// this test checks that apps can pass methods as arguments to other methods and have them still work
const callMethod = (method: (arg0: any) => any, args: { hello: string; }) => method(args);

describe("methods-as-args", () => {
  it("should pass methods as arguments and have them still work", async () => {
    const { client } = await clientFor("customTypes");
    const { result } = await callMethod((client as any).hello, { hello: "tests" });
    expect(result).toBe("tests");
  });
});
