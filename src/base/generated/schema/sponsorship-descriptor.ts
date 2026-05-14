// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
export type SponsorshipDescriptor = AccountId | null;
export const SponsorshipDescriptor = xdr.option(
  xdr.lazy(() => AccountId),
) as xdr.XdrType<SponsorshipDescriptor>;
