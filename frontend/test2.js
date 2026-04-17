import * as StellarSdk from '@stellar/stellar-sdk';

try {
  let val1 = StellarSdk.nativeToScVal(["opt1", "opt2"]);
  console.log("val1 valid?", typeof val1.switch === 'function');
  console.log("val1 val:", val1);
} catch (e) {
  console.log("val1 error:", e.message);
}

try {
  const optionsScVal = StellarSdk.xdr.ScVal.scvVec(
    ["a", "b"].map(opt => StellarSdk.nativeToScVal(opt, { type: 'string' }))
  );
  console.log("optionsScVal valid?", typeof optionsScVal.switch === 'function');
} catch (e) {
  console.log("optionsScVal error:", e.message);
}
