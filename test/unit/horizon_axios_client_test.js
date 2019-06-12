const SERVER_TIME_MAP = StellarSdk.SERVER_TIME_MAP;
const getCurrentServerTime = StellarSdk.getCurrentServerTime;

describe("getCurrentServerTime", () => {
  let clock;

  beforeEach(() => {
    // set it to 50 seconds
    clock = sinon.useFakeTimers(5050000);
  });

  afterEach(() => {
    clock.restore();
  });

  it("returns null when the hostname hasnt been hit", () => {
    expect(getCurrentServerTime("host")).to.be.null;
  });

  it("returns null when no time is available", () => {
    SERVER_TIME_MAP.host = {};
    expect(getCurrentServerTime("host")).to.be.null;
  });

  it("returns null when the old time is too old", () => {
    SERVER_TIME_MAP.host = {
      serverTime: 10,
      localTimeRecorded: 5,
    };
    expect(getCurrentServerTime("host")).to.be.null;
  });

  it("returns the delta between then and now", () => {
    SERVER_TIME_MAP.host = {
      serverTime: 10,
      localTimeRecorded: 5005,
    };
    expect(getCurrentServerTime("host")).to.equal(55);
  });
});
