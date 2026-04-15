import { describe, it, expect } from "vitest";
import { Account } from "../../src/account.js";

describe("Account.constructor", () => {
  const ACCOUNT = "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB";
  const MUXED_ADDRESS =
    "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVAAAAAAAAAAAAAJLK";

  it("fails to create Account object from an invalid address", () => {
    expect(() => new Account("GBBB", "0")).toThrow(/accountId is invalid/);
  });

  it("fails to create Account object from an invalid sequence number", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    expect(() => new Account(ACCOUNT, 100 as any)).toThrow(
      /sequence must be of type string/,
    );
    expect(() => new Account(ACCOUNT, "not a number")).toThrow(
      /sequence is not a valid number/,
    );
  });

  it("fails to create Account object from an empty string sequence", () => {
    expect(() => new Account(ACCOUNT, "")).toThrow(
      /sequence is not a valid number/,
    );
  });

  it("creates an Account object", () => {
    const account = new Account(ACCOUNT, "100");
    expect(account.accountId()).toBe(ACCOUNT);
    expect(account.sequenceNumber()).toBe("100");
  });

  it("wont create Account objects from muxed account strings", () => {
    expect(() => {
      new Account(MUXED_ADDRESS, "123");
    }).toThrow(/MuxedAccount/);
  });
});

describe("Account.incrementSequenceNumber", () => {
  it("correctly increments the sequence number", () => {
    const account = new Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "100",
    );
    account.incrementSequenceNumber();
    expect(account.sequenceNumber()).toBe("101");
    account.incrementSequenceNumber();
    account.incrementSequenceNumber();
    expect(account.sequenceNumber()).toBe("103");
  });

  it("handles large sequence numbers beyond Number.MAX_SAFE_INTEGER", () => {
    const account = new Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "9007199254740993",
    );
    expect(account.sequenceNumber()).toBe("9007199254740993");
    account.incrementSequenceNumber();
    expect(account.sequenceNumber()).toBe("9007199254740994");
  });

  it("handles sequence starting at zero", () => {
    const account = new Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "0",
    );
    expect(account.sequenceNumber()).toBe("0");
    account.incrementSequenceNumber();
    expect(account.sequenceNumber()).toBe("1");
  });
});
