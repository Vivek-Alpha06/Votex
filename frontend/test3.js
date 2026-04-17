import * as StellarSdk from '@stellar/stellar-sdk';

const title = "test";
const desc = "desc";
const startTime = Math.floor(Date.now() / 1000);
const deadline = startTime + 10000;
const options = ["a", "b"];
const quorum = Number(0);
const category = "Survey";
const minXlm = BigInt(0);

const args = [
  { name: 'title', val: StellarSdk.nativeToScVal(title, { type: 'string' }) },
  { name: 'desc', val: StellarSdk.nativeToScVal(desc, { type: 'string' }) },
  { name: 'startTime', val: StellarSdk.nativeToScVal(startTime, { type: 'u64' }) },
  { name: 'deadline', val: StellarSdk.nativeToScVal(deadline, { type: 'u64' }) },
  { name: 'optionsScVal', val: StellarSdk.xdr.ScVal.scvVec(options.map(opt => StellarSdk.nativeToScVal(opt, { type: 'string' }))) },
  { name: 'quorum', val: StellarSdk.nativeToScVal(quorum, { type: 'u64' }) },
  { name: 'category', val: StellarSdk.nativeToScVal(category, { type: 'string' }) },
  { name: 'minXlm', val: StellarSdk.nativeToScVal(minXlm, { type: 'i128' }) }
];

for (const arg of args) {
  if (typeof arg.val.switch !== 'function') {
    console.error(`Invalid ScVal for arg: ${arg.name} (type: ${typeof arg.val})`);
  } else {
    console.log(`Valid: ${arg.name}`);
  }
}
