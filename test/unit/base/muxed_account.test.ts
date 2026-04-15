import { describe, it, expect } from "vitest";
import { Account } from "../../src/account.js";
import { MuxedAccount } from "../../src/muxed_account.js";
import { StrKey } from "../../src/strkey.js";
import xdr from "../../src/xdr.js";
import { encodeMuxedAccountToAddress } from "../../src/util/decode_encode_muxed_account.js";

const PUBKEY = "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";
const MPUBKEY_ZERO =
  "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAACJUQ";
const MPUBKEY_ID =
  "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAABUTGI4";

describe("MuxedAccount.constructor", () => {
  it("generates addresses correctly", () => {
    const baseAccount = new Account(PUBKEY, "1");
    const mux = new MuxedAccount(baseAccount, "0");
    expect(mux.baseAccount().accountId()).toBe(PUBKEY);
    expect(mux.accountId()).toBe(MPUBKEY_ZERO);
    expect(mux.id()).toBe("0");

    expect(mux.setId("420").id()).toBe("420");
    expect(mux.accountId()).toBe(MPUBKEY_ID);

    const muxXdr = mux.toXDRObject();
    expect(muxXdr.switch()).toEqual(xdr.CryptoKeyType.keyTypeMuxedEd25519());

    const innerMux = muxXdr.med25519();
    expect(
      innerMux.ed25519().equals(StrKey.decodeEd25519PublicKey(PUBKEY)),
    ).toBe(true);
    expect(innerMux.id()).toEqual(xdr.Uint64.fromString("420"));
    expect(encodeMuxedAccountToAddress(muxXdr)).toBe(mux.accountId());
  });
});

describe("MuxedAccount.sequenceNumber", () => {
  it("tracks sequence numbers across all muxed accounts sharing a base", () => {
    const baseAccount = new Account(PUBKEY, "12345");
    const mux1 = new MuxedAccount(baseAccount, "1");
    const mux2 = new MuxedAccount(baseAccount, "2");

    expect(baseAccount.sequenceNumber()).toBe("12345");
    expect(mux1.sequenceNumber()).toBe("12345");
    expect(mux2.sequenceNumber()).toBe("12345");

    mux1.incrementSequenceNumber();
    expect(baseAccount.sequenceNumber()).toBe("12346");
    expect(mux1.sequenceNumber()).toBe("12346");
    expect(mux2.sequenceNumber()).toBe("12346");

    mux2.incrementSequenceNumber();
    expect(baseAccount.sequenceNumber()).toBe("12347");
    expect(mux1.sequenceNumber()).toBe("12347");
    expect(mux2.sequenceNumber()).toBe("12347");

    baseAccount.incrementSequenceNumber();
    expect(baseAccount.sequenceNumber()).toBe("12348");
    expect(mux1.sequenceNumber()).toBe("12348");
    expect(mux2.sequenceNumber()).toBe("12348");
  });

  it("shares sequence number when chaining from baseAccount()", () => {
    const baseAccount = new Account(PUBKEY, "12345");
    const mux1 = new MuxedAccount(baseAccount, "1");
    const mux2 = new MuxedAccount(mux1.baseAccount(), "420");
    expect(mux2.id()).toBe("420");
    expect(mux2.accountId()).toBe(MPUBKEY_ID);
    expect(mux2.sequenceNumber()).toBe("12345");

    const mux3 = new MuxedAccount(mux2.baseAccount(), "3");
    mux2.incrementSequenceNumber();
    expect(mux1.sequenceNumber()).toBe("12346");
    expect(mux2.sequenceNumber()).toBe("12346");
    expect(mux3.sequenceNumber()).toBe("12346");
  });
});

describe("MuxedAccount.fromAddress", () => {
  it("parses an M-address into a MuxedAccount", () => {
    const mux1 = MuxedAccount.fromAddress(MPUBKEY_ZERO, "123");
    expect(mux1.id()).toBe("0");
    expect(mux1.accountId()).toBe(MPUBKEY_ZERO);
    expect(mux1.baseAccount().accountId()).toBe(PUBKEY);
    expect(mux1.sequenceNumber()).toBe("123");
  });
});

// ---------------------------------------------------------------
// Additional tests for uncovered code paths
// ---------------------------------------------------------------

describe("MuxedAccount.constructor (error cases)", () => {
  it("throws when accountId is not a valid G-address", () => {
    const invalidAccount = new Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "0",
    );
    // Manually corrupt the accountId to simulate an invalid base account
    (invalidAccount as any)._accountId = "INVALID";
    expect(() => new MuxedAccount(invalidAccount, "1")).toThrow(
      /accountId is invalid/,
    );
  });
});

describe("MuxedAccount.setId (error cases)", () => {
  it("throws when id is not a string", () => {
    const mux = new MuxedAccount(new Account(PUBKEY, "0"), "1");
    expect(() => mux.setId(42 as any)).toThrow(
      /id should be a string representing a number/,
    );
  });
});

describe("MuxedAccount uint64 overflow", () => {
  // 2^64 = 18446744073709551616 (one above the max uint64 value)
  const OVERFLOW_ID = "18446744073709551616";

  it("rejects overflow in constructor", () => {
    const base = new Account(PUBKEY, "0");
    expect(() => new MuxedAccount(base, OVERFLOW_ID)).toThrow();
  });

  it("rejects overflow in setId", () => {
    const base = new Account(PUBKEY, "0");
    const mux = new MuxedAccount(base, "0");
    expect(() => mux.setId(OVERFLOW_ID)).toThrow();
  });

  it("accepts the maximum valid uint64 value", () => {
    const MAX_UINT64 = "18446744073709551615";
    const base = new Account(PUBKEY, "0");
    const mux = new MuxedAccount(base, MAX_UINT64);
    expect(mux.id()).toBe(MAX_UINT64);
  });
});

describe("MuxedAccount.fromAddress (error cases)", () => {
  it("throws when given a G-address instead of an M-address", () => {
    expect(() => MuxedAccount.fromAddress(PUBKEY, "0")).toThrow();
  });

  it("throws when given a completely invalid address", () => {
    expect(() => MuxedAccount.fromAddress("INVALID", "0")).toThrow();
  });
});

describe("MuxedAccount.equals", () => {
  it("returns true for two accounts with the same G-address and ID", () => {
    const base = new Account(PUBKEY, "0");
    const mux1 = new MuxedAccount(base, "42");
    const mux2 = new MuxedAccount(base, "42");
    expect(mux1.equals(mux2)).toBe(true);
  });

  it("returns false for two accounts with the same G-address but different IDs", () => {
    const base = new Account(PUBKEY, "0");
    const mux1 = new MuxedAccount(base, "1");
    const mux2 = new MuxedAccount(base, "2");
    expect(mux1.equals(mux2)).toBe(false);
  });
});
