import { describe, it, expect } from "vitest";

describe("Browser version tests", () => {
  it("StellarSdk is available globally", () => {
    // Skip this test if not running in browser environment
    if (typeof window === "undefined") {
      expect(true).toBe(true); // Pass the test in Node.js
      return;
    }

    expect(typeof (window as any).StellarSdk).toBe("object");
    expect((window as any).StellarSdk).toBeDefined();
  });

  it("StellarSdk has expected properties", () => {
    // Skip this test if not running in browser environment
    if (typeof window === "undefined") {
      expect(true).toBe(true); // Pass the test in Node.js
      return;
    }

    const StellarSdk = (window as any).StellarSdk;
    expect(StellarSdk.Keypair).toBeDefined();
    expect(StellarSdk.Networks).toBeDefined();
    expect(StellarSdk.TransactionBuilder).toBeDefined();
  });

  it("lodash is not exported globally", () => {
    if (typeof window !== "undefined") {
      expect(typeof (window as any)._).toBe("undefined");
    } else {
      expect(true).toBe(true); // Pass the test in Node.js
    }
  });
});
