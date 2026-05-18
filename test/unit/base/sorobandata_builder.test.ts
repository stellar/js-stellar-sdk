import { describe, it, expect } from "vitest";
import { Contract } from "../../../src/base/contract.js";
import { SorobanDataBuilder } from "../../../src/base/sorobandata_builder.js";
import * as xdr from "../../../src/xdr/index.js";

describe("SorobanTransactionData can be built", () => {
  const contractId = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
  const c = new Contract(contractId);

  const sentinel = new xdr.SorobanTransactionData({
    ext: xdr.SorobanTransactionDataExt.v0(),
    resources: new xdr.SorobanResources({
      footprint: new xdr.LedgerFootprint({ readOnly: [], readWrite: [] }),
      instructions: 1,
      diskReadBytes: 2,
      writeBytes: 3,
    }),
    resourceFee: 5n,
  });

  // Round-trip the key through encode/decode so its internals are Uint8Array
  // (StrKey decode returns Buffer, but SorobanDataBuilder.build round-trips
  // through bytes and produces Uint8Array — comparing the raw Buffer-backed
  // key against a Uint8Array-backed roundtrip fails deep equality).
  const key = xdr.LedgerKey.fromXdr(c.getFootprint().toXdr());

  // Migrated tests
  it("constructs from xdr, base64, and nothing", () => {
    new SorobanDataBuilder();
    const fromRaw = new SorobanDataBuilder(sentinel).build();
    const fromStr = new SorobanDataBuilder(sentinel.toXdr("base64")).build();

    expect(fromRaw).toEqual(sentinel);
    expect(fromStr).toEqual(sentinel);

    const baseline = new SorobanDataBuilder().build();
    [null, "", 0].forEach((falsy) => {
      const db = new SorobanDataBuilder(falsy as any).build();
      expect(db).toEqual(baseline);
    });
  });

  it("sets properties as expected", () => {
    expect(
      new SorobanDataBuilder().setResources(1, 2, 3).setResourceFee(5).build(),
    ).toEqual(sentinel);

    // this isn't a valid param but we're just checking that setters work
    const withFootprint = new SorobanDataBuilder()
      .setFootprint([key], [key])
      .build();
    expect(withFootprint.resources.footprint.readOnly[0]).toEqual(key);
    expect(withFootprint.resources.footprint.readWrite[0]).toEqual(key);
  });

  it("leaves untouched footprints untouched", () => {
    const builder = new SorobanDataBuilder();

    const data = builder.setFootprint([key], [key]).build();
    const data2 = new SorobanDataBuilder(data).setFootprint(null, []).build();

    expect(data.resources.footprint.readOnly).toEqual([key]);
    expect(data.resources.footprint.readWrite).toEqual([key]);
    expect(data2.resources.footprint.readOnly).toEqual([key]);
    expect(data2.resources.footprint.readWrite).toEqual([]);
  });

  it("appends footprints", () => {
    const builder = new SorobanDataBuilder();

    const data = builder
      .setFootprint([key], [key])
      .appendFootprint([key, key], []);
    const built = data.build();

    expect(data.getReadOnly()).toEqual([key, key, key]);
    expect(data.getReadWrite()).toEqual([key]);
    expect(built.resources.footprint.readOnly).toEqual([key, key, key]);
    expect(built.resources.footprint.readWrite).toEqual([key]);
  });

  it("makes copies on build()", () => {
    const builder = new SorobanDataBuilder();
    const first = builder.build();
    const second = builder.setResourceFee(100).build();

    expect(first.resourceFee).not.toEqual(second.resourceFee);
  });

  // Additional tests
  it("constructs from raw Uint8Array", () => {
    const raw = sentinel.toXdr();
    const fromBuf = new SorobanDataBuilder(Buffer.from(raw)).build();
    const fromUint8 = new SorobanDataBuilder(new Uint8Array(raw)).build();

    expect(fromBuf).toEqual(sentinel);
    expect(fromUint8).toEqual(sentinel);
  });

  it("fromXdr decodes base64 strings and raw buffers", () => {
    const fromBase64 = SorobanDataBuilder.fromXdr(sentinel.toXdr("base64"));
    const fromRaw = SorobanDataBuilder.fromXdr(sentinel.toXdr());

    expect(fromBase64).toEqual(sentinel);
    expect(fromRaw).toEqual(sentinel);
  });

  it("setResourceFee accepts string and bigint", () => {
    const fromString = new SorobanDataBuilder()
      .setResources(1, 2, 3)
      .setResourceFee("5")
      .build();
    const fromBigInt = new SorobanDataBuilder()
      .setResources(1, 2, 3)
      .setResourceFee(BigInt(5))
      .build();

    expect(fromString).toEqual(sentinel);
    expect(fromBigInt).toEqual(sentinel);
  });

  it("setReadOnly and setReadWrite work directly", () => {
    const built = new SorobanDataBuilder()
      .setReadOnly([key])
      .setReadWrite([key])
      .build();

    expect(built.resources.footprint.readOnly).toEqual([key]);
    expect(built.resources.footprint.readWrite).toEqual([key]);
  });

  it("setReadOnly and setReadWrite clear when called with no args", () => {
    const built = new SorobanDataBuilder()
      .setFootprint([key], [key])
      .setReadOnly()
      .setReadWrite()
      .build();

    expect(built.resources.footprint.readOnly).toEqual([]);
    expect(built.resources.footprint.readWrite).toEqual([]);
  });

  it("setFootprint with undefined clears, null preserves", () => {
    const base = new SorobanDataBuilder().setFootprint([key], [key]);

    // undefined clears (passes through to setReadOnly/setReadWrite with no arg)
    const withUndefined = new SorobanDataBuilder(base.build())
      .setFootprint(undefined, undefined)
      .build();
    expect(withUndefined.resources.footprint.readOnly).toEqual([]);
    expect(withUndefined.resources.footprint.readWrite).toEqual([]);

    // null preserves existing values
    const withNull = new SorobanDataBuilder(base.build())
      .setFootprint(null, null)
      .build();
    expect(withNull.resources.footprint.readOnly).toEqual([key]);
    expect(withNull.resources.footprint.readWrite).toEqual([key]);
  });

  it("getFootprint returns the footprint directly", () => {
    const builder = new SorobanDataBuilder().setFootprint([key], [key]);
    const footprint = builder.getFootprint();

    expect(footprint.readOnly).toEqual([key]);
    expect(footprint.readWrite).toEqual([key]);
  });

  it("throws when constructor receives an invalid base64 string", () => {
    expect(() => new SorobanDataBuilder("not-valid-base64")).toThrow();
  });

  it("throws when fromXdr receives malformed input", () => {
    expect(() => SorobanDataBuilder.fromXdr("not-valid")).toThrow();
  });
});
