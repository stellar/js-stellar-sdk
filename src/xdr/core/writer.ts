import { paddingLength, viewFor } from "./helpers.js";

export class Writer {
  readonly #chunks: number[] = [];

  writeBytes(bytes: Uint8Array): void {
    this.#chunks.push(...bytes);
  }

  writePadding(length: number): void {
    for (let i = 0; i < paddingLength(length); i += 1) {
      this.#chunks.push(0);
    }
  }

  writeInt32(value: number): void {
    const bytes = new Uint8Array(4);
    viewFor(bytes).setInt32(0, value, false);
    this.writeBytes(bytes);
  }

  writeUint32(value: number): void {
    const bytes = new Uint8Array(4);
    viewFor(bytes).setUint32(0, value, false);
    this.writeBytes(bytes);
  }

  writeBigInt64(value: bigint): void {
    const bytes = new Uint8Array(8);
    viewFor(bytes).setBigInt64(0, value, false);
    this.writeBytes(bytes);
  }

  writeBigUint64(value: bigint): void {
    const bytes = new Uint8Array(8);
    viewFor(bytes).setBigUint64(0, value, false);
    this.writeBytes(bytes);
  }

  writeFloat32(value: number): void {
    const bytes = new Uint8Array(4);
    viewFor(bytes).setFloat32(0, value, false);
    this.writeBytes(bytes);
  }

  writeFloat64(value: number): void {
    const bytes = new Uint8Array(8);
    viewFor(bytes).setFloat64(0, value, false);
    this.writeBytes(bytes);
  }

  toUint8Array(): Uint8Array {
    return Uint8Array.from(this.#chunks);
  }
}
