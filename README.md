\# 🗳️ Votex — Decentralized Voting dApp



> Secure • Transparent • Blockchain-based Voting System



\---



\## 🚀 Overview



\*\*Votex\*\* is a decentralized voting application (dApp) built on the Stellar blockchain using Soroban smart contracts. It eliminates the need for a centralized backend by directly connecting the frontend to the blockchain.



The platform ensures \*\*secure, transparent, and tamper-proof voting\*\* using cryptographic wallet-based authentication.



\---



\## 🧠 Architecture



Frontend (React + Vite)

&#x20;       ↓

Web3 Integration (Stellar SDK + Freighter Wallet)

&#x20;       ↓

Soroban Smart Contract (Rust)

&#x20;       ↓

Stellar Blockchain



\---



\## ✨ Key Features



\- 🗳️ Decentralized voting (no central server)

\- 🔐 Tamper-proof vote storage on blockchain

\- 👤 Wallet-based authentication (Freighter)

\- ⚙️ Admin-controlled proposal system

\- ⏳ Voting deadlines \& validation

\- 📊 Transparent and verifiable results



\---



\## 🛠️ Tech Stack



\### Frontend

\- React.js (Vite)

\- JavaScript (ES6+) \& JSX

\- Tailwind CSS + Custom CSS

\- Framer Motion (animations)

\- Lucide React (icons)



\### Blockchain

\- Soroban (Stellar Smart Contracts)

\- Rust (smart contract logic)



\### Web3 Integration

\- @stellar/stellar-sdk

\- @stellar/freighter-api



\---



\## ⚙️ Smart Contract Logic



The Soroban smart contract handles:



\- Proposal creation

\- Voting deadline validation

\- One-user-one-vote enforcement

\- Admin authorization

\- Persistent vote storage using DataKey mappings



\---



\## 🔗 Web3 Workflow



1\. User connects Freighter Wallet  

2\. Frontend creates transaction  

3\. User signs transaction securely  

4\. Transaction sent to Stellar Testnet  

5\. Smart contract executes voting logic  



\---



\## 📂 Project Structure





Votex/

├── frontend/ # React dApp

├── contract/ # Soroban smart contract (Rust)

└── README.md





\---



\## ⚙️ Setup Instructions



\### 1. Clone repository



git clone https://github.com/Vivek-Alpha06/Votex.git



cd Votex





\---



\### 2. Run frontend



cd frontend

npm install

npm run dev





\---



\## 🔐 Environment Variables



Create `.env` in frontend:





VITE\_ADMIN\_ADDRESS=your\_admin\_wallet

VITE\_NETWORK\_PASSPHRASE=Test SDF Network ; September 2015

VITE\_RPC\_URL=https://soroban-testnet.stellar.org:443



VITE\_CONTRACT\_ID=your\_contract\_id





\---



\## 🌐 Deployment



Frontend is deployed using Vercel.



\---



\## 🎯 Use Cases



\- 🏫 College Elections

\- 🏛️ Governance Systems

\- 🌐 DAO Voting

\- 📊 Secure Polling Platforms



\---



\## 👨‍💻 Author



\*\*Vivek Majumdar\*\*  

GitHub: https://github.com/Vivek-Alpha06



\---



\## ⭐ Support



If you like this project:

\- ⭐ Star the repo

\- 🍴 Fork it

\- 🤝 Contribute



\---



\## 📜 License



MIT License

