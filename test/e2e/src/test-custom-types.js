const { expect } = require("chai");
const { Address, contract } = require("../../..");
const { clientFor } = require("./util");

describe("Custom Types Tests", function () {
  before(async function () {
    const { client, keypair, contractId } = await clientFor("customTypes");
    const publicKey = keypair.publicKey();
    const addr = Address.fromString(publicKey);
    this.context = { client, publicKey, addr, contractId, keypair };
  });

  it("hello", async function () {
    expect(
      (await this.context.client.hello({ hello: "tests" })).result,
    ).to.equal("tests");
  });

  it("view method with empty keypair", async function () {
    const { client: client2 } = await clientFor("customTypes", {
      keypair: undefined,
      contractId: this.context.contractId,
    });
    expect((await client2.hello({ hello: "anonymous" })).result).to.equal(
      "anonymous",
    );
  });

  it("woid", async function () {
    expect((await this.context.client.woid()).result).to.be.null;
  });

  it("u32_fail_on_even", async function () {
    let response = await this.context.client.u32_fail_on_even({ u32_: 1 });
    expect(response.result).to.deep.equal(new contract.Ok(1));

    response = await this.context.client.u32_fail_on_even({ u32_: 2 });
    expect(response.result).to.deep.equal(
      new contract.Err({ message: "Please provide an odd number" }),
    );
  });

  it("u32", async function () {
    expect((await this.context.client.u32_({ u32_: 1 })).result).to.equal(1);
  });

  it("i32", async function () {
    expect((await this.context.client.i32_({ i32_: 1 })).result).to.equal(1);
  });

  it("i64", async function () {
    expect((await this.context.client.i64_({ i64_: 1n })).result).to.equal(1n);
  });

  it("strukt_hel", async function () {
    const strukt = { a: 0, b: true, c: "world" };
    expect(
      (await this.context.client.strukt_hel({ strukt })).result,
    ).to.deep.equal(["Hello", "world"]);
  });

  it("strukt", async function () {
    const strukt = { a: 0, b: true, c: "hello" };
    expect((await this.context.client.strukt({ strukt })).result).to.deep.equal(
      strukt,
    );
  });

  it("simple first", async function () {
    const simple = { tag: "First", values: undefined };
    expect((await this.context.client.simple({ simple })).result).to.deep.equal(
      { tag: "First" },
    );
  });

  it("simple second", async function () {
    const simple = { tag: "Second", values: undefined };
    expect((await this.context.client.simple({ simple })).result).to.deep.equal(
      { tag: "Second" },
    );
  });

  it("simple third", async function () {
    const simple = { tag: "Third", values: undefined };
    expect((await this.context.client.simple({ simple })).result).to.deep.equal(
      { tag: "Third" },
    );
  });

  it("complex with struct", async function () {
    const arg = { tag: "Struct", values: [{ a: 0, b: true, c: "hello" }] };
    expect(
      (await this.context.client.complex({ complex: arg })).result,
    ).to.deep.equal(arg);
  });

  it("complex with tuple", async function () {
    const arg = {
      tag: "Tuple",
      values: [
        [
          { a: 0, b: true, c: "hello" },
          { tag: "First", values: undefined },
        ],
      ],
    };
    const ret = {
      tag: "Tuple",
      values: [[{ a: 0, b: true, c: "hello" }, { tag: "First" }]],
    };
    expect(
      (await this.context.client.complex({ complex: arg })).result,
    ).to.deep.equal(ret);
  });

  it("complex with enum", async function () {
    const arg = { tag: "Enum", values: [{ tag: "First", values: undefined }] };
    const ret = { tag: "Enum", values: [{ tag: "First" }] };
    expect(
      (await this.context.client.complex({ complex: arg })).result,
    ).to.deep.equal(ret);
  });

  it("complex with asset", async function () {
    const arg = { tag: "Asset", values: [this.context.publicKey, 1n] };
    expect(
      (await this.context.client.complex({ complex: arg })).result,
    ).to.deep.equal(arg);
  });

  it("complex with void", async function () {
    const complex = { tag: "Void", values: undefined };
    const ret = { tag: "Void" };
    expect(
      (await this.context.client.complex({ complex })).result,
    ).to.deep.equal(ret);
  });

  it("addresse", async function () {
    expect(
      (await this.context.client.addresse({ addresse: this.context.publicKey }))
        .result,
    ).to.equal(this.context.addr.toString());
  });

  it("bytes", async function () {
    const bytes = Buffer.from("hello");
    expect((await this.context.client.bytes({ bytes })).result).to.deep.equal(
      bytes,
    );
  });

  it("bytesN", async function () {
    const bytesN = Buffer.from("123456789"); // what's the correct way to construct bytesN?
    expect(
      (await this.context.client.bytes_n({ bytes_n: bytesN })).result,
    ).to.deep.equal(bytesN);
  });

  it("card", async function () {
    const card = 11;
    expect((await this.context.client.card({ card })).result).to.equal(card);
  });

  it("boolean", async function () {
    expect(
      (await this.context.client.boolean({ boolean: true })).result,
    ).to.equal(true);
  });

  it("not", async function () {
    expect((await this.context.client.not({ boolean: true })).result).to.equal(
      false,
    );
  });

  it("i128", async function () {
    expect((await this.context.client.i128({ i128: -1n })).result).to.equal(
      -1n,
    );
  });

  it("u128", async function () {
    expect((await this.context.client.u128({ u128: 1n })).result).to.equal(1n);
  });

  it("multi_args", async function () {
    let response = await this.context.client.multi_args({ a: 1, b: true });
    expect(response.result).to.equal(1);

    response = await this.context.client.multi_args({ a: 1, b: false });
    expect(response.result).to.equal(0);
  });

  it("map", async function () {
    const map = new Map();
    map.set(1, true);
    map.set(2, false);
    expect((await this.context.client.map({ map })).result).to.deep.equal(
      Array.from(map.entries()),
    );
  });

  it("vec", async function () {
    const vec = [1, 2, 3];
    expect((await this.context.client.vec({ vec })).result).to.deep.equal(vec);
  });

  it("tuple", async function () {
    const tuple = ["hello", 1];
    expect((await this.context.client.tuple({ tuple })).result).to.deep.equal(
      tuple,
    );
  });

  it("option", async function () {
    let response = await this.context.client.option({ option: 1 });
    expect(response.result).to.equal(1);

    response = await this.context.client.option({ option: undefined });
    expect(response.result).to.equal(undefined);
    // this is the behavior we probably want, but fails
    // t.deepEqual(await t.context.client.option(), undefined) // typing and implementation require the object
    // t.deepEqual((await t.context.client.option({})).result, undefined) // typing requires argument; implementation would be fine with this
    // t.deepEqual((await t.context.client.option({ option: undefined })).result, undefined)
  });

  it("u256", async function () {
    expect((await this.context.client.u256({ u256: 1n })).result).to.equal(1n);
  });

  it("i256", async function () {
    expect((await this.context.client.i256({ i256: -1n })).result).to.equal(
      -1n,
    );
  });

  it("string", async function () {
    expect(
      (await this.context.client.string({ string: "hello" })).result,
    ).to.equal("hello");
  });

  it("tuple strukt", async function () {
    const arg = [
      { a: 0, b: true, c: "hello" },
      { tag: "First", values: undefined },
    ];
    const res = [{ a: 0, b: true, c: "hello" }, { tag: "First" }];
    expect(
      (await this.context.client.tuple_strukt({ tuple_strukt: arg })).result,
    ).to.deep.equal(res);
  });
});
