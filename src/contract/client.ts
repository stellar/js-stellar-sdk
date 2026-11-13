import { Operation, Address } from "../base/index.js";
import type { ExternalExecutableRef } from "../base/operations/types.js";
import { Spec } from "./spec.js";
import { Server } from "../rpc/index.js";
import { AssembledTransaction } from "./assembled_transaction.js";
import type { ClientOptions, MethodOptions } from "./types.js";
import { clientMethodNames } from "../bindings/utils.js";
import { buildMethodCall } from "./method_call.js";
import { ContractExecutableExternalRef, ScVal } from "../xdr/index.js";
import { hexToUint8Array } from "uint8array-extras";
import { base64ToUint8Array } from "../base/util/base64.js";

const CONSTRUCTOR_FUNC = "__constructor";

/**
 * Generate a class from the contract spec where each contract function gets a
 * method. The method name is the function name, made safe as a JavaScript
 * identifier: for example, `delete` becomes `delete_`.
 *
 * A function gets no method when its method name is a `Client` member or
 * another reserved name, such as `then` or `toString`. Two functions that map
 * to one method name both get no method. {@link Client.invoke} still calls
 * such a function by its on-chain name.
 *
 * Each method returns an {@link contract.AssembledTransaction | AssembledTransaction} that can
 * be used to modify, simulate, decode results, and possibly sign, & submit the
 * transaction.
 *
 *
 * @param spec - {@link Spec} to construct a Client for
 * @param options - see {@link ClientOptions}
 */
export class Client {
  static async deploy<T = Client>(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    args: Record<string, any> | null,
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ClientOptions, "contractId"> & {
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Uint8Array;
        /** The address to use to deploy the custom contract */
        address?: string;
      } & (
        | {
            /** The hash of the Wasm blob, which must already be installed on-chain. */
            wasmHash: Uint8Array | string;
            /** The format used to decode `wasmHash`, if it's provided as a string. */
            format?: "hex" | "base64";
            externalRef?: never;
          }
        | {
            /**
             * A CAP-85 external executable reference to deploy from instead of
             * a Wasm hash: the owner contract plus the tag under which it
             * publishes the Wasm hash. Passed through to
             * {@link Operation.createCustomContract}; the reference is also
             * resolved on-chain here to fetch the contract's spec.
             */
            externalRef: ExternalExecutableRef;
            wasmHash?: never;
            format?: never;
          }
      ),
  ): Promise<AssembledTransaction<T>> {
    const {
      wasmHash,
      externalRef,
      salt,
      format,
      fee,
      timeoutInSeconds,
      simulate,
      ...clientOptions
    } = options;

    if (!clientOptions.rpcUrl) {
      throw new TypeError("options must contain rpcUrl");
    }
    const { rpcUrl, allowHttp, headers } = clientOptions;
    const server =
      clientOptions.server ?? new Server(rpcUrl, { allowHttp, headers });

    // The operation deploys either from a Wasm hash or from an external ref,
    // but the constructor's spec always has to be read from actual Wasm: an
    // external ref is resolved to the Wasm hash it currently names.
    let executableOpts:
      { wasmHash: Uint8Array } | { externalRef: ContractExecutableExternalRef };
    let specWasmHash: Uint8Array;
    if (externalRef !== undefined) {
      const ref =
        externalRef instanceof ContractExecutableExternalRef
          ? externalRef
          : new ContractExecutableExternalRef({
              executableOwner: (externalRef.owner instanceof Address
                ? externalRef.owner
                : new Address(externalRef.owner)
              ).toScAddress(),
              tag: externalRef.tag,
            });
      specWasmHash = await server.getExternalRefWasmHash(ref);
      executableOpts = { externalRef: ref };
    } else {
      specWasmHash =
        typeof wasmHash === "string"
          ? (format ?? "hex") === "base64"
            ? base64ToUint8Array(wasmHash)
            : hexToUint8Array(wasmHash)
          : wasmHash!;
      executableOpts = { wasmHash: specWasmHash };
    }

    const spec = Spec.fromWasm(
      await server.getContractWasmByHash(specWasmHash),
    );

    const operation = Operation.createCustomContract({
      address: new Address(options.address || options.publicKey!),
      ...executableOpts,
      salt,
      constructorArgs: args
        ? spec.funcArgsToScVals(CONSTRUCTOR_FUNC, args)
        : [],
    });

    return AssembledTransaction.buildWithOp(operation, {
      fee,
      timeoutInSeconds,
      simulate,
      ...clientOptions,
      contractId: "ignored",
      method: CONSTRUCTOR_FUNC,
      parseResultXdr: (result) =>
        new Client(spec, {
          ...clientOptions,
          contractId: Address.fromScVal(result).toString(),
        }),
    }) as unknown as AssembledTransaction<T>;
  }

