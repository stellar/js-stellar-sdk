/**
 * @name JS SDK entrypoints
 * @description Export first-party entry functions that receive attacker- or remote-influenced input.
 * @kind table
 * @id stellar/js-sdk/entrypoints
 */

import javascript
import JsSdkSinks

from Function f, string kind, string trustBoundary, string inputShape
where entrypoint(f, kind, trustBoundary, inputShape)
select kind, subsystemForFile(f.getLocation().getFile()), labelForFunction(f), f.getLocation().getFile().getRelativePath(), f.getLocation().getStartLine(), trustBoundary, inputShape