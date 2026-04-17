import * as StellarSdk from '@stellar/stellar-sdk';
const quorum = Number(0);
let val = StellarSdk.nativeToScVal(quorum, { type: 'u64' });
console.log("quorum val:", val);
