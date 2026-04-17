const txHash = "e0de25c7158320fe3a915e7d31d4a306054f1a6e3d1af1a45f8bdd9f4a5ffe48";
fetch("https://soroban-testnet.stellar.org/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "getTransaction",
    params: { hash: txHash }
  })
}).then(r => r.json()).then(console.log).catch(console.error);