  constructor(
    public readonly spec: Spec,
    public readonly options: ClientOptions,
  ) {
    // Ensure we have a server to reuse for all AssembledTransactions
    if (options.server === undefined) {
      const { allowHttp, headers } = options;
      options.server = new Server(options.rpcUrl, {
        allowHttp,
        headers,
      });
    }

    const { methods } = clientMethodNames(
      this.spec.funcs().map((xdrFn) => xdrFn.name.toString()),
    );
    methods.forEach((method, name) => {
      const assembleTransaction = (
        args?: Record<string, any>,
        methodOptions?: MethodOptions,
      ) => buildMethodCall(spec, options, method, args, methodOptions);

      // A direct store is about 3 µs per client faster than `Reflect.set`.
      // @ts-expect-error error TS7053: Element implicitly has an 'any' type
      this[name] =
        spec.getFunc(method).inputs.length === 0
          ? (opts?: MethodOptions) => assembleTransaction(undefined, opts)
          : assembleTransaction;
    });
  }

  /**
   * Generates a Client instance from the provided ClientOptions and the contract's wasm hash.
   * The wasmHash can be provided in either hex or base64 format.
   *
   * @typeParam T - An interface describing the contract's methods, used to type
   * the returned client. Defaults to `unknown`, so calling without a type
   * argument yields a plain `Client` (backward compatible). Provide it to get
   * typed, autocompleted contract methods without code generation.
   *
   * @param wasmHash - The hash of the contract's wasm binary, in either hex or base64 format.
   * @param options - The ClientOptions object containing the necessary configuration, including the rpcUrl.
   * @param format - (optional) The format of the provided wasmHash, either "hex" or "base64". Defaults to "hex".
   * @returns A Promise that resolves to a Client instance.
   * @throws If the provided options object does not contain an rpcUrl.
   *
   * @example
   * ```ts
   * interface MyContract {
   *   increment: (opts?: MethodOptions) => Promise<AssembledTransaction<number>>;
   * }
   * const client = await contract.Client.fromWasmHash<MyContract>(hash, options);
   * const tx = await client.increment(); // typed
   * ```
   */
  static async fromWasmHash<T = unknown>(
    wasmHash: Uint8Array | string,
    options: ClientOptions,
    format: "hex" | "base64" = "hex",
  ): Promise<Client & T> {
    if (!options || !options.rpcUrl) {
      throw new TypeError("options must contain rpcUrl");
    }
    const { rpcUrl, allowHttp, headers } = options;
    const server =
      options.server ??
      new Server(rpcUrl, {
        allowHttp,
        headers,
      });
    const wasm = await server.getContractWasmByHash(wasmHash, format);

    return Client.fromWasm<T>(wasm, options);
  }

  /**
   * Generates a Client instance from the provided ClientOptions and the contract's wasm binary.
   *
   * @typeParam T - An interface describing the contract's methods, used to type
   * the returned client. Defaults to `unknown`, so calling without a type
   * argument yields a plain `Client` (backward compatible). Provide it to get
   * typed, autocompleted contract methods without code generation.
   *
   * @param wasm - The contract's wasm binary as a Uint8Array.
   * @param options - The ClientOptions object containing the necessary configuration.
   * @returns A Promise that resolves to a Client instance.
   * @throws If the contract spec cannot be obtained from the provided wasm binary.
   * @throws If the wasm binary has more than one `contractspecv0` section.
   *
   * @example
   * ```ts
   * interface MyContract {
   *   increment: (opts?: MethodOptions) => Promise<AssembledTransaction<number>>;
   * }
   * const client = await contract.Client.fromWasm<MyContract>(wasm, options);
   * const tx = await client.increment(); // typed
   * ```
   */
  static async fromWasm<T = unknown>(
    wasm: Uint8Array,
    options: ClientOptions,
  ): Promise<Client & T> {
    const spec = await Spec.fromWasm(wasm);
    return new Client(spec, options) as unknown as Client & T;
  }

