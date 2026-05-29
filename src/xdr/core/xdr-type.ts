import { Reader } from "./reader.js";
import { Writer } from "./writer.js";

export const UNBOUNDED_MAX_LENGTH = 4294967295;

export interface DecodeOptions {
  readonly maxDepth?: number;
}

export interface XdrType<T> {
  readonly name: string | undefined;
  readonly kind: string;
  encode(value: T): Uint8Array;
  decode(input: Uint8Array, options?: DecodeOptions): T;
  validate(value: unknown): value is T;
  _read(reader: Reader, path: string): T;
  _write(value: T, writer: Writer, path: string): void;
}

export type Infer<T> = T extends XdrType<infer V> ? V : never;

export abstract class BaseType<T> implements XdrType<T> {
  abstract readonly kind: string;
  readonly name: string | undefined;

  constructor(name: string | undefined = undefined) {
    this.name = name;
  }

  encode(value: T): Uint8Array {
    const writer = new Writer();
    this._write(value, writer, this.name ?? this.kind);
    return writer.toUint8Array();
  }

  decode(input: Uint8Array, options?: DecodeOptions): T {
    const reader = new Reader(input, options?.maxDepth);
    const value = this._read(reader, this.name ?? this.kind);
    reader.done(this.name ?? this.kind);
    return value;
  }

  validate(value: unknown): value is T {
    try {
      const writer = new Writer();
      this._write(value as T, writer, this.name ?? this.kind);
      return true;
    } catch {
      return false;
    }
  }

  abstract _read(reader: Reader, path: string): T;
  abstract _write(value: T, writer: Writer, path: string): void;
}
