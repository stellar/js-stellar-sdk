const URI = require("urijs");
const { CallBuilder } = require("../../../lib/call_builder"); // bc not exported

describe("CallBuilder functions", function () {
  it("doesn't mutate the constructor passed url argument (it clones it instead)", function () {
    let arg = URI("https://onedom.ain/");

    const builder = new CallBuilder(arg);
    builder.url.segment("one_segment");
    builder.checkFilter();

    expect(arg.toString()).not.to.equal("https://onedom.ain/one_segment"); // https://onedom.ain/
    expect(builder.url.toString()).to.equal("https://onedom.ain/one_segment");
  });
});
