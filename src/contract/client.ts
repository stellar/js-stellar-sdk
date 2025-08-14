import {
  Operation,
  xdr,
  Address,
} from "@stellar/stellar-base";
import { Spec } from "./spec";
import { Server } from '../rpc';
import { AssembledTransaction } from "./assembled_transaction";
import type { ClientOptions, MethodOptions } from "./types";
import { processSpecEntryStream } from './utils';

const CONSTRUCTOR_FUNC = "__constructor";

async function specFromWasm(wasm: Buffer) {
  let xdrSections: ArrayBuffer[] | undefined;

  try {
    const wasmModule = await WebAssembly.compile(wasm);
    xdrSections = WebAssembly.Module.customSections(
      wasmModule,
      "contractspecv0"
    );
  } catch {
    const customData = parseWasmCustomSections(wasm);
    xdrSections = customData.get('contractspecv0');
  }

  if (!xdrSections || xdrSections.length === 0) {
    throw new Error("Could not obtain contract spec from wasm");
  }

  const bufferSection = Buffer.from(xdrSections[0]);  
  const specEntryArray = processSpecEntryStream(bufferSection);
  const spec = new Spec(specEntryArray);

  return spec;
}

function parseWasmCustomSections(buffer: Buffer): Map<string, Uint8Array[]> {
  const sections = new Map<string, Uint8Array[]>();
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );

  let offset = 0;

  // Helper to read bytes with bounds checking
  const read = (length: number): Uint8Array => {
    if (offset + length > buffer.byteLength) throw new Error('Buffer overflow');
    const bytes = new Uint8Array(arrayBuffer, offset, length);
    offset += length;
    return bytes;
  };

  // Validate header
  if ([...read(4)].join() !== '0,97,115,109') throw new Error('Invalid WASM magic');
  if ([...read(4)].join() !== '1,0,0,0') throw new Error('Invalid WASM version');

  while (offset < buffer.byteLength) {
    const sectionId = read(1)[0];
    const sectionLength = readVarUint32();
    const start = offset;

    if (sectionId === 0) { // Custom section
      const nameLen = readVarUint32();

      if (nameLen === 0 || offset + nameLen > start + sectionLength) continue;

      const nameBytes = read(nameLen);
      const payload = read(sectionLength - (offset - start));

      try {
        const name = new TextDecoder('utf-8', { fatal: true }).decode(nameBytes);
        if (payload.length > 0) {
          sections.set(name, (sections.get(name) || []).concat(payload));
        }
      } catch { /* Invalid UTF-8 */ }
    } else {
      offset += sectionLength; // Skip other sections
    }
  }

  /**
   * Decodes a variable-length encoded unsigned 32-bit integer (LEB128 format) from the WASM binary.
   * 
   * This function implements the WebAssembly LEB128 (Little Endian Base 128) variable-length 
   * encoding scheme for unsigned integers. In this encoding:
   * - Each byte uses 7 bits for the actual value
   * - The most significant bit (MSB) indicates if more bytes follow (1) or not (0)
   * - Values are stored with the least significant bytes first
   * 
   * @returns {number} The decoded 32-bit unsigned integer
   * @throws {Error} If the encoding is invalid or exceeds 32 bits
   */
  function readVarUint32(): number {
    let value = 0, shift = 0;
    while (true) {
      const byte = read(1)[0];         // Read a single byte from the buffer
      value |= (byte & 0x7F) << shift; // Extract 7 bits and shift to correct position
      if ((byte & 0x80) === 0) break;  // If MSB is 0, we've reached the last byte
      if ((shift += 7) >= 32) throw new Error('Invalid WASM value'); // Ensure we don't exceed 32 bits
    }
    return value >>> 0;  // Force conversion to unsigned 32-bit integer
  }

  return sections;
}

async function specFromWasmHash(
  wasmHash: Buffer | string,
  options: Server.Options & { rpcUrl: string },
  format: "hex" | "base64" = "hex"
): Promise<Spec> {
  if (!options || !options.rpcUrl) {
    throw new TypeError("options must contain rpcUrl");
  }
  const { rpcUrl, allowHttp } = options;
  const serverOpts: Server.Options = { allowHttp };
  const server = new Server(rpcUrl, serverOpts);
  const wasm = await server.getContractWasmByHash(wasmHash, format);
  return specFromWasm(wasm);
}

/**
 * Generate a class from the contract spec that where each contract method
 * gets included with an identical name.
 *
 * Each method returns an {@link module:contract.AssembledTransaction | AssembledTransaction} that can
 * be used to modify, simulate, decode results, and possibly sign, & submit the
 * transaction.
 *
 * @memberof module:contract
 *
 * @class
 * @param {module:contract.Spec} spec {@link Spec} to construct a Client for
 * @param {ClientOptions} options see {@link ClientOptions}
 */
