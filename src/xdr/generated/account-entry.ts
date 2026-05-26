import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import { uint32 } from "../types/uint32.js";
import { option } from "../types/option.js";
import { string as string_ } from "../types/string.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { Thresholds, type ThresholdsWire } from "./thresholds.js";
import { Signer, type SignerWire } from "./signer.js";
import {
  AccountEntryExt,
  type AccountEntryExtWire,
} from "./account-entry-ext.js";

export interface AccountEntryWire {
  accountId: PublicKeyWire;
  balance: bigint;
  seqNum: bigint;
  numSubEntries: number;
  inflationDest: PublicKeyWire | null;
  flags: number;
  homeDomain: string;
  thresholds: ThresholdsWire;
  signers: SignerWire[];
  ext: AccountEntryExtWire;
}

/**
 * ```xdr
 * struct AccountEntry
 * {
 *     AccountID accountID;      // master public key for this account
 *     int64 balance;            // in stroops
 *     SequenceNumber seqNum;    // last sequence number used for this account
 *     uint32 numSubEntries;     // number of sub-entries this account has
 *                               // drives the reserve
 *     AccountID* inflationDest; // Account to vote for during inflation
 *     uint32 flags;             // see AccountFlags
 *
 *     string32 homeDomain; // can be used for reverse federation and memo lookup
 *
 *     // fields used for signatures
 *     // thresholds stores unsigned bytes: [weight of master|low|medium|high]
 *     Thresholds thresholds;
 *
 *     Signer signers<MAX_SIGNERS>; // possible signers for this account
 *
 *     // reserved for future use
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         AccountEntryExtensionV1 v1;
 *     }
 *     ext;
 * };
 * ```
 */
export class AccountEntry extends XdrValue {
  readonly accountId: PublicKey;
  readonly balance: bigint;
  readonly seqNum: bigint;
  readonly numSubEntries: number;
  readonly inflationDest: PublicKey | null;
  readonly flags: number;
  readonly homeDomain: string;
  readonly thresholds: Thresholds;
  readonly signers: Signer[];
  readonly ext: AccountEntryExt;

  static readonly schema: XdrType<AccountEntryWire> = struct("AccountEntry", {
    accountId: PublicKey.schema,
    balance: int64(),
    seqNum: int64(),
    numSubEntries: uint32(),
    inflationDest: option(PublicKey.schema),
    flags: uint32(),
    homeDomain: string_(32),
    thresholds: Thresholds.schema,
    signers: array(Signer.schema, UNBOUNDED_MAX_LENGTH),
    ext: AccountEntryExt.schema,
  });

  constructor(input: {
    accountId: PublicKey;
    balance: bigint;
    seqNum: bigint;
    numSubEntries: number;
    inflationDest: PublicKey | null;
    flags: number;
    homeDomain: Uint8Array | string;
    thresholds: Thresholds | Uint8Array | string;
    signers: Signer[];
    ext: AccountEntryExt;
  }) {
    super();
    this.accountId = input.accountId;
    this.balance = input.balance;
    this.seqNum = input.seqNum;
    this.numSubEntries = input.numSubEntries;
    this.inflationDest = input.inflationDest;
    this.flags = input.flags;
    this.homeDomain =
      input.homeDomain instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.homeDomain)
        : input.homeDomain;
    this.thresholds =
      input.thresholds instanceof Thresholds
        ? input.thresholds
        : new Thresholds(input.thresholds);
    this.signers = input.signers;
    this.ext = input.ext;
  }

  toXdrObject(): AccountEntryWire {
    return {
      accountId: this.accountId.toXdrObject(),
      balance: this.balance,
      seqNum: this.seqNum,
      numSubEntries: this.numSubEntries,
      inflationDest:
        this.inflationDest === null ? null : this.inflationDest.toXdrObject(),
      flags: this.flags,
      homeDomain: this.homeDomain,
      thresholds: this.thresholds.toXdrObject(),
      signers: this.signers.map((v) => v.toXdrObject()),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(wire: AccountEntryWire): AccountEntry {
    return new AccountEntry({
      accountId: PublicKey.fromXdrObject(wire.accountId),
      balance: wire.balance,
      seqNum: wire.seqNum,
      numSubEntries: wire.numSubEntries,
      inflationDest:
        wire.inflationDest === null
          ? null
          : PublicKey.fromXdrObject(wire.inflationDest),
      flags: wire.flags,
      homeDomain: wire.homeDomain,
      thresholds: Thresholds.fromXdrObject(wire.thresholds),
      signers: wire.signers.map((w) => Signer.fromXdrObject(w)),
      ext: AccountEntryExt.fromXdrObject(wire.ext),
    });
  }
}
