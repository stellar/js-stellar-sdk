import { Address } from "./address.js";
import { Operation } from "./operation.js";
import xdr from "./xdr.js";
import { StrKey } from "./strkey.js";

/**
 * Create a new Contract object.
 *
 * `Contract` represents a single contract in the Stellar network, embodying the
 * interface of the contract. See
 * [Contracts](https://soroban.stellar.org/docs/learn/interacting-with-contracts)
 * for more information about how contracts work in Stellar.
 */
export class Contract {
  private _id: Buffer;

  /**
   * @param contractId - ID of the contract (ex.
   *     `CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE`).
   */
  constructor(contractId: string) {
    try {
      // First, try it as a strkey
      this._id = StrKey.decodeContract(contractId);
    } catch (_) {
      throw new Error(`Invalid contract ID: ${contractId}`);
    }
  }

  /**
   * Returns Stellar contract ID as a strkey, ex.
   * `CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE`.
   */
  contractId(): string {
    return StrKey.encodeContract(this._id);
  }

  /** Returns the ID as a strkey (C...). */
  toString(): string {
    return this.contractId();
  }

  /** Returns the wrapped address of this contract. */
  address(): Address {
    return Address.contract(this._id);
  }

  /**
   * Returns an operation that will invoke this contract call.
   *
   * @param method - name of the method to call
   * @param params - arguments to pass to the method, as an array of xdr.ScVal
   *
   * @see Operation.invokeHostFunction
   * @see Operation.invokeContractFunction
   * @see Operation.createCustomContract
   * @see Operation.createStellarAssetContract
   * @see Operation.uploadContractWasm
   */
  call(
    method: string,
    ...params: xdr.ScVal[]
  ): xdr.Operation<Operation.InvokeHostFunction> {
    return Operation.invokeContractFunction({
      contract: this.address().toString(),
      function: method,
      args: params,
    });
  }

  /**
   * Returns the read-only footprint entries necessary for any invocations to
   * this contract, for convenience when manually adding it to your
   * transaction's overall footprint or doing bump/restore operations.
   */
  getFootprint(): xdr.LedgerKey {
    return xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: this.address().toScAddress(),
        key: xdr.ScVal.scvLedgerKeyContractInstance(),
        durability: xdr.ContractDataDurability.persistent(),
      }),
    );
  }
}
