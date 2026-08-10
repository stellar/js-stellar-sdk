// Shared plumbing for the two corpus refreshers, `refresh-horizon-corpus.ts`
// and `refresh-rpc-corpus.ts`.
//
// The validation helpers exist because of a real incident: Horizon quietly
// stopped serving `result_meta_xdr`, the refresher wrote `undefined` into the
// fixture, and it surfaced much later as a wall of unreadable test failures.
// Anything a corpus depends on goes through these, so a field disappearing
// upstream fails at fetch time and names the field.
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

export interface CorpusFile<T> {
  source: string;
  fetchedAt: string;
  records: T[];
}

export function requireString(
  value: unknown,
  field: string,
  where: string,
): string {
  // Trimmed, so a whitespace-only value fails here rather than surviving into
  // the fixture and failing later at base64 decode. Internal whitespace is
  // left alone: `Buffer.from(x, "base64")` tolerates it, so wrapped base64 is
  // still legitimate.
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(
      `${where}: response has no \`${field}\`. The corpus needs it — check ` +
        `whether this endpoint still returns the field before refreshing.`,
    );
  }
  return value;
}

// `JSON.stringify` renders NaN and Infinity as `null`, which is the opposite of
// helpful in a diagnostic, so numbers are stringified directly.
function describe(value: unknown): string {
  return typeof value === "number" ? String(value) : JSON.stringify(value);
}

// Only used for ledger sequences, which are always positive integers — `0`,
// negatives and fractions all mean the response was not what we expected.
export function requireNumber(
  value: unknown,
  field: string,
  where: string,
): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new Error(
      `${where}: response has no positive integer \`${field}\` ` +
        `(got ${describe(value)}).`,
    );
  }
  return value;
}

// `COUNT` comes from the environment, so every malformed value has to fail
// here. It used to flow straight into `Number()`: `COUNT=abc` became `NaN`, the
// `records.length < COUNT` fetch loops never ran, an empty corpus was written,
// and the test file skipped every corpus describe on a zero exit code.
export function readCount(raw: string | undefined, fallback: number): number {
  const count = Number(raw ?? fallback);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(
      `COUNT must be a positive integer, got ${JSON.stringify(raw)}.`,
    );
  }
  return count;
}

export function writeCorpus<T>(
  outDir: string,
  filename: string,
  payload: CorpusFile<T>,
): void {
  // An empty corpus is never a legitimate refresh result, and writing one is
  // silently destructive: `corpus_round_trip.test.ts` skips a section whose
  // corpus has no records, so replacing a populated fixture with an empty one
  // converts real coverage into a green run. Refuse rather than overwrite.
  if (payload.records.length === 0) {
    throw new Error(
      `${filename}: refusing to write an empty corpus — the fetch returned no ` +
        `records, and an empty fixture would make the tests skip silently.`,
    );
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    resolve(outDir, filename),
    JSON.stringify(payload, null, 2) + "\n",
  );
}

export function reportCount(got: number, want: number, kind: string): void {
  console.log(`Wrote ${got} ${kind} records.`);
  if (got < want) {
    console.warn(`  ! wanted ${want}; only ${got} were available.`);
  }
}

// The corpus is only as good as its envelope-type spread, and that is the one
// thing a fetch cannot guarantee — print it so a lopsided sample is visible
// before it gets committed.
export function reportEnvelopeSpread(envelopesBase64: string[]): void {
  // EnvelopeType discriminants, per the XDR union.
  const names = new Map([
    [0, "envelopeTypeTxV0"],
    [2, "envelopeTypeTx"],
    [5, "envelopeTypeTxFeeBump"],
  ]);
  const counts = new Map<string, number>();
  for (const b64 of envelopesBase64) {
    const buf = Buffer.from(b64, "base64");
    // A truncated or non-base64 value carries no discriminant. Count it rather
    // than letting `readUInt32BE` throw a bare RangeError — this runs after the
    // fixture is already on disk, so aborting here would leave a written file
    // behind a failed run.
    if (buf.length < 4) {
      counts.set("unparseable", (counts.get("unparseable") ?? 0) + 1);
      continue;
    }
    // The discriminant is the first 4 bytes of the XDR union.
    const kind = buf.readUInt32BE(0);
    const name = names.get(kind) ?? `unknown(${kind})`;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const spread = [...counts]
    .sort((a, b) => b[1] - a[1])
    .map(([name, n]) => `${name}=${n}`)
    .join(", ");
  console.log(`  envelope spread: ${spread || "(none)"}`);
}
