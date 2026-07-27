import { xdr } from "../base/index.js";
import { Spec } from "../contract/index.js";
import {
  parseTypeFromTypeDef,
  generateTypeImports,
  sanitizeIdentifier,
  escapeStringLiteral,
  formatJSDocComment,
  formatImports,
  isTupleStruct,
  toPascalCase,
} from "./utils.js";

/**
 * Interface for struct fields
 */
export interface StructField {
  doc: string;
  name: string;
  type: string;
}

/**
 * Interface for union cases
 */
export interface UnionCase {
  doc: string;
  name: string;
  types: string[];
}

/**
 * Interface for enum cases
 */
export interface EnumCase {
  doc: string;
  name: string;
  value: number;
}

/**
 * Generates TypeScript type definitions from Stellar contract specs
 */
export class TypeGenerator {
  private spec: Spec;

  // rawEventName -> resolved (possibly disambiguated) interface name.
  // Lazily computed on first use; see resolveEventInterfaceNames().
  private eventInterfaceNames: Map<string, string> | null = null;

  constructor(spec: Spec) {
    this.spec = spec;
  }

  /**
   * Generate all TypeScript type definitions
   */
  generate(): string {
    // Generate types for each entry in the spec
    const types = this.spec.entries
      .map((entry) => this.generateEntry(entry))
      .filter((t) => t)
      .join("\n\n");
    // Generate imports for all types
    const imports = this.generateImports();
    // Generate the discriminated union of all contract events, if any
    const eventUnion = this.generateContractEventUnion();

    return `${imports}

    ${types}
    ${eventUnion}
    `;
  }

  /**
   * Generate TypeScript for a single spec entry
   */
  private generateEntry(entry: xdr.ScSpecEntry): string | null {
    switch (entry.switch()) {
      case xdr.ScSpecEntryKind.scSpecEntryUdtStructV0():
        if (isTupleStruct(entry.udtStructV0())) {
          return this.generateTupleStruct(entry.udtStructV0());
        }
        return this.generateStruct(entry.udtStructV0());
      case xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0():
        return this.generateUnion(entry.udtUnionV0());
      case xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0():
        return this.generateEnum(entry.udtEnumV0());
      case xdr.ScSpecEntryKind.scSpecEntryUdtErrorEnumV0():
        return this.generateErrorEnum(entry.udtErrorEnumV0());
      case xdr.ScSpecEntryKind.scSpecEntryEventV0():
        return this.generateEvent(entry.eventV0());
      default:
        return null;
    }
  }

  private generateImports(): string {
    const imports = generateTypeImports(
      this.spec.entries.flatMap((entry) => {
        switch (entry.switch()) {
          case xdr.ScSpecEntryKind.scSpecEntryUdtStructV0():
            return entry
              .udtStructV0()
              .fields()
              .map((field) => field.type());
          case xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0():
            return entry
              .udtUnionV0()
              .cases()
              .flatMap((unionCase) => {
                if (
                  unionCase.switch() ===
                  xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0()
                ) {
                  return unionCase.tupleCase().type();
                }
                return [];
              });
          case xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0():
            // Enums do not have associated types
            return [];
          case xdr.ScSpecEntryKind.scSpecEntryUdtErrorEnumV0():
            // Enums do not have associated types
            return [];
          case xdr.ScSpecEntryKind.scSpecEntryEventV0():
            return entry
              .eventV0()
              .params()
              .map((param) => param.type());
          default:
            return [];
        }
      }),
    );

    return formatImports(imports, {
      includeTypeFileImports: false, // Types file doesn't import from itself
    });
  }

  /**
   * Generate TypeScript interface for a struct
   */
  private generateStruct(struct: xdr.ScSpecUdtStructV0): string {
    const name = sanitizeIdentifier(struct.name().toString());
    const doc = formatJSDocComment(
      struct.doc().toString() || `Struct: ${name}`,
      0,
    );

    const fields = struct
      .fields()
      .map((field) => {
        const fieldName = sanitizeIdentifier(field.name().toString());
        const fieldType = parseTypeFromTypeDef(field.type());
        const fieldDoc = formatJSDocComment(field.doc().toString(), 2);

        return `${fieldDoc}  ${fieldName}: ${fieldType};`;
      })
      .join("\n");

    return `${doc}export interface ${name} {
${fields}
}`;
  }

  /**
   * Generate TypeScript union type
   */
  private generateUnion(union: xdr.ScSpecUdtUnionV0): string {
    const name = sanitizeIdentifier(union.name().toString());
    const doc = formatJSDocComment(
      union.doc().toString() || `Union: ${name}`,
      0,
    );
    const cases = union
      .cases()
      .map((unionCase) => this.generateUnionCase(unionCase));

    const caseTypes = cases
      .map((c) => {
        if (c.types.length > 0) {
          return `${formatJSDocComment(c.doc, 2)}  { tag: "${escapeStringLiteral(c.name)}"; values: readonly [${c.types.join(", ")}] }`;
        }
        return `${formatJSDocComment(c.doc, 2)}  { tag: "${escapeStringLiteral(c.name)}"; values: void }`;
      })
      .join(" |\n");

    return `${doc} export type ${name} =
${caseTypes};`;
  }

