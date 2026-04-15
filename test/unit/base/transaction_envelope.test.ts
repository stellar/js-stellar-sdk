import { describe, it, expect } from "vitest";
import { Transaction } from "../../src/transaction.js";
import { Networks } from "../../src/network.js";
import xdr from "../../src/xdr.js";

describe("TransactionEnvelope", () => {
  it("can successfully decode an envelope", () => {
    // from https://github.com/stellar/js-stellar-sdk/issues/73
    const envelopeXdr =
      "AAAAAPQQv+uPYrlCDnjgPyPRgIjB6T8Zb8ANmL8YGAXC2IAgAAAAZAAIteYAAAAHAAAAAAAAAAAAAAABAAAAAAAAAAMAAAAAAAAAAUVVUgAAAAAAUtYuFczBLlsXyEp3q8BbTBpEGINWahqkFbnTPd93YUUAAAAXSHboAAAAABEAACcQAAAAAAAAAKIAAAAAAAAAAcLYgCAAAABAo2tU6n0Bb7bbbpaXacVeaTVbxNMBtnrrXVk2QAOje2Flllk/ORlmQdFU/9c8z43eWh1RNMpI3PscY+yDCnJPBQ==";

    const txe = xdr.TransactionEnvelope.fromXDR(
      envelopeXdr,
      "base64",
    ).value() as xdr.TransactionV0Envelope;
    const sourceAccount = txe.tx().sourceAccountEd25519();

    expect(sourceAccount.length).toBe(32);
  });

  it("calculates correct hash with non-utf8 strings", () => {
    // a84d534b3742ad89413bdbf259e02fa4c5d039123769e9bcc63616f723a2bcd5
    const envelopeXdr =
      "AAAAAAtjwtJadppTmm0NtAU99BFxXXfzPO1N/SqR43Z8aXqXAAAAZAAIj6YAAAACAAAAAAAAAAEAAAAB0QAAAAAAAAEAAAAAAAAAAQAAAADLa6390PDAqg3qDLpshQxS+uVw3ytSgKRirQcInPWt1QAAAAAAAAAAA1Z+AAAAAAAAAAABfGl6lwAAAEBC655+8Izq54MIZrXTVF/E1ycHgQWpVcBD+LFkuOjjJd995u/7wM8sFqQqambL0/ME2FTOtxMO65B9i3eAIu4P";
    const tx = new Transaction(envelopeXdr, Networks.PUBLIC);
    expect(tx.hash().toString("hex")).toBe(
      "a84d534b3742ad89413bdbf259e02fa4c5d039123769e9bcc63616f723a2bcd5",
    );
  });
});