export class Client {
  static async deploy<T = Client>(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    args: Record<string, any> | null,
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
        /** The address to use to deploy the custom contract */
        address?: string;
      }
  ): Promise<AssembledTransaction<T>> {
    const { wasmHash, salt, format, fee, timeoutInSeconds, simulate, ...clientOptions } = options;
    const spec = await specFromWasmHash(wasmHash, clientOptions, format);

    const operation = Operation.createCustomContract({
      address: new Address(options.address || options.publicKey!),
      wasmHash: typeof wasmHash === "string"
        ? Buffer.from(wasmHash, format ?? "hex")
        : (wasmHash as Buffer),
      salt,
      constructorArgs: args
        ? spec.funcArgsToScVals(CONSTRUCTOR_FUNC, args)
        : []
    });

    return AssembledTransaction.buildWithOp(operation, {
      fee,
      timeoutInSeconds,
      simulate,
      ...clientOptions,
      contractId: "ignored",
      method: CONSTRUCTOR_FUNC,
      parseResultXdr: (result) =>
        new Client(spec, { ...clientOptions, contractId: Address.fromScVal(result).toString() })
    }) as unknown as AssembledTransaction<T>;
  }

  constructor(
    public readonly spec: Spec,
    public readonly options: ClientOptions
  ) {
    this.spec.funcs().forEach((xdrFn) => {
      const method = xdrFn.name().toString();
      if (method === CONSTRUCTOR_FUNC) {
        return;
      }
      const assembleTransaction = (
        args?: Record<string, any>,
        methodOptions?: MethodOptions
      ) =>
        AssembledTransaction.build({
          method,
          args: args && spec.funcArgsToScVals(method, args),
          ...options,
          ...methodOptions,
          errorTypes: spec.errorCases().reduce(
            (acc, curr) => ({
              ...acc,
              [curr.value()]: { message: curr.doc().toString() },
            }),
            {} as Pick<ClientOptions, "errorTypes">,
          ),
          parseResultXdr: (result: xdr.ScVal) =>
            spec.funcResToNative(method, result),
        });

      // @ts-ignore error TS7053: Element implicitly has an 'any' type
      this[method] =
        spec.getFunc(method).inputs().length === 0
          ? (opts?: MethodOptions) => assembleTransaction(undefined, opts)
          : assembleTransaction;
    });
  }

  /**
   * Generates a Client instance from the provided ClientOptions and the contract's wasm hash.
   * The wasmHash can be provided in either hex or base64 format.
   *
   * @param {Buffer | string} wasmHash The hash of the contract's wasm binary, in either hex or base64 format.
   * @param {ClientOptions} options The ClientOptions object containing the necessary configuration, including the rpcUrl.
   * @param {('hex' | 'base64')} [format='hex'] The format of the provided wasmHash, either "hex" or "base64". Defaults to "hex".
   * @returns {Promise<module:contract.Client>} A Promise that resolves to a Client instance.
   * @throws {TypeError} If the provided options object does not contain an rpcUrl.
   */
  static async fromWasmHash(wasmHash: Buffer | string,
    options: ClientOptions,
    format: "hex" | "base64" = "hex"
  ): Promise<Client> {
    if (!options || !options.rpcUrl) {
      throw new TypeError('options must contain rpcUrl');
    }
    const { rpcUrl, allowHttp } = options;
    const serverOpts: Server.Options = { allowHttp };
    const server = new Server(rpcUrl, serverOpts);
    const wasm = await server.getContractWasmByHash(wasmHash, format);
    return Client.fromWasm(wasm, options);
  }

  /**
   * Generates a Client instance from the provided ClientOptions and the contract's wasm binary.
   *
   * @param {Buffer} wasm The contract's wasm binary as a Buffer.
   * @param {ClientOptions} options The ClientOptions object containing the necessary configuration.
   * @returns {Promise<module:contract.Client>} A Promise that resolves to a Client instance.
   * @throws {Error} If the contract spec cannot be obtained from the provided wasm binary.
   */
  static async fromWasm(wasm: Buffer, options: ClientOptions): Promise<Client> {
    const spec = await specFromWasm(wasm);
    return new Client(spec, options);
  }

  /**
   * Generates a Client instance from the provided ClientOptions, which must include the contractId and rpcUrl.
   *
   * @param {ClientOptions} options The ClientOptions object containing the necessary configuration, including the contractId and rpcUrl.
   * @returns {Promise<module:contract.Client>} A Promise that resolves to a Client instance.
   * @throws {TypeError} If the provided options object does not contain both rpcUrl and contractId.
   */
  static async from(options: ClientOptions): Promise<Client> {
    if (!options || !options.rpcUrl || !options.contractId) {
      throw new TypeError('options must contain rpcUrl and contractId');
    }
    const { rpcUrl, contractId, allowHttp } = options;
    const serverOpts: Server.Options = { allowHttp };
    const server = new Server(rpcUrl, serverOpts);
    const wasm = await server.getContractWasmByContractId(contractId);
    return Client.fromWasm(wasm, options);
  }

  txFromJSON = <T>(json: string): AssembledTransaction<T> => {
    const { method, ...tx } = JSON.parse(json);
    return AssembledTransaction.fromJSON(
      {
        ...this.options,
        method,
        parseResultXdr: (result: xdr.ScVal) =>
          this.spec.funcResToNative(method, result),
      },
      tx,
    );
  };

  txFromXDR = <T>(xdrBase64: string): AssembledTransaction<T> => AssembledTransaction.fromXDR(this.options, xdrBase64, this.spec);
}
