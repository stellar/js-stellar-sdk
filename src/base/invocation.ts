import { uint8ArrayToHex } from "uint8array-extras";
import {
  CreateContractArgsV2,
  ScVal,
  SorobanAuthorizedInvocation,
} from "../xdr/index.js";
import { Asset } from "./asset.js";
import { Address } from "./address.js";
import { scValToNative } from "./scval.js";

export interface WasmCreateDetails {
  hash: string;
  address: string;
  salt: string;

  constructorArgs?: any[];
}

/**
 * Details about a contract creation from an external executable (CAP-85).
 *
 * - `owner` is the strkey of the account or contract that owns the external
 *   executable being referenced
 * - `tag` is the owner-scoped name of that executable. It is an unbounded
 *   `SCString`, so it is not always text: a lenient UTF-8 decode would render
 *   two distinct tags identically, and the tag is half of what identifies the
 *   code being deployed. Binary tags come back as raw bytes, matching
 *   {@link scValToNative}
 * - `address` is the strkey of the deployer and `salt` its hex-encoded salt,
 *   which together derive the new contract's ID
 */
export interface ExternalRefCreateDetails {
  owner: string;
  tag: string | Uint8Array;
  address: string;
  salt: string;

  constructorArgs?: any[];
}

/**
 * Details about a contract creation invocation.
 *
 * - `type` indicates if this creation was a custom contract (`'wasm'`), a
 *   wrapping of an existing Stellar asset (`'sac'`), or a reference to an
 *   external executable (`'external'`, see CAP-85)
 * - `asset` is set when `type=='sac'`, containing the canonical {@link Asset}
 *   being wrapped by this Stellar Asset Contract
 * - `wasm` is set when `type=='wasm'`, containing additional creation parameters
 * - `external` is set when `type=='external'`, containing the referenced
 *   executable and the creation parameters
 */
export interface CreateInvocation {
  type: "sac" | "wasm" | "external";
  asset?: string;
  wasm?: WasmCreateDetails;
  external?: ExternalRefCreateDetails;
}

/**
 * Details about a contract function execution invocation.
 *
 * - `source` is the strkey of the contract (`C...`) being invoked
 * - `function` is the name of the function being invoked
 * - `args` are the natively-represented parameters to the function invocation
 *   (see {@link scValToNative} for rules on how they're represented as JS types)
 */
export interface ExecuteInvocation {
  source: string;
  function: string;

  args: any[];
}

/**
 * A node in the invocation tree.
 *
 * - `type` is the type of invocation occurring, either contract creation or
 *   host function execution
 * - `args` are the parameters to the invocation, depending on the type
 * - `invocations` are any sub-invocations that may occur as a result of this
 *   invocation (i.e. a tree of call stacks)
 */
export interface InvocationTree {
  type: "create" | "execute";
  args: CreateInvocation | ExecuteInvocation;
  invocations: InvocationTree[];
}

/**
 * A callback used when walking an invocation tree.
 *
 * Returning exactly `false` is a hint to stop exploring deeper from this node;
 * other return values are ignored.
 *
 * @param node - the currently explored node
 * @param depth - the depth of the tree this node is occurring at (the
 *    root starts at a depth of 1)
 * @param parent - this node's parent node, if any (i.e. this doesn't
 *    exist at the root)
 */
export type InvocationWalker = (
  node: SorobanAuthorizedInvocation,
  depth: number,
  parent?: SorobanAuthorizedInvocation,
) => boolean | null | void;

/**
 * Turns a raw invocation tree into a human-readable format.
 *
 * This is designed to make the invocation tree easier to understand in order to
 * inform users about the side-effects of their contract calls. This will help
 * make informed decisions about whether or not a particular invocation will
 * result in what you expect it to.
 *
 * @param root - the raw XDR of the invocation,
 *    likely acquired from transaction simulation. this is either from the
 *    {@link Operation.invokeHostFunction} itself (the `func` field), or from
 *    the authorization entries ({@link xdr.SorobanAuthorizationEntry}, the
 *    `rootInvocation` field)
 *
 * @example
 * Here, we show a browser modal after simulating an arbitrary transaction,
 * `tx`, which we assume has an `Operation.invokeHostFunction` inside of it:
 *
 * ```typescript
 * import { Server, buildInvocationTree } from '@stellar/stellar-sdk';
 *
 * const s = new Server("fill in accordingly");
 *
 * s.simulateTransaction(tx).then(
 *  (resp: SorobanRpc.SimulateTransactionResponse) => {
 *    if (SorobanRpc.isSuccessfulSim(resp) && resp.result) {
 *      // bold assumption: there's a valid result with an auth entry
 *      const auth = resp.result.auth;
 *      if (auth && auth.length > 0) {
 *        alert(
 *          "You are authorizing the following invocation:\n" +
 *          JSON.stringify(
 *            buildInvocationTree(auth[0].rootInvocation()),
 *            null,
 *            2
 *          )
 *        );
 *      }
 *    }
 *  }
 * );
 * ```
 */
