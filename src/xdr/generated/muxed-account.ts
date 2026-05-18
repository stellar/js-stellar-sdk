/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { opaque } from "../types/opaque.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { CryptoKeyType } from "./crypto-key-type.js";
import {
  MuxedAccountMed25519,
  type MuxedAccountMed25519Wire,
} from "./muxed-account-med25519.js";

export type MuxedAccountWire =
  | { type: 0; ed25519: Uint8Array }
  | { type: 256; med25519: MuxedAccountMed25519Wire };

export type MuxedAccountVariantName = "keyTypeEd25519" | "keyTypeMuxedEd25519";

/**
 * ```xdr
 * union MuxedAccount switch (CryptoKeyType type)
 * {
 * case KEY_TYPE_ED25519:
 *     uint256 ed25519;
 * case KEY_TYPE_MUXED_ED25519:
 *     struct
 *     {
 *         uint64 id;
 *         uint256 ed25519;
 *     } med25519;
 * };
 * ```
 */
abstract class MuxedAccountBase extends XdrValue {
  abstract readonly type: MuxedAccountVariantName;

  static readonly schema: XdrType<MuxedAccountWire> = union("MuxedAccount", {
    switchOn: CryptoKeyType.schema,
    cases: [
      case_("keyTypeEd25519", 0, field("ed25519", opaque(32))),
      case_(
        "keyTypeMuxedEd25519",
        256,
        field("med25519", MuxedAccountMed25519.schema),
      ),
    ],
  });

  static keyTypeEd25519(ed25519: Uint8Array): MuxedAccountEd25519 {
    return new MuxedAccountEd25519(ed25519);
  }

  static keyTypeMuxedEd25519(
    med25519: MuxedAccountMed25519,
  ): MuxedAccountMuxedEd25519 {
    return new MuxedAccountMuxedEd25519(med25519);
  }

  static fromXdrObject(wire: MuxedAccountWire): MuxedAccount {
    switch (wire.type) {
      case 0:
        return new MuxedAccountEd25519(wire.ed25519);
      case 256:
        return new MuxedAccountMuxedEd25519(
          MuxedAccountMed25519.fromXdrObject(wire.med25519),
        );
    }
  }

  abstract toXdrObject(): MuxedAccountWire;
}

export class MuxedAccountEd25519 extends MuxedAccountBase {
  readonly type = "keyTypeEd25519" as const;
  readonly ed25519: Uint8Array;

  constructor(ed25519: Uint8Array) {
    super();
    this.ed25519 = ed25519;
  }

  get value(): Uint8Array {
    return this.ed25519;
  }

  toXdrObject(): Extract<MuxedAccountWire, { type: 0 }> {
    return { type: 0, ed25519: this.ed25519 };
  }
}

export class MuxedAccountMuxedEd25519 extends MuxedAccountBase {
  readonly type = "keyTypeMuxedEd25519" as const;
  readonly med25519: MuxedAccountMed25519;

  constructor(med25519: MuxedAccountMed25519) {
    super();
    this.med25519 = med25519;
  }

  get value(): MuxedAccountMed25519 {
    return this.med25519;
  }

  toXdrObject(): Extract<MuxedAccountWire, { type: 256 }> {
    return { type: 256, med25519: this.med25519.toXdrObject() };
  }
}

export type MuxedAccount = MuxedAccountEd25519 | MuxedAccountMuxedEd25519;
export const MuxedAccount = MuxedAccountBase;
