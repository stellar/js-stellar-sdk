const test = require("ava");
const { clientFor } = require("./util");

// this test checks that apps can pass methods as arguments to other methods and have them still work
function callMethod(method, args) {
  return method(args);
}

test("methods-as-args", async (t) => {
  const { client } = await clientFor("helloWorld");
  const { result } = await callMethod(client.hello, { world: "tests" });
  t.deepEqual(result, ["Hello", "tests"]);
});
