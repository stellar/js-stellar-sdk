import { xdr, cereal, Account } from "@stellar/stellar-base";
import { Server } from "../rpc";
import { type AssembledTransaction } from "./assembled_transaction";
import {
  NULL_ACCOUNT,
  AssembledTransactionOptions,
  ClientOptions,
} from "./types";
import { Client } from "./client";
import { Spec } from "./spec";

export function fixDeprecatedClientOptions(
  options: Pick<AssembledTransactionOptions, "client" | keyof ClientOptions>,
): Client {
  if (options.client) return options.client; // all good
  console.warn("Deprecation warning: must initialize with a `client`"); // eslint-disable-line no-console
  return new Client(
    new Spec(["AAAAAAAAAAAAAAABeAAAAAAAAAAAAAAA"]), // dummy Spec for contract with one `x` method. Unused here! Don't worry!
    {
      contractId: options.contractId!,
      networkPassphrase: options.networkPassphrase!,
      rpcUrl: options.rpcUrl!,
      publicKey: options.publicKey,
      signTransaction: options.signTransaction,
      signAuthEntry: options.signAuthEntry,
      allowHttp: options.allowHttp,
      headers: options.headers,
      errorTypes: options.errorTypes,
      server: options.server,
    },
  );
}

/**
 * Keep calling a `fn` for `timeoutInSeconds` seconds, if `keepWaitingIf` is
 * true. Returns an array of all attempts to call the function.
 * @private
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
      // eslint-disable-next-line no-console
      console.info(
        `Waiting ${waitTime}ms before trying again (bringing the total wait time to ${totalWaitTime}ms so far, of total ${
          timeoutInSeconds * 1000
        }ms)`,
      );
    }
    // eslint-disable-next-line
    await new Promise((res) => setTimeout(res, waitTime));
    // Exponential backoff
    waitTime *= exponentialFactor;
    if (new Date(Date.now() + waitTime).valueOf() > waitUntil) {
      waitTime = waitUntil - Date.now();
      if (verbose) {
        // eslint-disable-next-line no-console
        console.info(`was gonna wait too long; new waitTime: ${waitTime}ms`);
      }
    }
    totalWaitTime = waitTime + totalWaitTime;
    // Try again
    // eslint-disable-next-line no-await-in-loop
    attempts.push(await fn(attempts[attempts.length - 1]));
    if (verbose && keepWaitingIf(attempts[attempts.length - 1])) {
      // eslint-disable-next-line no-console
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
 * @constant {RegExp}
 * @default "/Error\(Contract, #(\d+)\)/"
 * @memberof module:contract.Client
 */
export const contractErrorPattern = /Error\(Contract, #(\d+)\)/;

/**
 * A TypeScript type guard that checks if an object has a `toString` method.
 * @private
 */
export function implementsToString(
  /** some object that may or may not have a `toString` method */
  obj: unknown,
): obj is { toString(): string } {
  return typeof obj === "object" && obj !== null && "toString" in obj;
}

export async function specFromWasm(wasm: Buffer) {
  let xdrSections: ArrayBuffer[] | undefined;

  try {
    const wasmModule = await WebAssembly.compile(wasm);
    xdrSections = WebAssembly.Module.customSections(
      wasmModule,
      "contractspecv0",
    );
  } catch {
    const customData = parseWasmCustomSections(wasm);
    xdrSections = customData.get("contractspecv0");
  }

  if (!xdrSections || xdrSections.length === 0) {
    throw new Error("Could not obtain contract spec from wasm");
  }

  return Buffer.from(xdrSections[0]);
}

function parseWasmCustomSections(buffer: Buffer): Map<string, Uint8Array[]> {
  const sections = new Map<string, Uint8Array[]>();
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );

  let offset = 0;

  // Helper to read bytes with bounds checking
  const read = (length: number): Uint8Array => {
    if (offset + length > buffer.byteLength) throw new Error("Buffer overflow");
    const bytes = new Uint8Array(arrayBuffer, offset, length);
    offset += length;
    return bytes;
  };

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

      if (nameLen === 0 || offset + nameLen > start + sectionLength) continue;

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
    } else {
      offset += sectionLength; // Skip other sections
    }
  }

  /**
   * Decodes a variable-length encoded unsigned 32-bit integer (LEB128 format) from the WASM binary.
   *
   * This function implements the WebAssembly LEB128 (Little Endian Base 128) variable-length
   * encoding scheme for unsigned integers. In this encoding:
   * - Each byte uses 7 bits for the actual value
   * - The most significant bit (MSB) indicates if more bytes follow (1) or not (0)
   * - Values are stored with the least significant bytes first
   *
   * @returns {number} The decoded 32-bit unsigned integer
   * @throws {Error} If the encoding is invalid or exceeds 32 bits
   */
  function readVarUint32(): number {
    let value = 0,
      shift = 0;
    while (true) {
      const byte = read(1)[0]; // Read a single byte from the buffer
      value |= (byte & 0x7f) << shift; // Extract 7 bits and shift to correct position
      if ((byte & 0x80) === 0) break; // If MSB is 0, we've reached the last byte
      if ((shift += 7) >= 32) throw new Error("Invalid WASM value"); // Ensure we don't exceed 32 bits
    }
    return value >>> 0; // Force conversion to unsigned 32-bit integer
  }

  return sections;
}

/**
 * Reads a binary stream of ScSpecEntries into an array for processing by ContractSpec
 * @private
 */
export function processSpecEntryStream(buffer: Buffer) {
  const reader = new cereal.XdrReader(buffer);
  const res: xdr.ScSpecEntry[] = [];
  while (!reader.eof) {
    // @ts-ignore
    res.push(xdr.ScSpecEntry.read(reader));
  }
  return res;
}

//eslint-disable-next-line require-await
export async function getAccount<T>(
  options: AssembledTransactionOptions<T>,
  server: Server,
): Promise<Account> {
  return options.publicKey
    ? server.getAccount(options.publicKey)
    : new Account(NULL_ACCOUNT, "0");
}
