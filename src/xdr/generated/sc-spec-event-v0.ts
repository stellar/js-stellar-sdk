import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import {
  ScSpecEventParamV0,
  type ScSpecEventParamV0Wire,
} from "./sc-spec-event-param-v0.js";
import {
  ScSpecEventDataFormat,
  type ScSpecEventDataFormatWire,
} from "./sc-spec-event-data-format.js";

export interface ScSpecEventV0Wire {
  doc: XdrString;
  lib: XdrString;
  name: XdrString;
  prefixTopics: XdrString[];
  params: ScSpecEventParamV0Wire[];
  dataFormat: ScSpecEventDataFormatWire;
}

/**
 * ```xdr
 * struct SCSpecEventV0
 * {
 *     string doc<SC_SPEC_DOC_LIMIT>;
 *     string lib<80>;
 *     SCSymbol name;
 *     SCSymbol prefixTopics<2>;
 *     SCSpecEventParamV0 params<>;
 *     SCSpecEventDataFormat dataFormat;
 * };
 * ```
 */
export class ScSpecEventV0 extends XdrValue {
  readonly doc: XdrString;
  readonly lib: XdrString;
  readonly name: XdrString;
  readonly prefixTopics: XdrString[];
  readonly params: ScSpecEventParamV0[];
  readonly dataFormat: ScSpecEventDataFormat;

  static readonly schema: XdrType<ScSpecEventV0Wire> = struct("ScSpecEventV0", {
    doc: xdrString(1024),
    lib: xdrString(80),
    name: xdrString(32),
    prefixTopics: array(xdrString(32), UNBOUNDED_MAX_LENGTH),
    params: array(ScSpecEventParamV0.schema, UNBOUNDED_MAX_LENGTH),
    dataFormat: ScSpecEventDataFormat.schema,
  });

  constructor(input: {
    doc: XdrString | string | Uint8Array;
    lib: XdrString | string | Uint8Array;
    name: XdrString | string | Uint8Array;
    prefixTopics: (XdrString | string | Uint8Array)[];
    params: ScSpecEventParamV0[];
    dataFormat: ScSpecEventDataFormat;
  }) {
    super();
    this.doc =
      input.doc instanceof XdrString ? input.doc : new XdrString(input.doc);
    this.lib =
      input.lib instanceof XdrString ? input.lib : new XdrString(input.lib);
    this.name =
      input.name instanceof XdrString ? input.name : new XdrString(input.name);
    this.prefixTopics = input.prefixTopics.map((v) =>
      v instanceof XdrString ? v : new XdrString(v),
    );
    this.params = input.params;
    this.dataFormat = input.dataFormat;
  }

  toXdrObject(): ScSpecEventV0Wire {
    return {
      doc: this.doc,
      lib: this.lib,
      name: this.name,
      prefixTopics: this.prefixTopics,
      params: this.params.map((v) => v.toXdrObject()),
      dataFormat: this.dataFormat.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ScSpecEventV0Wire): ScSpecEventV0 {
    return new ScSpecEventV0({
      doc: wire.doc,
      lib: wire.lib,
      name: wire.name,
      prefixTopics: wire.prefixTopics,
      params: wire.params.map((w) => ScSpecEventParamV0.fromXdrObject(w)),
      dataFormat: ScSpecEventDataFormat.fromXdrObject(wire.dataFormat),
    });
  }
}
