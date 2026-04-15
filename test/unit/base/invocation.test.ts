import { describe, it, expect } from "vitest";

import { Keypair } from "../../src/keypair.js";
import { Asset } from "../../src/asset.js";
import { StrKey } from "../../src/strkey.js";
import xdr from "../../src/xdr.js";
import { hash } from "../../src/hashing.js";
import { Address } from "../../src/address.js";
import { Contract } from "../../src/contract.js";
import { nativeToScVal } from "../../src/scval.js";
import {
  buildInvocationTree,
  walkInvocationTree,
} from "../../src/invocation.js";
import { expectDefined } from "../support/expect_defined.js";

function randomKey(): string {
  return Keypair.random().publicKey();
}

function randomContract(): Contract {
  const buf = hash(Keypair.random().publicKey());
  return new Contract(StrKey.encodeContract(buf));
}

function makeInvocation(
  contract: Contract,
  name: string,
  ...args: any[]
): xdr.SorobanAuthorizedFunction {
  return xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
    new xdr.InvokeContractArgs({
      contractAddress: contract.address().toScAddress(),
      functionName: name,
      args: args.map((a) => nativeToScVal(a)),
    }),
  );
}

describe("buildInvocationTree", () => {
  const invoker = randomKey();
  const nftContract = randomContract();
  const swapContract = randomContract();
  const xlmContract = randomContract();
  const usdcContract = randomContract();
  const nftId = randomKey();
  const usdcId = randomKey();
  const dest = randomKey();

  // Complex invocation tree:
  // purchase("SomeNft:G...", 7 xlm)
  //     +--- create(wrap: "SomeNft:G...")         (SAC)
  //     +--- swap(xlm, usdc, from, to)
  //     |      +--- xlm.transfer(from, "7")
  //     |      +--- usdc.transfer(from, "1")
  //     +--- someNft.transfer(someNft, "2")
  //     +--- createV2(custom wasm contract)       (WASM V2 with ctor args)
  const rootInvocation = new xdr.SorobanAuthorizedInvocation({
    function: makeInvocation(nftContract, "purchase", `SomeNft:${nftId}`, 7),
    subInvocations: [
      new xdr.SorobanAuthorizedInvocation({
        function:
          xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeCreateContractHostFn(
            new xdr.CreateContractArgs({
              contractIdPreimage:
                xdr.ContractIdPreimage.contractIdPreimageFromAsset(
                  new Asset("TEST", nftId).toXDRObject(),
                ),
              executable:
                xdr.ContractExecutable.contractExecutableStellarAsset(),
            }),
          ),
        subInvocations: [],
      }),
      new xdr.SorobanAuthorizedInvocation({
        function: makeInvocation(
          swapContract,
          "swap",
          "native",
          `USDC:${usdcId}`,
          new Address(invoker).toScVal(),
          new Address(dest).toScVal(),
        ),
        subInvocations: [
          new xdr.SorobanAuthorizedInvocation({
            function: makeInvocation(
              xlmContract,
              "transfer",
              new Address(invoker).toScVal(),
              "7",
            ),
            subInvocations: [],
          }),
          new xdr.SorobanAuthorizedInvocation({
            function: makeInvocation(
              usdcContract,
              "transfer",
              new Address(invoker).toScVal(),
              "1",
            ),
            subInvocations: [],
          }),
        ],
      }),
      new xdr.SorobanAuthorizedInvocation({
        function: makeInvocation(
          nftContract,
          "transfer",
          nftContract.address().toScVal(),
          "2",
        ),
        subInvocations: [],
      }),
      new xdr.SorobanAuthorizedInvocation({
        function:
          xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeCreateContractV2HostFn(
            new xdr.CreateContractArgsV2({
              contractIdPreimage:
                xdr.ContractIdPreimage.contractIdPreimageFromAddress(
                  new xdr.ContractIdPreimageFromAddress({
                    address: nftContract.address().toScAddress(),
                    salt: Buffer.alloc(32, 0),
                  }),
                ),
              constructorArgs: [1, "2", 3].map((arg, i) => {
                return nativeToScVal(arg, {
                  type: ["u32", "string", "i32"][i] as any,
                });
              }),
              executable: xdr.ContractExecutable.contractExecutableWasm(
                Buffer.alloc(32, "\x20"),
              ),
            }),
          ),
        subInvocations: [],
      }),
    ],
  });

  const expectedParsed = {
    type: "execute",
    args: {
      source: nftContract.contractId(),
      function: "purchase",
      args: [`SomeNft:${nftId}`, "7"],
    },
    invocations: [
      {
        type: "create",
        args: {
          type: "sac",
          asset: `TEST:${nftId}`,
        },
        invocations: [],
      },
      {
        type: "execute",
        args: {
          source: swapContract.contractId(),
          function: "swap",
          args: ["native", `USDC:${usdcId}`, invoker, dest],
        },
        invocations: [
          {
            type: "execute",
            args: {
              source: xlmContract.contractId(),
              function: "transfer",
              args: [invoker, "7"],
            },
            invocations: [],
          },
          {
            type: "execute",
            args: {
              source: usdcContract.contractId(),
              function: "transfer",
              args: [invoker, "1"],
            },
            invocations: [],
          },
        ],
      },
      {
        type: "execute",
        args: {
          source: nftContract.contractId(),
          function: "transfer",
          args: [nftContract.contractId(), "2"],
        },
        invocations: [],
      },
      {
        type: "create",
        args: {
          type: "wasm",
          wasm: {
            salt: "00".repeat(32),
            hash: "20".repeat(32),
            address: nftContract.contractId(),
            constructorArgs: [1, "2", 3],
          },
        },
        invocations: [],
      },
    ],
  };

  it("builds valid XDR for the root invocation", () => {
    expect(() => rootInvocation.toXDR()).not.toThrow();
  });

  it("outputs a human-readable version of the invocation tree", () => {
    const parsed = buildInvocationTree(rootInvocation);
    expect(
      JSON.stringify(
        parsed,
        (_, val) => (typeof val === "bigint" ? val.toString() : val),
        2,
      ),
    ).toEqual(JSON.stringify(expectedParsed, null, 2));
  });

  it("handles a simple execute invocation", () => {
    const contract = randomContract();
    const inv = new xdr.SorobanAuthorizedInvocation({
      function: makeInvocation(contract, "hello", "world"),
      subInvocations: [],
    });
    const tree = buildInvocationTree(inv);
    expect(tree.type).toBe("execute");
    expect((tree.args as any).source).toBe(contract.contractId());
    expect((tree.args as any).function).toBe("hello");
    expect((tree.args as any).args).toEqual(["world"]);
    expect(tree.invocations).toHaveLength(0);
  });

  it("handles a SAC creation invocation", () => {
    const issuer = randomKey();
    const inv = new xdr.SorobanAuthorizedInvocation({
      function:
        xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeCreateContractHostFn(
          new xdr.CreateContractArgs({
            contractIdPreimage:
              xdr.ContractIdPreimage.contractIdPreimageFromAsset(
                new Asset("USD", issuer).toXDRObject(),
              ),
            executable: xdr.ContractExecutable.contractExecutableStellarAsset(),
          }),
        ),
      subInvocations: [],
    });
    const tree = buildInvocationTree(inv);
    expect(tree.type).toBe("create");
    expect((tree.args as any).type).toBe("sac");
    expect((tree.args as any).asset).toBe(`USD:${issuer}`);
  });

  it("handles a WASM V1 creation invocation (no constructorArgs)", () => {
    const contract = randomContract();
    const wasmHash = Buffer.alloc(32, "\x42");
    const salt = Buffer.alloc(32, "\x01");
    const inv = new xdr.SorobanAuthorizedInvocation({
      function:
        xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeCreateContractHostFn(
          new xdr.CreateContractArgs({
            contractIdPreimage:
              xdr.ContractIdPreimage.contractIdPreimageFromAddress(
                new xdr.ContractIdPreimageFromAddress({
                  address: contract.address().toScAddress(),
                  salt,
                }),
              ),
            executable: xdr.ContractExecutable.contractExecutableWasm(wasmHash),
          }),
        ),
      subInvocations: [],
    });
    const tree = buildInvocationTree(inv);
    expect(tree.type).toBe("create");
    const args = tree.args as any;
    expect(args.type).toBe("wasm");
    expect(args.wasm.hash).toBe("42".repeat(32));
    expect(args.wasm.salt).toBe("01".repeat(32));
    expect(args.wasm.address).toBe(contract.contractId());
    // V1 should NOT have constructorArgs at all
    expect(args.wasm.constructorArgs).toBeUndefined();
  });

  it("handles a WASM V2 creation with empty constructor args", () => {
    const contract = randomContract();
    const inv = new xdr.SorobanAuthorizedInvocation({
      function:
        xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeCreateContractV2HostFn(
          new xdr.CreateContractArgsV2({
            contractIdPreimage:
              xdr.ContractIdPreimage.contractIdPreimageFromAddress(
                new xdr.ContractIdPreimageFromAddress({
                  address: contract.address().toScAddress(),
                  salt: Buffer.alloc(32, 0),
                }),
              ),
            constructorArgs: [],
            executable: xdr.ContractExecutable.contractExecutableWasm(
              Buffer.alloc(32, "\x10"),
            ),
          }),
        ),
      subInvocations: [],
    });
    const tree = buildInvocationTree(inv);
    expect(tree.type).toBe("create");
    const args = tree.args as any;
    expect(args.type).toBe("wasm");
    expect(args.wasm.constructorArgs).toEqual([]);
  });

  it("throws for mismatched exec/preimage types", () => {
    // wasm executable + asset preimage = invalid
    const issuer = randomKey();
    const inv = new xdr.SorobanAuthorizedInvocation({
      function:
        xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeCreateContractHostFn(
          new xdr.CreateContractArgs({
            contractIdPreimage:
              xdr.ContractIdPreimage.contractIdPreimageFromAsset(
                new Asset("USD", issuer).toXDRObject(),
              ),
            executable: xdr.ContractExecutable.contractExecutableWasm(
              Buffer.alloc(32, "\x01"),
            ),
          }),
        ),
      subInvocations: [],
    });
    expect(() => buildInvocationTree(inv)).toThrow(
      /creation function appears invalid/,
    );
  });
});

