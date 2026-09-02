import {
  Claimant as XdrClaimant,
  ClaimantV0,
  ClaimPredicate,
  Int64,
} from "../xdr/index.js";
import { Keypair } from "./keypair.js";
import { StrKey } from "./strkey.js";

/**
 * A claim predicate in Horizon's JSON dialect (Go's `claimPredicateJSON`).
 *
 * Not the SEP-0051 dialect RPC serves: `abs_before` is ISO-8601 here, where
 * SEP-0051's `before_absolute_time` is epoch seconds.
 */
export interface HorizonPredicateJson {
  and?: HorizonPredicateJson[];
  or?: HorizonPredicateJson[];
  not?: HorizonPredicateJson;
  unconditional?: boolean;
  abs_before?: string;
  abs_before_epoch?: string;
  rel_before?: string;
}

const HORIZON_PREDICATE_KEYS = [
  "and",
  "or",
  "not",
  "unconditional",
  "abs_before",
  "abs_before_epoch",
  "rel_before",
] as const;

/** stellar-core rejects `depth > 4`, counting the top-level predicate as 1. */
const MAX_PREDICATE_DEPTH = 4;

function tooDeep(): Error {
  return new Error(
    `claim predicate is nested more than ${MAX_PREDICATE_DEPTH} levels deep`,
  );
}

/** For messages: `JSON.stringify` throws on the bigints int64 invites. */
function describeValue(value: unknown): string {
  switch (typeof value) {
    case "bigint":
      return `${value}n`;
    case "string":
      return JSON.stringify(value);
    case "object":
      return value === null
        ? "null"
        : Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
    default:
      return String(value);
  }
}

/** `Int64.fromString` coerces: `""` is 0 and `"  12"` is 12. */
function toNonNegativeInt64(value: unknown, field: string): Int64 {
  if (typeof value !== "string" || !/^-?\d+$/.test(value)) {
    throw new Error(
      `${field} must be a decimal integer string, got ${describeValue(value)}`,
    );
  }
  const seconds = BigInt(value);
  if (seconds < 0n) {
    throw new Error(`${field} must not be negative, got ${value}`);
  }
  const int64 = Int64.fromString(value);
  if (BigInt(int64.toString()) !== seconds) {
    throw new Error(`${field} ${value} did not survive conversion to int64`);
  }
  return int64;
}

/**
 * Horizon's `abs_before`: RFC 3339, no fractional seconds, and past year 9999
 * a "+" with an *unpadded* year — `toISOString` pads it to 6 digits.
 * `undefined` past the JS Date range, where no ISO form exists.
 */
function epochToIso(seconds: bigint): string | undefined {
  try {
    return new Date(Number(seconds) * 1000)
      .toISOString()
      .replace(/\.\d{3}Z$/, "Z")
      .replace(/^\+0*(\d{5,})/, "+$1");
  } catch {
    return undefined;
  }
}

/** Guards `BigInt`, which throws a raw `SyntaxError` on a non-integer. */
function toSeconds(value: unknown, field: string): bigint {
  if (value == null) {
    throw new Error(`${field} is missing from the predicate`);
  }
  const text = String(value);
  if (!/^-?\d+$/.test(text)) {
    throw new Error(`${field} must be an integer, got ${describeValue(value)}`);
  }
  const seconds = BigInt(text);
  if (seconds < 0n) {
    throw new Error(`${field} must not be negative, got ${seconds}`);
  }
  return seconds;
}

/**
 * The offset is mandatory: `Date.parse` reads an offset-less timestamp in the
 * host timezone, so the same JSON would mean different instants per machine.
 * Go rejects those too, parsing with `time.RFC3339`.
 */
const ISO_8601 =
  /^([+-]\d{4,}|\d{4})(-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))$/;

function isoToEpoch(iso: unknown): string {
  const match = typeof iso === "string" ? ISO_8601.exec(iso) : null;
  if (!match) {
    throw new Error(
      `abs_before must be an ISO-8601 timestamp with a timezone, got ` +
        `${describeValue(iso)}`,
    );
  }
  // `text` is the whole match, so it equals `iso` — and unlike `iso` it is
  // typed as a string, since the narrowing above does not carry through.
  const [text, year, rest] = match;
  // Go leaves an expanded year unpadded; Date.parse wants exactly 6 digits.
  const milliseconds = Date.parse(
    /^[+-]/.test(year)
      ? `${year[0]}${year.slice(1).padStart(6, "0")}${rest}`
      : text,
  );
  if (Number.isNaN(milliseconds)) {
    throw new Error(
      `abs_before ${describeValue(iso)} is not a representable date; ` +
        `pass abs_before_epoch instead`,
    );
  }
  // The XDR field is int64 seconds, so any fractional part truncates.
  return String(Math.floor(milliseconds / 1000));
}

