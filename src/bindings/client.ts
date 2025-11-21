import { xdr } from "@stellar/stellar-base";
import { Spec } from "../contract";

/**
 * Generates TypeScript client class for contract methods
 */
export class ClientGenerator {
  private spec: Spec;
  private interfaceImports: Set<string> = new Set<string>();

  constructor(spec: Spec) {
    this.spec = spec;
  }

  /**
   * Generate client class
   */
  generate(): string {
    // Generate constructor method if it exists
    let deployMethod = "";
    try {
      const constructorFunc = this.spec.getFunc("__constructor");
      deployMethod = this.generateDeployMethod(constructorFunc);
    } catch {
      // For specs without a constructor, generate a deploy method without params
      deployMethod = this.generateDeployMethod(undefined);
    }
    // Generate interface methods
    const interfaceMethods = this.spec
      .funcs()
      .filter((func) => func.name().toString() !== "__constructor")
      .map((func) => this.generateInterfaceMethod(func))
      .join("\n");

    // Build imports
    const typeImports =
      Array.from(this.interfaceImports).length > 0
        ? `import { ${Array.from(this.interfaceImports).join(", ")} } from './types.js';`
        : "";

    const specEntries = this.spec.entries.map(
      (entry) => `"${entry.toXDR("base64")}"`,
    );

    const fromJSON = this.spec
      .funcs()
      .filter((func) => func.name().toString() !== "__constructor")
      .map((func) => this.generateFromJSONMethod(func))
      .join(",");

    return `import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  Result,
  MethodOptions,
  Spec,
} from '@stellar/stellar-sdk/contract';
${typeImports}
import { Buffer } from 'buffer';
export interface Client {
${interfaceMethods}
}

export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new Spec([${specEntries.join(", ")}]),
      options
    );
  }

 ${deployMethod}
  public readonly fromJSON = {
  ${fromJSON}
  };
}`;
  }

  /**
   * Generate interface method signature
   */
  private generateInterfaceMethod(func: any): string {
    const name = func.name().toString();
    const inputs = func.inputs().map((input: any) => ({
      name: input.name().toString(),
      type: this.generateTypeFromTypeDef(input.type()),
    }));
    const outputType =
      func.outputs().length > 0
        ? this.generateTypeFromTypeDef(func.outputs()[0])
        : "void";

    const params = this.formatMethodParameters(inputs);

    return `  ${name}(${params}): Promise<AssembledTransaction<${outputType}>>;`;
  }

  private generateFromJSONMethod(func: any): string {
    const name = func.name().toString();
    const outputType =
      func.outputs().length > 0
        ? this.generateTypeFromTypeDef(func.outputs()[0])
        : "void";

    return `  ${name} : this.txFromJSON<${outputType}>`;
  }
  /**
   * Generate deploy method
   */
  private generateDeployMethod(
    constructorFunc: xdr.ScSpecFunctionV0 | undefined,
  ): string {
    // If no constructor, generate deploy with no params
    if (!constructorFunc) {
      const params = this.formatConstructorParameters([]);
      return `  static deploy<T = Client>(${params}): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }`;
    }
    const inputs = constructorFunc.inputs().map((input: any) => ({
      name: input.name().toString(),
      type: this.generateTypeFromTypeDef(input.type()),
    }));

    const params = this.formatConstructorParameters(inputs);
    const inputsDestructure =
      inputs.length > 0 ? `{ ${inputs.map((i) => i.name).join(", ")} }` : "";

    return `  static deploy<T = Client>(${params}): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(${inputs.length > 0 ? inputsDestructure + ", " : ""}options);
  }`;
  }

  /**
   * Format method parameters
   */
  private formatMethodParameters(
    inputs: Array<{ name: string; type: string }>,
  ): string {
    const params: string[] = [];

    if (inputs.length > 0) {
      const inputsParam = `{ ${inputs.map((i) => `${i.name}: ${i.type}`).join("; ")} }`;
      params.push(
        `{ ${inputs.map((i) => i.name).join(", ")} }: ${inputsParam}`,
      );
    }

    params.push(
      "options?: { fee?: number; timeoutInSeconds?: number; simulate?: boolean; }",
    );

    return params.join(", ");
  }

