import { XdrError } from "../core/error.js";
import type { Reader } from "../core/reader.js";
import type { Writer } from "../core/writer.js";
import { BaseType, type Infer, type XdrType } from "../core/xdr-type.js";
import { isPlainObject } from "../core/helpers.js";

export type Field<Name extends string, T extends XdrType<unknown>> = {
  readonly kind: "field";
  readonly name: Name;
  readonly schema: T;
};
type VoidArm = XdrType<void>;
export type UnionArm = VoidArm | Field<string, XdrType<unknown>>;
export type UnionCase<Name extends string, Disc, Arm extends UnionArm> = {
  readonly name: Name;
  readonly discriminant: Disc;
  readonly arm: Arm;
};
type ArmValue<Arm> =
  Arm extends Field<infer Name, infer Schema>
    ? { readonly [K in Name]: Infer<Schema> }
    : {};
type CaseValue<SwitchKey extends string, C> =
  C extends UnionCase<string, infer Disc, infer Arm>
    ? { readonly [K in SwitchKey]: Disc } & ArmValue<Arm>
    : never;
type DefaultValue<Switch, SwitchKey extends string, Arm> = Arm extends UnionArm
  ? { readonly [K in SwitchKey]: Infer<Switch> } & ArmValue<Arm>
  : never;
type UnionValue<
  Switch extends XdrType<unknown>,
  Cases extends readonly UnionCase<string, unknown, UnionArm>[],
  DefaultArm,
  SwitchKey extends string,
> =
  | CaseValue<SwitchKey, Cases[number]>
  | DefaultValue<Switch, SwitchKey, DefaultArm>;

const DEFAULT_CASE_NAME = "default";

class UnionType<
  Switch extends XdrType<string | number | boolean>,
  Cases extends readonly UnionCase<string, Infer<Switch>, UnionArm>[],
  DefaultArm extends UnionArm | undefined,
  SwitchKey extends string,
> extends BaseType<UnionValue<Switch, Cases, DefaultArm, SwitchKey>> {
  readonly kind = "union";
  readonly #casesByDiscriminant = new Map<Infer<Switch>, Cases[number]>();

  constructor(
    name: string,
    private readonly switchOn: Switch,
    cases: Cases,
    private readonly defaultArm: DefaultArm,
    private readonly switchKey: SwitchKey,
  ) {
    super(name);
    const names = new Set<string>();
    for (const unionCase of cases) {
      if (names.has(unionCase.name)) {
        throw new XdrError(
          `${name}: duplicate union case name ${unionCase.name}`,
        );
      }
      names.add(unionCase.name);
      if (this.#casesByDiscriminant.has(unionCase.discriminant)) {
        throw new XdrError(
          `${name}: duplicate union discriminator ${String(unionCase.discriminant)}`,
        );
      }
      assertArmPayloadName(name, unionCase.name, unionCase.arm, switchKey);
      this.#casesByDiscriminant.set(unionCase.discriminant, unionCase);
    }
    if (defaultArm !== undefined) {
      assertArmPayloadName(name, DEFAULT_CASE_NAME, defaultArm, switchKey);
    }
  }

  _read(
    reader: Reader,
    path: string,
  ): UnionValue<Switch, Cases, DefaultArm, SwitchKey> {
    reader.enter(path);
    try {
      const discriminant = this.switchOn._read(
        reader,
        `${path}.${this.switchKey}`,
      ) as Infer<Switch>;
      const unionCase = this.#casesByDiscriminant.get(discriminant);
      const arm = unionCase?.arm ?? this.defaultArm;
      if (arm === undefined) {
        throw new XdrError(
          `${path}: no case for union discriminator ${String(discriminant)}`,
        );
      }
      return readUnionArm(
        discriminant,
        arm,
        this.switchKey,
        reader,
        `${path}.${unionCase?.name ?? DEFAULT_CASE_NAME}`,
      ) as UnionValue<Switch, Cases, DefaultArm, SwitchKey>;
    } finally {
      reader.exit();
    }
  }

  _write(
    value: UnionValue<Switch, Cases, DefaultArm, SwitchKey>,
    writer: Writer,
    path: string,
  ): void {
    if (!isPlainObject(value) || !(this.switchKey in value)) {
      throw new XdrError(
        `${path}: expected union object with ${this.switchKey} discriminator`,
      );
    }
    const unionValue = value as Readonly<Record<string, unknown>>;
    const switchValue = unionValue[this.switchKey] as Infer<Switch>;
    const unionCase = this.#casesByDiscriminant.get(switchValue);
    const arm = unionCase?.arm ?? this.defaultArm;
    if (arm === undefined) {
      throw new XdrError(
        `${path}: no case for union discriminator ${String(switchValue)}`,
      );
    }
    this.switchOn._write(switchValue, writer, `${path}.${this.switchKey}`);
    writeUnionArm(
      unionValue,
      arm,
      writer,
      `${path}.${unionCase?.name ?? DEFAULT_CASE_NAME}`,
    );
  }
}

export function field<Name extends string, T extends XdrType<unknown>>(
  name: Name,
  schema: T,
): Field<Name, T> {
  return { kind: "field", name, schema };
}

function case_<
  Name extends string,
  Disc extends string | number | boolean,
  Arm extends UnionArm,
>(name: Name, discriminant: Disc, arm: Arm): UnionCase<Name, Disc, Arm> {
  return { name, discriminant, arm };
}

export { case_ as case };

export function union<
  Name extends string,
  Switch extends XdrType<string | number | boolean>,
  Cases extends readonly UnionCase<string, Infer<Switch>, UnionArm>[],
  DefaultArm extends UnionArm | undefined = undefined,
  SwitchKey extends string = "type",
>(
  name: Name,
  options: {
    readonly switchOn: Switch;
    readonly cases: Cases;
    readonly defaultArm?: DefaultArm;
    readonly switchKey?: SwitchKey;
  },
): XdrType<UnionValue<Switch, Cases, DefaultArm, SwitchKey>> & {
  readonly name: Name;
} {
  const switchKey = (options.switchKey ?? "type") as SwitchKey;
  return new UnionType(
    name,
    options.switchOn,
    options.cases,
    options.defaultArm,
    switchKey,
  ) as unknown as XdrType<UnionValue<Switch, Cases, DefaultArm, SwitchKey>> & {
    readonly name: Name;
  };
}

function readUnionArm(
  discriminant: unknown,
  arm: UnionArm,
  switchKey: string,
  reader: Reader,
  path: string,
): Record<string, unknown> {
  const base = { [switchKey]: discriminant };
  if (isFieldArm(arm)) {
    return {
      ...base,
      [arm.name]: arm.schema._read(reader, `${path}.${arm.name}`),
    };
  }
  arm._read(reader, path);
  return base;
}

function writeUnionArm(
  value: Readonly<Record<string, unknown>>,
  arm: UnionArm,
  writer: Writer,
  path: string,
): void {
  if (isFieldArm(arm)) {
    if (!(arm.name in value)) {
      throw new XdrError(`${path}.${arm.name}: missing union arm payload`);
    }
    arm.schema._write(value[arm.name], writer, `${path}.${arm.name}`);
    return;
  }
  arm._write(undefined, writer, path);
}

function assertArmPayloadName(
  unionName: string,
  caseName: string,
  arm: UnionArm,
  switchKey: string,
): void {
  if (isFieldArm(arm) && arm.name === switchKey) {
    throw new XdrError(
      `${unionName}.${caseName}: union arm payload field must not be named ${switchKey}`,
    );
  }
}

function isFieldArm(arm: UnionArm): arm is Field<string, XdrType<unknown>> {
  return "schema" in arm;
}
