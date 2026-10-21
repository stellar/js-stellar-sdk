import {
  buildAuthorizationEntryPreimage,
  inspectAuthEntry,
} from "../../../../src/base/auth.js";
import { hash } from "../../../../src/base/hashing.js";
import type { Keypair } from "../../../../src/base/keypair.js";
import type * as xdr from "../../../../src/xdr/index.js";

/**
 * True when `signer`'s ed25519 signature on its node verifies against the
 * payload for the entry's stored expiration.
 */
export function verifiesAtStored(
  entry: xdr.SorobanAuthorizationEntry,
  signer: Keypair,
  networkPassphrase: string,
): boolean {
  const info = inspectAuthEntry(entry);
  const node = info.signers.find((s) => s.address === signer.publicKey());
  const sig = node?.signatures?.[0]?.signature;
  if (sig === undefined || info.signatureExpirationLedger === null) {
    return false;
  }
  const payload = hash(
    buildAuthorizationEntryPreimage(
      entry,
      info.signatureExpirationLedger,
      networkPassphrase,
    ).toXdr(),
  );
  return signer.verify(payload, sig);
}
