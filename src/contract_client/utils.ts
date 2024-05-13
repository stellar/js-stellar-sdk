import { xdr, cereal } from "..";

/**
 * The default timeout for waiting for a transaction to be included in a block.
 */
export const DEFAULT_TIMEOUT = 5 * 60;

/**
 * Keep calling a `fn` for `timeoutInSeconds` seconds, if `keepWaitingIf` is true.
 * Returns an array of all attempts to call the function.
 */
export async function withExponentialBackoff<T>(
  fn: (previousFailure?: T) => Promise<T>,
  keepWaitingIf: (result: T) => boolean,
  timeoutInSeconds: number,
  exponentialFactor = 1.5,
  verbose = false
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
    count++;
    // Wait a beat
    if (verbose) {
      console.info(
        `Waiting ${waitTime}ms before trying again (bringing the total wait time to ${totalWaitTime}ms so far, of total ${
          timeoutInSeconds * 1000
        }ms)`
      );
    }
    await new Promise((res) => setTimeout(res, waitTime));
    // Exponential backoff
    waitTime = waitTime * exponentialFactor;
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
          2
        )}`
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
 * @{link AssembledTransaction} parse these errors.
 */
export const contractErrorPattern = /Error\(Contract, #(\d+)\)/;

/**
 * A TypeScript type guard that checks if an object has a `toString` method.
 */
export function implementsToString(obj: unknown): obj is { toString(): string } {
  return typeof obj === "object" && obj !== null && "toString" in obj;
}

/**
 * Reads a binary stream of ScSpecEntries into an array for processing by ContractSpec
 */
export function processSpecEntryStream(buffer: Buffer) {
  const reader = new cereal.XdrReader(buffer);
  const res: xdr.ScSpecEntry[] = [];
  while (!reader.eof){
    // @ts-ignore 
    res.push(xdr.ScSpecEntry.read(reader));
  }
  return res;
}
