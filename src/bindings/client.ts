import { xdr } from "@stellar/stellar-base";
import { Spec } from "../contract";
import {
  parseTypeFromTypeDef,
  generateTypeImports,
  sanitizeName,
} from "./utils";

/**
 * Generates TypeScript client class for contract methods
 */
export class ClientGenerator {
  private spec: Spec;

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

    const imports = this.generateImports();

    const specEntries = this.spec.entries.map(
      (entry) => `"${entry.toXDR("base64")}"`,
    );

    const fromJSON = this.spec
      .funcs()
      .filter((func) => func.name().toString() !== "__constructor")
      .map((func) => this.generateFromJSONMethod(func))
      .join(",");

    return `${imports}

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

  private generateImports(): string {
    const { stellarContractImports, typeFileImports, stellarImports } =
      generateTypeImports(
        this.spec.funcs().flatMap((func) => {
          const inputs = func.inputs();
          const outputs = func.outputs();
          const defs = inputs.map((input) => input.type()).concat(outputs);
          return defs;
        }),
      );
    // Ensure necessary imports for Client class
    stellarContractImports.push(
      "Spec",
      "AssembledTransaction",
      "Client as ContractClient",
      "ClientOptions as ContractClientOptions",
      "MethodOptions",
    );
    // Build imports
    const importLines: string[] = [];
    if (typeFileImports.length > 0) {
      importLines.push(
        `import {\n${typeFileImports.join(",\n")}\n} from './types.js';`,
      );
    }
    if (stellarContractImports.length > 0) {
      importLines.push(
        `import {\n${stellarContractImports.join(
          ",\n",
        )}\n} from '@stellar/stellar-sdk/contract';`,
      );
    }
    if (stellarImports.length > 0) {
      importLines.push(
        `import {\n${stellarImports.join(
          ",\n",
        )}\n} from '@stellar/stellar-sdk';`,
      );
    }
    importLines.push(`import { Buffer } from 'buffer';`);
    const imports = importLines.join("\n");
    return imports;
  }

  /**
   * Generate interface method signature
   */
  private generateInterfaceMethod(func: xdr.ScSpecFunctionV0): string {
    const name = sanitizeName(func.name().toString());
    const inputs = func.inputs().map((input: any) => ({
      name: input.name().toString(),
      type: parseTypeFromTypeDef(input.type()),
    }));
    const outputType =
      func.outputs().length > 0
        ? parseTypeFromTypeDef(func.outputs()[0])
        : "void";

    const params = this.formatMethodParameters(inputs);

    return `  ${name}(${params}): Promise<AssembledTransaction<${outputType}>>;`;
  }

  private generateFromJSONMethod(func: xdr.ScSpecFunctionV0): string {
    const name = func.name().toString();
    const outputType =
      func.outputs().length > 0
        ? parseTypeFromTypeDef(func.outputs()[0])
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
      type: parseTypeFromTypeDef(input.type()),
    }));

    const params = this.formatConstructorParameters(inputs);
    const inputsDestructure =
      inputs.length > 0 ? `{ ${inputs.map((i) => i.name).join(", ")} }, ` : "";

    return `  static deploy<T = Client>(${params}): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(${inputsDestructure}options);
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

    params.push("options?: MethodOptions");

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
}
