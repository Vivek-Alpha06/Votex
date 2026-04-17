import { signTransaction } from '@stellar/freighter-api';
// We just need to check if there is some typedoc or structure from Freighter API.
// Wait, actually I can just change the code in useContract.js to stringify it:
// if (typeof signedTxXdr !== 'string') signedTxXdr = signedTxXdr.signedTxXdr || signedTxXdr.tx || ...
