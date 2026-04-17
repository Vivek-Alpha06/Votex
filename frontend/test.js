import * as StellarSdk from '@stellar/stellar-sdk';

try {
  let val1 = StellarSdk.nativeToScVal("test", { type: 'string' });
  console.log("val1 valid?", typeof val1.switch === 'function');
} catch (e) {
  console.log("val1 error:", e.message);
}

try {
  let val2 = StellarSdk.xdr.ScVal.scvString("test");
  console.log("val2 valid?", typeof val2.switch === 'function');
} catch (e) {
  console.log("val2 error:", e.message);
}

try {
  let val3 = StellarSdk.nativeToScVal("test");
  console.log("val3 valid?", typeof val3.switch === 'function');
  console.log("val3 type:", val3.switch().name);
} catch (e) {
  console.log("val3 error:", e.message);
}
