import { xdr, cereal, Account } from "@stellar/stellar-base";
import { Server } from "../rpc";
import { type AssembledTransaction } from "./assembled_transaction";
import { NULL_ACCOUNT , AssembledTransactionOptions } from "./types";

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
  server: Server
): Promise<Account> {
  return options.publicKey
    ? server.getAccount(options.publicKey)
    : new Account(NULL_ACCOUNT, "0");
}