export function buildInvocationTree(
  root: SorobanAuthorizedInvocation,
): InvocationTree {
  const fn = root.function;

  const output: Partial<InvocationTree> = {};

  switch (fn.type) {
    case "sorobanAuthorizedFunctionTypeContractFn": {
      const invokeArgs = fn.value;
      output.type = "execute";
      output.args = {
        source: Address.fromScAddress(invokeArgs.contractAddress).toString(),
        function: invokeArgs.functionName.toString(),

        args: invokeArgs.args.map((arg) => scValToNative(arg)),
      };
      break;
    }

    case "sorobanAuthorizedFunctionTypeCreateContractHostFn":
    // fallthrough: V1 just has no ctor args
    case "sorobanAuthorizedFunctionTypeCreateContractV2HostFn": {
      const createArgs = fn.value;
      const createV2 =
        fn.type === "sorobanAuthorizedFunctionTypeCreateContractV2HostFn";
      output.type = "create";
      const createInvocation: Partial<CreateInvocation> = {};

      // A WASM or external-ref executable derives its contract ID from a
      // deployer address plus salt, so its preimage MUST be an address. A
      // token wraps an existing asset, so its preimage MUST be an asset.
      const exec = createArgs.executable;
      const preimage = createArgs.contractIdPreimage;

      // only apply constructor args for CreateV2 scenarios;
      // empty indicates V2 and no ctor, undefined indicates V1
      const ctorArgs = createV2
        ? {
            constructorArgs: (
              fn.value as CreateContractArgsV2
            ).constructorArgs.map((arg: ScVal) => scValToNative(arg)),
          }
        : {};

      if (
        exec.type === "contractExecutableWasm" &&
        preimage.type === "contractIdPreimageFromAddress"
      ) {
        const details = preimage.value;
        createInvocation.type = "wasm";
        createInvocation.wasm = {
          salt: uint8ArrayToHex(details.salt.toBytes()),
          hash: uint8ArrayToHex(exec.value.value),
          address: Address.fromScAddress(details.address).toString(),
          ...ctorArgs,
        };
      } else if (
        exec.type === "contractExecutableExternalRef" &&
        preimage.type === "contractIdPreimageFromAddress"
      ) {
        const details = preimage.value;
        createInvocation.type = "external";
        createInvocation.external = {
          owner: Address.fromScAddress(exec.value.executableOwner).toString(),
          tag: exec.value.tag.asStringOrBytes(),
          salt: uint8ArrayToHex(details.salt.toBytes()),
          address: Address.fromScAddress(details.address).toString(),
          ...ctorArgs,
        };
      } else if (
        exec.type === "contractExecutableStellarAsset" &&
        preimage.type === "contractIdPreimageFromAsset"
      ) {
        createInvocation.type = "sac";
        createInvocation.asset = Asset.fromOperation(preimage.value).toString();
      } else {
        throw new Error(
          `creation function appears invalid: ${JSON.stringify(fn.value)} ` +
            `(should be wasm+address, external ref+address, or token+asset)`,
        );
      }

      output.args = createInvocation as CreateInvocation;
      break;
    }

    default:
      throw new Error(
        `unknown invocation type (${(fn as { type: string }).type}): ${JSON.stringify(fn)}`,
      );
  }

  output.invocations = root.subInvocations.map((i) => buildInvocationTree(i));
  return output as InvocationTree;
}

/**
 * Executes a callback function on each node in the tree until stopped.
 *
 * Nodes are walked in a depth-first order. Returning `false` from the callback
 * stops further depth exploration at that node, but it does not stop the walk
 * in a "global" view.
 *
 * @param root - the tree to explore
 * @param callback - the callback to execute for each node
 */
export function walkInvocationTree(
  root: SorobanAuthorizedInvocation,
  callback: InvocationWalker,
): void {
  walkHelper(root, 1, callback);
}

function walkHelper(
  node: SorobanAuthorizedInvocation,
  depth: number,
  callback: InvocationWalker,
  parent?: SorobanAuthorizedInvocation,
): void {
  if (callback(node, depth, parent) === false /* allow void rv */) {
    return;
  }

  node.subInvocations.forEach((i) => walkHelper(i, depth + 1, callback, node));
}
