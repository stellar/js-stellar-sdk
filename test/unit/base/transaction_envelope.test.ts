import { describe, it, expect } from "vitest";
import { Transaction } from "../../../src/base/transaction.js";
import { Networks } from "../../../src/base/network.js";
import xdr from "../../../src/base/xdr.js";

describe("TransactionEnvelope", () => {
  it("can successfully decode an envelope", () => {
    // from https://github.com/stellar/js-stellar-sdk/issues/73
    const envelopeXdr =
      "AAAAAPQQv+uPYrlCDnjgPyPRgIjB6T8Zb8ANmL8YGAXC2IAgAAAAZAAIteYAAAAHAAAAAAAAAAAAAAABAAAAAAAAAAMAAAAAAAAAAUVVUgAAAAAAUtYuFczBLlsXyEp3q8BbTBpEGINWahqkFbnTPd93YUUAAAAXSHboAAAAABEAACcQAAAAAAAAAKIAAAAAAAAAAcLYgCAAAABAo2tU6n0Bb7bbbpaXacVeaTVbxNMBtnrrXVk2QAOje2Flllk/ORlmQdFU/9c8z43eWh1RNMpI3PscY+yDCnJPBQ==";

    const envelope = xdr.TransactionEnvelope.fromXDR(envelopeXdr, "base64");
    if (envelope.type !== "envelopeTypeTxV0") {
      throw new Error("expected envelopeTypeTxV0");
    }
    const sourceAccount = envelope.v0.tx.sourceAccountEd25519;

    expect(sourceAccount.length).toBe(32);
  });

  it("rejects envelopes with non-utf8 memo text", () => {
    // The new XDR codec validates `string` fields as UTF-8 on decode. The
    // envelope below contains a memo_text payload with byte 0xD1, which is
    // not a well-formed standalone UTF-8 byte, so decoding now throws.
    const envelopeXdr =
      "AAAAAAtjwtJadppTmm0NtAU99BFxXXfzPO1N/SqR43Z8aXqXAAAAZAAIj6YAAAACAAAAAAAAAAEAAAAB0QAAAAAAAAEAAAAAAAAAAQAAAADLa6390PDAqg3qDLpshQxS+uVw3ytSgKRirQcInPWt1QAAAAAAAAAAA1Z+AAAAAAAAAAABfGl6lwAAAEBC655+8Izq54MIZrXTVF/E1ycHgQWpVcBD+LFkuOjjJd995u/7wM8sFqQqambL0/ME2FTOtxMO65B9i3eAIu4P";
    expect(() => new Transaction(envelopeXdr, Networks.PUBLIC)).toThrow(
      /invalid UTF-8 string/,
    );
  });
});
