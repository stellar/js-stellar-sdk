import { describe, it, expect } from "vitest";
import {
  eventWarning,
  functionWarning,
  quoteName,
} from "../../../src/cli/messages.js";

describe("functionWarning", () => {
  it("names a reserved method name", () => {
    expect(
      functionWarning({
        rawName: "toString",
        methodName: "toString",
        reason: "reserved",
        hasInputs: true,
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
        hasInputs: true,
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
      hasInputs: true,
    });
    expect(message).not.toContain("\u001b");
    expect(message).toContain(
      'contract.Client.invoke(client, "a\\"b\\u001b[2J", args).',
    );
  });

  it("leaves out args when the function takes no inputs", () => {
    expect(
      functionWarning({
        rawName: "toString",
        methodName: "toString",
        reason: "reserved",
        hasInputs: false,
      }),
    ).toContain('Call it with contract.Client.invoke(client, "toString").');
  });
});

describe("eventWarning", () => {
  const hostile = 'a"b\u001b[2J';
  const event = {
    rawName: hostile,
    occurrence: 1,
    declarations: 1,
    interfaceName: "AB2JEvent",
    filterMethodName: "aB2JEventFilter",
    interfaceRenamed: false,
    filterMethodRenamed: false,
  };

  it("names a duplicate declaration and escapes the event name", () => {
    expect(eventWarning({ ...event, declarations: 2 })).toBe(
      '⚠ Event "a\\"b\\u001b[2J" is declared 2 times; declaration 2 ' +
        "generated as AB2JEvent with filter aB2JEventFilter(). Review the " +
        "generated bindings to confirm which declaration you need.",
    );
  });

  it("names one renamed name and escapes the event name", () => {
    expect(eventWarning({ ...event, interfaceRenamed: true })).toBe(
      '⚠ Event "a\\"b\\u001b[2J": generated name AB2JEvent was renamed ' +
        "to avoid a collision with another generated name.",
    );
  });

  it("names two renamed names", () => {
    expect(
      eventWarning({
        ...event,
        interfaceRenamed: true,
        filterMethodRenamed: true,
      }),
    ).toContain("generated names AB2JEvent and aB2JEventFilter() were renamed");
  });
});

describe("quoteName", () => {
  it.each([
    ["\u001b", "\\u001b"],
    ["\u007f", "\\u007f"],
    ["\u009b", "\\u009b"],
    ["\u2028", "\\u2028"],
    ["\u2029", "\\u2029"],
    ["\u202e", "\\u202e"],
    ["\u2066", "\\u2066"],
    ["\u200b", "\\u200b"],
    ["\ufeff", "\\ufeff"],
    ["\u061c", "\\u061c"],
    ["\u{e0001}", "\\udb40\\udc01"],
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

  it("round-trips a name with bidi and astral format characters", () => {
    const name = "burn\u202eref\u2066\u{e0001}";
    expect(JSON.parse(quoteName(name))).toBe(name);
  });

  it("keeps a plain name and quotes it", () => {
    expect(quoteName("delete_")).toBe('"delete_"');
  });
});
