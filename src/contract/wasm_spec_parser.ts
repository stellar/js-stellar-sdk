import { parseWasmCustomSections } from "./utils";
/**
 * Obtains the contract spec XDR from a contract's wasm binary.
 * @param wasm The contract's wasm binary as a Buffer.
 * @returns The XDR buffer representing the contract spec.
 * @throws {Error} If the contract spec cannot be obtained from the provided wasm binary.
 */
export function specFromWasm(wasm: Buffer) {
  const customData = parseWasmCustomSections(wasm);
  let xdrSections = customData.get("contractspecv0");

  if (!xdrSections || xdrSections.length === 0) {
    throw new Error("Could not obtain contract spec from wasm");
  }

  return Buffer.from(xdrSections[0]);
}
