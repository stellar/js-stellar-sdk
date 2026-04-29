import OriginBigNumber from "bignumber.js";

const BigNumber = OriginBigNumber.clone();

BigNumber.DEBUG = true; // gives us exceptions on bad constructor values

export default BigNumber;
// eslint-disable-next-line @typescript-eslint/no-use-before-define
export type { BigNumber };
