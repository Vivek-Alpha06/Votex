import * as StellarSdk from '@stellar/stellar-sdk';
const RPC_URL = 'https://soroban-testnet.stellar.org:443';
const server = new StellarSdk.rpc.Server(RPC_URL);
console.log("prepareTransaction exists?", typeof server.prepareTransaction === 'function');
