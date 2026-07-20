import { xdr } from "../base/index.js";
import { Spec } from "../contract/index.js";
import {
  parseTypeFromTypeDef,
  generateTypeImports,
  sanitizeIdentifier,
  formatJSDocComment,
  formatImports,
  toCamelCase,
} from "./utils.js";

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

    const events = this.spec.events();
    const eventMethods =
      events.length > 0
        ? `\n${this.generateParseEventMethod()}\n${events
            .map((event) => this.generateEventFilterMethod(event))
            .join("\n")}`
        : "";

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
${eventMethods}
}`;
  }

  private generateImports(): string {
    const imports = generateTypeImports(
      this.spec.funcs().flatMap((func) => {
        const inputs = func.inputs();
        const outputs = func.outputs();
        const defs = inputs.map((input) => input.type()).concat(outputs);
        return defs;
      }),
    );

    const events = this.spec.events();
    if (events.length > 0) {
      // parseEvent()'s return type is the ContractEvent union
      imports.typeFileImports.add("ContractEvent");
      // parseEvent()'s topics/data parameters are typed using xdr.ScVal
      imports.stellarImports.add("xdr");
      // Event filter helpers reference topic param types
      events.forEach((event) => {
        event.params().forEach((param) => {
          const nested = generateTypeImports([param.type()]);
          nested.typeFileImports.forEach((t) => imports.typeFileImports.add(t));
          nested.stellarContractImports.forEach((t) =>
            imports.stellarContractImports.add(t),
          );
          nested.stellarImports.forEach((t) => imports.stellarImports.add(t));
          imports.needsBufferImport =
            imports.needsBufferImport || nested.needsBufferImport;
        });
      });
    }

    return formatImports(imports, {
      includeTypeFileImports: true, // Client imports types
      additionalStellarContractImports: [
        "Spec",
        "AssembledTransaction",
        "Client as ContractClient",
        "ClientOptions as ContractClientOptions",
        "MethodOptions",
      ],
    });
  }

  /**
   * Generate the parseEvent method, which delegates to the underlying Spec
   * to decode a raw event's topics/data into a typed ContractEvent.
   */
  private generateParseEventMethod(): string {
    return `  /**
   * Parse a raw contract event (topics + data) into a typed {@link ContractEvent}.
   */
  parseEvent(topics: xdr.ScVal[] | string[], data: xdr.ScVal | string): ContractEvent | undefined {
    return this.spec.parseEvent(topics, data) as ContractEvent | undefined;
  }`;
  }

  /**
   * Generate a per-event helper that builds a topics-filter row for
   * `Api.EventFilter.topics`, suitable for passing to server.getEvents.
   */
  private generateEventFilterMethod(event: xdr.ScSpecEventV0): string {
    const rawName = event.name().toString();
    const methodName = `${toCamelCase(sanitizeIdentifier(rawName))}EventFilter`;
    const topicParams = event
      .params()
      .filter(
        (param) =>
          param.location().value ===
          xdr.ScSpecEventParamLocationV0.scSpecEventParamLocationTopicList()
            .value,
      );

    const fields = topicParams
      .map((param) => {
        const fieldName = sanitizeIdentifier(param.name().toString());
        const fieldType = parseTypeFromTypeDef(param.type());
        return `${fieldName}?: ${fieldType}`;
      })
      .join("; ");

    const topicValuesType = `{ ${fields} }`;
    const doc = formatJSDocComment(
      `Build a topics filter row for the "${rawName}" event, for use in ` +
        `\`Api.EventFilter.topics\` when calling \`server.getEvents\`. ` +
        `Omitted fields match any value.`,
      2,
    );

    return `${doc}  ${methodName}(topicValues?: ${topicValuesType}): string[] {
    return this.spec.eventTopicFilter("${rawName}", topicValues);
  }`;
  }

  /**
   * Generate interface method signature
   */
  private generateInterfaceMethod(func: xdr.ScSpecFunctionV0): string {
    const name = sanitizeIdentifier(func.name().toString());
    const inputs = func.inputs().map((input: any) => ({
      name: sanitizeIdentifier(input.name().toString()),
      type: parseTypeFromTypeDef(input.type(), true),
    }));
    const outputType =
      func.outputs().length > 0
        ? parseTypeFromTypeDef(func.outputs()[0])
        : "void";
    const docs = formatJSDocComment(func.doc().toString(), 2);
    const params = this.formatMethodParameters(inputs);

    return `${docs}  ${name}(${params}): Promise<AssembledTransaction<${outputType}>>;`;
  }

  private generateFromJSONMethod(func: xdr.ScSpecFunctionV0): string {
    const name = sanitizeIdentifier(func.name().toString());
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
    const inputs = constructorFunc.inputs().map((input) => ({
      name: sanitizeIdentifier(input.name().toString()),
      type: parseTypeFromTypeDef(input.type(), true),
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
