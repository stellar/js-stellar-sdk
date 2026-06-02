// `node --import` bootstrap for the `xdr:roundtrip` script.
//
// Registers tsx (so the `.ts` entry — and its `.js`-specified imports of the
// `src/` TypeScript — load and transpile), then layers our `@stellar/js-xdr`
// alias hook on top. The alias is registered last so it runs first in the
// resolve chain and wins for that specifier, delegating everything else to tsx.
import { register } from "node:module";
import { register as registerTsx } from "tsx/esm/api";

registerTsx();
register("./js-xdr-esm-hook.mjs", import.meta.url);
