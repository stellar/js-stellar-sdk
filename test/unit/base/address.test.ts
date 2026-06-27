import { describe, it, expect } from "vitest";
import { Address } from "../../../src/base/address.js";
import { StrKey } from "../../../src/base/strkey.js";
import xdr from "../../../src/base/xdr.js";

describe("Address", () => {
  const ACCOUNT = "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB";
  const CONTRACT = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
  const MUXED_ADDRESS =
    "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVAAAAAAAAAAAAAJLK";
  const MUXED_ADDRESS_ID = "9223372036854775808";
  const MUXED_ADDRESS_BASE =
    "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";

  const MUXED_ZERO = StrKey.encodeMed25519PublicKey(Buffer.alloc(40));
  const CLAIMABLE_BALANCE_ZERO = StrKey.encodeClaimableBalance(
    Buffer.alloc(33),
  );
  const LIQUIDITY_POOL_ZERO = StrKey.encodeLiquidityPool(Buffer.alloc(32));

  describe(".constructor", () => {
    it("fails to create Address object from an invalid address", () => {
      expect(() => new Address("GBBB")).toThrow(/Unsupported address type/);
    });

    [
      ACCOUNT,
      CONTRACT,
      MUXED_ADDRESS,
      CLAIMABLE_BALANCE_ZERO,
      LIQUIDITY_POOL_ZERO,
    ].forEach((strkey) => {
      const type = strkey[0] ? StrKey.types[strkey[0]] : "unknown";
      it(`creates an Address for ${type}`, () => {
        expect(new Address(strkey).toString()).toBe(strkey);
      });
    });
  });

  describe("static constructors", () => {
    it(".fromString", () => {
      const a = Address.fromString(ACCOUNT);
      expect(a.toString()).toBe(ACCOUNT);
    });

    it(".account", () => {
      const a = Address.account(Buffer.alloc(32));
      expect(a.toString()).toBe(
        "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      );
    });

    it(".contract", () => {
      const c = Address.contract(Buffer.alloc(32));
      expect(c.toString()).toBe(
        "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4",
      );
    });

    it(".muxedAccount", () => {
      const m = Address.muxedAccount(Buffer.alloc(40));
      expect(m.toString()).toBe(MUXED_ZERO);
    });

    it(".claimableBalance", () => {
      const cb = Address.claimableBalance(Buffer.alloc(33));
      expect(cb.toString()).toBe(CLAIMABLE_BALANCE_ZERO);
    });

    it(".liquidityPool", () => {
      const lp = Address.liquidityPool(Buffer.alloc(32));
      expect(lp.toString()).toBe(LIQUIDITY_POOL_ZERO);
    });

    describe(".fromScAddress", () => {
      it("parses account addresses", () => {
        const sc = xdr.ScAddress.scAddressTypeAccount(
          xdr.PublicKey.publicKeyTypeEd25519(
            StrKey.decodeEd25519PublicKey(ACCOUNT),
          ),
        );
        const a = Address.fromScAddress(sc);
        expect(a.toString()).toBe(ACCOUNT);
      });

      it("parses contract addresses", () => {
        const sc = xdr.ScAddress.scAddressTypeContract(
          StrKey.decodeContract(CONTRACT) as unknown as xdr.Hash,
        );
        const c = Address.fromScAddress(sc);
        expect(c.toString()).toBe(CONTRACT);
      });

      it("parses muxed-account addresses", () => {
        const sc = xdr.ScAddress.scAddressTypeMuxedAccount(
          new xdr.MuxedEd25519Account({
            id: new xdr.Uint64(MUXED_ADDRESS_ID),
            ed25519: StrKey.decodeEd25519PublicKey(MUXED_ADDRESS_BASE),
          }),
        );
        const m = Address.fromScAddress(sc);
        expect(m.toString()).toBe(MUXED_ADDRESS);
      });

      it("parses claimable-balance addresses", () => {
        const sc = xdr.ScAddress.scAddressTypeClaimableBalance(
          new (xdr.ClaimableBalanceId as any)(
            "claimableBalanceIdTypeV0",
            Buffer.alloc(32),
          ),
        );
        const cb = Address.fromScAddress(sc);
        expect(cb.toString()).toBe(CLAIMABLE_BALANCE_ZERO);
      });

      it("parses claimable-balance from decoded XDR", () => {
        // XDR: ScVal containing claimable balance address
        const xdrBase64 =
          "AAAAEgAAAAMAAAAAGZ8agta/ETY/tCE7KG10xWweJ9IBmnhmy0alCNG6gOE=";
        const scVal = xdr.ScVal.fromXDR(xdrBase64, "base64");
        const addr = Address.fromScVal(scVal);
        expect(addr.toString()).toBe(
          "BAABTHY2QLLL6EJWH62CCOZINV2MK3A6E7JADGTYM3FUNJII2G5IBYM2TU",
        );
      });

      it("parses liquidity-pool addresses", () => {
        const sc = xdr.ScAddress.scAddressTypeLiquidityPool(
          Buffer.alloc(32) as unknown as xdr.Hash,
        );
        const lp = Address.fromScAddress(sc);
        expect(lp.toString()).toBe(LIQUIDITY_POOL_ZERO);
      });
    });

    describe(".fromScVal", () => {
      it("parses account ScVals", () => {
        const scVal = xdr.ScVal.scvAddress(
          xdr.ScAddress.scAddressTypeAccount(
            xdr.PublicKey.publicKeyTypeEd25519(
              StrKey.decodeEd25519PublicKey(ACCOUNT),
            ),
          ),
        );
        const a = Address.fromScVal(scVal);
        expect(a.toString()).toBe(ACCOUNT);
      });

      it("parses contract ScVals", () => {
        const scVal = xdr.ScVal.scvAddress(
          xdr.ScAddress.scAddressTypeContract(
            StrKey.decodeContract(CONTRACT) as unknown as xdr.Hash,
          ),
        );
        const c = Address.fromScVal(scVal);
        expect(c.toString()).toBe(CONTRACT);
      });

      it("parses muxed-account ScVals", () => {
        const scVal = xdr.ScVal.scvAddress(
          xdr.ScAddress.scAddressTypeMuxedAccount(
            new xdr.MuxedEd25519Account({
              id: new xdr.Uint64(MUXED_ADDRESS_ID),
              ed25519: StrKey.decodeEd25519PublicKey(MUXED_ADDRESS_BASE),
            }),
          ),
        );
        const m = Address.fromScVal(scVal);
        expect(m.toString()).toBe(MUXED_ADDRESS);
      });

      it("parses claimable-balance ScVals", () => {
        const scVal = xdr.ScVal.scvAddress(
          xdr.ScAddress.scAddressTypeClaimableBalance(
            new (xdr.ClaimableBalanceId as any)(
              "claimableBalanceIdTypeV0",
              Buffer.alloc(32),
            ),
          ),
        );
        const cb = Address.fromScVal(scVal);
        expect(cb.toString()).toBe(CLAIMABLE_BALANCE_ZERO);
      });

      it("parses liquidity-pool ScVals", () => {
        const scVal = xdr.ScVal.scvAddress(
          xdr.ScAddress.scAddressTypeLiquidityPool(
            Buffer.alloc(32) as unknown as xdr.Hash,
          ),
        );
        const lp = Address.fromScVal(scVal);
        expect(lp.toString()).toBe(LIQUIDITY_POOL_ZERO);
      });
    });
  });

  describe(".toScAddress", () => {
    it("converts accounts", () => {
      const a = new Address(ACCOUNT);
      const s = a.toScAddress();
      expect(s.switch()).toBe(xdr.ScAddressType.scAddressTypeAccount());
      expect(xdr.ScAddress.fromXDR(s.toXDR())).toEqual(s);
    });

    it("converts contracts", () => {
      const c = new Address(CONTRACT);
      const s = c.toScAddress();
      expect(s.switch()).toBe(xdr.ScAddressType.scAddressTypeContract());
      expect(xdr.ScAddress.fromXDR(s.toXDR())).toEqual(s);
    });

    it("converts muxed accounts", () => {
      const m = new Address(MUXED_ADDRESS);
      const s = m.toScAddress();
      expect(s).toBeInstanceOf(xdr.ScAddress);
      expect(s.switch()).toBe(xdr.ScAddressType.scAddressTypeMuxedAccount());
      expect(s.muxedAccount().ed25519()).toEqual(
        StrKey.decodeEd25519PublicKey(MUXED_ADDRESS_BASE),
      );
      expect(s.muxedAccount().id().toString()).toBe(MUXED_ADDRESS_ID);
      expect(xdr.ScAddress.fromXDR(s.toXDR())).toEqual(s);
    });

    it("converts claimable balances", () => {
      const cb = new Address(CLAIMABLE_BALANCE_ZERO);
      const s = cb.toScAddress();
      expect(s.switch()).toBe(
        xdr.ScAddressType.scAddressTypeClaimableBalance(),
      );
      expect(xdr.ScAddress.fromXDR(s.toXDR())).toEqual(s);
    });

    it("converts liquidity pools", () => {
      const lp = new Address(LIQUIDITY_POOL_ZERO);
      const s = lp.toScAddress();
      expect(s.switch()).toBe(xdr.ScAddressType.scAddressTypeLiquidityPool());
      expect(xdr.ScAddress.fromXDR(s.toXDR())).toEqual(s);
    });
  });

  describe(".toScVal", () => {
    it("wraps account ScAddress types", () => {
      const a = new Address(ACCOUNT);
      expect(a.toScVal().address().switch()).toBe(
        xdr.ScAddressType.scAddressTypeAccount(),
      );
    });

    it("wraps contract ScAddress types", () => {
      const c = new Address(CONTRACT);
      expect(c.toScVal().address().switch()).toBe(
        xdr.ScAddressType.scAddressTypeContract(),
      );
    });

    it("wraps muxed-account ScAddress types", () => {
      const m = new Address(MUXED_ADDRESS);
      expect(m.toScVal().address().switch()).toBe(
        xdr.ScAddressType.scAddressTypeMuxedAccount(),
      );
    });

    it("wraps liquidity-pool ScAddress types", () => {
      const lp = new Address(LIQUIDITY_POOL_ZERO);
      expect(lp.toScVal().address().switch()).toBe(
        xdr.ScAddressType.scAddressTypeLiquidityPool(),
      );
    });

    it("wraps claimable-balance ScAddress types", () => {
      const cb = new Address(CLAIMABLE_BALANCE_ZERO);
      const val = cb.toScVal();
      expect(val).toBeInstanceOf(xdr.ScVal);
      expect(val.address().switch()).toBe(
        xdr.ScAddressType.scAddressTypeClaimableBalance(),
      );
    });
  });

  describe(".toBuffer", () => {
    it("returns the raw public-key bytes for accounts", () => {
      const a = new Address(ACCOUNT);
      expect(a.toBuffer()).toEqual(StrKey.decodeEd25519PublicKey(ACCOUNT));
    });

    it("returns the raw hash for contracts", () => {
      const c = new Address(CONTRACT);
      expect(c.toBuffer()).toEqual(StrKey.decodeContract(CONTRACT));
    });

    it("returns raw bytes for muxed accounts", () => {
      const m = new Address(MUXED_ADDRESS);
      expect(m.toBuffer()).toEqual(
        StrKey.decodeMed25519PublicKey(MUXED_ADDRESS),
      );
    });

    it("returns raw bytes for claimable balances", () => {
      const cb = new Address(CLAIMABLE_BALANCE_ZERO);
      expect(cb.toBuffer()).toEqual(
        StrKey.decodeClaimableBalance(CLAIMABLE_BALANCE_ZERO),
      );
    });

    it("returns raw bytes for liquidity pools", () => {
      const lp = new Address(LIQUIDITY_POOL_ZERO);
      expect(lp.toBuffer()).toEqual(
        StrKey.decodeLiquidityPool(LIQUIDITY_POOL_ZERO),
      );
    });
  });

  describe("muxed-contract addresses (CAP-0084)", () => {
    // 2^64 - 1: a uint64 well above Number.MAX_SAFE_INTEGER, used to prove the
    // muxing id survives a fromScAddress -> toScAddress round-trip and the
    // muxedId() accessor without precision loss.
    const MUXED_CONTRACT_ID = "18446744073709551615";
    const CONTRACT_RAW = StrKey.decodeContract(CONTRACT);

    // CAP-0084's SC_ADDRESS_TYPE_MUXED_CONTRACT arm is gated to the `next`
    // channel, so the curr-bound default codec cannot construct or encode it
    // yet. Codec round-trip coverage runs only once the arm lands in the
    // active codec; the Address-level assertions below are codec-agnostic.
    const codecHasMuxedContract =
      typeof (xdr.ScAddressType as any).scAddressTypeMuxedContract ===
      "function";
    const itCodec = codecHasMuxedContract ? it : it.skip;

    function muxedContractScAddress(id: string): xdr.ScAddress {
      return (xdr.ScAddress as any).scAddressTypeMuxedContract(
        new (xdr as any).MuxedContract({
          id: new xdr.Uint64(id),
          contractId: CONTRACT_RAW,
        }),
      );
    }

    it(".muxedContract factory exposes its components", () => {
      const a = Address.muxedContract(CONTRACT_RAW, MUXED_CONTRACT_ID);
      expect(a.contractId()).toEqual(CONTRACT_RAW);
      expect(a.muxedId().toString()).toBe(MUXED_CONTRACT_ID);
      expect(a.type).toBe("muxedContract");
    });

    it("renders the display form <C-strkey>:<id>", () => {
      const a = Address.muxedContract(CONTRACT_RAW, MUXED_CONTRACT_ID);
      expect(a.toString()).toBe(`${CONTRACT}:${MUXED_CONTRACT_ID}`);
    });

    itCodec("fromScAddress decodes the arm without precision loss", () => {
      const sc = muxedContractScAddress(MUXED_CONTRACT_ID);
      const a = Address.fromScAddress(sc);
      expect(a.contractId()).toEqual(CONTRACT_RAW);
      expect(a.muxedId().toString()).toBe(MUXED_CONTRACT_ID);
      expect(a.toString()).toBe(`${CONTRACT}:${MUXED_CONTRACT_ID}`);
    });

    itCodec("round-trips Address -> ScAddress byte-for-byte", () => {
      const sc = muxedContractScAddress(MUXED_CONTRACT_ID);
      const out = Address.fromScAddress(sc).toScAddress();
      expect(out.switch()).toBe(
        (xdr.ScAddressType as any).scAddressTypeMuxedContract(),
      );
      expect(out.toXDR()).toEqual(sc.toXDR());
      expect(xdr.ScAddress.fromXDR(out.toXDR())).toEqual(sc);
    });

    itCodec("round-trips through ScVal", () => {
      const scVal = Address.muxedContract(
        CONTRACT_RAW,
        MUXED_CONTRACT_ID,
      ).toScVal();
      const back = Address.fromScVal(scVal);
      expect(back.toString()).toBe(`${CONTRACT}:${MUXED_CONTRACT_ID}`);
      expect(back.muxedId().toString()).toBe(MUXED_CONTRACT_ID);
    });

    it("toBuffer throws (no canonical single-buffer encoding)", () => {
      const a = Address.muxedContract(CONTRACT_RAW, MUXED_CONTRACT_ID);
      expect(() => a.toBuffer()).toThrow(
        /toBuffer is not supported for muxed-contract addresses/,
      );
    });

    it("constructor cannot parse the display string (no strkey yet)", () => {
      expect(() => new Address(`${CONTRACT}:${MUXED_CONTRACT_ID}`)).toThrow(
        /Unsupported address type/,
      );
    });

    it("contractId/muxedId throw for non-muxed-contract addresses", () => {
      const c = new Address(CONTRACT);
      expect(() => c.muxedId()).toThrow(/only valid for muxed-contract/);
      expect(() => c.contractId()).toThrow(/only valid for muxed-contract/);
    });
  });
});
