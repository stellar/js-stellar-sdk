/**
 * @name JS SDK material sinks
 * @description Export operation-class sinks used as Gesserit static frontier materiality anchors.
 * @kind table
 * @id stellar/js-sdk/material-sinks
 */

import javascript
import JsSdkSinks

from InvokeExpr call, string sinkRole, string impactClass
where materialCall(call, sinkRole, impactClass)
select "call", subsystemForFile(call.getLocation().getFile()), labelForCall(call), call.getLocation().getFile().getRelativePath(), call.getLocation().getStartLine(), sinkRole, impactClass