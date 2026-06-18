/**
 * @name JS SDK direct material routes
 * @description Export direct caller-to-material-operation edges for Gesserit v2 static route seeds.
 * @kind table
 * @id stellar/js-sdk/routes
 */

import javascript
import JsSdkSinks

from InvokeExpr call, Function caller, string sinkRole, string impactClass
where
  materialCall(call, sinkRole, impactClass) and
  caller = call.getEnclosingFunction()
select "direct_call", labelForFunction(caller), caller.getLocation().getFile().getRelativePath(), caller.getLocation().getStartLine(), labelForCall(call), call.getLocation().getFile().getRelativePath(), call.getLocation().getStartLine(), call.getLocation().getFile().getRelativePath(), call.getLocation().getStartLine(), sinkRole