  /**
   * Generate TypeScript enum
   */
  private generateEnum(enumEntry: xdr.ScSpecUdtEnumV0): string {
    const name = sanitizeIdentifier(enumEntry.name().toString());
    const doc = formatJSDocComment(
      enumEntry.doc().toString() || `Enum: ${name}`,
      0,
    );

    const members = enumEntry
      .cases()
      .map((enumCase) => {
        const caseName = sanitizeIdentifier(enumCase.name().toString());
        const caseValue = enumCase.value();
        const caseDoc = enumCase.doc().toString() || `Enum Case: ${caseName}`;

        return `${formatJSDocComment(caseDoc, 2)}  ${caseName} = ${caseValue}`;
      })
      .join(",\n");

    return `${doc}export enum ${name} {
${members}
}`;
  }

  /**
   * Generate TypeScript error enum
   */
  private generateErrorEnum(errorEnum: xdr.ScSpecUdtErrorEnumV0): string {
    const name = sanitizeIdentifier(errorEnum.name().toString());
    const doc = formatJSDocComment(
      errorEnum.doc().toString() || `Error Enum: ${name}`,
      0,
    );
    const cases = errorEnum
      .cases()
      .map((enumCase) => this.generateEnumCase(enumCase));

    const members = cases
      .map((c) => {
        return `${formatJSDocComment(c.doc, 2)}  ${c.value} : { message: "${escapeStringLiteral(c.name)}" }`;
      })
      .join(",\n");

    return `${doc}export const ${name} = {
${members}
}`;
  }

  /**
   * Generate union case
   */
  private generateUnionCase(unionCase: xdr.ScSpecUdtUnionCaseV0): UnionCase {
    switch (unionCase.switch()) {
      case xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseVoidV0(): {
        const voidCase = unionCase.voidCase();
        return {
          doc: voidCase.doc().toString(),
          name: voidCase.name().toString(),
          types: [],
        };
      }
      case xdr.ScSpecUdtUnionCaseV0Kind.scSpecUdtUnionCaseTupleV0(): {
        const tupleCase = unionCase.tupleCase();
        return {
          doc: tupleCase.doc().toString(),
          name: tupleCase.name().toString(),
          types: tupleCase.type().map((t) => parseTypeFromTypeDef(t)),
        };
      }
      default:
        throw new Error(`Unknown union case kind: ${unionCase.switch()}`);
    }
  }

  /**
   * Generate enum case
   */
  private generateEnumCase(enumCase: xdr.ScSpecUdtEnumCaseV0): EnumCase {
    return {
      doc: enumCase.doc().toString(),
      name: enumCase.name().toString(),
      value: enumCase.value(),
    };
  }

  /**
   * Compute the exported TS interface name for an event, e.g. "transfer"
   * becomes "TransferEvent". Resolved (and disambiguated if necessary) via
   * {@link resolveEventInterfaceNames}, so every call site agrees.
   */
  private eventInterfaceName(event: xdr.ScSpecEventV0): string {
    const rawName = event.name().toString();
    const resolved = this.resolveEventInterfaceNames().get(rawName);
    /* istanbul ignore next -- every event in the spec is reserved a name */
    if (resolved === undefined) {
      return `${toPascalCase(sanitizeIdentifier(rawName))}Event`;
    }
    return resolved;
  }

  /**
   * True if the given event's resolved interface name differs from its
   * preferred (unsuffixed) form, i.e. it was disambiguated away from a
   * collision.
   */
  private eventInterfaceNameWasRenamed(event: xdr.ScSpecEventV0): boolean {
    const rawName = event.name().toString();
    const preferred = `${toPascalCase(sanitizeIdentifier(rawName))}Event`;
    return this.eventInterfaceName(event) !== preferred;
  }

