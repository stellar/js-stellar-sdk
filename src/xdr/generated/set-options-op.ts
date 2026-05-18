import { struct } from "../types/struct.js";
import { option } from "../types/option.js";
import { uint32 } from "../types/uint32.js";
import { string as string_ } from "../types/string.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { Signer, type SignerWire } from "./signer.js";

export interface SetOptionsOpWire {
  inflationDest: PublicKeyWire | null;
  clearFlags: number | null;
  setFlags: number | null;
  masterWeight: number | null;
  lowThreshold: number | null;
  medThreshold: number | null;
  highThreshold: number | null;
  homeDomain: string | null;
  signer: SignerWire | null;
}

/**
 * ```xdr
 * struct SetOptionsOp
 * {
 *     AccountID* inflationDest; // sets the inflation destination
 *
 *     uint32* clearFlags; // which flags to clear
 *     uint32* setFlags;   // which flags to set
 *
 *     // account threshold manipulation
 *     uint32* masterWeight; // weight of the master account
 *     uint32* lowThreshold;
 *     uint32* medThreshold;
 *     uint32* highThreshold;
 *
 *     string32* homeDomain; // sets the home domain
 *
 *     // Add, update or remove a signer for the account
 *     // signer is deleted if the weight is 0
 *     Signer* signer;
 * };
 * ```
 */
export class SetOptionsOp extends XdrValue {
  readonly inflationDest: PublicKey | null;
  readonly clearFlags: number | null;
  readonly setFlags: number | null;
  readonly masterWeight: number | null;
  readonly lowThreshold: number | null;
  readonly medThreshold: number | null;
  readonly highThreshold: number | null;
  readonly homeDomain: string | null;
  readonly signer: Signer | null;

  static readonly schema: XdrType<SetOptionsOpWire> = struct("SetOptionsOp", {
    inflationDest: option(PublicKey.schema),
    clearFlags: option(uint32()),
    setFlags: option(uint32()),
    masterWeight: option(uint32()),
    lowThreshold: option(uint32()),
    medThreshold: option(uint32()),
    highThreshold: option(uint32()),
    homeDomain: option(string_(32)),
    signer: option(Signer.schema),
  });

  constructor(input: {
    inflationDest: PublicKey | null;
    clearFlags: number | null;
    setFlags: number | null;
    masterWeight: number | null;
    lowThreshold: number | null;
    medThreshold: number | null;
    highThreshold: number | null;
    homeDomain: string | null;
    signer: Signer | null;
  }) {
    super();
    this.inflationDest = input.inflationDest;
    this.clearFlags = input.clearFlags;
    this.setFlags = input.setFlags;
    this.masterWeight = input.masterWeight;
    this.lowThreshold = input.lowThreshold;
    this.medThreshold = input.medThreshold;
    this.highThreshold = input.highThreshold;
    this.homeDomain = input.homeDomain;
    this.signer = input.signer;
  }

  toXdrObject(): SetOptionsOpWire {
    return {
      inflationDest:
        this.inflationDest === null ? null : this.inflationDest.toXdrObject(),
      clearFlags: this.clearFlags,
      setFlags: this.setFlags,
      masterWeight: this.masterWeight,
      lowThreshold: this.lowThreshold,
      medThreshold: this.medThreshold,
      highThreshold: this.highThreshold,
      homeDomain: this.homeDomain,
      signer: this.signer === null ? null : this.signer.toXdrObject(),
    };
  }

  static fromXdrObject(wire: SetOptionsOpWire): SetOptionsOp {
    return new SetOptionsOp({
      inflationDest:
        wire.inflationDest === null
          ? null
          : PublicKey.fromXdrObject(wire.inflationDest),
      clearFlags: wire.clearFlags,
      setFlags: wire.setFlags,
      masterWeight: wire.masterWeight,
      lowThreshold: wire.lowThreshold,
      medThreshold: wire.medThreshold,
      highThreshold: wire.highThreshold,
      homeDomain: wire.homeDomain,
      signer: wire.signer === null ? null : Signer.fromXdrObject(wire.signer),
    });
  }
}
