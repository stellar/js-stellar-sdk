import type { FunctionDiagnostic } from "../bindings/generator.js";

// Control characters that `JSON.stringify` leaves as they are.
const UNESCAPED_CONTROLS = /[\u007f-\u009f\u2028\u2029]/g;

/**
 * Quote an untrusted spec name for CLI output as a double-quoted JS string
 * literal, with every C0, DEL, C1 and line separator character escaped.
 */
export function quoteName(name: string): string {
  return JSON.stringify(name).replace(
    UNESCAPED_CONTROLS,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}

/**
 * The CLI warning for a contract function that the generated `Client` has
 * no method for.
 */
export function functionWarning(d: FunctionDiagnostic): string {
  const rawName = quoteName(d.rawName);
  const methodName = quoteName(d.methodName);
  const cause =
    d.reason === "reserved"
      ? `${methodName} is a reserved name`
      : `another function also maps to ${methodName}`;
  return (
    `⚠ Function ${rawName} has no method: ${cause}. ` +
    `Call it with contract.Client.invoke(client, ${rawName}, args).`
  );
}