  /**
   * Format constructor parameters
   */
  private formatConstructorParameters(
    inputs: Array<{ name: string; type: string }>,
  ): string {
    const params: string[] = [];

    if (inputs.length > 0) {
      const inputsParam = `{ ${inputs.map((i) => `${i.name}: ${i.type}`).join("; ")} }`;
      params.push(
        `{ ${inputs.map((i) => i.name).join(", ")} }: ${inputsParam}`,
      );
    }

    params.push(
      'options: MethodOptions & Omit<ContractClientOptions, \'contractId\'> & { wasmHash: Buffer | string; salt?: Buffer | Uint8Array; format?: "hex" | "base64"; address?: string; }',
    );

    return params.join(", ");
  }

  /**
   * Generate TypeScript type from XDR type definition
   */
  private generateTypeFromTypeDef(typeDef: xdr.ScSpecTypeDef): string {
    switch (typeDef.switch()) {
      case xdr.ScSpecType.scSpecTypeVal():
        return "xdr.ScVal";
      case xdr.ScSpecType.scSpecTypeBool():
        return "boolean";
      case xdr.ScSpecType.scSpecTypeVoid():
        return "void";
      case xdr.ScSpecType.scSpecTypeError():
        return "Error";
      case xdr.ScSpecType.scSpecTypeU32():
      case xdr.ScSpecType.scSpecTypeI32():
        return "number";
      case xdr.ScSpecType.scSpecTypeU64():
      case xdr.ScSpecType.scSpecTypeI64():
      case xdr.ScSpecType.scSpecTypeTimepoint():
      case xdr.ScSpecType.scSpecTypeDuration():
      case xdr.ScSpecType.scSpecTypeU128():
      case xdr.ScSpecType.scSpecTypeI128():
      case xdr.ScSpecType.scSpecTypeU256():
      case xdr.ScSpecType.scSpecTypeI256():
        return "bigint";
      case xdr.ScSpecType.scSpecTypeBytes():
      case xdr.ScSpecType.scSpecTypeBytesN():
        return "Buffer";
      case xdr.ScSpecType.scSpecTypeString():
        return "string";
      case xdr.ScSpecType.scSpecTypeSymbol():
        return "string";
      case xdr.ScSpecType.scSpecTypeAddress():
      case xdr.ScSpecType.scSpecTypeMuxedAddress():
        return "string";
      case xdr.ScSpecType.scSpecTypeVec(): {
        const vecType = this.generateTypeFromTypeDef(
          typeDef.vec().elementType(),
        );
        return `Array<${vecType}>`;
      }
      case xdr.ScSpecType.scSpecTypeMap(): {
        const keyType = this.generateTypeFromTypeDef(typeDef.map().keyType());
        const valueType = this.generateTypeFromTypeDef(
          typeDef.map().valueType(),
        );
        return `Map<${keyType}, ${valueType}>`;
      }
      case xdr.ScSpecType.scSpecTypeTuple(): {
        const tupleTypes = typeDef
          .tuple()
          .valueTypes()
          .map((t: xdr.ScSpecTypeDef) => this.generateTypeFromTypeDef(t));
        return `[${tupleTypes.join(", ")}]`;
      }
      case xdr.ScSpecType.scSpecTypeOption(): {
        const optionType = this.generateTypeFromTypeDef(
          typeDef.option().valueType(),
        );
        return `${optionType} | undefined`;
      }
      case xdr.ScSpecType.scSpecTypeResult(): {
        const okType = this.generateTypeFromTypeDef(typeDef.result().okType());
        const errorType = this.generateTypeFromTypeDef(
          typeDef.result().errorType(),
        );
        return `Result<${okType}, ${errorType}>`;
      }
      case xdr.ScSpecType.scSpecTypeUdt():
        const udtName = typeDef.udt().name().toString();
        this.interfaceImports.add(udtName);
        return udtName;
      default:
        return "unknown";
    }
  }
}
