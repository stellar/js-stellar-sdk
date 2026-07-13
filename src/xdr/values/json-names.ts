// Canonical SEP-0051 JSON naming rules for the XDR↔JSON walker.
//
// These mirror the reference Rust `stellar-xdr` crate exactly: xdrgen derives a
// variant/field identifier for each XDR element, and serde renders it with
// `rename_all = "snake_case"`. The rules below reproduce that:
//
//   - struct field  → snake_case(field name)
//   - enum member   → snake_case(member name minus the xdrgen `member_prefix`,
//                     which is carried on the schema as `memberPrefix` because
//                     the camelCase member name has lost that boundary)
//   - union case    → the discriminant enum member's name for enum-switched
//                     unions; `v<discriminant>` for int-switched (ext/version)
//                     unions; snake_case(arm name) otherwise
//
// SEP-0051 is a Stellar concept, so these live in the value layer — the generic
// `types/` schema builders stay agnostic. Types whose JSON is a custom scalar
// (StrKey addresses, asset codes, wide-int decimals, …) are handled separately
// by the per-type overrides in `to-json.ts`, not here.

/** A bidirectional map between source (member/arm) names and JSON names. */
export interface JsonNameMap {
  readonly bySource: ReadonlyMap<string, string>;
  readonly byJson: ReadonlyMap<string, string>;
}

/** camelCase / acronym boundaries → snake_case. */
function snakeCase(input: string): string {
  // Insert `_` between a lowercase/digit and an uppercase letter (camel
  // boundary), and between consecutive uppercase letters that are followed
  // by a lowercase letter (acronym boundary, e.g. `XMLParser` → `xml_parser`).
  let out = "";
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const prev = i > 0 ? input[i - 1] : "";
    const next = i + 1 < input.length ? input[i + 1] : "";
    const isCamelBoundary =
      isUpperAscii(ch) && (isLowerAscii(prev) || isDigitAscii(prev));
    const isAcronymBoundary =
      isUpperAscii(ch) && isUpperAscii(prev) && isLowerAscii(next);
    if (i > 0 && (isCamelBoundary || isAcronymBoundary)) out += "_";
    out += ch.toLowerCase();
  }
  return out;
}

// Rust keywords xdrgen-rust escapes with a trailing `_` when an XDR field name
// collides; serde then keeps the escaped form. `type` is the one that occurs in
// the Stellar XDR (ContractEvent, the SC-spec structs, …).
const RUST_KEYWORD_FIELDS = new Set([
  "type",
  "ref",
  "move",
  "box",
  "self",
  "match",
  "loop",
  "fn",
  "mod",
  "in",
  "as",
]);

/** Struct field → its SEP-0051 JSON key. */
export function structFieldJsonName(field: string): string {
  const name = snakeCase(field);
  return RUST_KEYWORD_FIELDS.has(name) ? `${name}_` : name;
}

// Name maps are derived purely from the (immutable) schema, and the walker
// asks for them on every enum/union node it visits — memoize per schema so
// large values (transaction metas) don't rebuild the same maps repeatedly.
const ENUM_NAME_CACHE = new WeakMap<object, JsonNameMap>();
const UNION_NAME_CACHE = new WeakMap<object, JsonNameMap>();

/**
 * Canonical JSON names for an enum's members. Strips the enum's camelized
 * `member_prefix` (attached as `memberPrefix` for enums with one, e.g.
 * `scvBool` − `scv` → `bool`) when present, then `snake_case`s. Enums without a
 * prefix just `snake_case` the member name (`createAccount` → `create_account`).
 */
export function enumJsonNames(
  memberPrefix: string | undefined,
  nameByValue: ReadonlyMap<number, string>,
): JsonNameMap {
  const cached = ENUM_NAME_CACHE.get(nameByValue);
  if (cached) return cached;
  const bySource = new Map<string, string>();
  const byJson = new Map<string, string>();
  for (const member of nameByValue.values()) {
    const stripped =
      memberPrefix && member.startsWith(memberPrefix)
        ? member.slice(memberPrefix.length)
        : member;
    const jsonName = snakeCase(stripped);
    bySource.set(member, jsonName);
    byJson.set(jsonName, member);
  }
  const result = { bySource, byJson };
  ENUM_NAME_CACHE.set(nameByValue, result);
  return result;
}

interface UnionView {
  readonly switchOn: unknown;
  readonly cases: ReadonlyArray<{
    readonly name: string;
    readonly discriminant: unknown;
  }>;
}

/**
 * Union JSON keys, mapped by the union's *arm* name (the rest of the walker
 * keys off that). For enum-switched unions the canonical key is the
 * discriminant enum member's name (NOT the arm name) — e.g. `OperationBody`'s
 * `createClaimableBalance` arm renders as `create_claimable_balance` (from
 * `OperationType`), and `tx`/`op` prefixes survive (`tx_success`).
 * Int-switched ext/version unions use `v<discriminant>` (`v0`/`v1`).
 */
export function unionCaseNames(schema: UnionView): JsonNameMap {
  const cached = UNION_NAME_CACHE.get(schema);
  if (cached) return cached;
  const result = buildUnionCaseNames(schema);
  UNION_NAME_CACHE.set(schema, result);
  return result;
}

function buildUnionCaseNames(schema: UnionView): JsonNameMap {
  const switchOn = schema.switchOn as {
    kind: string;
    nameByValue?: ReadonlyMap<number, string>;
    memberPrefix?: string;
  };
  const bySource = new Map<string, string>();
  const byJson = new Map<string, string>();

  if (switchOn.kind === "enum" && switchOn.nameByValue) {
    const enumNames = enumJsonNames(
      switchOn.memberPrefix,
      switchOn.nameByValue,
    );
    for (const c of schema.cases) {
      const member = switchOn.nameByValue.get(c.discriminant as number);
      const jsonName =
        (member && enumNames.bySource.get(member)) ?? snakeCase(c.name);
      bySource.set(c.name, jsonName);
      byJson.set(jsonName, c.name);
    }
    return { bySource, byJson };
  }

  if (switchOn.kind === "int32" || switchOn.kind === "uint32") {
    // ext/version unions: `union switch (int v) { case 0: …; case 1: … }`.
    for (const c of schema.cases) {
      const jsonName =
        typeof c.discriminant === "number"
          ? `v${c.discriminant}`
          : snakeCase(c.name);
      bySource.set(c.name, jsonName);
      byJson.set(jsonName, c.name);
    }
    return { bySource, byJson };
  }

  for (const c of schema.cases) {
    const jsonName = snakeCase(c.name);
    bySource.set(c.name, jsonName);
    byJson.set(jsonName, c.name);
  }
  return { bySource, byJson };
}

function isLowerAscii(ch: string): boolean {
  return ch >= "a" && ch <= "z";
}

function isUpperAscii(ch: string): boolean {
  return ch >= "A" && ch <= "Z";
}

function isDigitAscii(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}
