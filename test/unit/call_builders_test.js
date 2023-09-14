import URI from "urijs";

const { CallBuilder } = StellarSdk;

describe("CallBuilder functions", function () {
  it("doesn't mutate the constructor passed url argument (it clones it instead)", function () {
    let arg = URI("https://onedom.ain/");
    const builder = new CallBuilder(arg);
    builder.url.segment("one_segment");
    builder.checkFilter();

    expect(arg.toString()).not.to.be.equal("https://onedom.ain/one_segment"); // https://onedom.ain/
    expect(builder.url.toString()).to.be.equal(
      "https://onedom.ain/one_segment",
    );
  });
});
