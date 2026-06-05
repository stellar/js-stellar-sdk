declare module "base32.js" {
  interface Base32Codec {
    decode(encoded: string): Buffer;
    encode(decoded: Uint8Array): string;
  }

  const base32: Base32Codec;
  export default base32;
}
