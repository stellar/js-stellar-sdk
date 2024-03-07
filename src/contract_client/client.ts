import { ContractSpec, xdr } from '..'
import { AssembledTransaction } from './assembled_transaction'
import type { ContractClientOptions, MethodOptions } from './types'

/**
 * converts a snake_case string to camelCase
 */
function toLowerCamelCase(str: string): string {
  return str.replace(/_\w/g, (m) => m[1].toUpperCase());
}

export class ContractClient {
  /**
   * Generate a class from the contract spec that where each contract method
   * gets included with a JSified name.
   *
   * Each method returns an {@link AssembledTransaction} that can be used to
   * modify, simulate, decode results, and possibly sign, & submit the
   * transaction.
   */
  constructor(
    public readonly spec: ContractSpec,
    public readonly options: ContractClientOptions,
  ) {
    let methods = this.spec.funcs();
    for (let method of methods) {
      let name = method.name().toString();
      let jsName = toLowerCamelCase(name);
      // @ts-ignore
      this[jsName] = async (
        args: Record<string, any>,
        options: MethodOptions
      ) => {
        return await AssembledTransaction.build({
          method: name,
          args: spec.funcArgsToScVals(name, args),
          ...options,
          ...this.options,
          errorTypes: spec
            .errorCases()
            .reduce(
              (acc, curr) => ({
                ...acc,
                [curr.value()]: { message: curr.doc().toString() },
              }),
              {} as Pick<ContractClientOptions, "errorTypes">
            ),
          parseResultXdr: (result: xdr.ScVal) => spec.funcResToNative(name, result),
        });
      };
    }
  }

  txFromJSON = <T>(json: string): AssembledTransaction<T> => {
    const { method, ...tx } = JSON.parse(json)
    return AssembledTransaction.fromJSON(
      {
        ...this.options,
        method,
        parseResultXdr: (result: xdr.ScVal) => this.spec.funcResToNative(method, result),
      },
      tx,
    );
  }
}
