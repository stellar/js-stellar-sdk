const { expect } = require("chai");
const { clientFor } = require("./util");

// this test checks that apps can pass methods as arguments to other methods and have them still work
function callMethod(method, args) {
  return method(args);
}

describe("methods-as-args", function () {
  it("should pass methods as arguments and have them still work", async function () {
    const { client } = await clientFor("helloWorld");
    const { result } = await callMethod(client.hello, { world: "tests" });
    expect(result).to.deep.equal(["Hello", "tests"]);
  });
});