/**
 * Claimant class represents an xdr.Claimant
 *
 * The claim predicate is optional, it defaults to unconditional if none is specified.
 *
 * ### JSON dialects
 *
 * Two dialects describe the same predicate — pick by where the JSON came from:
 *
 * - **SEP-0051**, served by RPC and canonical: `xdr.ClaimPredicate.fromJson()`
 *   and `predicate.toJson()`. Prefer this.
 * - **Horizon's**: {@link Claimant.predicateFromHorizonJson} and
 *   {@link Claimant.predicateToHorizonJson}.
 *
 * ```ts
 * { not: { before_absolute_time: "1788443399" } }              // SEP-0051
 * { not: { abs_before: "2026-09-03T13:49:59Z",                 // Horizon
 *          abs_before_epoch: "1788443399" } }
 * ```
 *
 * Both collapse to the same XDR before signing, so the choice never affects
 * submission.
 */
export class Claimant {
  private _destination: string;
  private _predicate: ClaimPredicate;

  /**
   * @param destination - The destination account ID.
   * @param predicate - The claim predicate.
   */
  constructor(destination: string, predicate?: ClaimPredicate) {
    if (!StrKey.isValidEd25519PublicKey(destination)) {
      throw new Error("Destination is invalid");
    }
    this._destination = destination;

    if (!predicate) {
      this._predicate = ClaimPredicate.claimPredicateUnconditional();
    } else if (predicate instanceof ClaimPredicate) {
      this._predicate = predicate;
    } else {
      throw new Error("Predicate should be an xdr.ClaimPredicate");
    }
  }

  /**
   * Returns an unconditional claim predicate
   */
  static predicateUnconditional(): ClaimPredicate {
    return ClaimPredicate.claimPredicateUnconditional();
  }

  /**
   * Returns an `and` claim predicate
   * @param left - an xdr.ClaimPredicate
   * @param right - an xdr.ClaimPredicate
   */
  static predicateAnd(
    left: ClaimPredicate,
    right: ClaimPredicate,
  ): ClaimPredicate {
    if (!(left instanceof ClaimPredicate)) {
      throw new Error("left Predicate should be an xdr.ClaimPredicate");
    }
    if (!(right instanceof ClaimPredicate)) {
      throw new Error("right Predicate should be an xdr.ClaimPredicate");
    }

    return ClaimPredicate.claimPredicateAnd([left, right]);
  }

  /**
   * Returns an `or` claim predicate
   * @param left - an xdr.ClaimPredicate
   * @param right - an xdr.ClaimPredicate
   */
  static predicateOr(
    left: ClaimPredicate,
    right: ClaimPredicate,
  ): ClaimPredicate {
    if (!(left instanceof ClaimPredicate)) {
      throw new Error("left Predicate should be an xdr.ClaimPredicate");
    }
    if (!(right instanceof ClaimPredicate)) {
      throw new Error("right Predicate should be an xdr.ClaimPredicate");
    }

    return ClaimPredicate.claimPredicateOr([left, right]);
  }

  /**
   * Returns a `not` claim predicate
   * @param predicate - an xdr.ClaimPredicate
   */
  static predicateNot(predicate: ClaimPredicate): ClaimPredicate {
    if (!(predicate instanceof ClaimPredicate)) {
      throw new Error("Predicate should be an xdr.ClaimPredicate");
    }

    return ClaimPredicate.claimPredicateNot(predicate);
  }

  /**
   * Returns a `BeforeAbsoluteTime` claim predicate
   *
   * This predicate will be fulfilled if the closing time of the ledger that
   * includes the CreateClaimableBalance operation is less than this (absolute)
   * Unix timestamp (expressed in seconds).
   *
   * @param absBefore - Unix epoch (in seconds) as a string
   */
  static predicateBeforeAbsoluteTime(absBefore: string): ClaimPredicate {
    return ClaimPredicate.claimPredicateBeforeAbsoluteTime(
      Int64.fromString(absBefore),
    );
  }

  /**
   * Returns a `BeforeRelativeTime` claim predicate
   *
   * This predicate will be fulfilled if the closing time of the ledger that
   * includes the CreateClaimableBalance operation plus this relative time delta
   * (in seconds) is less than the current time.
   *
   * @param seconds - seconds since closeTime of the ledger in which the ClaimableBalanceEntry was created (as string)
   */
  static predicateBeforeRelativeTime(seconds: string): ClaimPredicate {
    return ClaimPredicate.claimPredicateBeforeRelativeTime(
      Int64.fromString(seconds),
    );
  }

