import { StellarSdk } from "../test-utils/stellar-sdk-import";
import { describe, it, expect } from "vitest";

const { BindingGenerator, xdr, contract } = StellarSdk;

describe("BindingGenerator", () => {
  const defaultOptions = { contractName: "test-contract" };

  // Helper to create a minimal spec (Spec requires at least one entry)
  const createMinimalSpec = () => {
    const funcSpec = xdr.ScSpecEntry.scSpecEntryFunctionV0(
      new xdr.ScSpecFunctionV0({
        doc: "",
        name: "noop",
        inputs: [],
        outputs: [],
      }),
    );
    return new contract.Spec([funcSpec.toXDR("base64")]);
  };

  // Helper to create a function spec entry
  const createFunctionSpec = (
    name: string,
    inputs: Array<{ name: string; type: any; doc?: string }>,
    outputs: any[] = [],
    doc = "",
  ) =>
    xdr.ScSpecEntry.scSpecEntryFunctionV0(
      new xdr.ScSpecFunctionV0({
        doc,
        name,
        inputs: inputs.map(
          (i) =>
            new xdr.ScSpecFunctionInputV0({
              name: i.name,
              doc: i.doc || "",
              type: i.type,
            }),
        ),
        outputs,
      }),
    );

  // Helper to create a struct spec entry
  const createStructSpec = (
    name: string,
    fields: Array<{ name: string; type: any; doc?: string }>,
    doc = "",
  ) =>
    xdr.ScSpecEntry.scSpecEntryUdtStructV0(
      new xdr.ScSpecUdtStructV0({
        doc,
        lib: "",
        name,
        fields: fields.map(
          (f) =>
            new xdr.ScSpecUdtStructFieldV0({
              doc: f.doc || "",
              name: f.name,
              type: f.type,
            }),
        ),
      }),
    );

  describe("fromSpec", () => {
    it("creates a generator from a Spec object", () => {
      const spec = createMinimalSpec();
      const generator = BindingGenerator.fromSpec(spec);
      expect(generator).toBeInstanceOf(BindingGenerator);
    });
  });

  describe("generate - validation", () => {
    it("throws when contractName is missing", () => {
      const spec = createMinimalSpec();
      const generator = BindingGenerator.fromSpec(spec);
      expect(() => generator.generate({ contractName: "" })).toThrow(
        "contractName is required",
      );
    });

    it("throws when contractName is whitespace only", () => {
      const spec = createMinimalSpec();
      const generator = BindingGenerator.fromSpec(spec);
      expect(() => generator.generate({ contractName: "   " })).toThrow(
        "contractName is required",
      );
    });
  });

  describe("generate - index file", () => {
    it("always exports Client", () => {
      const spec = createMinimalSpec();
      const generator = BindingGenerator.fromSpec(spec);
      const result = generator.generate(defaultOptions);
      expect(result.index).toContain('export { Client } from "./client.js"');
    });

    it("exports types when UDTs are present", () => {
      const structSpec = createStructSpec("MyStruct", [
        { name: "value", type: xdr.ScSpecTypeDef.scSpecTypeU32() },
      ]);
      const spec = new contract.Spec([structSpec.toXDR("base64")]);
      const generator = BindingGenerator.fromSpec(spec);
      const result = generator.generate(defaultOptions);
      expect(result.index).toContain('export * from "./types.js"');
    });

    it("omits types export when no UDTs", () => {
      const funcSpec = createFunctionSpec(
        "hello",
        [],
        [xdr.ScSpecTypeDef.scSpecTypeString()],
      );
      const spec = new contract.Spec([funcSpec.toXDR("base64")]);
      const generator = BindingGenerator.fromSpec(spec);
      const result = generator.generate(defaultOptions);
      expect(result.index).not.toContain('export * from "./types.js"');
    });
  });

  describe("generate - client method signatures", () => {
    it("generates method with no inputs", () => {
      const funcSpec = createFunctionSpec(
        "get_value",
        [],
        [xdr.ScSpecTypeDef.scSpecTypeU32()],
        "Get the current value",
      );
      const spec = new contract.Spec([funcSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.client).toContain("get_value(");
      expect(result.client).toContain("options?: MethodOptions");
      expect(result.client).toContain("Promise<AssembledTransaction<number>>");
    });

    it("generates method with single input", () => {
      const funcSpec = createFunctionSpec(
        "set_value",
        [{ name: "value", type: xdr.ScSpecTypeDef.scSpecTypeU32() }],
        [],
      );
      const spec = new contract.Spec([funcSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.client).toContain("set_value(");
      expect(result.client).toContain("{ value }: { value: number }");
    });

    it("generates method with multiple inputs", () => {
      const funcSpec = createFunctionSpec("transfer", [
        { name: "from", type: xdr.ScSpecTypeDef.scSpecTypeAddress() },
        { name: "to", type: xdr.ScSpecTypeDef.scSpecTypeAddress() },
        { name: "amount", type: xdr.ScSpecTypeDef.scSpecTypeI128() },
      ]);
      const spec = new contract.Spec([funcSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.client).toContain("transfer(");
      expect(result.client).toContain("from: string | Address");
      expect(result.client).toContain("to: string | Address");
      expect(result.client).toContain("amount: bigint");
    });

    describe("type mappings", () => {
      const primitiveTypes = [
        {
          name: "address",
          type: xdr.ScSpecTypeDef.scSpecTypeAddress(),
          expectedOutput: "string",
          expectedInput: "string | Address",
        },
        {
          name: "bool",
          type: xdr.ScSpecTypeDef.scSpecTypeBool(),
          expectedOutput: "boolean",
          expectedInput: "boolean",
        },
        {
          name: "bytes",
          type: xdr.ScSpecTypeDef.scSpecTypeBytes(),
          expectedOutput: "Buffer",
          expectedInput: "Buffer",
        },
        {
          name: "bytesN",
          type: xdr.ScSpecTypeDef.scSpecTypeBytesN(
            new xdr.ScSpecTypeBytesN({ n: 32 }),
          ),
          expectedOutput: "Buffer",
          expectedInput: "Buffer",
        },
        {
          name: "duration",
          type: xdr.ScSpecTypeDef.scSpecTypeDuration(),
          expectedOutput: "bigint",
          expectedInput: "bigint",
        },
        {
          name: "i128",
          type: xdr.ScSpecTypeDef.scSpecTypeI128(),
          expectedOutput: "bigint",
          expectedInput: "bigint",
        },
        {
          name: "i256",
          type: xdr.ScSpecTypeDef.scSpecTypeI256(),
          expectedOutput: "bigint",
          expectedInput: "bigint",
        },
        {
          name: "i32",
          type: xdr.ScSpecTypeDef.scSpecTypeI32(),
          expectedOutput: "number",
          expectedInput: "number",
        },
        {
          name: "i64",
          type: xdr.ScSpecTypeDef.scSpecTypeI64(),
          expectedOutput: "bigint",
          expectedInput: "bigint",
        },
        {
          name: "string",
          type: xdr.ScSpecTypeDef.scSpecTypeString(),
          expectedOutput: "string",
          expectedInput: "string",
        },
        {
          name: "symbol",
          type: xdr.ScSpecTypeDef.scSpecTypeSymbol(),
          expectedOutput: "string",
          expectedInput: "string",
        },
        {
          name: "timepoint",
          type: xdr.ScSpecTypeDef.scSpecTypeTimepoint(),
          expectedOutput: "bigint",
          expectedInput: "bigint",
        },
        {
          name: "u128",
          type: xdr.ScSpecTypeDef.scSpecTypeU128(),
          expectedOutput: "bigint",
          expectedInput: "bigint",
        },
        {
          name: "u256",
          type: xdr.ScSpecTypeDef.scSpecTypeU256(),
          expectedOutput: "bigint",
          expectedInput: "bigint",
        },
        {
          name: "u32",
          type: xdr.ScSpecTypeDef.scSpecTypeU32(),
          expectedOutput: "number",
          expectedInput: "number",
        },
        {
          name: "u64",
          type: xdr.ScSpecTypeDef.scSpecTypeU64(),
          expectedOutput: "bigint",
          expectedInput: "bigint",
        },
        {
          name: "vec",
          type: xdr.ScSpecTypeDef.scSpecTypeVec(
            new xdr.ScSpecTypeVec({
              elementType: xdr.ScSpecTypeDef.scSpecTypeU32(),
            }),
          ),
          expectedOutput: "Array<number>",
          expectedInput: "Array<number>",
        },
        {
          name: "map",
          type: xdr.ScSpecTypeDef.scSpecTypeMap(
            new xdr.ScSpecTypeMap({
              keyType: xdr.ScSpecTypeDef.scSpecTypeString(),
              valueType: xdr.ScSpecTypeDef.scSpecTypeU32(),
            }),
          ),
          expectedOutput: "Map<string, number>",
          expectedInput: "Map<string, number>",
        },
        {
          name: "option",
          type: xdr.ScSpecTypeDef.scSpecTypeOption(
            new xdr.ScSpecTypeOption({
              valueType: xdr.ScSpecTypeDef.scSpecTypeU32(),
            }),
          ),
          expectedOutput: "number | null",
          expectedInput: "number | null",
        },
        {
          name: "result",
          type: xdr.ScSpecTypeDef.scSpecTypeResult(
            new xdr.ScSpecTypeResult({
              okType: xdr.ScSpecTypeDef.scSpecTypeBool(),
              errorType: xdr.ScSpecTypeDef.scSpecTypeString(),
            }),
          ),
          expectedOutput: "Result<boolean, string>",
          expectedInput: "Result<boolean, string>",
        },
        {
          name: "tuple",
          type: xdr.ScSpecTypeDef.scSpecTypeTuple(
            new xdr.ScSpecTypeTuple({
              valueTypes: [
                xdr.ScSpecTypeDef.scSpecTypeBool(),
                xdr.ScSpecTypeDef.scSpecTypeU32(),
              ],
            }),
          ),
          expectedOutput: "[boolean, number]",
          expectedInput: "[boolean, number]",
        },
        {
          name: "val",
          type: xdr.ScSpecTypeDef.scSpecTypeVal(),
          expectedOutput: "any",
          expectedInput: "any",
        },
      ];

      primitiveTypes.forEach(
        ({ name, type, expectedOutput, expectedInput }) => {
          it(`maps ${name} input to ${expectedInput}`, () => {
            const funcSpec = createFunctionSpec("test_fn", [
              { name: "input", type },
            ]);
            const spec = new contract.Spec([funcSpec.toXDR("base64")]);
            const result =
              BindingGenerator.fromSpec(spec).generate(defaultOptions);
            expect(result.client).toContain(`input: ${expectedInput}`);
          });

          it(`maps ${name} output to ${expectedOutput}`, () => {
            const funcSpec = createFunctionSpec("test_fn", [], [type]);
            const spec = new contract.Spec([funcSpec.toXDR("base64")]);
            const result =
              BindingGenerator.fromSpec(spec).generate(defaultOptions);
            expect(result.client).toContain(
              `Promise<AssembledTransaction<${expectedOutput}>>`,
            );
          });
        },
      );

      it("maps void output to null", () => {
        const funcSpec = createFunctionSpec(
          "test_fn",
          [],
          [xdr.ScSpecTypeDef.scSpecTypeVoid()],
        );
        const spec = new contract.Spec([funcSpec.toXDR("base64")]);
        const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);
        expect(result.client).toContain("Promise<AssembledTransaction<null>>");
      });

      describe("udt types", () => {
        it("maps struct input and output", () => {
          const structSpec = createStructSpec("MyStruct", [
            { name: "value", type: xdr.ScSpecTypeDef.scSpecTypeU32() },
          ]);
          const udtType = xdr.ScSpecTypeDef.scSpecTypeUdt(
            new xdr.ScSpecTypeUdt({ name: "MyStruct" }),
          );
          const funcSpec = createFunctionSpec(
            "test_fn",
            [{ name: "input", type: udtType }],
            [udtType],
          );
          const spec = new contract.Spec([
            structSpec.toXDR("base64"),
            funcSpec.toXDR("base64"),
          ]);
          const result =
            BindingGenerator.fromSpec(spec).generate(defaultOptions);
          expect(result.client).toContain("input: MyStruct");
          expect(result.client).toContain(
            "Promise<AssembledTransaction<MyStruct>>",
          );
        });

        it("maps enum input and output", () => {
          const enumSpec = xdr.ScSpecEntry.scSpecEntryUdtEnumV0(
            new xdr.ScSpecUdtEnumV0({
              doc: "",
              lib: "",
              name: "MyEnum",
              cases: [
                new xdr.ScSpecUdtEnumCaseV0({ doc: "", name: "A", value: 0 }),
                new xdr.ScSpecUdtEnumCaseV0({ doc: "", name: "B", value: 1 }),
              ],
            }),
          );
          const udtType = xdr.ScSpecTypeDef.scSpecTypeUdt(
            new xdr.ScSpecTypeUdt({ name: "MyEnum" }),
          );
          const funcSpec = createFunctionSpec(
            "test_fn",
            [{ name: "input", type: udtType }],
            [udtType],
          );
          const spec = new contract.Spec([
            enumSpec.toXDR("base64"),
            funcSpec.toXDR("base64"),
          ]);
          const result =
            BindingGenerator.fromSpec(spec).generate(defaultOptions);
          expect(result.client).toContain("input: MyEnum");
          expect(result.client).toContain(
            "Promise<AssembledTransaction<MyEnum>>",
          );
        });

        it("maps union input and output", () => {
          const unionSpec = xdr.ScSpecEntry.scSpecEntryUdtUnionV0(
            new xdr.ScSpecUdtUnionV0({
              doc: "",
              lib: "",
              name: "MyUnion",
              cases: [
                xdr.ScSpecUdtUnionCaseV0.scSpecUdtUnionCaseVoidV0(
                  new xdr.ScSpecUdtUnionCaseVoidV0({ doc: "", name: "None" }),
                ),
              ],
            }),
          );
          const udtType = xdr.ScSpecTypeDef.scSpecTypeUdt(
            new xdr.ScSpecTypeUdt({ name: "MyUnion" }),
          );
          const funcSpec = createFunctionSpec(
            "test_fn",
            [{ name: "input", type: udtType }],
            [udtType],
          );
          const spec = new contract.Spec([
            unionSpec.toXDR("base64"),
            funcSpec.toXDR("base64"),
          ]);
          const result =
            BindingGenerator.fromSpec(spec).generate(defaultOptions);
          expect(result.client).toContain("input: MyUnion");
          expect(result.client).toContain(
            "Promise<AssembledTransaction<MyUnion>>",
          );
        });
      });
    });
  });

  describe("generate - deploy method", () => {
    it("generates deploy with null args when no constructor", () => {
      const spec = createMinimalSpec();
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.client).toContain("static deploy<T = Client>");
      expect(result.client).toContain("ContractClient.deploy(null, options)");
    });

    it("generates deploy with params when constructor exists", () => {
      const constructorSpec = createFunctionSpec("__constructor", [
        { name: "admin", type: xdr.ScSpecTypeDef.scSpecTypeAddress() },
        { name: "initial_value", type: xdr.ScSpecTypeDef.scSpecTypeU32() },
      ]);
      const spec = new contract.Spec([constructorSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.client).toContain("static deploy<T = Client>");
      expect(result.client).toContain("admin: string | Address");
      expect(result.client).toContain("initial_value: number");
      expect(result.client).toContain("{ admin, initial_value }, options");
    });
  });

  describe("generate - fromJSON methods", () => {
    it("generates fromJSON for each function", () => {
      const funcSpec = createFunctionSpec(
        "my_method",
        [],
        [xdr.ScSpecTypeDef.scSpecTypeBool()],
      );
      const spec = new contract.Spec([funcSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.client).toContain("public readonly fromJSON = {");
      expect(result.client).toContain("my_method : this.txFromJSON<boolean>");
    });

    it("excludes __constructor from fromJSON", () => {
      const constructorSpec = createFunctionSpec("__constructor", []);
      const funcSpec = createFunctionSpec(
        "hello",
        [],
        [xdr.ScSpecTypeDef.scSpecTypeString()],
      );
      const spec = new contract.Spec([
        constructorSpec.toXDR("base64"),
        funcSpec.toXDR("base64"),
      ]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.client).toContain("hello : this.txFromJSON<string>");
      expect(result.client).not.toContain("__constructor : this.txFromJSON");
    });
  });

  describe("generate - client imports", () => {
    it("includes base ContractClient imports", () => {
      const spec = createMinimalSpec();
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.client).toContain("Spec");
      expect(result.client).toContain("AssembledTransaction");
      expect(result.client).toContain("Client as ContractClient");
      expect(result.client).toContain("MethodOptions");
    });

    it("includes Address import when address type used", () => {
      const funcSpec = createFunctionSpec(
        "get_addr",
        [],
        [xdr.ScSpecTypeDef.scSpecTypeAddress()],
      );
      const spec = new contract.Spec([funcSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.client).toContain("Address");
      expect(result.client).toContain("from '@stellar/stellar-sdk'");
    });

    it("includes Result import when result type used", () => {
      const funcSpec = createFunctionSpec(
        "try_action",
        [],
        [
          xdr.ScSpecTypeDef.scSpecTypeResult(
            new xdr.ScSpecTypeResult({
              okType: xdr.ScSpecTypeDef.scSpecTypeU32(),
              errorType: xdr.ScSpecTypeDef.scSpecTypeU32(),
            }),
          ),
        ],
      );
      const spec = new contract.Spec([funcSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.client).toContain("Result");
    });

    it("includes Buffer import when bytes type used", () => {
      const funcSpec = createFunctionSpec(
        "get_bytes",
        [],
        [xdr.ScSpecTypeDef.scSpecTypeBytes()],
      );
      const spec = new contract.Spec([funcSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.client).toContain("Buffer");
      expect(result.client).toContain("from 'buffer'");
    });

    it("includes UDT type imports from types.js", () => {
      const structSpec = createStructSpec("MyData", [
        { name: "value", type: xdr.ScSpecTypeDef.scSpecTypeU32() },
      ]);
      const funcSpec = createFunctionSpec(
        "get_data",
        [],
        [
          xdr.ScSpecTypeDef.scSpecTypeUdt(
            new xdr.ScSpecTypeUdt({ name: "MyData" }),
          ),
        ],
      );
      const spec = new contract.Spec([
        structSpec.toXDR("base64"),
        funcSpec.toXDR("base64"),
      ]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.client).toContain("from './types.js'");
      expect(result.client).toContain("MyData");
    });
  });

  describe("generate - name sanitization", () => {
    it("sanitizes reserved keyword method names", () => {
      const funcSpec = createFunctionSpec(
        "class",
        [],
        [xdr.ScSpecTypeDef.scSpecTypeU32()],
      );
      const spec = new contract.Spec([funcSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.client).toContain("class_(");
    });

    it("sanitizes method names starting with digits", () => {
      const funcSpec = createFunctionSpec(
        "123method",
        [],
        [xdr.ScSpecTypeDef.scSpecTypeU32()],
      );
      const spec = new contract.Spec([funcSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.client).toContain("_123method(");
    });

    it("sanitizes reserved keyword type names", () => {
      const structSpec = createStructSpec("class", [
        { name: "value", type: xdr.ScSpecTypeDef.scSpecTypeU32() },
      ]);
      const spec = new contract.Spec([structSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.types).toContain("export interface class_");
    });
  });

  describe("generate - doc sanitization", () => {
    it("escapes closing comment sequences in function docs", () => {
      const funcSpec = createFunctionSpec(
        "dangerous_doc",
        [],
        [xdr.ScSpecTypeDef.scSpecTypeU32()],
        "This doc has */ which would break JSDoc",
      );
      const spec = new contract.Spec([funcSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      // Should escape */ to prevent breaking the JSDoc block
      expect(result.client).toContain("* /");
      expect(result.client).not.toMatch(/\* This doc has \*\//);
    });

    it("escapes @ symbols that are not valid JSDoc tags", () => {
      const funcSpec = createFunctionSpec(
        "email_doc",
        [],
        [xdr.ScSpecTypeDef.scSpecTypeU32()],
        "Contact user@stellar.org for help",
      );
      const spec = new contract.Spec([funcSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      // Should escape @ in email addresses (but not if it matches a JSDoc tag like @example)
      expect(result.client).toContain("\\@stellar.org");
    });

    it("preserves valid JSDoc tags in docs", () => {
      const funcSpec = createFunctionSpec(
        "tagged_doc",
        [],
        [xdr.ScSpecTypeDef.scSpecTypeU32()],
        "@deprecated Use new_method instead\n@see new_method",
      );
      const spec = new contract.Spec([funcSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      // Valid JSDoc tags should not be escaped
      expect(result.client).toContain("@deprecated");
      expect(result.client).toContain("@see");
    });

    it("escapes closing comment sequences in struct docs", () => {
      const structSpec = xdr.ScSpecEntry.scSpecEntryUdtStructV0(
        new xdr.ScSpecUdtStructV0({
          doc: "Struct with */ in doc",
          lib: "",
          name: "DangerousStruct",
          fields: [
            new xdr.ScSpecUdtStructFieldV0({
              doc: "",
              name: "value",
              type: xdr.ScSpecTypeDef.scSpecTypeU32(),
            }),
          ],
        }),
      );
      const spec = new contract.Spec([structSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.types).toContain("* /");
    });

    it("escapes closing comment sequences in field docs", () => {
      const structSpec = xdr.ScSpecEntry.scSpecEntryUdtStructV0(
        new xdr.ScSpecUdtStructV0({
          doc: "",
          lib: "",
          name: "StructWithFieldDoc",
          fields: [
            new xdr.ScSpecUdtStructFieldV0({
              doc: "Field doc with */ inside",
              name: "value",
              type: xdr.ScSpecTypeDef.scSpecTypeU32(),
            }),
          ],
        }),
      );
      const spec = new contract.Spec([structSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.types).toContain("* /");
    });

    it("escapes closing comment sequences in enum variant docs", () => {
      const enumSpec = xdr.ScSpecEntry.scSpecEntryUdtUnionV0(
        new xdr.ScSpecUdtUnionV0({
          doc: "",
          lib: "",
          name: "MyUnion",
          cases: [
            xdr.ScSpecUdtUnionCaseV0.scSpecUdtUnionCaseVoidV0(
              new xdr.ScSpecUdtUnionCaseVoidV0({
                doc: "Variant with */ in doc",
                name: "Dangerous",
              }),
            ),
          ],
        }),
      );
      const spec = new contract.Spec([enumSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.types).toContain("* /");
    });
  });

  describe("generate - type generation", () => {
    describe("structs", () => {
      it("generates struct with primitive fields", () => {
        const structSpec = createStructSpec("User", [
          { name: "id", type: xdr.ScSpecTypeDef.scSpecTypeU64() },
          { name: "name", type: xdr.ScSpecTypeDef.scSpecTypeString() },
          { name: "active", type: xdr.ScSpecTypeDef.scSpecTypeBool() },
        ]);
        const spec = new contract.Spec([structSpec.toXDR("base64")]);
        const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

        expect(result.types).toContain("export interface User");
        expect(result.types).toContain("id: bigint");
        expect(result.types).toContain("name: string");
        expect(result.types).toContain("active: boolean");
      });

      it("generates struct with nested UDT", () => {
        const innerStruct = createStructSpec("Inner", [
          { name: "value", type: xdr.ScSpecTypeDef.scSpecTypeU32() },
        ]);
        const outerStruct = createStructSpec("Outer", [
          {
            name: "inner",
            type: xdr.ScSpecTypeDef.scSpecTypeUdt(
              new xdr.ScSpecTypeUdt({ name: "Inner" }),
            ),
          },
        ]);
        const spec = new contract.Spec([
          innerStruct.toXDR("base64"),
          outerStruct.toXDR("base64"),
        ]);
        const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

        expect(result.types).toContain("export interface Inner");
        expect(result.types).toContain("export interface Outer");
        expect(result.types).toContain("inner: Inner");
      });

      it("generates struct with complex nested types", () => {
        const structSpec = createStructSpec("Complex", [
          {
            name: "data",
            type: xdr.ScSpecTypeDef.scSpecTypeVec(
              new xdr.ScSpecTypeVec({
                elementType: xdr.ScSpecTypeDef.scSpecTypeMap(
                  new xdr.ScSpecTypeMap({
                    keyType: xdr.ScSpecTypeDef.scSpecTypeString(),
                    valueType: xdr.ScSpecTypeDef.scSpecTypeOption(
                      new xdr.ScSpecTypeOption({
                        valueType: xdr.ScSpecTypeDef.scSpecTypeU32(),
                      }),
                    ),
                  }),
                ),
              }),
            ),
          },
        ]);
        const spec = new contract.Spec([structSpec.toXDR("base64")]);
        const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

        expect(result.types).toContain(
          "data: Array<Map<string, number | null>>",
        );
      });

      it("generates struct with tuple field", () => {
        const structSpec = createStructSpec("TupleStruct", [
          {
            name: "0",
            type: xdr.ScSpecTypeDef.scSpecTypeUdt(
              new xdr.ScSpecTypeUdt({
                name: "FirstTupleElement",
              }),
            ),
          },
          {
            name: "1",
            type: xdr.ScSpecTypeDef.scSpecTypeUdt(
              new xdr.ScSpecTypeUdt({
                name: "SecondTupleElement",
              }),
            ),
          },
        ]);
        const spec = new contract.Spec([structSpec.toXDR("base64")]);
        const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

        expect(result.types).toContain("export type TupleStruct");
        expect(result.types).toContain(
          "readonly [FirstTupleElement, SecondTupleElement]",
        );
      });
    });

    describe("enums", () => {
      it("generates enum with multiple cases", () => {
        const enumSpec = xdr.ScSpecEntry.scSpecEntryUdtEnumV0(
          new xdr.ScSpecUdtEnumV0({
            doc: "Status enum",
            lib: "",
            name: "Status",
            cases: [
              new xdr.ScSpecUdtEnumCaseV0({
                doc: "",
                name: "Pending",
                value: 0,
              }),
              new xdr.ScSpecUdtEnumCaseV0({
                doc: "",
                name: "Active",
                value: 1,
              }),
              new xdr.ScSpecUdtEnumCaseV0({
                doc: "",
                name: "Completed",
                value: 2,
              }),
            ],
          }),
        );
        const spec = new contract.Spec([enumSpec.toXDR("base64")]);
        const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

        expect(result.types).toContain("export enum Status");
        expect(result.types).toContain("Pending = 0");
        expect(result.types).toContain("Active = 1");
        expect(result.types).toContain("Completed = 2");
      });
    });

    describe("unions", () => {
      it("generates union with void cases", () => {
        const unionSpec = xdr.ScSpecEntry.scSpecEntryUdtUnionV0(
          new xdr.ScSpecUdtUnionV0({
            doc: "",
            lib: "",
            name: "MyResult",
            cases: [
              xdr.ScSpecUdtUnionCaseV0.scSpecUdtUnionCaseVoidV0(
                new xdr.ScSpecUdtUnionCaseVoidV0({ doc: "", name: "Success" }),
              ),
              xdr.ScSpecUdtUnionCaseV0.scSpecUdtUnionCaseVoidV0(
                new xdr.ScSpecUdtUnionCaseVoidV0({ doc: "", name: "Failure" }),
              ),
            ],
          }),
        );
        const spec = new contract.Spec([unionSpec.toXDR("base64")]);
        const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

        expect(result.types).toContain("export type MyResult");
        expect(result.types).toContain('{ tag: "Success"; values: void }');
        expect(result.types).toContain('{ tag: "Failure"; values: void }');
      });

      it("generates union with tuple cases", () => {
        const unionSpec = xdr.ScSpecEntry.scSpecEntryUdtUnionV0(
          new xdr.ScSpecUdtUnionV0({
            doc: "",
            lib: "",
            name: "MyOption",
            cases: [
              xdr.ScSpecUdtUnionCaseV0.scSpecUdtUnionCaseTupleV0(
                new xdr.ScSpecUdtUnionCaseTupleV0({
                  doc: "",
                  name: "Some",
                  type: [xdr.ScSpecTypeDef.scSpecTypeU32()],
                }),
              ),
              xdr.ScSpecUdtUnionCaseV0.scSpecUdtUnionCaseVoidV0(
                new xdr.ScSpecUdtUnionCaseVoidV0({ doc: "", name: "None" }),
              ),
            ],
          }),
        );
        const spec = new contract.Spec([unionSpec.toXDR("base64")]);
        const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

        expect(result.types).toContain("export type MyOption");
        expect(result.types).toContain(
          '{ tag: "Some"; values: readonly [number] }',
        );
        expect(result.types).toContain('{ tag: "None"; values: void }');
      });
    });

    describe("error enums", () => {
      it("generates error enum as const object", () => {
        const errorSpec = xdr.ScSpecEntry.scSpecEntryUdtErrorEnumV0(
          new xdr.ScSpecUdtErrorEnumV0({
            doc: "",
            lib: "",
            name: "ContractError",
            cases: [
              new xdr.ScSpecUdtErrorEnumCaseV0({
                doc: "",
                name: "NotAuthorized",
                value: 1,
              }),
              new xdr.ScSpecUdtErrorEnumCaseV0({
                doc: "",
                name: "InsufficientBalance",
                value: 2,
              }),
            ],
          }),
        );
        const spec = new contract.Spec([errorSpec.toXDR("base64")]);
        const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

        expect(result.types).toContain("export const ContractError");
        expect(result.types).toContain('1 : { message: "NotAuthorized" }');
        expect(result.types).toContain(
          '2 : { message: "InsufficientBalance" }',
        );
      });
    });

    describe("type imports in types file", () => {
      it("includes Address import when struct has address field", () => {
        const structSpec = createStructSpec("MyStruct", [
          { name: "addr", type: xdr.ScSpecTypeDef.scSpecTypeAddress() },
        ]);
        const spec = new contract.Spec([structSpec.toXDR("base64")]);
        const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

        expect(result.types).toContain("Address");
        expect(result.types).toContain("from '@stellar/stellar-sdk'");
      });

      it("includes Result import when struct has result field", () => {
        const structSpec = createStructSpec("MyStruct", [
          {
            name: "result",
            type: xdr.ScSpecTypeDef.scSpecTypeResult(
              new xdr.ScSpecTypeResult({
                okType: xdr.ScSpecTypeDef.scSpecTypeU32(),
                errorType: xdr.ScSpecTypeDef.scSpecTypeString(),
              }),
            ),
          },
        ]);
        const spec = new contract.Spec([structSpec.toXDR("base64")]);
        const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

        expect(result.types).toContain("Result");
        expect(result.types).toContain("from '@stellar/stellar-sdk/contract'");
      });
    });
  });

  describe("generate - config files", () => {
    it("generates package.json with contract name", () => {
      const spec = createMinimalSpec();
      const result = BindingGenerator.fromSpec(spec).generate({
        contractName: "my-awesome-contract",
      });

      expect(result.packageJson).toContain('"name": "my-awesome-contract"');
    });

    it("generates tsconfig.json", () => {
      const spec = createMinimalSpec();
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.tsConfig).toContain("compilerOptions");
    });

    it("generates readme", () => {
      const spec = createMinimalSpec();
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.readme).toBeTruthy();
    });

    it("generates gitignore", () => {
      const spec = createMinimalSpec();
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.gitignore).toBeTruthy();
    });
  });

  describe("generate - identifier and string literal sanitization", () => {
    it("escapes double quotes in error enum case names", () => {
      const errorSpec = xdr.ScSpecEntry.scSpecEntryUdtErrorEnumV0(
        new xdr.ScSpecUdtErrorEnumV0({
          doc: "",
          lib: "",
          name: "Errors",
          cases: [
            new xdr.ScSpecUdtErrorEnumCaseV0({
              doc: "",
              name: 'has "quotes" inside',
              value: 0,
            }),
          ],
        }),
      );
      const spec = new contract.Spec([errorSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.types).toContain("export const Errors");
      // Double quotes should be escaped in the string literal
      expect(result.types).toContain('has \\"quotes\\" inside');
    });

    it("strips non-identifier characters from struct field names", () => {
      const structSpec = createStructSpec("MyStruct", [
        {
          name: "field;name{bad}",
          type: xdr.ScSpecTypeDef.scSpecTypeU32(),
        },
      ]);
      const spec = new contract.Spec([structSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      // Special characters should be replaced with underscores
      expect(result.types).toContain("field_name_bad_: number");
      expect(result.types).toContain("export interface MyStruct");
    });

    it("escapes special characters in union case tag strings", () => {
      const unionSpec = xdr.ScSpecEntry.scSpecEntryUdtUnionV0(
        new xdr.ScSpecUdtUnionV0({
          doc: "",
          lib: "",
          name: "MyUnion",
          cases: [
            xdr.ScSpecUdtUnionCaseV0.scSpecUdtUnionCaseVoidV0(
              new xdr.ScSpecUdtUnionCaseVoidV0({
                doc: "",
                name: 'case"with"quotes',
              }),
            ),
          ],
        }),
      );
      const spec = new contract.Spec([unionSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.types).toContain('case\\"with\\"quotes');
      expect(result.types).toContain("export type MyUnion");
    });

    it("strips non-identifier characters from enum case names", () => {
      const enumSpec = xdr.ScSpecEntry.scSpecEntryUdtEnumV0(
        new xdr.ScSpecUdtEnumV0({
          doc: "",
          lib: "",
          name: "MyEnum",
          cases: [
            new xdr.ScSpecUdtEnumCaseV0({
              doc: "",
              name: "Case = 0; extra",
              value: 0,
            }),
          ],
        }),
      );
      const spec = new contract.Spec([enumSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.types).toContain("Case___0__extra = 0");
      expect(result.types).toContain("export enum MyEnum");
    });

    it("escapes JS line terminators U+2028 and U+2029 in string literals", () => {
      const errorSpec = xdr.ScSpecEntry.scSpecEntryUdtErrorEnumV0(
        new xdr.ScSpecUdtErrorEnumV0({
          doc: "",
          lib: "",
          name: "Errors",
          cases: [
            new xdr.ScSpecUdtErrorEnumCaseV0({
              doc: "",
              name: "line\u2028sep\u2029end",
              value: 0,
            }),
          ],
        }),
      );
      const spec = new contract.Spec([errorSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.types).toContain("\\u2028");
      expect(result.types).toContain("\\u2029");
      // Raw line terminators should not appear in the output
      expect(result.types).not.toContain("\u2028");
      expect(result.types).not.toContain("\u2029");
    });

    it("escapes backslashes in string literals", () => {
      const errorSpec = xdr.ScSpecEntry.scSpecEntryUdtErrorEnumV0(
        new xdr.ScSpecUdtErrorEnumV0({
          doc: "",
          lib: "",
          name: "Errors",
          cases: [
            new xdr.ScSpecUdtErrorEnumCaseV0({
              doc: "",
              name: "path\\to\\file",
              value: 0,
            }),
          ],
        }),
      );
      const spec = new contract.Spec([errorSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      // Backslashes should be double-escaped
      expect(result.types).toContain("path\\\\to\\\\file");
    });

    it("falls back to _unnamed for identifiers with only special characters", () => {
      const structSpec = createStructSpec("MyStruct", [
        {
          name: '";{}',
          type: xdr.ScSpecTypeDef.scSpecTypeU32(),
        },
      ]);
      const spec = new contract.Spec([structSpec.toXDR("base64")]);
      const result = BindingGenerator.fromSpec(spec).generate(defaultOptions);

      expect(result.types).toContain("_unnamed: number");
    });
  });

  describe("generate - full contract scenario", () => {
    it("generates complete bindings for token-like contract", () => {
      const specs = [
        // Constructor
        createFunctionSpec("__constructor", [
          { name: "admin", type: xdr.ScSpecTypeDef.scSpecTypeAddress() },
          { name: "name", type: xdr.ScSpecTypeDef.scSpecTypeString() },
          { name: "symbol", type: xdr.ScSpecTypeDef.scSpecTypeString() },
          { name: "decimals", type: xdr.ScSpecTypeDef.scSpecTypeU32() },
        ]),
        // Struct
        createStructSpec("BalanceInfo", [
          { name: "amount", type: xdr.ScSpecTypeDef.scSpecTypeI128() },
          { name: "authorized", type: xdr.ScSpecTypeDef.scSpecTypeBool() },
        ]),
        // Error enum
        xdr.ScSpecEntry.scSpecEntryUdtErrorEnumV0(
          new xdr.ScSpecUdtErrorEnumV0({
            doc: "",
            lib: "",
            name: "TokenError",
            cases: [
              new xdr.ScSpecUdtErrorEnumCaseV0({
                doc: "",
                name: "InsufficientBalance",
                value: 1,
              }),
              new xdr.ScSpecUdtErrorEnumCaseV0({
                doc: "",
                name: "NotAuthorized",
                value: 2,
              }),
            ],
          }),
        ),
        // Functions
        createFunctionSpec(
          "balance",
          [{ name: "id", type: xdr.ScSpecTypeDef.scSpecTypeAddress() }],
          [xdr.ScSpecTypeDef.scSpecTypeI128()],
        ),
        createFunctionSpec("transfer", [
          { name: "from", type: xdr.ScSpecTypeDef.scSpecTypeAddress() },
          { name: "to", type: xdr.ScSpecTypeDef.scSpecTypeAddress() },
          { name: "amount", type: xdr.ScSpecTypeDef.scSpecTypeI128() },
        ]),
        createFunctionSpec("name", [], [xdr.ScSpecTypeDef.scSpecTypeString()]),
      ];

      const spec = new contract.Spec(specs.map((s) => s.toXDR("base64")));
      const result = BindingGenerator.fromSpec(spec).generate({
        contractName: "my-token",
      });

      // Index exports
      expect(result.index).toContain('export { Client } from "./client.js"');
      expect(result.index).toContain('export * from "./types.js"');

      // Client methods
      expect(result.client).toContain("balance(");
      expect(result.client).toContain("transfer(");
      expect(result.client).toContain("name(");

      // Deploy has constructor params
      expect(result.client).toContain("{ admin, name, symbol, decimals }");

      // Types
      expect(result.types).toContain("export interface BalanceInfo");
      expect(result.types).toContain("amount: bigint");
      expect(result.types).toContain("authorized: boolean");
      expect(result.types).toContain("export const TokenError");

      // Package name
      expect(result.packageJson).toContain('"name": "my-token"');
    });
  });
});
