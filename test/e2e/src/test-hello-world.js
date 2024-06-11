const { expect } = require("chai");
const { clientFor } = require("./util");

describe("helloWorld client", function () {
  it("should return properly formed hello response", async function () {
    const { client } = await clientFor("helloWorld");
    const response = await client.hello({ world: "tests" });
    expect(response.result).to.deep.equal(["Hello", "tests"]);
  });

  it("should authenticate the user correctly", async function () {
    const { client, keypair } = await clientFor("helloWorld");
    const publicKey = keypair.publicKey();
    const { result } = await client.auth({ addr: publicKey, world: "lol" });
    expect(result).to.equal(publicKey);
  });

  it("should increment the counter correctly", async function () {
    const { client } = await clientFor("helloWorld");
    const { result: startingBalance } = await client.get_count();
    const inc = await client.inc();
    const incrementResponse = await inc.signAndSend();
    expect(incrementResponse.result).to.equal(startingBalance + 1);
    expect(startingBalance).to.equal(0); // Assuming the counter starts at 0
    const { result: newBalance } = await client.get_count();
    expect(newBalance).to.equal(startingBalance + 1);
  });

  it("should accept only options object for methods with no arguments", async function () {
    const { client } = await clientFor("helloWorld");
    const inc = await client.inc({ simulate: false });
    expect(inc.simulation).to.be.undefined;
  });
});
