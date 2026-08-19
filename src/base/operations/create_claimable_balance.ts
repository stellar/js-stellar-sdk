import {
  Asset as XdrAsset,
  Claimant,
  ClaimPredicate,
  CreateClaimableBalanceOp,
  Int64,
  Operation,
  OperationBody,
} from "../../xdr/index.js";
import { Asset } from "../asset.js";
import { CreateClaimableBalanceOpts, OperationAttributes } from "./types.js";
import {
  constructAmountRequirementsError,
  isValidAmount,
  setSourceAccount,
  toXdrAmount,
} from "../util/operations.js";

/**
 * Deepest claim predicate stellar-core accepts. The root predicate is depth 1,
 * so three further levels of nesting fit underneath it.
 */
const MAX_PREDICATE_DEPTH = 4;

/**
 * Rejects predicates that stellar-core would reject.
 *
 * This mirrors `validatePredicate` in `CreateClaimableBalanceOpFrame.cpp`, which
 * bounds nesting depth, requires `and` and `or` to hold exactly two predicates,
 * requires `not` to hold one, and forbids negative times. Every one of those
 * failures reaches the submitter as a single `CREATE_CLAIMABLE_BALANCE_MALFORMED`
 * with no indication of which claimant or which predicate was at fault.
 */
function validateClaimPredicate(
  predicate: ClaimPredicate,
  depth: number,
): void {
  if (depth > MAX_PREDICATE_DEPTH) {
    throw new Error(
      `claim predicate is nested deeper than ${MAX_PREDICATE_DEPTH} levels`,
    );
  }

  switch (predicate.type) {
    case "claimPredicateUnconditional":
      return;

    case "claimPredicateAnd":
    case "claimPredicateOr": {
      const children =
        predicate.type === "claimPredicateAnd"
          ? predicate.andPredicates
          : predicate.orPredicates;

      if (children.length !== 2) {
        throw new Error(
          `${predicate.type} requires exactly two predicates, got ${children.length}`,
        );
      }

      children.forEach((child) => validateClaimPredicate(child, depth + 1));
      return;
    }

    case "claimPredicateNot":
      if (!predicate.notPredicate) {
        throw new Error("claimPredicateNot requires a predicate");
      }
      validateClaimPredicate(predicate.notPredicate, depth + 1);
      return;

    case "claimPredicateBeforeAbsoluteTime":
      if (predicate.absBefore < 0n) {
        throw new Error("absBefore must not be negative");
      }
      return;

    case "claimPredicateBeforeRelativeTime":
      if (predicate.relBefore < 0n) {
        throw new Error("relBefore must not be negative");
      }
      return;
  }
}

/**
 * Create a new claimable balance operation.
 *
 *
 * @param opts - Options object
 *   - `asset`: The asset for the claimable balance.
 *   - `amount`: Amount.
 *   - `claimants`: An array of Claimants
 *   - `source`: The source account for the operation. Defaults to the transaction's source account.
 *
 * @example
 * ```ts
 * const asset = new Asset(
 *   'USD',
 *   'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
 * );
 * const amount = '100.0000000';
 * const claimants = [
 *   new Claimant(
 *     'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
 *      Claimant.predicateBeforeAbsoluteTime("4102444800000")
 *   )
 * ];
 *
 * const op = Operation.createClaimableBalance({
 *   asset,
 *   amount,
 *   claimants
 * });
 * ```
 */
export function createClaimableBalance(
  opts: CreateClaimableBalanceOpts,
): Operation {
  if (!(opts.asset instanceof Asset)) {
    throw new Error(
      "must provide an asset for create claimable balance operation",
    );
  }

  if (!isValidAmount(opts.amount)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }

  if (!Array.isArray(opts.claimants) || opts.claimants.length === 0) {
    throw new Error("must provide at least one claimant");
  }

  const destinations = new Set<string>();
  opts.claimants.forEach((claimant) => {
    if (destinations.has(claimant.destination)) {
      throw new Error(
        `duplicate claimant destination: ${claimant.destination}`,
      );
    }
    destinations.add(claimant.destination);

    validateClaimPredicate(claimant.predicate, 1);
  });

  const asset: XdrAsset = opts.asset.toXdrObject();
  const amount: Int64 = toXdrAmount(opts.amount);
  const claimants: Claimant[] = opts.claimants.map((c) => c.toXdrObject());

  const createClaimableBalanceOp = new CreateClaimableBalanceOp({
    asset,
    amount,
    claimants,
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.createClaimableBalance(createClaimableBalanceOp),
  };

  setSourceAccount(opAttributes, opts);

  return new Operation(opAttributes);
}
