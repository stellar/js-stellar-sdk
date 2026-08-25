import { describe, it, expect } from "vitest";

import {
  AssetCode4,
  AssetCode12,
  BytesValue,
  Hash,
  Signature,
} from "../../../src/xdr/index.js";
import { opaque } from "@stellar/js-xdr";

describe("BytesValue#toString", () => {
  it("renders hex-encoded aliases as hex", () => {
    const hex = "ab".repeat(32);
    expect(new Hash(hex).toString()).toBe(hex);
    expect(new Hash(new Uint8Array(32).fill(0xab)).toString()).toBe(hex);
  });

  it("round-trips through the constructor", () => {
    const sig = new Signature(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
    expect(new Signature(sig.toString()).value).toEqual(sig.value);
  });

  it("renders ascii-encoded aliases as text", () => {
    expect(
      new AssetCode4(new Uint8Array([0x55, 0x53, 0x44, 0x43])).toString(),
    ).toBe("USDC");
  });

  it("keeps the zero padding a short asset code gained", () => {
    expect(new AssetCode4("USD").toString()).toBe("USD\0");
    expect(new AssetCode12("LONGCODE").toString()).toBe("LONGCODE\0\0\0\0");
  });

  it("renders base64-encoded subclasses as base64", () => {
    class B64Bytes extends BytesValue<"B64Bytes"> {
      static readonly encoding = "base64" as const;

      static readonly schema = opaque(4, "B64Bytes");
    }
    const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    expect(new B64Bytes(bytes).toString()).toBe("3q2+7w==");
    expect(new B64Bytes("3q2+7w==").value).toEqual(bytes);
  });

  it("returns a plain string usable in interpolation", () => {
    const hash = new Hash("00".repeat(32));
    expect(`${hash}`).toBe("00".repeat(32));
    expect(String(hash)).toBe("00".repeat(32));
  });
});
