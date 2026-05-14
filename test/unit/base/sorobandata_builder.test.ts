import { describe, it, expect } from "vitest";
import { Contract } from "../../../src/base/contract.js";
import { SorobanDataBuilder } from "../../../src/base/sorobandata_builder.js";
import xdr from "../../../src/base/xdr.js";

describe("SorobanTransactionData can be built", () => {
  const contractId = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
  const c = new Contract(contractId);

  const sentinel: xdr.SorobanTransactionData = {
    ext: xdr.SorobanTransactionDataExt.case0(),
    resources: {
      footprint: { readOnly: [], readWrite: [] },
      instructions: 1,
      diskReadBytes: 2,
      writeBytes: 3,
    },
    resourceFee: BigInt(5),
  };

  const key = c.getFootprint(); // arbitrary key for testing

  // Migrated tests
  it("constructs from xdr, base64, and nothing", () => {
    new SorobanDataBuilder();
    const fromRaw = new SorobanDataBuilder(sentinel).build();
    const fromStr = new SorobanDataBuilder(
      xdr.SorobanTransactionData.toXDR(sentinel, "base64"),
    ).build();

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
    const toLedgerKeyXDR = (k: xdr.LedgerKey) =>
      xdr.LedgerKey.toXDR(k, "base64");
    expect(
      withFootprint.resources.footprint.readOnly.map(toLedgerKeyXDR),
    ).toEqual([key].map(toLedgerKeyXDR));
    expect(
      withFootprint.resources.footprint.readWrite.map(toLedgerKeyXDR),
    ).toEqual([key].map(toLedgerKeyXDR));
  });

  it("leaves untouched footprints untouched", () => {
    const builder = new SorobanDataBuilder();

    const data = builder.setFootprint([key], [key]).build();
    const data2 = new SorobanDataBuilder(data).setFootprint(null, []).build();

    const toLedgerKeyXDR = (k: xdr.LedgerKey) =>
      xdr.LedgerKey.toXDR(k, "base64");
    expect(data.resources.footprint.readOnly.map(toLedgerKeyXDR)).toEqual(
      [key].map(toLedgerKeyXDR),
    );
    expect(data.resources.footprint.readWrite.map(toLedgerKeyXDR)).toEqual(
      [key].map(toLedgerKeyXDR),
    );
    expect(data2.resources.footprint.readOnly.map(toLedgerKeyXDR)).toEqual(
      [key].map(toLedgerKeyXDR),
    );
    expect(data2.resources.footprint.readWrite.map(toLedgerKeyXDR)).toEqual(
      [].map(toLedgerKeyXDR),
    );
  });

  it("appends footprints", () => {
    const builder = new SorobanDataBuilder();

    const data = builder
      .setFootprint([key], [key])
      .appendFootprint([key, key], []);
    const built = data.build();

    expect(data.getReadOnly()).toEqual([key, key, key]);
    expect(data.getReadWrite()).toEqual([key]);
    const toLedgerKeyXDR = (k: xdr.LedgerKey) =>
      xdr.LedgerKey.toXDR(k, "base64");
    expect(built.resources.footprint.readOnly.map(toLedgerKeyXDR)).toEqual(
      [key, key, key].map(toLedgerKeyXDR),
    );
    expect(built.resources.footprint.readWrite.map(toLedgerKeyXDR)).toEqual(
      [key].map(toLedgerKeyXDR),
    );
  });

  it("makes copies on build()", () => {
    const builder = new SorobanDataBuilder();
    const first = builder.build();
    const second = builder.setResourceFee(100).build();

    expect(first.resourceFee).not.toEqual(second.resourceFee);
  });

  // Additional tests
  it("constructs from raw Uint8Array", () => {
    const raw = xdr.SorobanTransactionData.toXDR(sentinel);
    const fromBuf = new SorobanDataBuilder(Buffer.from(raw)).build();
    const fromUint8 = new SorobanDataBuilder(new Uint8Array(raw)).build();

    expect(fromBuf).toEqual(sentinel);
    expect(fromUint8).toEqual(sentinel);
  });

  it("fromXDR decodes base64 strings and raw buffers", () => {
    const fromBase64 = SorobanDataBuilder.fromXDR(
      xdr.SorobanTransactionData.toXDR(sentinel, "base64"),
    );
    const fromRaw = SorobanDataBuilder.fromXDR(
      xdr.SorobanTransactionData.toXDR(sentinel),
    );

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

    expect(xdr.LedgerKey.toXDR(built.resources.footprint.readOnly[0])).toEqual(
      xdr.LedgerKey.toXDR(key),
    );
    expect(xdr.LedgerKey.toXDR(built.resources.footprint.readWrite[0])).toEqual(
      xdr.LedgerKey.toXDR(key),
    );
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
    const toLedgerKeyXDR = (k: xdr.LedgerKey) =>
      xdr.LedgerKey.toXDR(k, "base64");
    expect(withNull.resources.footprint.readOnly.map(toLedgerKeyXDR)).toEqual(
      [key].map(toLedgerKeyXDR),
    );
    expect(withNull.resources.footprint.readWrite.map(toLedgerKeyXDR)).toEqual(
      [key].map(toLedgerKeyXDR),
    );
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

  it("throws when fromXDR receives malformed input", () => {
    expect(() => SorobanDataBuilder.fromXDR("not-valid")).toThrow();
  });
});
