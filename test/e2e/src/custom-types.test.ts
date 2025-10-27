import { expect, beforeAll } from "vitest";
import { Address, contract } from "../../../lib";
import { clientFor } from "./util";

let context: { client: any; publicKey: string; addr: any; contractId: string; keypair: any };

describe("Custom Types Tests", () => {
  beforeAll(async () => {
    const { client, keypair, contractId } = await clientFor("customTypes");
    const publicKey = keypair!.publicKey();
    const addr = Address.fromString(publicKey);
    context = { client, publicKey, addr, contractId, keypair };
  });

  it("hello", async () => {
    expect(
      (await context.client.hello({ hello: "tests" })).result,
    ).toBe("tests");
  });

  it("view method with empty keypair", async () => {
    const { client: client2 } = await clientFor("customTypes", {
      contractId: context.contractId,
    });
    expect((await (client2 as any).i32_({ i32_: 1 })).result).toEqual(1);
  });

  it("should increment the counter correctly", async () => {
    const { result: startingBalance } = await context.client.get_count();
    const inc = await context.client.inc();
    const incrementResponse = await inc.signAndSend();
    expect(incrementResponse.result).toBe(startingBalance + 1);
    expect(startingBalance).toBe(0); // Assuming the counter starts at 0
    const { result: newBalance } = await context.client.get_count();
    expect(newBalance).toBe(startingBalance + 1);
  });

  it("should accept only options object for methods with no arguments", async () => {
    const inc = await context.client.inc({ simulate: false });
    expect(inc.simulation).toBeUndefined();
  });

  it("woid", async () => {
    expect((await context.client.woid()).result).toBeNull();
  });

  it("should authenticate the user correctly", async () => {
    const { result } = await context.client.auth({
      addr: context.publicKey,
      world: "lol",
    });
    expect(result).toBe(context.publicKey);
  });

  it("should authenticate the user correctly", async () => {
    const { result } = await context.client.auth({
      addr: context.publicKey,
      world: "lol",
    });
    expect(result).toBe(context.publicKey);
  });

  it("u32_fail_on_even", async () => {
    let response = await context.client.u32_fail_on_even({ u32_: 1 });
    expect(response.result).toEqual(new contract.Ok(1));

    response = await context.client.u32_fail_on_even({ u32_: 2 });
    expect(response.result).toEqual(
      new contract.Err({ message: "Please provide an odd number" }),
    );
  });

  it("u32", async () => {
    expect((await context.client.u32_({ u32_: 1 })).result).toBe(1);
  });

  it("i32", async () => {
    expect((await context.client.i32_({ i32_: 1 })).result).toBe(1);
  });

  it("i64", async () => {
    expect((await context.client.i64_({ i64_: 1n })).result).toBe(1n);
  });

  it("strukt_hel", async () => {
    const strukt = { a: 0, b: true, c: "world" };
    expect(
      (await context.client.strukt_hel({ strukt })).result,
    ).toEqual(["Hello", "world"]);
  });

  it("strukt", async () => {
    const strukt = { a: 0, b: true, c: "hello" };
    expect((await context.client.strukt({ strukt })).result).toEqual(
      strukt,
    );
  });

  it("simple first", async () => {
    const simple = { tag: "First", values: undefined };
    expect((await context.client.simple({ simple })).result).toEqual(
      { tag: "First" },
    );
  });

  it("simple second", async () => {
    const simple = { tag: "Second", values: undefined };
    expect((await context.client.simple({ simple })).result).toEqual(
      { tag: "Second" },
    );
  });

  it("simple third", async () => {
    const simple = { tag: "Third", values: undefined };
    expect((await context.client.simple({ simple })).result).toEqual(
      { tag: "Third" },
    );
  });

  it("complex with struct", async () => {
    const arg = { tag: "Struct", values: [{ a: 0, b: true, c: "hello" }] };
    expect(
      (await context.client.complex({ complex: arg })).result,
    ).toEqual(arg);
  });

  it("complex with tuple", async () => {
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
      (await context.client.complex({ complex: arg })).result,
    ).toEqual(ret);
  });

  it("complex with enum", async () => {
    const arg = { tag: "Enum", values: [{ tag: "First", values: undefined }] };
    const ret = { tag: "Enum", values: [{ tag: "First" }] };
    expect(
      (await context.client.complex({ complex: arg })).result,
    ).toEqual(ret);
  });

  it("complex with asset", async () => {
    const arg = { tag: "Asset", values: [context.publicKey, 1n] };
    expect(
      (await context.client.complex({ complex: arg })).result,
    ).toEqual(arg);
  });

  it("complex with void", async () => {
    const complex = { tag: "Void", values: undefined };
    const ret = { tag: "Void" };
    expect(
      (await context.client.complex({ complex })).result,
    ).toEqual(ret);
  });

  it("addresse", async () => {
    expect(
      (await context.client.addresse({ addresse: context.publicKey }))
        .result,
    ).toBe(context.addr.toString());
  });

  it("bytes", async () => {
    const bytes = Buffer.from("hello");
    expect((await context.client.bytes({ bytes })).result).toEqual(
      bytes,
    );
  });

  it("bytesN", async () => {
    const bytesN = Buffer.from("123456789"); // what's the correct way to construct bytesN?
    expect(
      (await context.client.bytes_n({ bytes_n: bytesN })).result,
    ).toEqual(bytesN);
  });

  it("card", async () => {
    const card = 11;
    expect((await context.client.card({ card })).result).toBe(card);
  });

  it("boolean", async () => {
    expect(
      (await context.client.boolean({ boolean: true })).result,
    ).toBe(true);
  });

  it("not", async () => {
    expect((await context.client.not({ boolean: true })).result).toBe(
      false,
    );
  });

  it("i128", async () => {
    expect((await context.client.i128({ i128: -1n })).result).toBe(
      -1n,
    );
  });

  it("u128", async () => {
    expect((await context.client.u128({ u128: 1n })).result).toBe(1n);
  });

  it("multi_args", async () => {
    let response = await context.client.multi_args({ a: 1, b: true });
    expect(response.result).toBe(1);

    response = await context.client.multi_args({ a: 1, b: false });
    expect(response.result).toBe(0);
  });

  it("map", async () => {
    const map = new Map();
    map.set(1, true);
    map.set(2, false);
    expect((await context.client.map({ map })).result).toEqual(
      Array.from(map.entries()),
    );
  });

  it("vec", async () => {
    const vec = [1, 2, 3];
    expect((await context.client.vec({ vec })).result).toEqual(vec);
  });

  it("tuple", async () => {
    const tuple = ["hello", 1];
    expect((await context.client.tuple({ tuple })).result).toEqual(
      tuple,
    );
  });

  it("option", async () => {
    let response = await context.client.option({ option: 1 });
    expect(response.result).toBe(1);

    response = await context.client.option({ option: undefined });
    expect(response.result).toBeNull();
    // this is the behavior we probably want, but fails
    // t.deepEqual(await t.context.client.option(), undefined) // typing and implementation require the object
    // t.deepEqual((await t.context.client.option({})).result, undefined) // typing requires argument; implementation would be fine with this
    // t.deepEqual((await t.context.client.option({ option: undefined })).result, undefined)
  });

  it("u256", async () => {
    expect((await context.client.u256({ u256: 1n })).result).toBe(1n);
  });

  it("i256", async () => {
    expect((await context.client.i256({ i256: -1n })).result).toBe(
      -1n,
    );
  });

  it("string", async () => {
    expect(
      (await context.client.string({ string: "hello" })).result,
    ).toBe("hello");
  });

  it("tuple strukt", async () => {
    const arg = [
      { a: 0, b: true, c: "hello" },
      { tag: "First", values: undefined },
    ];
    const res = [{ a: 0, b: true, c: "hello" }, { tag: "First" }];
    expect(
      (await context.client.tuple_strukt({ tuple_strukt: arg })).result,
    ).toEqual(res);
  });
});