describe("walkInvocationTree", () => {
  it("walks all nodes depth-first", () => {
    const [c1, c2, c3] = [randomContract(), randomContract(), randomContract()];
    const root = new xdr.SorobanAuthorizedInvocation({
      function: makeInvocation(c1, "root"),
      subInvocations: [
        new xdr.SorobanAuthorizedInvocation({
          function: makeInvocation(c2, "child1"),
          subInvocations: [
            new xdr.SorobanAuthorizedInvocation({
              function: makeInvocation(c3, "grandchild"),
              subInvocations: [],
            }),
          ],
        }),
      ],
    });

    let walkCount = 0;
    let maxDepth = 0;
    const walkSet: Record<string, number> = {};

    walkInvocationTree(root, (node, depth) => {
      walkCount++;
      const s = node.toXDR("base64");
      if (s in walkSet) {
        const count = expectDefined(walkSet[s]);
        walkSet[s] = count + 1;
      } else {
        walkSet[s] = 1;
      }
      maxDepth = Math.max(maxDepth, depth);
      return true;
    });

    expect(walkCount).toBe(3);
    expect(
      Object.values(walkSet).reduce((accum, curr) => accum + (curr ?? 0), 0),
    ).toBe(3);
    expect(maxDepth).toBe(3);
  });

  it("walks complex tree with 7 nodes", () => {
    const nftContract = randomContract();
    const swapContract = randomContract();
    const xlmContract = randomContract();
    const usdcContract = randomContract();
    const invoker = randomKey();
    const nftId = randomKey();
    const usdcId = randomKey();
    const dest = randomKey();

    const rootInvocation = new xdr.SorobanAuthorizedInvocation({
      function: makeInvocation(nftContract, "purchase", `SomeNft:${nftId}`, 7),
      subInvocations: [
        new xdr.SorobanAuthorizedInvocation({
          function:
            xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeCreateContractHostFn(
              new xdr.CreateContractArgs({
                contractIdPreimage:
                  xdr.ContractIdPreimage.contractIdPreimageFromAsset(
                    new Asset("TEST", nftId).toXDRObject(),
                  ),
                executable:
                  xdr.ContractExecutable.contractExecutableStellarAsset(),
              }),
            ),
          subInvocations: [],
        }),
        new xdr.SorobanAuthorizedInvocation({
          function: makeInvocation(
            swapContract,
            "swap",
            "native",
            `USDC:${usdcId}`,
            new Address(invoker).toScVal(),
            new Address(dest).toScVal(),
          ),
          subInvocations: [
            new xdr.SorobanAuthorizedInvocation({
              function: makeInvocation(
                xlmContract,
                "transfer",
                new Address(invoker).toScVal(),
                "7",
              ),
              subInvocations: [],
            }),
            new xdr.SorobanAuthorizedInvocation({
              function: makeInvocation(
                usdcContract,
                "transfer",
                new Address(invoker).toScVal(),
                "1",
              ),
              subInvocations: [],
            }),
          ],
        }),
        new xdr.SorobanAuthorizedInvocation({
          function: makeInvocation(
            nftContract,
            "transfer",
            nftContract.address().toScVal(),
            "2",
          ),
          subInvocations: [],
        }),
        new xdr.SorobanAuthorizedInvocation({
          function:
            xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeCreateContractV2HostFn(
              new xdr.CreateContractArgsV2({
                contractIdPreimage:
                  xdr.ContractIdPreimage.contractIdPreimageFromAddress(
                    new xdr.ContractIdPreimageFromAddress({
                      address: nftContract.address().toScAddress(),
                      salt: Buffer.alloc(32, 0),
                    }),
                  ),
                constructorArgs: [1, "2", 3].map((arg, i) => {
                  return nativeToScVal(arg, {
                    type: ["u32", "string", "i32"][i] as any,
                  });
                }),
                executable: xdr.ContractExecutable.contractExecutableWasm(
                  Buffer.alloc(32, "\x20"),
                ),
              }),
            ),
          subInvocations: [],
        }),
      ],
    });

    let walkCount = 0;
    const walkSet: Record<string, number> = {};
    let maxDepth = 0;

    walkInvocationTree(rootInvocation, (node, depth) => {
      walkCount++;
      const s = node.toXDR("base64");
      if (s in walkSet) {
        const count = expectDefined(walkSet[s]);
        walkSet[s] = count + 1;
      } else {
        walkSet[s] = 1;
      }
      maxDepth = Math.max(maxDepth, depth);
      return true;
    });

    expect(walkCount).toBe(7);
    expect(
      Object.values(walkSet).reduce((accum, curr) => accum + (curr ?? 0), 0),
    ).toBe(7);
    expect(Object.values(walkSet).every((val) => val !== 0)).toBe(true);
    expect(maxDepth).toBe(3);
  });

  it("stops exploring a subtree when callback returns false", () => {
    const [c1, c2, c3] = [randomContract(), randomContract(), randomContract()];
    const root = new xdr.SorobanAuthorizedInvocation({
      function: makeInvocation(c1, "root"),
      subInvocations: [
        new xdr.SorobanAuthorizedInvocation({
          function: makeInvocation(c2, "child"),
          subInvocations: [
            new xdr.SorobanAuthorizedInvocation({
              function: makeInvocation(c3, "grandchild"),
              subInvocations: [],
            }),
          ],
        }),
      ],
    });

    let visited = 0;
    walkInvocationTree(root, (_node, depth) => {
      visited++;
      if (depth === 2) {
        return false; // stop exploring deeper from depth 2
      }
      return undefined;
    });

    // root (depth 1) + child (depth 2) = 2 visited
    // grandchild is NOT visited because we returned false at depth 2
    expect(visited).toBe(2);
  });

  it("provides parent node to callback", () => {
    const [c1, c2] = [randomContract(), randomContract()];
    const root = new xdr.SorobanAuthorizedInvocation({
      function: makeInvocation(c1, "root"),
      subInvocations: [
        new xdr.SorobanAuthorizedInvocation({
          function: makeInvocation(c2, "child"),
          subInvocations: [],
        }),
      ],
    });

    const parents: Array<xdr.SorobanAuthorizedInvocation | undefined> = [];
    walkInvocationTree(root, (_node, _depth, parent) => {
      parents.push(parent);
    });

    expect(parents).toHaveLength(2);
    // Root has no parent
    expect(parents[0]).toBeUndefined();
    // Child's parent should be the root
    const parent = expectDefined(parents[1]);
    expect(parent.toXDR("base64")).toBe(root.toXDR("base64"));
  });

  it("handles void return from callback (continues walking)", () => {
    const c1 = randomContract();
    const root = new xdr.SorobanAuthorizedInvocation({
      function: makeInvocation(c1, "root"),
      subInvocations: [],
    });

    let visited = 0;
    walkInvocationTree(root, () => {
      visited++;
      // returning void (undefined) - should continue
    });

    expect(visited).toBe(1);
  });
});
