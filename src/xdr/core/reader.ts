import { XdrError } from "./error.js";
import { paddingLength, viewFor } from "./helpers.js";

export const DEFAULT_MAX_DEPTH = 200;

export class Reader {
  #offset = 0;
  #depth = 0;
  readonly #maxDepth: number;

  constructor(
    private readonly bytes: Uint8Array,
    maxDepth: number = DEFAULT_MAX_DEPTH,
  ) {
    this.#maxDepth = maxDepth;
  }

  get offset(): number {
    return this.#offset;
  }

  get remaining(): number {
    return this.bytes.length - this.#offset;
  }

  enter(path: string): void {
    this.#depth += 1;
    if (this.#depth > this.#maxDepth) {
      throw new XdrError(
        `${path}: max recursion depth ${this.#maxDepth} exceeded`,
      );
    }
  }

  exit(): void {
    this.#depth -= 1;
  }

  done(path: string): void {
    if (this.remaining !== 0) {
      throw new XdrError(
        `${path}: trailing ${this.remaining} byte(s) after XDR value`,
      );
    }
  }

  readBytes(length: number, path: string): Uint8Array {
    if (length < 0 || !Number.isInteger(length)) {
      throw new XdrError(`${path}: invalid byte length ${length}`);
    }
    if (this.remaining < length) {
      throw new XdrError(
        `${path}: incomplete XDR data at offset ${this.#offset}, expected ${length} byte(s)`,
      );
    }
    const result = this.bytes.slice(this.#offset, this.#offset + length);
    this.#offset += length;
    return result;
  }

  skipPadding(length: number, path: string): void {
    const padding = paddingLength(length);
    const bytes = this.readBytes(padding, path);
    for (const byte of bytes) {
      if (byte !== 0) {
        throw new XdrError(`${path}: non-zero XDR padding`);
      }
    }
  }

  readInt32(path: string): number {
    const view = viewFor(this.readBytes(4, path));
    return view.getInt32(0, false);
  }

  readUint32(path: string): number {
    const view = viewFor(this.readBytes(4, path));
    return view.getUint32(0, false);
  }

  readBigInt64(path: string): bigint {
    const view = viewFor(this.readBytes(8, path));
    return view.getBigInt64(0, false);
  }

  readBigUint64(path: string): bigint {
    const view = viewFor(this.readBytes(8, path));
    return view.getBigUint64(0, false);
  }

  readFloat32(path: string): number {
    const view = viewFor(this.readBytes(4, path));
    return view.getFloat32(0, false);
  }

  readFloat64(path: string): number {
    const view = viewFor(this.readBytes(8, path));
    return view.getFloat64(0, false);
  }
}
