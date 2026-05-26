/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { uint64 } from "../types/uint64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import { MemoType } from "./memo-type.js";
import { Hash, type HashWire } from "./hash.js";

export type MemoWire =
  | { type: 0 }
  | { type: 1; text: XdrString }
  | { type: 2; id: bigint }
  | { type: 3; hash: HashWire }
  | { type: 4; retHash: HashWire };

export type MemoVariantName =
  | "memoNone"
  | "memoText"
  | "memoId"
  | "memoHash"
  | "memoReturn";

/**
 * ```xdr
 * union Memo switch (MemoType type)
 * {
 * case MEMO_NONE:
 *     void;
 * case MEMO_TEXT:
 *     string text<28>;
 * case MEMO_ID:
 *     uint64 id;
 * case MEMO_HASH:
 *     Hash hash; // the hash of what to pull from the content server
 * case MEMO_RETURN:
 *     Hash retHash; // the hash of the tx you are rejecting
 * };
 * ```
 */
abstract class MemoBase extends XdrValue {
  abstract readonly type: MemoVariantName;

  static readonly schema: XdrType<MemoWire> = union("Memo", {
    switchOn: MemoType.schema,
    cases: [
      case_("memoNone", 0, voidType()),
      case_("memoText", 1, field("text", xdrString(28))),
      case_("memoId", 2, field("id", uint64())),
      case_("memoHash", 3, field("hash", Hash.schema)),
      case_("memoReturn", 4, field("retHash", Hash.schema)),
    ],
  });

  static memoNone(): MemoNone {
    return new MemoNone();
  }

  static memoText(text: XdrString | string | Uint8Array): MemoText {
    return new MemoText(text);
  }

  static memoId(id: bigint): MemoId {
    return new MemoId(id);
  }

  static memoHash(hash: Hash | Uint8Array | string): MemoHash {
    return new MemoHash(hash);
  }

  static memoReturn(retHash: Hash | Uint8Array | string): MemoReturn {
    return new MemoReturn(retHash);
  }

  static fromXdrObject(wire: MemoWire): Memo {
    switch (wire.type) {
      case 0:
        return new MemoNone();
      case 1:
        return new MemoText(wire.text);
      case 2:
        return new MemoId(wire.id);
      case 3:
        return new MemoHash(Hash.fromXdrObject(wire.hash));
      case 4:
        return new MemoReturn(Hash.fromXdrObject(wire.retHash));
    }
  }

  abstract toXdrObject(): MemoWire;
}

export class MemoNone extends MemoBase {
  readonly type = "memoNone" as const;

  toXdrObject(): Extract<MemoWire, { type: 0 }> {
    return { type: 0 };
  }
}

export class MemoText extends MemoBase {
  readonly type = "memoText" as const;
  readonly text: XdrString;

  constructor(text: XdrString | string | Uint8Array) {
    super();
    this.text = text instanceof XdrString ? text : new XdrString(text);
  }

  get value(): string {
    return this.text.toString();
  }

  toXdrObject(): Extract<MemoWire, { type: 1 }> {
    return { type: 1, text: this.text };
  }
}

export class MemoId extends MemoBase {
  readonly type = "memoId" as const;
  readonly id: bigint;

  constructor(id: bigint) {
    super();
    this.id = id;
  }

  get value(): bigint {
    return this.id;
  }

  toXdrObject(): Extract<MemoWire, { type: 2 }> {
    return { type: 2, id: this.id };
  }
}

export class MemoHash extends MemoBase {
  readonly type = "memoHash" as const;
  readonly hash: Hash;

  constructor(hash: Hash | Uint8Array | string) {
    super();
    this.hash = hash instanceof Hash ? hash : new Hash(hash);
  }

  get value(): Hash {
    return this.hash;
  }

  toXdrObject(): Extract<MemoWire, { type: 3 }> {
    return { type: 3, hash: this.hash.toXdrObject() };
  }
}

export class MemoReturn extends MemoBase {
  readonly type = "memoReturn" as const;
  readonly retHash: Hash;

  constructor(retHash: Hash | Uint8Array | string) {
    super();
    this.retHash = retHash instanceof Hash ? retHash : new Hash(retHash);
  }

  get value(): Hash {
    return this.retHash;
  }

  toXdrObject(): Extract<MemoWire, { type: 4 }> {
    return { type: 4, retHash: this.retHash.toXdrObject() };
  }
}

export type Memo = MemoNone | MemoText | MemoId | MemoHash | MemoReturn;
export const Memo = MemoBase;
