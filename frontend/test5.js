import * as StellarSdk from '@stellar/stellar-sdk';
try {
  StellarSdk.TransactionBuilder.fromXDR({ signedTxXdr: "AAAA..." }, "Test SDF Network ; September 2015");
} catch (e) {
  console.log("error:", e.message);
}
