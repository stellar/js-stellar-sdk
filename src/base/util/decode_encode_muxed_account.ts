import { concatUint8Arrays } from "uint8array-extras";
import { MuxedAccount, MuxedAccountMed25519, Uint64 } from "../../xdr/index.js";
import { StrKey } from "../strkey.js";

const MAX_UINT64 = BigInt("18446744073709551615"); // 2^64 - 1

// Accepts only decimal digits and returns the canonical form, so one ID has
// one spelling. BigInt() alone also accepts hex, signs, whitespace and "".
export function canonicalUint64Id(id: string): string {
  if (typeof id !== "string") {
    throw new Error("id should be a string representing a number (uint64)");
  }
  // Checked first, so a very long string never reaches BigInt().
  if (id.length > 22) {
    throw new Error("id must have at most 22 digits");
  }
  if (!/^\d+$/.test(id)) {
    throw new Error(`id is not a valid uint64 string: ${id}`);
  }

  const value = BigInt(id);
  if (value > MAX_UINT64) {
    throw new Error(
      `id value out of range for uint64 [0, ${MAX_UINT64}]: ${id}`,
    );
  }

  return value.toString();
}

/**
 * Converts a Stellar address (in G... or M... form) to an `xdr.MuxedAccount`
 * structure, using the ed25519 representation when possible.
 *
 * This supports full muxed accounts, where an `M...` address will resolve to
 * both its underlying `G...` address and an integer ID.
 *
 * @param address - G... or M... address to encode into XDR
 */
export function decodeAddressToMuxedAccount(address: string): MuxedAccount {
  if (StrKey.isValidMed25519PublicKey(address)) {
    return _decodeAddressFullyToMuxedAccount(address);
  }

  return MuxedAccount.keyTypeEd25519(StrKey.decodeEd25519PublicKey(address));
}

/**
 * Converts an xdr.MuxedAccount to its StrKey representation.
 *
 * Returns the "M..." string representation if there is a muxing ID within
 * the object, or the "G..." representation otherwise.
 *
 * @param muxedAccount - raw account to stringify
 *
 * @see https://stellar.org/protocol/sep-23
 */
export function encodeMuxedAccountToAddress(
  muxedAccount: MuxedAccount,
): string {
  if (muxedAccount.type === "keyTypeMuxedEd25519") {
    return _encodeMuxedAccountFullyToAddress(muxedAccount);
  }

  return StrKey.encodeEd25519PublicKey(muxedAccount.value.toBytes());
}

/**
 * Transform a Stellar address (G...) and an ID into its XDR representation.
 *
 * @param address - a Stellar G... address
 * @param id - the ID, as a uint64 in decimal digits. Leading zeros are
 *     removed. At most 22 digits.
 */
export function encodeMuxedAccount(address: string, id: string): MuxedAccount {
  if (!StrKey.isValidEd25519PublicKey(address)) {
    throw new Error("address should be a Stellar account ID (G...)");
  }
  return MuxedAccount.keyTypeMuxedEd25519(
    new MuxedAccountMed25519({
      id: Uint64.fromString(canonicalUint64Id(id)),
      ed25519: StrKey.decodeEd25519PublicKey(address),
    }),
  );
}

/**
 * Extracts the underlying base (G...) address from an M-address.
 * @param address - an account address (either M... or G...)
 */
export function extractBaseAddress(address: string): string {
  if (StrKey.isValidEd25519PublicKey(address)) {
    return address;
  }

  if (!StrKey.isValidMed25519PublicKey(address)) {
    throw new TypeError(`expected muxed account (M...), got ${address}`);
  }

  const muxedAccount = decodeAddressToMuxedAccount(address);
  if (muxedAccount.type !== "keyTypeMuxedEd25519") {
    throw new TypeError(`expected muxed account (M...), got ${address}`);
  }
  return StrKey.encodeEd25519PublicKey(muxedAccount.value.ed25519.toBytes());
}

// Decodes an "M..." account ID into its MuxedAccount object representation.
function _decodeAddressFullyToMuxedAccount(address: string): MuxedAccount {
  const rawBytes = StrKey.decodeMed25519PublicKey(address);

  // Decoding M... addresses cannot be done through a simple
  // MuxedAccountMed25519.fromXdr() call, because the definition is:
  //
  //    constructor(attributes: { id: Uint64; ed25519: Uint8Array });
  //
  // Note the ID is the first attribute. However, the ID comes *last* in the
  // stringified (base32-encoded) address itself (it's the last 8-byte suffix).
  // The `fromXdr()` method interprets bytes in order, so we need to parse out
  // the raw binary into its requisite parts, i.e. use the MuxedAccountMed25519
  // constructor directly.
  //
  // Refer to https://github.com/stellar/go/blob/master/xdr/muxed_account.go#L26
  // for the Golang implementation of the M... parsing.
  return MuxedAccount.keyTypeMuxedEd25519(
    new MuxedAccountMed25519({
      id: Uint64.fromXdr(rawBytes.subarray(-8)),
      ed25519: rawBytes.subarray(0, -8),
    }),
  );
}

// Converts an xdr.MuxedAccount into its *true* "M..." string representation.
function _encodeMuxedAccountFullyToAddress(muxedAccount: MuxedAccount): string {
  if (muxedAccount.type === "keyTypeEd25519") {
    return encodeMuxedAccountToAddress(muxedAccount);
  }

  const muxed = muxedAccount.value;
  return StrKey.encodeMed25519PublicKey(
    concatUint8Arrays([
      muxed.ed25519.toBytes(),
      MuxedAccountMed25519.schema.encode(muxed.toXdrObject()).subarray(0, 8),
    ]),
  );
}
