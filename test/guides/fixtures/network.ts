import { Networks } from "@stellar/stellar-sdk";

if (Networks.TESTNET === "Test SDF Network ; September 2015") {
  throw new Error("the local-network redirect is not active in this process");
}
