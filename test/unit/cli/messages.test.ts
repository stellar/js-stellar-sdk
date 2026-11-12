import { describe, it, expect } from "vitest";
import { functionWarning, quoteName } from "../../../src/cli/messages.js";

describe("functionWarning", () => {
  it("names a reserved method name", () => {
    expect(
      functionWarning({
        rawName: "toString",
        methodName: "toString",
        reason: "reserved",
      }),
    ).toBe(
      '⚠ Function "toString" has no method: "toString" is a reserved name. ' +
        'Call it with contract.Client.invoke(client, "toString", args).',
    );
  });

  it("names the method name that another function shares", () => {
    expect(
      functionWarning({
        rawName: "delete",
        methodName: "delete_",
        reason: "shared",
      }),
    ).toBe(
      '⚠ Function "delete" has no method: another function also maps to ' +
        '"delete_". Call it with ' +
        'contract.Client.invoke(client, "delete", args).',
    );
  });

  it("escapes quotes and control bytes in spec names", () => {
    const message = functionWarning({
      rawName: 'a"b\u001b[2J',
      methodName: "a_b__2J",
      reason: "shared",
    });
    expect(message).not.toContain("\u001b");
    expect(message).toContain(
      'contract.Client.invoke(client, "a\\"b\\u001b[2J", args).',
    );
  });
});

describe("quoteName", () => {
  it.each([
    ["\u001b", "\\u001b"],
    ["\u007f", "\\u007f"],
    ["\u009b", "\\u009b"],
    ["\u2028", "\\u2028"],
    ["\u2029", "\\u2029"],
  ])("escapes %j as %s", (char, escaped) => {
    expect(quoteName(`a${char}b`)).toBe(`"a${escaped}b"`);
  });

  it("leaves no raw C0, DEL, C1 or line separator code point", () => {
    const all = Array.from({ length: 0xa0 }, (_, i) =>
      String.fromCharCode(i),
    ).join("");
    const quoted = quoteName(`${all}\u2028\u2029`);
    const raw = [...quoted].filter((char) => {
      const code = char.charCodeAt(0);
      return (
        code < 0x20 ||
        (code >= 0x7f && code <= 0x9f) ||
        code === 0x2028 ||
        code === 0x2029
      );
    });
    expect(raw).toEqual([]);
    expect(JSON.parse(quoted)).toBe(`${all}\u2028\u2029`);
  });

  it("keeps a plain name and quotes it", () => {
    expect(quoteName("delete_")).toBe('"delete_"');
  });
});
