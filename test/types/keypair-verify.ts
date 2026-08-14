// Compile-time regression test for issue #1639: `Keypair.verify` and
// `verifyMessage` must accept the `xdr.Signature` wrapper that
// `DecoratedSignature.signature` actually holds, not just raw bytes. The
// parameter was once `Uint8Array`, so `kp.verify(tx.hash(), sig.signature)`
// did not compile — and at runtime the same call silently returned `false`,
// reporting a valid signature as a forgery. This file only has to typecheck;
// it never runs.
//
// The negative cases matter as much as the positive ones: widening the
// parameter must not widen it to *any* byte wrapper. `Signature` and `Hash`
// are distinct only because the XDR type name is a type parameter
// (`BytesValue<"Signature">` vs `BytesValue<"Hash">`); were they plain
// structural siblings, the wrong wrapper would compile and fail at runtime.

import type {
  DecoratedSignature,
  Hash,
  Signature,
} from "../../src/xdr/index.js";
import type { Keypair } from "../../src/base/keypair.js";

declare const kp: Keypair;
declare const bytes: Uint8Array;
declare const buffer: Buffer;
declare const signature: Signature;
declare const decorated: DecoratedSignature;
declare const hash: Hash;
declare const message: string;

export const compiles: boolean[] = [
  // Raw bytes, the shape that always worked.
  kp.verify(bytes, bytes),
  // `Buffer` is a `Uint8Array` subclass and is what Node callers still pass.
  kp.verify(bytes, buffer),
  // The wrapper, named directly.
  kp.verify(bytes, signature),
  // The real-world shape that surfaced the issue: reading the field off a
  // decorated signature, with no annotation to help it along.
  kp.verify(bytes, decorated.signature),

  // `verifyMessage` takes the same union, over both message forms.
  kp.verifyMessage(message, signature),
  kp.verifyMessage(message, bytes),
  kp.verifyMessage(bytes, decorated.signature),
];

// Each of these must be a type error. `@ts-expect-error` fails the build if
// the line it guards ever starts compiling, so these lock the boundary.

// @ts-expect-error a Hash is a byte wrapper, but it is not a signature
export const rejectsHash: boolean = kp.verify(bytes, hash);

// @ts-expect-error the whole struct, not the `signature` field on it
export const rejectsDecoratedSignature: boolean = kp.verify(bytes, decorated);

// @ts-expect-error a base64/hex string is the most common wrong input
export const rejectsString: boolean = kp.verify(bytes, "deadbeef");

// @ts-expect-error `data` was not widened, only `signature`
export const rejectsWrapperAsData: boolean = kp.verify(signature, bytes);

export const rejectsHashAsMessageSignature: boolean = kp.verifyMessage(
  message,
  // @ts-expect-error `verifyMessage` inherits the same signature bound
  hash,
);
