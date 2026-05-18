import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  ScSpecEventParamV0,
  type ScSpecEventParamV0Wire,
} from "./sc-spec-event-param-v0.js";
import {
  ScSpecEventDataFormat,
  type ScSpecEventDataFormatWire,
} from "./sc-spec-event-data-format.js";

export interface ScSpecEventV0Wire {
  doc: string;
  lib: string;
  name: string;
  prefixTopics: string[];
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
  readonly doc: string;
  readonly lib: string;
  readonly name: string;
  readonly prefixTopics: string[];
  readonly params: ScSpecEventParamV0[];
  readonly dataFormat: ScSpecEventDataFormat;

  static readonly schema: XdrType<ScSpecEventV0Wire> = struct("ScSpecEventV0", {
    doc: string_(1024),
    lib: string_(80),
    name: string_(32),
    prefixTopics: array(string_(32), UNBOUNDED_MAX_LENGTH),
    params: array(ScSpecEventParamV0.schema, UNBOUNDED_MAX_LENGTH),
    dataFormat: ScSpecEventDataFormat.schema,
  });

  constructor(input: {
    doc: string;
    lib: string;
    name: string;
    prefixTopics: string[];
    params: ScSpecEventParamV0[];
    dataFormat: ScSpecEventDataFormat;
  }) {
    super();
    this.doc = input.doc;
    this.lib = input.lib;
    this.name = input.name;
    this.prefixTopics = input.prefixTopics;
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
