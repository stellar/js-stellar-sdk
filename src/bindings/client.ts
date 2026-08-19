import { Spec } from "../contract/index.js";
import {
  parseTypeFromTypeDef,
  generateTypeImports,
  sanitizeIdentifier,
  escapeStringLiteral,
  formatJSDocComment,
  formatImports,
  toCamelCase,
} from "./utils.js";
import {
  ScSpecEventParamLocationV0,
  ScSpecEventV0,
  ScSpecFunctionV0,
} from "../xdr/index.js";

/**
 * Generates TypeScript client class for contract methods
 */
export class ClientGenerator {
  private spec: Spec;

  // event index (in declaration order) -> resolved (possibly disambiguated)
  // filter method name. Keyed by index rather than raw name because a
  // contract may declare several events with the same name.
  // Lazily computed on first use; see resolveEventFilterMethodNames().
  private eventFilterMethodNames: Map<number, string> | null = null;

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
      .filter((func) => func.name.toString() !== "__constructor")
      .map((func) => this.generateInterfaceMethod(func))
      .join("\n");

    const imports = this.generateImports();

    const specEntries = this.spec.entries.map(
      (entry) => `"${entry.toXdr("base64")}"`,
    );

    const fromJson = this.spec
      .funcs()
      .filter((func) => func.name.toString() !== "__constructor")
      .map((func) => this.generateFromJsonMethod(func))
      .join(",");

