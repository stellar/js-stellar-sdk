const StellarSdk = require("@stellar/stellar-sdk");

const secret = "SA22TDBINLZMGYUDVXGUP2JMYIQ3DTJE53PNQUVCDK73XRS6TDVYU7WW"; // Example secret
try {
  const keypair = StellarSdk.Keypair.fromSecret(secret);
  console.log("Public Key:", keypair.publicKey());
} catch (error) {
  console.error("Error generating keypair:", error);
}