  /**
   * Generates a Client instance from the provided ClientOptions, which must include the contractId and rpcUrl.
   *
   * If the contract is a built-in Stellar Asset Contract (SAC), the embedded
   * SAC spec is used instead of downloading Wasm, since a SAC has no Wasm
   * executable on-chain.
   *
   * If the contract was created from a CAP-85 external executable reference,
   * the reference is resolved to a Wasm hash first (see
   * {@link rpc.Server.getExternalRefWasmHash}), then the spec is read from
   * that Wasm.
   *
   * @typeParam T - An interface describing the contract's methods, used to type
   * the returned client. Defaults to `unknown`, so calling without a type
   * argument yields a plain `Client` (backward compatible). Provide it to get
   * typed, autocompleted contract methods without code generation.
   *
   * @param options - The ClientOptions object containing the necessary configuration, including the contractId and rpcUrl.
   * @returns A Promise that resolves to a Client instance.
   * @throws If the provided options object does not contain both rpcUrl and contractId.
   *
   * @example
   * ```ts
   * interface MyContract {
   *   increment: (opts?: MethodOptions) => Promise<AssembledTransaction<number>>;
   * }
   * const client = await contract.Client.from<MyContract>(options);
   * const tx = await client.increment(); // typed
   * ```
   *
   * @example
   * ```ts
   * // Set a request timeout through your own rpc.Server
   * const client = await contract.Client.from({
   *   contractId,
   *   networkPassphrase,
   *   rpcUrl,
   *   server: new rpc.Server(rpcUrl, { timeout: 30_000 }),
   * });
   * ```
   */
  static async from<T = unknown>(options: ClientOptions): Promise<Client & T> {
    if (!options || !options.rpcUrl || !options.contractId) {
      throw new TypeError("options must contain rpcUrl and contractId");
    }

    const { rpcUrl, contractId, allowHttp, headers } = options;
    const server =
      options.server ??
      new Server(rpcUrl, {
        allowHttp,
        headers,
      });

    const instance = await server.getContractInstance(contractId);
    const executable = instance.executable;

    if (executable.type === "contractExecutableStellarAsset") {
      // Lazily load the (large) embedded SAC spec so bundlers can code-split
      // it out of the common path; it's only needed for built-in SACs.
      const { SAC_SPEC } = await import("../bindings/sac-spec.js");
      return new Client(new Spec(SAC_SPEC), options) as unknown as Client & T;
    }

    // A CAP-85 external reference names its code indirectly: the owner contract
    // holds a persistent entry keyed by the tag whose value is the Wasm hash.
    // Resolve that, then load the spec from the Wasm as usual.
    const wasmHash =
      executable.type === "contractExecutableExternalRef"
        ? await server.getExternalRefWasmHash(executable.externalRef)
        : executable.wasmHash.value;

    const wasm = await server.getContractWasmByHash(wasmHash);

    return Client.fromWasm<T>(wasm, options);
  }

  /**
   * Builds a call to a contract function by its on-chain name, as the
   * function's client method does. It also reaches a function that has no
   * client method because its name is reserved or shared.
   *
   * @typeParam T - The type of the function's decoded result.
   * @param client - The client of the contract to call.
   * @param name - The on-chain function name, such as `delete`, not `delete_`.
   * @param args - The function arguments by parameter name. `undefined` and
   *    `null` mean no arguments. They are never read as call options.
   * @param options - The call options, as for a client method.
   * @returns The assembled call, simulated unless `options.simulate` is
   *    `false`. Sign and send it for a write.
   * @throws If the contract has no function with this name, or if the name is
   *    `__constructor`.
   *
   * @example
   * ```ts
   * // `delete` and `delete_` both map to `delete_`, so neither has a method.
   * const tx = await contract.Client.invoke(client, "delete", { id: 7 });
   * await tx.signAndSend();
   * ```
   */
  static async invoke<T = unknown>(
    client: Client,
    name: string,
    args?: Record<string, unknown> | null,
    options?: MethodOptions,
  ): Promise<AssembledTransaction<T>> {
    if (
      name === CONSTRUCTOR_FUNC ||
      !client.spec.funcs().some((fn) => fn.name.toString() === name)
    ) {
      throw new TypeError(
        `Contract ${client.options.contractId} has no method '${name}'`,
      );
    }
    return buildMethodCall(
      client.spec,
      client.options,
      name,
      args ?? {},
      options,
    );
  }

  txFromJson = <T>(json: string): AssembledTransaction<T> => {
    const { method, ...tx } = JSON.parse(json);
    return AssembledTransaction.fromJson(
      {
        ...this.options,
        method,
        parseResultXdr: (result: ScVal) =>
          this.spec.funcResToNative(method, result),
      },
      tx,
    );
  };

  /**
   * @deprecated Use {@link txFromJson} instead.
   */
  txFromJSON = this.txFromJson;

  txFromXDR = <T>(xdrBase64: string): AssembledTransaction<T> =>
    AssembledTransaction.fromXdr(this.options, xdrBase64, this.spec);
}