  /**
   * Builds a claim predicate from Horizon's JSON dialect.
   *
   * Horizon's dialect only — for SEP-0051, which RPC serves, call
   * `xdr.ClaimPredicate.fromJson(json)` instead.
   *
   * Stricter than Horizon's marshaller: it enforces stellar-core's submission
   * rules (`and`/`or` of exactly 2, at most 4 levels deep, non-negative times)
   * and refuses an object matching no known key, which would otherwise read as
   * unconditional and fail open.
   *
   * `abs_before` needs an explicit timezone, as Horizon always sends one:
   * without it `Date.parse` resolves in the host timezone.
   *
   * @param json - a claim predicate as Horizon serves it
   * @returns the equivalent `xdr.ClaimPredicate`
   * @throws an `Error` when the object is malformed, or stellar-core would
   * reject the predicate it describes
   *
   * @example
   * ```ts
   * const predicate = Claimant.predicateFromHorizonJson({
   *   not: { abs_before: "2026-09-03T13:49:59Z", abs_before_epoch: "1788443399" }
   * });
   * ```
   */
  static predicateFromHorizonJson(json: HorizonPredicateJson): ClaimPredicate {
    return Claimant.horizonJsonToPredicate(json, 1);
  }

  private static horizonJsonToPredicate(
    json: HorizonPredicateJson,
    depth: number,
  ): ClaimPredicate {
    if (depth > MAX_PREDICATE_DEPTH) {
      throw tooDeep();
    }
    if (json === null || typeof json !== "object" || Array.isArray(json)) {
      throw new Error(
        `claim predicate must be an object, got ${describeValue(json)}`,
      );
    }

    // Go's field is a bool with `omitempty`, so `false` and absent are alike.
    const present = HORIZON_PREDICATE_KEYS.filter((key) =>
      key === "unconditional"
        ? json.unconditional === true
        : json[key] !== undefined,
    );
    const unknown = Object.keys(json).filter(
      (key) => !(HORIZON_PREDICATE_KEYS as readonly string[]).includes(key),
    );
    // Horizon always sends this pair together; it is the one legal combination.
    const isTimePair =
      present.length === 2 &&
      present.includes("abs_before") &&
      present.includes("abs_before_epoch");
    if (
      unknown.length > 0 ||
      present.length === 0 ||
      (present.length > 1 && !isTimePair)
    ) {
      throw new Error(
        `claim predicate must have exactly one of: ` +
          `${HORIZON_PREDICATE_KEYS.join(", ")}`,
      );
    }

    if (json.unconditional === true) {
      return ClaimPredicate.claimPredicateUnconditional();
    }
    if (json.not !== undefined) {
      if (json.not === null) {
        throw new Error("not must have a sub-predicate");
      }
      return ClaimPredicate.claimPredicateNot(
        Claimant.horizonJsonToPredicate(json.not, depth + 1),
      );
    }
    if (json.and !== undefined) {
      return ClaimPredicate.claimPredicateAnd(
        Claimant.horizonSubPredicates(json.and, "and", depth),
      );
    }
    if (json.or !== undefined) {
      return ClaimPredicate.claimPredicateOr(
        Claimant.horizonSubPredicates(json.or, "or", depth),
      );
    }
    // Prefer the epoch field: an ISO timestamp through `Date` can lose range.
    if (json.abs_before_epoch !== undefined) {
      return ClaimPredicate.claimPredicateBeforeAbsoluteTime(
        toNonNegativeInt64(json.abs_before_epoch, "abs_before_epoch"),
      );
    }
    if (json.abs_before !== undefined) {
      return ClaimPredicate.claimPredicateBeforeAbsoluteTime(
        toNonNegativeInt64(isoToEpoch(json.abs_before), "abs_before"),
      );
    }
    return ClaimPredicate.claimPredicateBeforeRelativeTime(
      toNonNegativeInt64(json.rel_before, "rel_before"),
    );
  }

  private static horizonSubPredicates(
    list: HorizonPredicateJson[],
    name: "and" | "or",
    depth: number,
  ): ClaimPredicate[] {
    if (!Array.isArray(list)) {
      throw new Error(
        `${name} must be an array of 2 sub-predicates, got ${describeValue(list)}`,
      );
    }
    if (list.length !== 2) {
      throw new Error(
        `${name} must have exactly 2 sub-predicates, got ${list.length}`,
      );
    }
    return list.map((sub) => Claimant.horizonJsonToPredicate(sub, depth + 1));
  }

  /**
   * Renders a claim predicate in Horizon's JSON dialect.
   *
   * For SEP-0051, which RPC serves, call `predicate.toJson()` instead.
   *
   * Enforces the same stellar-core rules as
   * {@link Claimant.predicateFromHorizonJson}, since a predicate built through
   * the `xdr` factories can violate any of them.
   *
   * @param predicate - the predicate to render
   * @returns the predicate in Horizon's dialect; absolute times carry both
   * `abs_before` and `abs_before_epoch` as Horizon sends them, or the epoch
   * alone when the time is past the JS `Date` range
   * @throws an `Error` when stellar-core would reject the predicate
   */
  static predicateToHorizonJson(
    predicate: ClaimPredicate,
  ): HorizonPredicateJson {
    return Claimant.predicateToHorizonJsonAt(predicate, 1);
  }

