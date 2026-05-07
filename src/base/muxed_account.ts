import xdr from "./xdr.js";
import { Account } from "./account.js";
import { StrKey } from "./strkey.js";
import {
  decodeAddressToMuxedAccount,
  encodeMuxedAccountToAddress,
  encodeMuxedAccount,
  extractBaseAddress,
} from "./util/decode_encode_muxed_account.js";

const MAX_UINT64 = BigInt("18446744073709551615"); // 2^64 - 1

function validateUint64Id(id: string): void {
  let value: bigint;

  try {
    value = BigInt(id);
  } catch {
    throw new Error(`id is not a valid uint64 string: ${id}`);
  }

  if (value < BigInt(0) || value > MAX_UINT64) {
    throw new Error(
      `id value out of range for uint64 [0, ${MAX_UINT64}]: ${id}`,
    );
  }
}

/**
 * Represents a muxed account for transactions and operations.
 *
 * A muxed (or *multiplexed*) account (defined rigorously in
 * [CAP-27](https://stellar.org/protocol/cap-27) and briefly in
 * [SEP-23](https://stellar.org/protocol/sep-23)) is one that resolves a single
 * Stellar `G...` account to many different underlying IDs.
 *
 * For example, you may have a single Stellar address for accounting purposes:
 *   GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ
 *
 * Yet would like to use it for 4 different family members:
 *   1: MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAAGZFQ
 *   2: MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAALIWQ
 *   3: MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAAPYHQ
 *   4: MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAAQLQQ
 *
 * This object makes it easy to create muxed accounts from regular accounts,
 * duplicate them, get/set the underlying IDs, etc. without mucking around with
 * the raw XDR.
 *
 * Because muxed accounts are purely an off-chain convention, they all share the
 * sequence number tied to their underlying G... account. Thus, this object
 * *requires* an {@link Account} instance to be passed in, so that muxed
 * instances of an account can collectively modify the sequence number whenever
 * a muxed account is used as the source of a {@link Transaction} with {@link
 * TransactionBuilder}.
 *
 * @see https://developers.stellar.org/docs/glossary/muxed-accounts/
 */
export class MuxedAccount {
  private account: Account;
  private _muxedXdr: xdr.MuxedAccount;
  private _mAddress: string;
  private _id: string;

  /**
   * @param baseAccount - the {@link Account} instance representing the
   *     underlying G... address
   * @param id - a stringified uint64 value that represents the ID of the
   *     muxed account
   */
  constructor(baseAccount: Account, id: string) {
    const accountId = baseAccount.accountId();

    if (!StrKey.isValidEd25519PublicKey(accountId)) {
      throw new Error("accountId is invalid");
    }

    validateUint64Id(id);

    this.account = baseAccount;
    this._muxedXdr = encodeMuxedAccount(accountId, id);
    this._mAddress = encodeMuxedAccountToAddress(this._muxedXdr);
    this._id = id;
  }

  /**
   * Parses an M-address into a MuxedAccount object.
   *
   * @param  mAddress    - an M-address to transform
   * @param  sequenceNum - the sequence number of the underlying {@link
   *     Account}, to use for the underlying base account {@link
   *     MuxedAccount.baseAccount}. If you're using the SDK, you can use
   *     `server.loadAccount` to fetch this if you don't know it.
   */
  static fromAddress(mAddress: string, sequenceNum: string): MuxedAccount {
    const muxedAccount = decodeAddressToMuxedAccount(mAddress);
    const gAddress = extractBaseAddress(mAddress);
    const id = muxedAccount.med25519().id().toString();

    return new MuxedAccount(new Account(gAddress, sequenceNum), id);
  }

  /**
   * Returns the underlying account object shared among all muxed
   * accounts with this Stellar address.
   */
  baseAccount(): Account {
    return this.account;
  }

  /**
   * Returns the M-address representing this account's (G-address, ID).
   */
  accountId(): string {
    return this._mAddress;
  }

  /**
   * Returns the uint64 ID of this muxed account as a string.
   */
  id(): string {
    return this._id;
  }

  /**
   * Updates the muxed account's ID, regenerating the M-address accordingly.
   *
   * @param id - a stringified uint64 value to set as the new muxed account ID
   */
  setId(id: string): MuxedAccount {
    if (typeof id !== "string") {
      throw new Error("id should be a string representing a number (uint64)");
    }

    validateUint64Id(id);

    this._muxedXdr.med25519().id(xdr.Uint64.fromString(id));
    this._mAddress = encodeMuxedAccountToAddress(this._muxedXdr);
    this._id = id;
    return this;
  }

  /**
   * Returns the stringified sequence number for the underlying account.
   */
  sequenceNumber(): string {
    return this.account.sequenceNumber();
  }

  /**
   * Increments the underlying account's sequence number by one.
   */
  incrementSequenceNumber(): void {
    this.account.incrementSequenceNumber();
  }

  /**
   * Returns the XDR object representing this muxed account's
   * G-address and uint64 ID.
   */
  toXDRObject(): xdr.MuxedAccount {
    return this._muxedXdr;
  }

  /**
   * Checks whether two muxed accounts are equal by comparing their M-addresses.
   *
   * @param otherMuxedAccount - the MuxedAccount to compare against
   */
  equals(otherMuxedAccount: MuxedAccount): boolean {
    return this.accountId() === otherMuxedAccount.accountId();
  }
}
