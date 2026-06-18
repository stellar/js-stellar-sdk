import javascript

predicate inProductionSource(File file) {
  file.getRelativePath().matches("src/%") or
  file.getRelativePath().matches("bin/%")
}

predicate excludedFile(File file) {
  file.getRelativePath().matches("%/test/%") or
  file.getRelativePath().matches("test/%") or
  file.getRelativePath().matches("lib/%") or
  file.getRelativePath().matches("dist/%") or
  file.getRelativePath().matches("node_modules/%") or
  file.getRelativePath().matches("website/%") or
  file.getRelativePath().matches("coverage/%") or
  file.getRelativePath().matches(".vuln-hunt/%")
}

predicate inScope(File file) {
  inProductionSource(file) and not excludedFile(file)
}

string subsystemForFile(File file) {
  file.getRelativePath().matches("src/rpc/%") and result = "rpc"
  or file.getRelativePath().matches("src/horizon/%") and result = "horizon"
  or file.getRelativePath().matches("src/contract/%") and result = "contract"
  or file.getRelativePath().matches("src/bindings/%") and result = "bindings"
  or file.getRelativePath().matches("src/webauth/%") and result = "webauth"
  or file.getRelativePath().matches("src/federation/%") and result = "federation"
  or file.getRelativePath().matches("src/stellartoml/%") and result = "stellartoml"
  or file.getRelativePath().matches("src/http-client/%") and result = "http-client"
  or file.getRelativePath().matches("src/cli/%") and result = "cli"
  or file.getRelativePath().matches("bin/%") and result = "cli"
  or file.getRelativePath().matches("src/friendbot/%") and result = "friendbot"
  or file.getRelativePath().matches("src/errors/%") and result = "errors"
  or file.getRelativePath() = "src/utils.ts" and result = "core-utils"
  or file.getRelativePath() = "src/config.ts" and result = "core-utils"
  or file.getRelativePath() = "src/index.ts" and result = "core-utils"
  or file.getRelativePath() = "src/browser.ts" and result = "core-utils"
}

string labelForFunction(Function f) {
  exists(string name | name = f.getName() and name != "" and result = name)
  or result = "<anonymous>"
}

string callName(InvokeExpr call) {
  result = call.getCalleeName()
  or result = call.(MethodCallExpr).getMethodName()
}

string labelForCall(InvokeExpr call) {
  exists(string name | name = callName(call) and name != "" and result = name)
  or result = call.getCallee().toString()
}

predicate entrypoint(Function f, string kind, string trustBoundary, string inputShape) {
  inScope(f.getLocation().getFile()) and
  (
    f.getName() in ["simulateTransaction", "_simulateTransaction", "sendTransaction", "_sendTransaction", "prepareTransaction", "getLedgerEntries"] and
    kind = "rpc_api" and trustBoundary = "remote_rpc_server" and inputShape = "rpc_json_or_xdr"
    or
    f.getName() in ["submitTransaction", "submitAsyncTransaction", "loadAccount", "checkMemoRequired"] and
    kind = "horizon_api" and trustBoundary = "remote_horizon_server" and inputShape = "horizon_json_or_xdr"
    or
    f.getName() in ["fromJSON", "fromXDR", "txFromJSON", "txFromXDR", "send", "restoreFootprint", "funcArgsToScVals", "funcResToNative"] and
    kind = "contract_api" and trustBoundary = "application_or_remote_rpc" and inputShape = "contract_json_xdr_or_spec"
    or
    f.getName() in ["buildChallengeTx", "readChallengeTx", "verifyChallengeTxSigners", "verifyChallengeTxThreshold"] and
    kind = "webauth_api" and trustBoundary = "wallet_or_service_user_input" and inputShape = "sep10_challenge_xdr"
    or
    f.getName() in ["resolve", "createForDomain", "resolveAddress", "resolveAccountId", "resolveTransactionId"] and
    kind = "federation_or_toml_api" and trustBoundary = "remote_domain_or_federation_server" and inputShape = "domain_toml_or_federation_json"
    or
    f.getName() in ["fromWasm", "fromWasmHash", "fromContractId", "generate"] and
    kind = "binding_generation_api" and trustBoundary = "contract_spec_or_rpc_server" and inputShape = "contract_wasm_or_spec"
  )
}

predicate materialCall(InvokeExpr call, string sinkRole, string impactClass) {
  inScope(call.getLocation().getFile()) and
  (
    callName(call) in ["get", "post", "request", "fetch"] and
    sinkRole = "network_request" and impactClass = "network_integrity"
    or
    callName(call) in ["submitTransaction", "submitAsyncTransaction", "sendTransaction", "_sendTransaction"] and
    sinkRole = "transaction_submission" and impactClass = "transaction_integrity"
    or
    callName(call) in ["toXDR", "toEnvelope"] and
    sinkRole = "transaction_serialization" and impactClass = "transaction_integrity"
    or
    callName(call) = "sign" and
    sinkRole = "transaction_signing" and impactClass = "authorization_integrity"
    or
    callName(call) = "fromXDR" and
    sinkRole = "xdr_decode" and impactClass = "parse_integrity"
    or
    callName(call) = "parse" and
    sinkRole = "json_deserialization" and impactClass = "parse_integrity"
    or
    callName(call) in ["fromWasm", "specFromWasm"] and
    sinkRole = "contract_wasm_parse" and impactClass = "contract_interface_integrity"
    or
    callName(call) in ["funcArgsToScVals", "funcResToNative", "nativeToScVal", "scValToNative"] and
    sinkRole = "contract_spec_conversion" and impactClass = "contract_interface_integrity"
    or
    callName(call) in ["generate", "sanitizeIdentifier"] and
    sinkRole = "code_generation" and impactClass = "generated_code_integrity"
    or
    callName(call) = "from" and
    sinkRole = "buffer_decode" and impactClass = "encoding_integrity"
    or
    callName(call) = "readBodyBounded" and
    sinkRole = "bounded_response_read" and impactClass = "resource_exhaustion"
    or
    callName(call) = "randomBytes" and
    sinkRole = "random_challenge" and impactClass = "authentication_integrity"
  )
}