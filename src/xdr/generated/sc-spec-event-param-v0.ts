import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScSpecTypeDef, type ScSpecTypeDefWire } from "./sc-spec-type-def.js";
import {
  ScSpecEventParamLocationV0,
  type ScSpecEventParamLocationV0Wire,
} from "./sc-spec-event-param-location-v0.js";

export interface ScSpecEventParamV0Wire {
  doc: string;
  name: string;
  type: ScSpecTypeDefWire;
  location: ScSpecEventParamLocationV0Wire;
}

/**
 * ```xdr
 * struct SCSpecEventParamV0
 * {
 *     string doc<SC_SPEC_DOC_LIMIT>;
 *     string name<30>;
 *     SCSpecTypeDef type;
 *     SCSpecEventParamLocationV0 location;
 * };
 * ```
 */
export class ScSpecEventParamV0 extends XdrValue {
  readonly doc: string;
  readonly name: string;
  readonly type: ScSpecTypeDef;
  readonly location: ScSpecEventParamLocationV0;

  static readonly schema: XdrType<ScSpecEventParamV0Wire> = struct(
    "ScSpecEventParamV0",
    {
      doc: string_(1024),
      name: string_(30),
      type: ScSpecTypeDef.schema,
      location: ScSpecEventParamLocationV0.schema,
    },
  );

  constructor(input: {
    doc: Uint8Array | string;
    name: Uint8Array | string;
    type: ScSpecTypeDef;
    location: ScSpecEventParamLocationV0;
  }) {
    super();
    this.doc =
      input.doc instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.doc)
        : input.doc;
    this.name =
      input.name instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.name)
        : input.name;
    this.type = input.type;
    this.location = input.location;
  }

  toXdrObject(): ScSpecEventParamV0Wire {
    return {
      doc: this.doc,
      name: this.name,
      type: this.type.toXdrObject(),
      location: this.location.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ScSpecEventParamV0Wire): ScSpecEventParamV0 {
    return new ScSpecEventParamV0({
      doc: wire.doc,
      name: wire.name,
      type: ScSpecTypeDef.fromXdrObject(wire.type),
      location: ScSpecEventParamLocationV0.fromXdrObject(wire.location),
    });
  }
}
