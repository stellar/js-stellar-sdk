import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { StellarSdk } from "../test-utils/stellar-sdk-import";

const { SERVER_TIME_MAP, getCurrentServerTime } = StellarSdk.Horizon;

describe("getCurrentServerTime", () => {
  beforeEach(() => {
    // set it to 50 seconds
    vi.useFakeTimers({ now: 5050000 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when the hostname hasn't been hit", () => {
    expect(getCurrentServerTime("host")).toBeNull();
  });

  it("returns null when no time is available", () => {
    SERVER_TIME_MAP.host = {
      serverTime: 0,
      localTimeRecorded: 0,
    };
    expect(getCurrentServerTime("host")).toBeNull();
  });

  it("returns null when the old time is too old", () => {
    SERVER_TIME_MAP.host = {
      serverTime: 10,
      localTimeRecorded: 5,
    };
    expect(getCurrentServerTime("host")).toBeNull();
  });

  it("returns the delta between then and now", () => {
    SERVER_TIME_MAP.host = {
      serverTime: 10,
      localTimeRecorded: 5005,
    };
    expect(getCurrentServerTime("host")).toBe(55);
  });
});
