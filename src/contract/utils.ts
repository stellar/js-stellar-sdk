import { Account, Address } from "../base/index.js";
import { getAddressCredentials } from "../base/auth.js";
import { Server } from "../rpc/index.js";
import { NULL_ACCOUNT, type AssembledTransactionOptions } from "./types.js";
import {
  ScSpecEntry,
  decodeStream,
  type ScAddress,
  type ScVal,
  type SorobanCredentials,
  type SorobanDelegateSignature,
} from "../xdr/index.js";

/**
 * Keep calling a `fn` for `timeoutInSeconds` seconds, if `keepWaitingIf` is
 * true. Returns an array of all attempts to call the function.
 * @hidden
 */
export async function withExponentialBackoff<T>(
  /** Function to call repeatedly */
  fn: (previousFailure?: T) => Promise<T>,
  /** Condition to check when deciding whether or not to call `fn` again */
  keepWaitingIf: (result: T) => boolean,
  /** How long to wait between the first and second call */
  timeoutInSeconds: number,
  /** What to multiply `timeoutInSeconds` by, each subsequent attempt */
  exponentialFactor = 1.5,
  /** Whether to log extra info */
  verbose = false,
): Promise<T[]> {
  const attempts: T[] = [];

  let count = 0;
  attempts.push(await fn());
  if (!keepWaitingIf(attempts[attempts.length - 1])) return attempts;

  const waitUntil = new Date(Date.now() + timeoutInSeconds * 1000).valueOf();
  let waitTime = 1000;
  let totalWaitTime = waitTime;

  while (
    Date.now() < waitUntil &&
    keepWaitingIf(attempts[attempts.length - 1])
  ) {
    count += 1;
    // Wait a beat
    if (verbose) {
      console.info(
        `Waiting ${waitTime}ms before trying again (bringing the total wait time to ${totalWaitTime}ms so far, of total ${
          timeoutInSeconds * 1000
        }ms)`,
      );
    }

    await new Promise((res) => setTimeout(res, waitTime));
    // Exponential backoff
    waitTime *= exponentialFactor;
    if (new Date(Date.now() + waitTime).valueOf() > waitUntil) {
      waitTime = waitUntil - Date.now();
      if (verbose) {
        console.info(`was gonna wait too long; new waitTime: ${waitTime}ms`);
      }
    }
    totalWaitTime = waitTime + totalWaitTime;
    // Try again

    attempts.push(await fn(attempts[attempts.length - 1]));
    if (verbose && keepWaitingIf(attempts[attempts.length - 1])) {
      console.info(
        `${count}. Called ${fn}; ${
          attempts.length
        } prev attempts. Most recent: ${JSON.stringify(
          attempts[attempts.length - 1],
          null,
          2,
        )}`,
      );
    }
  }

  return attempts;
}

/**
 * If contracts are implemented using the `#[contracterror]` macro, then the
 * errors get included in the on-chain XDR that also describes your contract's
 * methods. Each error will have a specific number. This Regular Expression
 * matches these "expected error types" that a contract may throw, and helps
 * {@link AssembledTransaction} parse these errors.
 *
 * @defaultValue `/Error\(Contract, #(\d+)\)/`
 */
