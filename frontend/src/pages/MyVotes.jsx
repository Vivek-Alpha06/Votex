import { useWallet } from '../hooks/useWallet';
import { History, Wallet, ExternalLink, Copy, CheckCircle2, Hexagon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export default function MyVotes() {
  const { address, openModal } = useWallet();
  const { getProposal } = useContract();
  const [copiedHash, setCopiedHash] = useState(null);
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    if (!address) {
      setHistory([]);
      return;
    }
    
    // Find all localStorage items that match `voted_${address}_${proposalId}`
    const loadHistory = async () => {
      const records = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`voted_${address}_`)) {
          try {
            const proposalIdStr = key.replace(`voted_${address}_`, '');
            const val = JSON.parse(localStorage.getItem(key));
            
            // Try formatting title by requesting it dynamically
            // (A cache could be added here, but doing it raw is fine for history view)
            const p = await getProposal(Number(proposalIdStr)).catch(() => null);
            records.push({
              id: proposalIdStr + Date.now(), // Key fallback
              proposalId: Number(proposalIdStr),
              proposalTitle: p ? p.title : `Proposal #${proposalIdStr}`,
              optionVoted: val.choice,
              timestamp: val.timestamp || Date.now(),
              txHash: val.txHash || 'N/A: Queried via SC directly',
              fee: val.fee || 10000
            });
          } catch(e) { }
        }
      }
      records.sort((a,b) => b.timestamp - a.timestamp);
      setHistory(records);
    };
    
    loadHistory();
  }, [address, getProposal]);

  const handleCopy = (hash) => {
    if (hash && hash !== 'N/A: Queried via SC directly') {
      navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-white neon-text mb-2">My Voting History</h2>
      <p className="text-slate-400 mb-10">Immutable record of all proposals you have participated in.</p>
      
      {!address ? (
        <div className="glass-panel p-16 text-center rounded-3xl border border-dashed border-purple-500/30 shadow-[0_0_30px_rgba(138,43,226,0.1)]">
          <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-70" />
          <h3 className="text-2xl text-slate-300 font-bold mb-2">Connect your wallet</h3>
          <p className="text-slate-500 mb-8">Connect your Stellar wallet to see your voting history.</p>
          <button 
            onClick={openModal}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold inline-flex items-center gap-2 hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] transition-shadow"
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </button>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl border border-dashed border-slate-700">
          <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-2xl text-slate-300 font-bold mb-2">You haven't voted yet.</h3>
          <p className="text-slate-500 mb-8">Your voting history is empty. Go cast your first vote!</p>
          <Link 
            to="/proposals"
            className="px-8 py-3 rounded-xl bg-slate-800 border border-cyan-500/50 text-cyan-400 font-bold inline-flex items-center gap-2 hover:bg-slate-700 hover:text-cyan-300 transition-colors"
          >
            <Hexagon className="w-5 h-5" />
            Active Proposals
          </Link>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {history.map((record) => (
            <motion.div 
              key={record.id}
              variants={itemVariants}
              className="glass-panel p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden group hover:border-cyan-500/30 transition-colors"
            >
              <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="text-xs text-slate-500 tracking-widest uppercase mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Voted {new Date(record.timestamp).toLocaleDateString()}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                    {record.proposalTitle}
                  </h4>
                  <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded text-sm font-medium">
                    Chosen: {record.optionVoted}
                  </div>
                </div>

                <div className="md:w-72 shrink-0 bg-slate-900/80 rounded-xl p-4 border border-slate-800">
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Transaction Hash</div>
                      <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                        <span className="text-cyan-400 font-mono text-xs truncate flex-1">
                          {record.txHash !== 'N/A: Queried via SC directly' ? `${record.txHash.slice(0,10)}...${record.txHash.slice(-8)}` : record.txHash}
                        </span>
                        {record.txHash !== 'N/A: Queried via SC directly' && (
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => handleCopy(record.txHash)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors" title="Copy">
                              {copiedHash === record.txHash ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <a 
                              href={`https://stellar.expert/explorer/testnet/tx/${record.txHash}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition-colors"
                              title="View on Explorer"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-500/80 text-[10px] uppercase tracking-wider">💸 Network Fee Paid</span>
                      <span className="text-emerald-400 font-mono">{record.fee} stroops <span className="text-emerald-500/50">({(record.fee / 10000000).toFixed(6)} XLM)</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
