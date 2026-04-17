import { useState } from 'react';
import { Search, ShieldAlert, CheckCircle2, Copy, ExternalLink, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_RECEIPT = {
  txHash: "0xMockHash8f9c1a2b3c4d5e6f7g8h9i0j1k2l3m4n5",
  fee: 1000,
  timestamp: Date.now() - 3600000,
  optionText: "Approve",
  proposalTitle: "Allocate 50,000 XLM for Votex Community Grants"
};

export default function Verify() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, not_found
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setStatus('loading');
    setReceipt(null);

    // Simulate network delay
    setTimeout(() => {
      // Dummy logic: if starts with G or 0x, show mock success, else not found
      if (query.length > 10) {
        setReceipt(MOCK_RECEIPT);
        setStatus('success');
      } else {
        setStatus('not_found');
      }
    }, 1200);
  };

  const handleCopy = () => {
    if (receipt?.txHash) {
      navigator.clipboard.writeText(receipt.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-bold text-white neon-text mb-2 text-center">Verify Public Ledger</h2>
      <p className="text-slate-400 mb-10 text-center">Enter a Stellar wallet address or Tx Hash to verify on-chain records.</p>

      <form onSubmit={handleSearch} className="mb-12 relative group max-w-xl mx-auto">
        <div className={`absolute inset-0 rounded-full transition-all duration-500 blur-lg ${isFocused ? 'bg-gradient-to-r from-cyan-500 to-purple-500 opacity-50' : 'bg-slate-700 opacity-20'}`} />
        <div className={`relative flex items-center bg-slate-900 border transition-colors duration-300 rounded-full p-2 ${isFocused ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.15)]' : 'border-slate-700'}`}>
          <Search className={`w-6 h-6 ml-4 transition-colors ${isFocused ? 'text-cyan-400' : 'text-slate-400'}`} />
          <input
            type="text"
            className="flex-grow bg-transparent border-none text-white px-4 py-2 focus:outline-none placeholder-slate-500 font-mono text-sm tracking-wide"
            placeholder="Search address or Tx Hash..."
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit"
            disabled={status === 'loading'}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold px-6 py-2 rounded-full hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {status === 'loading' ? <Hexagon className="w-4 h-4 animate-[spin_2s_linear_infinite]" /> : 'Verify'}
          </button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-12 text-center rounded-3xl border border-dashed border-slate-700"
          >
            <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl text-slate-400 font-medium tracking-wide">Awaiting Query</h3>
            <p className="text-sm text-slate-500 mt-2">Enter credentials above to parse public history.</p>
          </motion.div>
        )}

        {status === 'not_found' && (
          <motion.div 
            key="not_found"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-12 text-center rounded-3xl border border-dashed border-red-500/30"
          >
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl text-red-400 font-medium">Record Not Found</h3>
            <p className="text-sm text-slate-500 mt-2">No matching transactions or wallets were identified on the network.</p>
          </motion.div>
        )}

        {status === 'success' && receipt && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-[1px] rounded-xl bg-gradient-to-r from-emerald-500/50 to-cyan-500/50 relative overflow-hidden"
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 z-20 pointer-events-none"
            />
            
            <div className="bg-slate-900 rounded-xl p-8 relative z-10 backdrop-blur-3xl shadow-xl">
              <div className="flex items-center gap-2 mb-6 text-emerald-400 font-bold text-lg border-b border-emerald-500/20 pb-4">
                <CheckCircle2 className="w-6 h-6" />
                Verified Immutable Match
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Proposal Verified</div>
                  <div className="text-white text-xl font-bold bg-slate-800/50 p-3 rounded border border-slate-700/50">
                    {receipt.proposalTitle}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Recorded Choice</div>
                  <div className="text-emerald-300 font-medium bg-emerald-950/30 p-2 rounded truncate border border-emerald-500/30">
                    {receipt.optionText}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Network Fee Paid</div>
                  <div className="text-slate-200 font-medium bg-slate-800/50 p-2 rounded border border-slate-700/50 flex items-center gap-2">
                    {receipt.fee} stroops
                    <span className="text-slate-500 text-sm">({(receipt.fee / 10000000).toFixed(6)} XLM)</span>
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Blockchain Transaction Hash</div>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2.5 rounded hover:border-slate-700 transition-colors group">
                    <span className="text-cyan-400 font-mono text-sm truncate flex-1">
                      {receipt.txHash}
                    </span>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={handleCopy} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors title='Copy'">
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a 
                        href={`https://stellar.expert/explorer/testnet/tx/${receipt.txHash}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 hover:bg-slate-800 rounded text-cyan-400 transition-colors title='View on Explorer'"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 md:col-span-2 pt-2 border-t border-slate-800/50">
                  <div className="text-xs text-slate-500 font-mono">
                    Ledger Timestamp: {new Date(receipt.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
