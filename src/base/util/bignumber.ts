import OriginBigNumber from "bignumber.js";
import type { BigNumber as BigNumberInstance } from "bignumber.js";

const BigNumber = OriginBigNumber.clone({ STRICT: true });

export default BigNumber;
export type BigNumber = BigNumberInstance;
