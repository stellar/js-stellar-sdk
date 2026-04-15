import { describe, expect, it } from "vitest";
import { Asset } from "../../src/asset.js";
import {
  getLiquidityPoolId,
  LiquidityPoolFeeV18,
} from "../../src/get_liquidity_pool_id.js";
import { StrKey } from "../../src/strkey.js";

const assetA = new Asset(
  "ARST",
  "GB7TAYRUZGE6TVT7NHP5SMIZRNQA6PLM423EYISAOAP3MKYIQMVYP2JO",
);
const assetB = new Asset(
  "USD",
  "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
);
const fee = LiquidityPoolFeeV18;

describe("getLiquidityPoolId()", () => {
  it("throws if liquidityPoolType is not 'constant_product'", () => {
    // @ts-expect-error testing missing argument
    expect(() => getLiquidityPoolId()).toThrow(/liquidityPoolType is invalid/);
    // @ts-expect-error testing invalid type
    expect(() => getLiquidityPoolId(1)).toThrow(/liquidityPoolType is invalid/);
    // @ts-expect-error testing invalid value
    expect(() => getLiquidityPoolId("random_type")).toThrow(
      /liquidityPoolType is invalid/,
    );
  });

  it("throws if assetA is invalid", () => {
    expect(() =>
      // @ts-expect-error testing missing assetA
      getLiquidityPoolId("constant_product", {}),
    ).toThrow(/assetA is invalid/);

    expect(() =>
      // @ts-expect-error testing invalid assetA
      getLiquidityPoolId("constant_product", { assetA: "random" }),
    ).toThrow(/assetA is invalid/);
  });

  it("throws if assetB is invalid", () => {
    expect(() =>
      // @ts-expect-error testing missing assetB
      getLiquidityPoolId("constant_product", { assetA }),
    ).toThrow(/assetB is invalid/);

    expect(() =>
      // @ts-expect-error testing invalid assetB
      getLiquidityPoolId("constant_product", { assetA, assetB: "random" }),
    ).toThrow(/assetB is invalid/);
  });

  it("throws if fee is invalid", () => {
    expect(() =>
      // @ts-expect-error testing missing fee
      getLiquidityPoolId("constant_product", { assetA, assetB }),
    ).toThrow(/fee is invalid/);
  });

  it("throws if assets are not in lexicographic order", () => {
    expect(() =>
      getLiquidityPoolId("constant_product", {
        assetA: assetB,
        assetB: assetA,
        fee,
      }),
    ).toThrow(/Assets are not in lexicographic order/);
  });

  it("returns poolId correctly", () => {
    const poolId = getLiquidityPoolId("constant_product", {
      assetA,
      assetB,
      fee,
    });
    expect(poolId.toString("hex")).toBe(
      "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7",
    );
  });
});

describe("getLiquidityPoolId() mirror stellar-core getPoolID() tests", () => {
  // The tests below were copied from https://github.com/stellar/stellar-core/blob/c5f6349b240818f716617ca6e0f08d295a6fad9a/src/transactions/test/LiquidityPoolTradeTests.cpp#L430-L526
  const issuer1 = StrKey.encodeEd25519PublicKey(
    Buffer.from(
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "hex",
    ),
  );
  const issuer2 = StrKey.encodeEd25519PublicKey(
    Buffer.from(
      "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
      "hex",
    ),
  );

  it("returns poolId correctly for native and alphaNum4 (short and full length)", () => {
    expect(
      getLiquidityPoolId("constant_product", {
        assetA: Asset.native(),
        assetB: new Asset("AbC", issuer1),
        fee,
      }).toString("hex"),
    ).toBe("c17f36fbd210e43dca1cda8edc5b6c0f825fcb72b39f0392fd6309844d77ff7d");

    expect(
      getLiquidityPoolId("constant_product", {
        assetA: Asset.native(),
        assetB: new Asset("AbCd", issuer1),
        fee,
      }).toString("hex"),
    ).toBe("80e0c5dc79ed76bb7e63681f6456136762f0d01ede94bb379dbc793e66db35e6");
  });

  it("returns poolId correctly for native and alphaNum12 (short and full length)", () => {
    expect(
      getLiquidityPoolId("constant_product", {
        assetA: Asset.native(),
        assetB: new Asset("AbCdEfGhIjK", issuer1),
        fee,
      }).toString("hex"),
    ).toBe("d2306c6e8532f99418e9d38520865e1c1059cddb6793da3cc634224f2ffb5bd4");

    expect(
      getLiquidityPoolId("constant_product", {
        assetA: Asset.native(),
        assetB: new Asset("AbCdEfGhIjKl", issuer1),
        fee,
      }).toString("hex"),
    ).toBe("807e9e66653b5fda4dd4e672ff64a929fc5fdafe152eeadc07bb460c4849d711");
  });

  it("returns poolId correctly for alphaNum4 and alphaNum12, same code but different issuer", () => {
    expect(
      getLiquidityPoolId("constant_product", {
        assetA: new Asset("aBc", issuer1),
        assetB: new Asset("aBc", issuer2),
        fee,
      }).toString("hex"),
    ).toBe("5d7188454299529856586e81ea385d2c131c6afdd9d58c82e9aa558c16522fea");

    expect(
      getLiquidityPoolId("constant_product", {
        assetA: new Asset("aBcDeFgHiJkL", issuer1),
        assetB: new Asset("aBcDeFgHiJkL", issuer2),
        fee,
      }).toString("hex"),
    ).toBe("93fa82ecaabe987461d1e3c8e0fd6510558b86ac82a41f7c70b112281be90c71");
  });

  it("returns poolId correctly for alphaNum4 and alphaNum12 do not depend on issuer or code", () => {
    expect(
      getLiquidityPoolId("constant_product", {
        assetA: new Asset("aBc", issuer1),
        assetB: new Asset("aBcDeFgHiJk", issuer2),
        fee,
      }).toString("hex"),
    ).toBe("c0d4c87bbaade53764b904fde2901a0353af437e9d3a976f1252670b85a36895");
  });
});

describe("LiquidityPoolFeeV18", () => {
  it("equals 30", () => {
    expect(LiquidityPoolFeeV18).toBe(30);
  });
});

// ---------------------------------------------------------------
// Additional tests for uncovered code paths
// ---------------------------------------------------------------

describe("getLiquidityPoolId() additional coverage", () => {
  it("throws if fee is a valid number but not LiquidityPoolFeeV18", () => {
    expect(() =>
      getLiquidityPoolId("constant_product", { assetA, assetB, fee: 25 }),
    ).toThrow(/fee is invalid/);
  });

  it("throws if assetA and assetB are the same asset", () => {
    expect(() =>
      getLiquidityPoolId("constant_product", { assetA, assetB: assetA, fee }),
    ).toThrow(/Assets are not in lexicographic order/);
  });
});
