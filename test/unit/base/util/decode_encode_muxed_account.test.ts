import { describe, it, expect } from "vitest";
import {
  decodeAddressToMuxedAccount,
  encodeMuxedAccountToAddress,
  encodeMuxedAccount,
  extractBaseAddress
} from "../../../src/util/decode_encode_muxed_account.js";
import { StrKey } from "../../../src/strkey.js";
import xdr from "../../../src/xdr.js";

const PUBKEY = "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";
const MPUBKEY =
  "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVAAAAAAAAAAAAAJLK";

const MUXED_CASES = [
  {
    strkey:
      "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVAAAAAAAAAAAAAJLK",
    id: "9223372036854775808"
  },
  {
    strkey:
      "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAFB4CJJBRKA",
    id: "1357924680"
  },
  {
    strkey:
      "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAE2JUG6",
    id: "1234"
  },
  {
    strkey:
      "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAACJUQ",
    id: "0"
  }
];

describe("decodeAddressToMuxedAccount", () => {
  it("decodes a G... address to an ed25519 MuxedAccount", () => {
    const muxed = decodeAddressToMuxedAccount(PUBKEY);

    expect(xdr.MuxedAccount.isValid(muxed)).toBe(true);
    expect(muxed.switch()).toEqual(xdr.CryptoKeyType.keyTypeEd25519());
    expect(muxed.ed25519().equals(StrKey.decodeEd25519PublicKey(PUBKEY))).toBe(
      true
    );
  });

  it.each(MUXED_CASES)(
    "decodes M... address with id=$id to a muxed ed25519 MuxedAccount",
    ({ strkey, id }) => {
      const muxed = decodeAddressToMuxedAccount(strkey);

      expect(xdr.MuxedAccount.isValid(muxed)).toBe(true);
      expect(muxed.switch()).toEqual(xdr.CryptoKeyType.keyTypeMuxedEd25519());

      const inner = muxed.med25519();
      expect(
        inner.ed25519().equals(StrKey.decodeEd25519PublicKey(PUBKEY))
      ).toBe(true);
      expect(inner.id()).toEqual(xdr.Uint64.fromString(id));
    }
  );

  it("throws for an invalid address", () => {
    expect(() => decodeAddressToMuxedAccount("INVALIDADDRESS")).toThrow();
  });
});

describe("encodeMuxedAccountToAddress", () => {
  it("encodes an ed25519 MuxedAccount back to a G... address", () => {
    const muxed = decodeAddressToMuxedAccount(PUBKEY);
    const address = encodeMuxedAccountToAddress(muxed);

    expect(address).toBe(PUBKEY);
  });

  it.each(MUXED_CASES)(
    "encodes a muxed ed25519 MuxedAccount back to M... address (id=$id)",
    ({ strkey }) => {
      const muxed = decodeAddressToMuxedAccount(strkey);
      const address = encodeMuxedAccountToAddress(muxed);

      expect(address).toBe(strkey);
    }
  );
});

describe("encodeMuxedAccount", () => {
  it("creates a MuxedAccount from a G... address and string id", () => {
    const muxed = encodeMuxedAccount(PUBKEY, "420");

    expect(xdr.MuxedAccount.isValid(muxed)).toBe(true);
    expect(muxed.switch()).toEqual(xdr.CryptoKeyType.keyTypeMuxedEd25519());

    const inner = muxed.med25519();
    expect(inner.ed25519().equals(StrKey.decodeEd25519PublicKey(PUBKEY))).toBe(
      true
    );
    expect(inner.id()).toEqual(xdr.Uint64.fromString("420"));
  });

  it("roundtrips through encodeMuxedAccountToAddress", () => {
    const muxed = encodeMuxedAccount(PUBKEY, "1234");
    const address = encodeMuxedAccountToAddress(muxed);
    const decoded = decodeAddressToMuxedAccount(address);

    expect(decoded.med25519().id()).toEqual(xdr.Uint64.fromString("1234"));
    expect(
      decoded.med25519().ed25519().equals(StrKey.decodeEd25519PublicKey(PUBKEY))
    ).toBe(true);
  });

  it("throws if address is not a valid G... address", () => {
    expect(() => encodeMuxedAccount("INVALID", "1")).toThrow(
      /address should be a Stellar account ID/
    );
  });

  it("throws if address is an M... address", () => {
    expect(() => encodeMuxedAccount(MPUBKEY, "1")).toThrow(
      /address should be a Stellar account ID/
    );
  });

  it("throws if id is not a string", () => {
    // @ts-expect-error testing invalid input
    expect(() => encodeMuxedAccount(PUBKEY, 123)).toThrow(
      /id should be a string/
    );
  });
});

describe("extractBaseAddress", () => {
  it("returns G... address unchanged", () => {
    expect(extractBaseAddress(PUBKEY)).toBe(PUBKEY);
  });

  it("extracts G... address from an M... address", () => {
    expect(extractBaseAddress(MPUBKEY)).toBe(PUBKEY);
  });

  it.each(MUXED_CASES)(
    "extracts base address from M... with id=$id",
    ({ strkey }) => {
      expect(extractBaseAddress(strkey)).toBe(PUBKEY);
    }
  );

  it("throws for an invalid address", () => {
    expect(() => extractBaseAddress("INVALIDADDRESS")).toThrow(
      /expected muxed account/
    );
  });
});
