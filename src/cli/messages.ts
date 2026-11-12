import type {
  EventDiagnostic,
  FunctionDiagnostic,
} from "../bindings/generator.js";

// Control, format (bidi, zero-width) and separator characters that
// `JSON.stringify` leaves as they are.
const UNESCAPED_CONTROLS = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu;

/**
 * Quote an untrusted spec name for CLI output as a double-quoted JS string
 * literal, with every control, format and line or paragraph separator
 * character escaped.
 */
export function quoteName(name: string): string {
  // Escape each UTF-16 unit, so an astral match stays valid JSON.
  return JSON.stringify(name).replace(UNESCAPED_CONTROLS, (char) =>
    char
      .split("")
      .map((unit) => `\\u${unit.charCodeAt(0).toString(16).padStart(4, "0")}`)
      .join(""),
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
    `Call it with contract.Client.invoke(client, ${rawName}${d.hasInputs ? ", args" : ""}).`
  );
}

/** The CLI warning for an event that needs the user's review. */
export function eventWarning(d: EventDiagnostic): string {
  const rawName = quoteName(d.rawName);
  if (d.declarations > 1) {
    return (
      `⚠ Event ${rawName} is declared ${d.declarations} times; ` +
      `declaration ${d.occurrence + 1} generated as ` +
      `${d.interfaceName} with filter ${d.filterMethodName}(). ` +
      `Review the generated bindings to confirm which declaration ` +
      `you need.`
    );
  }
  const renamed = [
    ...(d.interfaceRenamed ? [d.interfaceName] : []),
    ...(d.filterMethodRenamed ? [`${d.filterMethodName}()`] : []),
  ];
  return (
    `⚠ Event ${rawName}: generated name` +
    `${renamed.length > 1 ? "s" : ""} ${renamed.join(" and ")} ` +
    `${renamed.length > 1 ? "were" : "was"} renamed to avoid a ` +
    `collision with another generated name.`
  );
}
