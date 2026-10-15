import { describe, it, expect } from "vitest";
import {
  decodeAddressToMuxedAccount,
  encodeMuxedAccountToAddress,
  encodeMuxedAccount,
  encodeMuxedContractAddress,
  extractBaseAddress,
} from "../../../../src/base/util/decode_encode_muxed_account.js";
import { StrKey } from "../../../../src/base/strkey.js";
import * as xdr from "../../../../src/xdr/index.js";

const PUBKEY = "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";
const MPUBKEY =
  "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVAAAAAAAAAAAAAJLK";

// SEP-23 (stellar-protocol#2020) vectors
const CONTRACT = "CA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUWDA";
const WCONTRACT =
  "WA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVAAAAAAAAAAAACWJY";
const WCONTRACT_ID = "9223372036854775808";

const MUXED_CASES = [
  {
    strkey:
      "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVAAAAAAAAAAAAAJLK",
    id: "9223372036854775808",
  },
  {
    strkey:
      "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAFB4CJJBRKA",
    id: "1357924680",
  },
  {
    strkey:
      "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAE2JUG6",
    id: "1234",
  },
  {
    strkey:
      "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAACJUQ",
    id: "0",
  },
];

describe("decodeAddressToMuxedAccount", () => {
  it("decodes a G... address to an ed25519 MuxedAccount", () => {
    const muxed = decodeAddressToMuxedAccount(PUBKEY);

    expect(muxed).toBeInstanceOf(xdr.MuxedAccount);
    expect(muxed.type).toBe("keyTypeEd25519");
    if (muxed.type !== "keyTypeEd25519") throw new Error("expected ed25519");
    expect(Array.from(muxed.ed25519.toBytes())).toEqual(
      Array.from(StrKey.decodeEd25519PublicKey(PUBKEY)),
    );
  });

  it.each(MUXED_CASES)(
    "decodes M... address with id=$id to a muxed ed25519 MuxedAccount",
    ({ strkey, id }) => {
      const muxed = decodeAddressToMuxedAccount(strkey);

      expect(muxed).toBeInstanceOf(xdr.MuxedAccount);
      expect(muxed.type).toBe("keyTypeMuxedEd25519");
      if (muxed.type !== "keyTypeMuxedEd25519") {
        throw new Error("expected muxed");
      }

      const inner = muxed.med25519;
      expect(Array.from(inner.ed25519.toBytes())).toEqual(
        Array.from(StrKey.decodeEd25519PublicKey(PUBKEY)),
      );
      expect(inner.id).toEqual(BigInt(id));
    },
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
    },
  );
});

describe("encodeMuxedAccount", () => {
  it("creates a MuxedAccount from a G... address and string id", () => {
    const muxed = encodeMuxedAccount(PUBKEY, "420");

    expect(muxed).toBeInstanceOf(xdr.MuxedAccount);
    expect(muxed.type).toBe("keyTypeMuxedEd25519");
    if (muxed.type !== "keyTypeMuxedEd25519") {
      throw new Error("expected muxed");
    }

    const inner = muxed.med25519;
    expect(Array.from(inner.ed25519.toBytes())).toEqual(
      Array.from(StrKey.decodeEd25519PublicKey(PUBKEY)),
    );
    expect(inner.id).toEqual(BigInt("420"));
  });

  it("roundtrips through encodeMuxedAccountToAddress", () => {
    const muxed = encodeMuxedAccount(PUBKEY, "1234");
    const address = encodeMuxedAccountToAddress(muxed);
    const decoded = decodeAddressToMuxedAccount(address);

    if (decoded.type !== "keyTypeMuxedEd25519") {
      throw new Error("expected muxed");
    }
    expect(decoded.med25519.id).toEqual(BigInt("1234"));
    expect(Array.from(decoded.med25519.ed25519.toBytes())).toEqual(
      Array.from(StrKey.decodeEd25519PublicKey(PUBKEY)),
    );
  });

  it("throws if address is not a valid G... address", () => {
    expect(() => encodeMuxedAccount("INVALID", "1")).toThrow(
      /address should be a Stellar account ID/,
    );
  });

  it("throws if address is an M... address", () => {
    expect(() => encodeMuxedAccount(MPUBKEY, "1")).toThrow(
      /address should be a Stellar account ID/,
    );
  });

  it("throws if id is not a string", () => {
    // @ts-expect-error testing invalid input
    expect(() => encodeMuxedAccount(PUBKEY, 123)).toThrow(
      /id should be a string/,
    );
  });

  it("encodes an ID with leading zeros as its canonical form", () => {
    expect(encodeMuxedAccountToAddress(encodeMuxedAccount(PUBKEY, "016"))).toBe(
      encodeMuxedAccountToAddress(encodeMuxedAccount(PUBKEY, "16")),
    );
  });

  it("rejects an id that is not plain decimal digits", () => {
    for (const id of ["0x10", "+16", "-1", " 16 ", "", "1e1"]) {
      expect(() => encodeMuxedAccount(PUBKEY, id)).toThrow(
        /id is not a valid uint64 string/,
      );
    }
  });

  it("rejects an id longer than 22 characters before parsing it", () => {
    for (const id of ["1".repeat(1_000_000), `${"0".repeat(22)}1`]) {
      expect(() => encodeMuxedAccount(PUBKEY, id)).toThrow(
        /id must have at most 22 digits/,
      );
    }
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
    },
  );

  it("returns C... address unchanged", () => {
    expect(extractBaseAddress(CONTRACT)).toBe(CONTRACT);
  });

  it("extracts C... address from a W... address", () => {
    expect(extractBaseAddress(WCONTRACT)).toBe(CONTRACT);
  });

  it("throws for an invalid address", () => {
    expect(() => extractBaseAddress("INVALIDADDRESS")).toThrow(
      /expected an account or contract address/,
    );
  });
});

describe("encodeMuxedContractAddress", () => {
  it("encodes the SEP-23 vector", () => {
    expect(encodeMuxedContractAddress(CONTRACT, WCONTRACT_ID)).toBe(WCONTRACT);
  });

  it("round-trips with extractBaseAddress and the strkey payload", () => {
    for (const id of ["0", "1234", "18446744073709551615"]) {
      const w = encodeMuxedContractAddress(CONTRACT, id);
      expect(extractBaseAddress(w)).toBe(CONTRACT);
      const raw = StrKey.decodeMuxedContract(w);
      expect(new DataView(raw.buffer, raw.byteOffset).getBigUint64(32)).toBe(
        BigInt(id),
      );
    }
  });

  it("encodes an ID with leading zeros as its canonical form", () => {
    expect(encodeMuxedContractAddress(CONTRACT, "016")).toBe(
      encodeMuxedContractAddress(CONTRACT, "16"),
    );
  });

  it("rejects an id that is not a uint64 in decimal digits", () => {
    for (const id of ["0x10", "-1", " 16 ", "", "1.5"]) {
      expect(() => encodeMuxedContractAddress(CONTRACT, id)).toThrow(
        /id is not a valid uint64 string/,
      );
    }
    expect(() =>
      encodeMuxedContractAddress(CONTRACT, "18446744073709551616"),
    ).toThrow(/id value out of range/);
  });

  it("rejects an address that is not a C... address", () => {
    for (const address of [PUBKEY, MPUBKEY, WCONTRACT, "INVALID"]) {
      expect(() => encodeMuxedContractAddress(address, "1")).toThrow(
        /contractId should be a contract address/,
      );
    }
  });
});
