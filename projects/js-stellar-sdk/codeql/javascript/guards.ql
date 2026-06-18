/**
 * @name JS SDK guards
 * @description Export nearby branch guards for material routes.
 * @kind table
 * @id stellar/js-sdk/guards
 */

import javascript
import JsSdkSinks

from IfStmt guard
where
  inScope(guard.getLocation().getFile())
select "branch_guard", "", guard.getCondition().toString(), guard.getLocation().getFile().getRelativePath(), guard.getLocation().getStartLine()