  /**
   * The name-normalization used for event interface names (and UDT type
   * names) is not injective — e.g. events "FooBar" and "foo_bar" both
   * produce the interface name "FooBarEvent", and an event can just as
   * easily collide with a UDT (struct/union/enum) of the same generated
   * name. Since UDT/function names are load-bearing (referenced directly in
   * signatures) and event-derived names are already synthetic, UDT names
   * always win: they are reserved first, in spec-entry order. Events are
   * then resolved in spec-entry order, appending the smallest integer 2 or greater
   * needed to make the name unique (and reserving whatever name results, so
   * later events see it too). This is deterministic for a given spec.
   */
  private resolveEventInterfaceNames(): Map<string, string> {
    if (this.eventInterfaceNames !== null) {
      return this.eventInterfaceNames;
    }
    // Reserve names that are already taken by UDTs and other special entries. ContractEvent is a special entry for the discriminated union of all events.
    const reserved = new Set<string>(["ContractEvent"]);

    for (const entry of this.spec.entries) {
      switch (entry.switch()) {
        case xdr.ScSpecEntryKind.scSpecEntryUdtStructV0():
          reserved.add(
            sanitizeIdentifier(entry.udtStructV0().name().toString()),
          );
          break;
        case xdr.ScSpecEntryKind.scSpecEntryUdtUnionV0():
          reserved.add(
            sanitizeIdentifier(entry.udtUnionV0().name().toString()),
          );
          break;
        case xdr.ScSpecEntryKind.scSpecEntryUdtEnumV0():
          reserved.add(sanitizeIdentifier(entry.udtEnumV0().name().toString()));
          break;
        case xdr.ScSpecEntryKind.scSpecEntryUdtErrorEnumV0():
          reserved.add(
            sanitizeIdentifier(entry.udtErrorEnumV0().name().toString()),
          );
          break;
        default:
          break;
      }
    }

    const resolved = new Map<string, string>();

    for (const entry of this.spec.entries) {
      if (entry.switch() !== xdr.ScSpecEntryKind.scSpecEntryEventV0()) {
        continue;
      }
      const event = entry.eventV0();
      const rawName = event.name().toString();
      const preferred = `${toPascalCase(sanitizeIdentifier(rawName))}Event`;

      let candidate = preferred;
      let suffix = 2;
      while (reserved.has(candidate)) {
        candidate = `${preferred}${suffix}`;
        suffix += 1;
      }

      reserved.add(candidate);
      resolved.set(rawName, candidate);
    }

    this.eventInterfaceNames = resolved;
    return resolved;
  }

  /**
   * Generate TypeScript interface for a Soroban contract event
   */
  private generateEvent(event: xdr.ScSpecEventV0): string {
    const rawName = event.name().toString();
    const name = this.eventInterfaceName(event);
    const preferred = `${toPascalCase(sanitizeIdentifier(rawName))}Event`;
    const renameNote = this.eventInterfaceNameWasRenamed(event)
      ? `\n\nNote: renamed from "${preferred}" to avoid a collision with another generated name.`
      : "";
    const doc = formatJSDocComment(
      (event.doc().toString() || `Event: ${rawName}`) + renameNote,
      0,
    );

    // parseEvent keys its output by the raw param names, so the interface
    // must use them too — quoted when they aren't valid identifiers.
    const fieldKey = (rawParamName: string): string =>
      /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(rawParamName)
        ? rawParamName
        : `"${escapeStringLiteral(rawParamName)}"`;

    // Map-format data entries may be absent from an emitted event's map, in
    // which case parseEvent omits the key — so those fields are optional.
    const dataIsMapFormat =
      event.dataFormat().value ===
      xdr.ScSpecEventDataFormat.scSpecEventDataFormatMap().value;

    // parseEvent merges topic-list and data-located params into a single
    // flat `data` record; generate one field per param in declaration order.
    const dataFields = event
      .params()
      .map((param) => {
        const fieldName = fieldKey(param.name().toString());
        const fieldType = parseTypeFromTypeDef(param.type());
        const fieldDoc = formatJSDocComment(param.doc().toString(), 4);
        const optional =
          dataIsMapFormat &&
          param.location().value ===
            xdr.ScSpecEventParamLocationV0.scSpecEventParamLocationData().value;

        return `${fieldDoc}    ${fieldName}${optional ? "?" : ""}: ${fieldType};`;
      })
      .join("\n");

    return `${doc}export interface ${name} {
  name: "${escapeStringLiteral(rawName)}";
  data: {
${dataFields}
  };
}`;
  }

  /**
   * Generate the discriminated union of all contract events, if the spec defines any.
   */
  private generateContractEventUnion(): string {
    const eventEntries = this.spec.entries.filter(
      (entry) => entry.switch() === xdr.ScSpecEntryKind.scSpecEntryEventV0(),
    );

    if (eventEntries.length === 0) {
      return "";
    }

    const names = eventEntries.map((entry) =>
      this.eventInterfaceName(entry.eventV0()),
    );

    return `export type ContractEvent = ${names.join(" | ")};`;
  }

  private generateTupleStruct(udtStruct: xdr.ScSpecUdtStructV0): string {
    const name = sanitizeIdentifier(udtStruct.name().toString());
    const doc = formatJSDocComment(
      udtStruct.doc().toString() || `Tuple Struct: ${name}`,
      0,
    );

    const types = udtStruct
      .fields()
      .map((field) => parseTypeFromTypeDef(field.type()))
      .join(", ");

    return `${doc}export type ${name} = readonly [${types}];`;
  }
}
