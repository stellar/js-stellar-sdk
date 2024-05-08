import { Contract, ContractSpec, xdr } from "..";
import { Server } from '../soroban';
import { AssembledTransaction } from "./assembled_transaction";
import type { ContractClientOptions, MethodOptions } from "./types";
import { processSpecEntryStream } from './utils';

export class ContractClient {
  /**
   * Generate a class from the contract spec that where each contract method
   * gets included with an identical name.
   *
   * Each method returns an {@link AssembledTransaction} that can be used to
   * modify, simulate, decode results, and possibly sign, & submit the
   * transaction.
   */
  constructor(
    public readonly spec: ContractSpec,
    public readonly options: ContractClientOptions,
  ) {
    this.spec.funcs().forEach((xdrFn) => {
      const method = xdrFn.name().toString();
      const assembleTransaction = (
        args?: Record<string, any>,
        methodOptions?: MethodOptions,
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
            {} as Pick<ContractClientOptions, "errorTypes">,
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
   * Generate a ContractClient instance from the ContractClientOptions and the wasm binary
   */
  static async fromWasm(options: ContractClientOptions, wasm: BufferSource): Promise<ContractClient> {
    const wasmModule = await WebAssembly.compile(wasm);
    const xdrSections = WebAssembly.Module.customSections(wasmModule, "contractspecv0");
    if (xdrSections.length === 0) {
      return Promise.reject(new Error('Could not obtain contract spec from wasm'));
    }
    const section = xdrSections[0];
    const bufferSection = Buffer.from(section);
    const specEntryArray = processSpecEntryStream(bufferSection);
    const spec = new ContractSpec(specEntryArray);
    return new ContractClient(spec, options);
  }

  /**
   * Generate a ContractClient instance from the contractId and rpcUrl
   */
  static async from(options: ContractClientOptions): Promise<ContractClient> {
    if (!options || !options.rpcUrl || !options.contractId) {
      return Promise.reject(new TypeError('options must contain rpcUrl and contractId'));
    }
    const { rpcUrl, contractId, allowHttp } = options;
    const serverOpts: Server.Options = { allowHttp: allowHttp?? !rpcUrl.startsWith('https') };
    const server = new Server(rpcUrl, serverOpts);
    const contractLedgerKey = new Contract(contractId).getFootprint();
    const response = await server.getLedgerEntries(contractLedgerKey);
    if (!response.entries[0]?.val)
      return Promise.reject(new Error(`Could not obtain contract from server`));
    const wasmHash = ((response.entries[0].val.value() as xdr.ContractDataEntry).val().value() as xdr.ScContractInstance).executable().wasmHash();
    const ledgerKeyWasmHash = xdr.LedgerKey.contractCode(new xdr.LedgerKeyContractCode({
      hash: wasmHash,
    }));
    const responseWasm = await server.getLedgerEntries(ledgerKeyWasmHash);
    const wasmBuffer = (responseWasm.entries[0].val.value() as xdr.ContractCodeEntry).code();
    return ContractClient.fromWasm(options, wasmBuffer);
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
}

