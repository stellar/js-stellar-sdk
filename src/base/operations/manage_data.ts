import { setSourceAccount } from "../util/operations.js";
import xdr from "../xdr.js";
import {
  ManageDataResult,
  ManageDataOpts,
  OperationAttributes,
} from "./types.js";

/**
 * This operation adds data entry to the ledger.
 * @param opts - Options object
 * @param opts.name - The name of the data entry.
 * @param opts.value - The value of the data entry.
 * @param opts.source - The optional source account.
 */
export function manageData(
  opts: ManageDataOpts,
): xdr.Operation<ManageDataResult> {
  if (!(typeof opts.name === "string" && opts.name.length <= 64)) {
    throw new Error("name must be a string, up to 64 characters");
  }

  // undefined is accepted (treated as null/delete) for internal round-trip
  // compatibility: fromXDRObject returns undefined for absent optional fields.
  // The public API contract is null for delete-entry.
  if (
    typeof opts.value !== "string" &&
    !Buffer.isBuffer(opts.value) &&
    opts.value !== null &&
    opts.value !== undefined
  ) {
    throw new Error("value must be a string, Buffer or null");
  }

  let dataValue: Buffer | null;
  if (typeof opts.value === "string") {
    dataValue = Buffer.from(opts.value);
  } else {
    dataValue = opts.value ?? null;
  }

  if (dataValue !== null && dataValue.length > 64) {
    throw new Error("value cannot be longer that 64 bytes");
  }

  const manageDataOp = new xdr.ManageDataOp({
    dataName: opts.name,
    dataValue,
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.manageData(manageDataOp),
  };
  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(
    opAttributes as {
      sourceAccount: xdr.MuxedAccount | null;
      body: xdr.OperationBody;
    },
  );
}
