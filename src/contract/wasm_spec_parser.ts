import { parseWasmCustomSections } from "./utils.js";
/**
 * Obtains the contract spec XDR from a contract's wasm binary.
 * @param wasm - The contract's wasm binary as a Uint8Array.
 * @returns The XDR bytes representing the contract spec.
 * @throws If the contract spec cannot be obtained from the provided wasm binary.
 */
export function specFromWasm(wasm: Uint8Array): Uint8Array {
  const customData = parseWasmCustomSections(wasm);
  const xdrSections = customData.get("contractspecv0");

  if (!xdrSections || xdrSections.length === 0) {
    throw new Error("Could not obtain contract spec from wasm");
  }

  // Uint8Array.from so the result never aliases caller-owned wasm bytes
  // (Buffer.prototype.slice returns a view).
  return Uint8Array.from(xdrSections[0]);
}