  private static predicateToHorizonJsonAt(
    predicate: ClaimPredicate,
    depth: number,
  ): HorizonPredicateJson {
    if (depth > MAX_PREDICATE_DEPTH) {
      throw tooDeep();
    }
    // Structural, not `instanceof`: the CJS and ESM builds carry distinct class
    // objects, so a valid predicate crossing between them fails a nominal
    // check. Each arm below validates the member it reads.
    if (
      predicate == null ||
      typeof (predicate as ClaimPredicate).type !== "string"
    ) {
      throw new Error("Predicate should be an xdr.ClaimPredicate");
    }

    switch (predicate.type) {
      case "claimPredicateUnconditional":
        return { unconditional: true };

      case "claimPredicateNot": {
        const inner = predicate.notPredicate;
        if (inner == null) {
          throw new Error("not must have a sub-predicate");
        }
        return { not: Claimant.predicateToHorizonJsonAt(inner, depth + 1) };
      }

      case "claimPredicateAnd":
        return {
          and: Claimant.subPredicatesToHorizonJson(
            predicate.andPredicates,
            "and",
            depth,
          ),
        };

      case "claimPredicateOr":
        return {
          or: Claimant.subPredicatesToHorizonJson(
            predicate.orPredicates,
            "or",
            depth,
          ),
        };

      case "claimPredicateBeforeAbsoluteTime": {
        const seconds = toSeconds(predicate.absBefore, "abs_before_epoch");
        const iso = epochToIso(seconds);
        // Horizon sends both, but core accepts times the JS Date range cannot
        // express, and dropping `abs_before` beats refusing to render.
        return iso === undefined
          ? { abs_before_epoch: seconds.toString() }
          : { abs_before: iso, abs_before_epoch: seconds.toString() };
      }

      case "claimPredicateBeforeRelativeTime":
        return {
          rel_before: toSeconds(predicate.relBefore, "rel_before").toString(),
        };

      default:
        throw new Error(
          `Invalid claim predicate type: ${(predicate as ClaimPredicate).type}`,
        );
    }
  }

  private static subPredicatesToHorizonJson(
    list: readonly ClaimPredicate[],
    name: "and" | "or",
    depth: number,
  ): HorizonPredicateJson[] {
    if (!Array.isArray(list)) {
      // Duck-typed input reaches here; raise our error, not a TypeError.
      throw new Error(
        `${name} must be an array of 2 sub-predicates, got ${describeValue(list)}`,
      );
    }
    if (list.length !== 2) {
      throw new Error(
        `${name} must have exactly 2 sub-predicates, got ${list.length}`,
      );
    }
    return list.map((sub) => Claimant.predicateToHorizonJsonAt(sub, depth + 1));
  }

  /**
   * Returns a claimant object from its XDR object representation.
   * @param claimantXdr - The claimant xdr object.
   */
  static fromXdr(claimantXdr: XdrClaimant): Claimant {
    let value;
    switch (claimantXdr.type) {
      case "claimantTypeV0":
        value = claimantXdr.value;
        return new this(
          StrKey.encodeEd25519PublicKey(value.destination.value.toBytes()),
          value.predicate,
        );
      default:
        throw new Error(`Invalid claimant type: ${claimantXdr.type}`);
    }
  }

  /**
   * @deprecated Use {@link Claimant.fromXdr} instead.
   * Deprecated in version v17.0.0
   */
  static fromXDR(claimantXdr: XdrClaimant): Claimant {
    return Claimant.fromXdr(claimantXdr);
  }

  /**
   * Returns the xdr object for this claimant.
   */
  toXdrObject(): XdrClaimant {
    const claimant = new ClaimantV0({
      destination: Keypair.fromPublicKey(this._destination).xdrAccountId(),
      predicate: this._predicate,
    });

    return XdrClaimant.claimantTypeV0(claimant);
  }

  /**
   * @deprecated Use {@link toXdrObject} instead.
   * Deprecated in version v17.0.0
   */
  toXDRObject(): XdrClaimant {
    return this.toXdrObject();
  }

  /**
   * The destination account ID.
   */
  get destination() {
    return this._destination;
  }

  set destination(_value: string) {
    throw new Error("Claimant is immutable");
  }

  /**
   * The claim predicate.
   */
  get predicate() {
    return this._predicate;
  }

  set predicate(_value: ClaimPredicate) {
    throw new Error("Claimant is immutable");
  }
}
