import { describe, it, expect, vi } from "vitest";
import { xdr, contract } from "../../src/index.js";
import { ClientGenerator } from "../../src/bindings/index.js";

const { Spec, Client, AssembledTransaction } = contract;

// Build a single ScSpecEntry function entry with the given name, inputs, and
// a single output type. Names use only [a-zA-Z0-9_] characters.
function funcEntry(
  name: string,
  inputs: xdr.ScSpecFunctionInputV0[],
  output: xdr.ScSpecTypeDef,
): xdr.ScSpecEntry {
  return xdr.ScSpecEntry.scSpecEntryFunctionV0(
    new xdr.ScSpecFunctionV0({
      doc: "",
      name,
      inputs,
      outputs: [output],
    }),
  );
}

function input(name: string, type: xdr.ScSpecTypeDef): xdr.ScSpecFunctionInputV0 {
  return new xdr.ScSpecFunctionInputV0({ doc: "", name, type });
}

// Two distinct, valid contract function names that collide under
// sanitizeIdentifier: "delete" is a reserved word -> "delete_", and the
// already-named "delete_" stays "delete_".
//
// They are given DISTINCT, observable schemas:
//   - delete:  takes one u32 input,  returns bool   (boolean)
//   - delete_: takes no inputs,      returns u32     (number)
function collidingSpec(): InstanceType<typeof Spec> {
  return new Spec([
    funcEntry(
      "delete",
      [input("x", xdr.ScSpecTypeDef.scSpecTypeU32())],
      xdr.ScSpecTypeDef.scSpecTypeBool(),
    ),
    funcEntry("delete_", [], xdr.ScSpecTypeDef.scSpecTypeU32()),
  ]);
}

describe("sanitizeIdentifier function-name collision (R980)", () => {
  it("generated bindings emit a duplicate `delete_` interface method and fromJSON key", () => {
    const generated = new ClientGenerator(collidingSpec()).generate();

    // The interface advertises BOTH functions, but both resolve to the same
    // identifier `delete_`. The two distinct schemas (boolean vs number) prove
    // these are two different contract functions collapsed onto one name.
    expect(generated).toContain(
      "delete_(): Promise<AssembledTransaction<number>>;",
    );
    expect(generated).toContain(
      "delete_(x: u32): Promise<AssembledTransaction<boolean>>;",
    );

    // The fromJSON object literal contains the key `delete_` TWICE -> a
    // duplicate object key. At runtime the second wins, silently binding only
    // one of the two functions for JSON result decoding.
    const fromJSONKeyOccurrences = (
      generated.match(/delete_ : this\.txFromJSON</g) || []
    ).length;
    expect(fromJSONKeyOccurrences).toBe(2);

    // Both fromJSON output schemas are present even though only one key can
    // survive in the literal.
    expect(generated).toContain("delete_ : this.txFromJSON<boolean>");
    expect(generated).toContain("delete_ : this.txFromJSON<number>");
  });

  it("runtime ContractClient binds a single `delete_` property, dropping `delete`", () => {
    const spec = collidingSpec();
    const client = new Client(spec, {
      contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      networkPassphrase: "Test SDF Network ; September 2015",
      rpcUrl: "https://example.invalid/soroban/rpc",
      allowHttp: true,
    });

    // sanitizeIdentifier("delete") === sanitizeIdentifier("delete_") === "delete_",
    // so no property is ever named "delete" and only ONE property exists for the
    // two functions.
    expect((client as any).delete).toBeUndefined();
    expect(typeof (client as any).delete_).toBe("function");

    // The surviving `delete_` property is the LAST-defined function ("delete_",
    // the no-input function): it is the zero-arg wrapper. The first function
    // ("delete", which takes a u32 input) has been overwritten and is
    // unreachable.
    expect((client as any).delete_.length).toBe(0); // zero-arg wrapper

    // Capture which underlying contract method the surviving property actually
    // invokes by spying on AssembledTransaction.build.
    const buildSpy = vi
      .spyOn(AssembledTransaction, "build")
      .mockReturnValue("BUILT" as any);

    (client as any).delete_();

    expect(buildSpy).toHaveBeenCalledTimes(1);
    const buildArgs = buildSpy.mock.calls[0][0] as { method: string };
    // The property routes to "delete_" (the survivor), NOT "delete". The
    // original `delete` function can never be invoked through the client.
    expect(buildArgs.method).toBe("delete_");

    buildSpy.mockRestore();
  });
});
