import { useEffect, useState } from 'react';
import { useContract } from '../../hooks/useContract';
import { Loader2, Settings, Lock, ShieldAlert, Hexagon, CheckCircle2, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManageProposals() {
  const { getActiveProposals, closeProposal } = useContract();
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(true);

  // Modal states
  const [closingId, setClosingId] = useState(null);
  const [loadingClose, setLoadingClose] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = () => {
    setLoadingProposals(true);
    getActiveProposals()
      .then(setProposals)
      .catch(console.error)
      .finally(() => setLoadingProposals(false));
  };

  const handleInitiateClose = (id) => {
    setClosingId(id);
    setReceipt(null);
    setErrorStatus(null);
  };

  const handleConfirmClose = async () => {
    if (closingId === null) return;
    setLoadingClose(true);
    setErrorStatus(null);
    try {
      const res = await closeProposal(closingId);
      setReceipt(res);
      setClosingId(null);
      // Refresh the list after brief delay
      setTimeout(fetchProposals, 1500);
    } catch (err) {
      setErrorStatus("Failed to submit to chain: " + (err.message || String(err)));
      setClosingId(null);
    } finally {
      setLoadingClose(false);
    }
  };

  const handleCopy = () => {
    if (receipt?.txHash) {
      navigator.clipboard.writeText(receipt.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const targetProposal = proposals.find(p => p.id === closingId);

  return (
    <div className="max-w-6xl mx-auto relative">
      <div className="flex justify-between items-end mb-10 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-white neon-text mb-2">Manage Campaigns</h2>
          <p className="text-slate-400">Control active voting campaigns and force close operations on-chain.</p>
        </div>
      </div>

      <AnimatePresence>
        {errorStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-8 p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-xl flex items-center gap-3"
          >
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
            <p className="text-sm font-medium">{errorStatus}</p>
          </motion.div>
        )}

        {receipt && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-12 p-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 overflow-hidden relative"
          >
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 z-20 pointer-events-none"
            />
            <div className="bg-slate-900 rounded-2xl p-8 relative z-10 block">
              <div className="flex items-center gap-3 text-emerald-400 font-bold text-xl mb-4">
                <CheckCircle2 className="w-8 h-8" />
                Force Close Deployed
              </div>
              <div className="grid gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wider text-slate-500">Transaction Hash</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 truncate">{receipt.txHash}</span>
                    <button type="button" onClick={handleCopy} className="p-1 hover:bg-slate-800 rounded">
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-3">
                  <span className="text-emerald-500/80 uppercase text-xs tracking-wider font-bold">💸 Network Fee Paid: <span className="text-emerald-400 font-mono ml-2 lowercase">{receipt.fee} stroops <span className="text-emerald-500/50">({(receipt.fee / 10000000).toFixed(7)} XLM)</span></span></span>
                  <span className="text-slate-500 text-xs">Timestamp: {new Date(receipt.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loadingProposals ? (
        <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 text-cyan-400 animate-spin" /></div>
      ) : proposals.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl border border-dashed border-slate-700">
          <Settings className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl text-slate-300 font-bold mb-2">No Active Campaigns</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">There are currently no active proposals available for management.</p>
          <Link to="/admin/create" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-cyan-500/20 transition-all inline-block">Launch Campaign</Link>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {proposals.map((p, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              key={p.id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-l-4 border-l-purple-500 hover:border-l-cyan-400 transition-colors"
            >
               <div className="flex-1 w-full relative">
                 <span className="text-xs font-bold text-cyan-300 bg-cyan-900/40 border border-cyan-500/30 px-2 py-1 rounded inline-block mb-3 tracking-widest uppercase">{p.category}</span>
                 <h3 className="text-2xl font-bold text-white mb-2">{p.title}</h3>
                 <div className="flex items-center gap-4 text-sm mt-1">
                   <div className="bg-slate-900 px-3 py-1.5 rounded-md border border-slate-700">
                     <span className="text-slate-500 mr-2">Votes Cast</span>
                     <span className="font-mono font-bold text-white text-base leading-none">{p.total_votes}</span>
                   </div>
                 </div>
               </div>
               <div className="flex w-full md:w-auto shrink-0 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                  <button 
                    onClick={() => handleInitiateClose(p.id)} 
                    className="w-full md:w-auto bg-slate-900 text-red-400 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500 px-6 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md group"
                  >
                    <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" /> FORCE CLOSE
                  </button>
               </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pre-Signing Summary Modal */}
      <AnimatePresence>
        {closingId !== null && targetProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !loadingClose && setClosingId(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg glass-panel p-8 rounded-3xl z-10 border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)]"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                Sign Force Close
              </h3>
              
              <div className="space-y-4 mb-8 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Contract Execution</div>
                  <div className="font-mono text-cyan-300 text-sm bg-slate-950 p-2 rounded">close_proposal({targetProposal.id})</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Target Proposal</div>
                  <div className="text-white text-sm font-medium border border-slate-700 bg-slate-950 p-3 rounded truncate">{targetProposal.title}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Estimated Fee</div>
                  <div className="text-slate-300 font-mono text-sm block">~2,000 stroops</div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setClosingId(null)}
                  disabled={loadingClose}
                  className="flex-1 px-4 py-4 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmClose}
                  disabled={loadingClose}
                  className="flex-[2] relative overflow-hidden rounded-xl font-bold text-white group disabled:opacity-80 disabled:cursor-wait"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-purple-600" />
                  {loadingClose && <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-red-600 animate-[pulse_1s_infinite] opacity-50" />}
                  <div className="relative py-4 px-4 flex items-center justify-center gap-2">
                    {loadingClose ? (
                      <><Hexagon className="w-5 h-5 animate-[spin_2s_linear_infinite]" /> Broadcasting...</>
                    ) : (
                      <><ShieldAlert className="w-5 h-5" /> Sign & Terminate</>
                    )}
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