    const events = this.spec.events();
    const parseEventMethodName = this.parseEventMethodName();
    const eventMethods =
      events.length > 0
        ? `\n${this.generateParseEventMethod(parseEventMethodName)}\n${events
            .map((event, eventIndex) =>
              this.generateEventFilterMethod(event, eventIndex),
            )
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
  public readonly fromJson = {
  ${fromJson}
  };

  /** @deprecated Use fromJson instead. */
  public readonly fromJSON = this.fromJson;
${eventMethods}
}`;
  }

  private generateImports(): string {
    const imports = generateTypeImports(
      this.spec.funcs().flatMap((func) => {
        const inputs = func.inputs;
        const outputs = func.outputs;
        const defs = inputs.map((input) => input.type).concat(outputs);
        return defs;
      }),
    );

    const events = this.spec.events();
    if (events.length > 0) {
      // parseEvent()'s return type is the ContractEvent union
      imports.typeFileImports.add("ContractEvent");
      // parseEvent()'s topics/data parameters are typed using xdr.ScVal
      imports.stellarImports.add("xdr");
      // Event filter helpers reference topic-list param types only; data
      // param types appear only in types.ts
      events.forEach((event) => {
        const topicParams = event.params.filter(
          (param) =>
            param.location.value ===
            ScSpecEventParamLocationV0.scSpecEventParamLocationTopicList.value,
        );
        topicParams.forEach((param) => {
          const nested = generateTypeImports([param.type]);
          nested.typeFileImports.forEach((t) => imports.typeFileImports.add(t));
          nested.stellarContractImports.forEach((t) =>
            imports.stellarContractImports.add(t),
          );
          nested.stellarImports.forEach((t) => imports.stellarImports.add(t));
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
        "ExternalExecutableRef",
      ],
    });
  }

  /**
   * Generate the parseEvent method, which delegates to the underlying Spec
   * to decode a raw event's topics/data into a typed ContractEvent.
   */
  private generateParseEventMethod(methodName: string): string {
    return `  /**
   * Parse a raw contract event (topics + data) into a typed {@link ContractEvent}.
   */
  ${methodName}(topics: xdr.ScVal[] | string[], data: xdr.ScVal | string): ContractEvent | undefined {
    return this.spec.parseEvent(topics, data) as ContractEvent | undefined;
  }`;
  }

  private parseEventMethodName(): string {
    const reserved = new Set(
      this.spec
        .funcs()
        .filter((func) => func.name.toString() !== "__constructor")
        .map((func) => sanitizeIdentifier(func.name.toString())),
    );
    let candidate = "parseEvent";
    let suffix = 2;
    while (reserved.has(candidate)) {
      candidate = `parseEvent${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  /**
   * The `<camelCase>EventFilter` method name derived from an event name is
   * not injective (e.g. "FooBar" and "foo_bar" both produce
   * "fooBarEventFilter"), a contract may declare several events with the
   * very same name (composed modules each emitting their own "transfer"),
   * and it can just as easily collide with a generated contract function
   * name (e.g. an event "transfer" plus a function "transferEventFilter").
   * Since function member names are load-bearing (called directly by
   * users) and event filter names are already synthetic, function names
   * always win: they are reserved first, in spec-entry order. Events are
   * then resolved in spec-entry order, appending the smallest integer 2 or
   * greater needed to make the name unique (and reserving whatever name
   * results, so later events see it too). This is deterministic for a
   * given spec.
   */
  private resolveEventFilterMethodNames(): Map<number, string> {
    if (this.eventFilterMethodNames !== null) {
      return this.eventFilterMethodNames;
    }

    const reserved = new Set<string>();

    this.spec
      .funcs()
      .filter((func) => func.name.toString() !== "__constructor")
      .forEach((func) => {
        reserved.add(sanitizeIdentifier(func.name.toString()));
      });

    const resolved = new Map<number, string>();

    this.spec.events().forEach((event, eventIndex) => {
      const preferred = `${toCamelCase(sanitizeIdentifier(event.name.toString()))}EventFilter`;

      let candidate = preferred;
      let suffix = 2;
      while (reserved.has(candidate)) {
        candidate = `${preferred}${suffix}`;
        suffix += 1;
      }

      reserved.add(candidate);
      resolved.set(eventIndex, candidate);
    });

    this.eventFilterMethodNames = resolved;
    return resolved;
  }

  /**
   * Compute the resolved (possibly disambiguated) filter method name for an
   * event; see {@link resolveEventFilterMethodNames}.
   */
  private eventFilterMethodName(
    event: ScSpecEventV0,
    eventIndex: number,
  ): string {
    const resolved = this.resolveEventFilterMethodNames().get(eventIndex);
    /* istanbul ignore next -- every event in the spec is reserved a name */
    if (resolved === undefined) {
      return `${toCamelCase(sanitizeIdentifier(event.name.toString()))}EventFilter`;
    }
    return resolved;
  }

  /**
   * The resolved (possibly disambiguated) filter method name of every event
   * in the spec, in declaration order. Exposed so callers (e.g. the bindings
   * generator's diagnostics) can report renames and duplicates.
   */
  eventFilterMethodNamesInOrder(): string[] {
    return this.spec
      .events()
      .map((event, eventIndex) =>
        this.eventFilterMethodName(event, eventIndex),
      );
  }

  /**
   * Generate a per-event helper that builds a topics-filter row for
   * `Api.EventFilter.topics`, suitable for passing to server.getEvents.
   */
  private generateEventFilterMethod(
    event: ScSpecEventV0,
    eventIndex: number,
  ): string {
    const rawName = event.name.toString();
    const methodName = this.eventFilterMethodName(event, eventIndex);
    const preferredMethodName = `${toCamelCase(sanitizeIdentifier(rawName))}EventFilter`;
    // Which same-named event this is (0-based, declaration order) — needed
    // so eventTopicFilter targets the right spec when names are duplicated.
    const occurrence = this.spec
      .events()
      .slice(0, eventIndex)
      .filter((e) => e.name.toString() === rawName).length;
    const occurrenceNote =
      occurrence > 0
        ? ` This targets declaration ${occurrence + 1} of the "${rawName}" event in the contract spec.`
        : "";
    const renameNote =
      methodName !== preferredMethodName
        ? ` Note: renamed from "${preferredMethodName}" to avoid a collision with another generated name.`
        : "";
    const topicParams = event.params.filter(
      (param) =>
        param.location.value ===
        ScSpecEventParamLocationV0.scSpecEventParamLocationTopicList.value,
    );

    // eventTopicFilter looks values up by the raw param names, so the
    // parameter type must use them too — quoted when they aren't valid
    // identifiers.
    const fields = topicParams
      .map((param) => {
        const rawParamName = param.name.toString();
        const fieldName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(rawParamName)
          ? rawParamName
          : `"${escapeStringLiteral(rawParamName)}"`;
        const fieldType = parseTypeFromTypeDef(param.type, true);
        return `${fieldName}?: ${fieldType}`;
      })
      .join("; ");

    const doc = formatJSDocComment(
      `Build a topics filter row for the "${rawName}" event, for use in ` +
        `\`Api.EventFilter.topics\` when calling \`server.getEvents\`. ` +
        `Omitted fields match any value.${occurrenceNote}${renameNote}`,
      2,
    );

    const escapedName = escapeStringLiteral(rawName);
    const occurrenceArg = occurrence > 0 ? `, ${occurrence}` : "";

    if (topicParams.length === 0) {
      return `${doc}  ${methodName}(): string[] {
    return this.spec.eventTopicFilter("${escapedName}"${occurrence > 0 ? `, undefined${occurrenceArg}` : ""});
  }`;
    }

    return `${doc}  ${methodName}(topicValues?: { ${fields} }): string[] {
    return this.spec.eventTopicFilter("${escapedName}", topicValues${occurrenceArg});
  }`;
  }

  /**
   * Generate interface method signature
   */
  private generateInterfaceMethod(func: ScSpecFunctionV0): string {
    const name = sanitizeIdentifier(func.name.toString());
    const inputs = func.inputs.map((input: any) => ({
      name: sanitizeIdentifier(input.name.toString()),
      type: parseTypeFromTypeDef(input.type, true),
    }));
    const outputType =
      func.outputs.length > 0 ? parseTypeFromTypeDef(func.outputs[0]) : "void";
    const docs = formatJSDocComment(func.doc.toString(), 2);
    const params = this.formatMethodParameters(inputs);

    return `${docs}  ${name}(${params}): Promise<AssembledTransaction<${outputType}>>;`;
  }

  private generateFromJsonMethod(func: ScSpecFunctionV0): string {
    const name = sanitizeIdentifier(func.name.toString());
    const outputType =
      func.outputs.length > 0 ? parseTypeFromTypeDef(func.outputs[0]) : "void";

    return `  ${name} : this.txFromJson<${outputType}>`;
  }
  /**
   * Generate deploy method
   */
  private generateDeployMethod(
    constructorFunc: ScSpecFunctionV0 | undefined,
  ): string {
    // If no constructor, generate deploy with no params
    if (!constructorFunc) {
      const params = this.formatConstructorParameters([]);
      return `  static deploy<T = Client>(${params}): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }`;
    }
    const inputs = constructorFunc.inputs.map((input) => ({
      name: sanitizeIdentifier(input.name.toString()),
      type: parseTypeFromTypeDef(input.type, true),
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
      `options: MethodOptions & Omit<ContractClientOptions, 'contractId'> & { salt?: Uint8Array; address?: string; } & ({ wasmHash: Uint8Array | string; format?: "hex" | "base64"; externalRef?: never; } | { externalRef: ExternalExecutableRef; wasmHash?: never; format?: never; })`,
    );

    return params.join(", ");
  }
}
