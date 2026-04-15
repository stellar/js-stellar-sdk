import OriginBigNumber from "bignumber.js";

const BigNumber = OriginBigNumber.clone();

BigNumber.DEBUG = true; // gives us exceptions on bad constructor values

export default BigNumber;
export type { BigNumber };