export const contractErrorPattern = /Error\(Contract, #(\d+)\)/;

/**
 * A TypeScript type guard that checks if an object has a `toString` method.
 * @hidden
 */
export function implementsToString(
  /** some object that may or may not have a `toString` method */
  obj: unknown,
): obj is { toString(): string } {
  return typeof obj === "object" && obj !== null && "toString" in obj;
}

export function parseWasmCustomSections(
  buffer: Uint8Array,
): Map<string, Uint8Array[]> {
  const sections = new Map<string, Uint8Array[]>();

  let offset = 0;

  // Helper to read bytes with bounds checking
  const read = (length: number): Uint8Array => {
    if (offset + length > buffer.byteLength)
      throw new Error("WASM read out of bounds");
    const bytes = buffer.subarray(offset, offset + length);
    offset += length;
    return bytes;
  };
  /**
   * Decodes a variable-length encoded unsigned 32-bit integer (LEB128 format) from the WASM binary.
   *
   * This function implements the WebAssembly LEB128 (Little Endian Base 128) variable-length
   * encoding scheme for unsigned integers. In this encoding:
   * - Each byte uses 7 bits for the actual value
   * - The most significant bit (MSB) indicates if more bytes follow (1) or not (0)
   * - Values are stored with the least significant bytes first
   *
   * @returns The decoded 32-bit unsigned integer
   * @throws If the encoding is invalid or exceeds 32 bits
   */
  function readVarUint32(): number {
    let value = 0;
    let shift = 0;
    while (true) {
      const byte = read(1)[0]; // Read a single byte from the buffer
      value |= (byte & 0x7f) << shift; // Extract 7 bits and shift to correct position
      if ((byte & 0x80) === 0) break; // If MSB is 0, we've reached the last byte
      if ((shift += 7) >= 32) throw new Error("Invalid WASM value"); // Ensure we don't exceed 32 bits
    }
    return value >>> 0; // Force conversion to unsigned 32-bit integer
  }
  // Validate header
  if ([...read(4)].join() !== "0,97,115,109")
    throw new Error("Invalid WASM magic");
  if ([...read(4)].join() !== "1,0,0,0")
    throw new Error("Invalid WASM version");

  while (offset < buffer.byteLength) {
    const sectionId = read(1)[0];
    const sectionLength = readVarUint32();
    const start = offset;

    if (sectionId === 0) {
      // Custom section
      const nameLen = readVarUint32();

      if (nameLen > 0 && offset + nameLen <= start + sectionLength) {
        const nameBytes = read(nameLen);
        const payload = read(sectionLength - (offset - start));

        try {
          const name = new TextDecoder("utf-8", { fatal: true }).decode(
            nameBytes,
          );
          if (payload.length > 0) {
            sections.set(name, (sections.get(name) || []).concat(payload));
          }
        } catch {
          /* Invalid UTF-8 */
        }
      }
    }
    // Always advance to end of section
    offset = start + sectionLength;
  }

  return sections;
}

/**
 * Reads a binary stream of ScSpecEntries into an array for processing by ContractSpec
 * @hidden
 */
export function processSpecEntryStream(buffer: Uint8Array) {
  return decodeStream(ScSpecEntry, buffer);
}

export async function getAccount<T>(
  options: AssembledTransactionOptions<T>,
  server: Server,
): Promise<Account> {
  return options.publicKey
    ? server.getAccount(options.publicKey)
    : new Account(NULL_ACCOUNT, "0");
}

// Same rule as `inspectAuthEntry`: `scvVoid` and an empty `scvVec` are unsigned.
const signaturePresent = (signature: ScVal): boolean =>
  signature.type === "scvVec"
    ? (signature.value ?? []).length > 0
    : signature.type !== "scvVoid";

const pendingAt = (
  address: ScAddress,
  signature: ScVal,
  delegates: SorobanDelegateSignature[],
  includeSigned: boolean,
): string[] => {
  if (!includeSigned && signaturePresent(signature)) return [];
  const self = Address.fromScAddress(address).toString();
  // On p27 (CAP-71 only) the built-in G… check ignores delegates, so a G…
  // node's delegates never count. CAP-72 changes this; revisit when it ships.
  if (address.type !== "scAddressTypeContract") return [self];
  return [
    self,
    ...delegates.flatMap((d) =>
      pendingAt(d.address, d.signature, d.nestedDelegates, includeSigned),
    ),
  ];
};

/**
 * Addresses in `credentials` whose signature is still empty, or with
 * `includeSigned` every address that may sign. An empty `C…` node is listed
 * even when its delegates have signed, since only its `__check_auth` knows
 * whether it needs its own signature. On p27 a `G…` node's delegates are not
 * listed, and a signed node's delegates are not checked unless
 * `includeSigned` is set. Source-account credentials return `[]`.
 * @hidden
 */
export function pendingSigners(
  credentials: SorobanCredentials,
  includeSigned = false,
): string[] {
  const addrAuth = getAddressCredentials(credentials);
  if (addrAuth === null) return [];
  const delegates =
    credentials.type === "sorobanCredentialsAddressWithDelegates"
      ? credentials.addressWithDelegates.delegates
      : [];
  return pendingAt(
    addrAuth.address,
    addrAuth.signature,
    delegates,
    includeSigned,
  );
}
