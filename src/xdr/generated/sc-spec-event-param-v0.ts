import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import { ScSpecTypeDef, type ScSpecTypeDefWire } from "./sc-spec-type-def.js";
import {
  ScSpecEventParamLocationV0,
  type ScSpecEventParamLocationV0Wire,
} from "./sc-spec-event-param-location-v0.js";

export interface ScSpecEventParamV0Wire {
  doc: XdrString;
  name: XdrString;
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
  readonly doc: XdrString;
  readonly name: XdrString;
  readonly type: ScSpecTypeDef;
  readonly location: ScSpecEventParamLocationV0;

  static readonly schema: XdrType<ScSpecEventParamV0Wire> = struct(
    "ScSpecEventParamV0",
    {
      doc: xdrString(1024),
      name: xdrString(30),
      type: ScSpecTypeDef.schema,
      location: ScSpecEventParamLocationV0.schema,
    },
  );

  constructor(input: {
    doc: XdrString | string | Uint8Array;
    name: XdrString | string | Uint8Array;
    type: ScSpecTypeDef;
    location: ScSpecEventParamLocationV0;
  }) {
    super();
    this.doc =
      input.doc instanceof XdrString ? input.doc : new XdrString(input.doc);
    this.name =
      input.name instanceof XdrString ? input.name : new XdrString(input.name);
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
