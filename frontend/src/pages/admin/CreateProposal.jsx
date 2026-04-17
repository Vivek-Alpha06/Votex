import { useState } from 'react';
import { useContract } from '../../hooks/useContract';
import { useWallet } from '../../hooks/useWallet';
import { Loader2, Plus, Trash2, ShieldAlert, CheckCircle2, Copy, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateProposal() {
  const { createProposal } = useContract();
  const { networkFee } = useWallet();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Election',
    deadlineDays: 7,
    quorum: 0,
  });
  const [options, setOptions] = useState(['', '']);
  
  // Modal states
  const [showSummary, setShowSummary] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  const handlePreSubmit = (e) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim() !== '');
    if (validOptions.length < 2) {
      setErrorStatus("You must provide at least 2 valid options.");
      setTimeout(() => setErrorStatus(null), 3000);
      return;
    }
    setShowSummary(true);
  };

  const handleConfirmSubmit = async () => {
    const validOptions = options.filter(o => o.trim() !== '');
    setLoading(true);
    setErrorStatus(null);
    try {
      const start = Math.floor(Date.now() / 1000);
      const end = start + (form.deadlineDays * 24 * 3600);
      
      const res = await createProposal(
        form.title,
        form.description,
        start,
        end,
        validOptions,
        Number(form.quorum),
        form.category,
        form.minBalance ? String(form.minBalance * 10000000) : "0" // pass min balance in stroops
      );
      
      setReceipt({ ...res });
      setForm({ title: '', description: '', category: 'Election', deadlineDays: 7, quorum: 0, minBalance: '' });
      setOptions(['', '']);
      setShowSummary(false);
    } catch (err) {
      setErrorStatus("Failed to submit to chain: " + (err.message || String(err)));
      setShowSummary(false);
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    if (options.length >= 8) return;
    setOptions([...options, '']);
  };

  const removeOption = (idx) => {
    if (options.length <= 2) return;
    const newOpts = [...options];
    newOpts.splice(idx, 1);
    setOptions(newOpts);
  };

  const handleCopy = () => {
    if (receipt?.txHash) {
      navigator.clipboard.writeText(receipt.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      <div className="mb-10 pb-6 border-b border-slate-800 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-white neon-text mb-2">Create Proposal</h2>
          <p className="text-slate-400">Publish a new democratic vote directly to the blockchain.</p>
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
            <div className="bg-slate-900 rounded-2xl p-8 relative z-10">
              <div className="flex items-center gap-3 text-emerald-400 font-bold text-xl mb-4">
                <CheckCircle2 className="w-8 h-8" />
                Proposal Successfully Deployed
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
                  <span className="text-slate-500">Fee Paid: <span className="text-slate-300 font-mono">{receipt.fee} stroops</span></span>
                  <span className="text-slate-500 text-xs">Timestamp: {new Date(receipt.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handlePreSubmit} className="glass-panel p-8 md:p-12 rounded-3xl space-y-8 border-t-[3px] border-t-cyan-500/80 shadow-2xl relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2 relative group mt-2">
            <input 
              id="title"
              required
              className="peer w-full bg-transparent border-b-2 border-slate-700 px-0 py-3 text-white text-lg focus:outline-none focus:border-cyan-500 transition-colors placeholder-transparent"
              placeholder="Title"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
            />
            <label htmlFor="title" className="absolute left-0 -top-5 text-sm text-cyan-400 font-medium transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-cyan-400">Proposal Title</label>
          </div>
          
          <div className="md:col-span-2 relative group mt-2">
            <textarea 
              id="desc"
              required
              rows={3}
              className="peer w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-white text-md focus:outline-none focus:border-cyan-500 focus:bg-slate-900 transition-all placeholder-transparent mt-2 resize-y"
              placeholder="Desc"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
            <label htmlFor="desc" className="absolute left-4 top-0 text-xs text-cyan-400 font-medium transition-all bg-slate-950 px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-6 peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:text-xs peer-focus:text-cyan-400 peer-focus:bg-slate-950">Description Context</label>
          </div>

          <div className="relative">
            <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 ml-1">Category</label>
            <select 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500 appearance-none drop-shadow-sm cursor-pointer"
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
            >
              <option>Election</option>
              <option>Referendum</option>
              <option>Survey</option>
              <option>Policy Vote</option>
              <option>Budget Approval</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 ml-1">Voting Window</label>
            <div className="flex items-center gap-3">
              <input 
                type="number"
                min="1"
                max="90"
                required
                className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500 text-center font-mono"
                value={form.deadlineDays}
                onChange={e => setForm({...form, deadlineDays: e.target.value})}
              />
              <span className="text-slate-400 font-medium">Days Duration</span>
            </div>
          </div>
          
          <div className="relative">
            <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 ml-1">Quorum</label>
            <div className="flex items-center gap-3">
              <input 
                type="number"
                min="0"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-center font-mono"
                value={form.quorum}
                onChange={e => setForm({...form, quorum: e.target.value})}
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 ml-1">Min Balance Req (XLM)</label>
            <div className="flex items-center gap-3">
              <input 
                type="number"
                min="0"
                step="0.0000001"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-center font-mono"
                value={form.minBalance || ''}
                placeholder="Optional"
                onChange={e => setForm({...form, minBalance: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <label className="block text-sm text-white font-bold">Voting Options (Min 2)</label>
            {options.length < 8 && (
              <button type="button" onClick={addOption} className="text-cyan-400 text-sm font-bold flex items-center hover:text-cyan-300 bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-colors">
                <Plus className="w-4 h-4 mr-1" /> Add Option
              </button>
            )}
          </div>
          <motion.div layout className="space-y-4 rounded-xl">
            <AnimatePresence>
              {options.map((opt, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, height: 0, scale: 0.9 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-3 items-center group"
                >
                  <div className="w-8 flex justify-center text-slate-600 font-mono font-bold text-sm">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <input 
                    required
                    className="flex-grow bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 focus:bg-slate-900 transition-colors"
                    placeholder={`Descriptor for option ${i + 1}`}
                    value={opt}
                    onChange={e => {
                      const newOpts = [...options];
                      newOpts[i] = e.target.value;
                      setOptions(newOpts);
                    }}
                  />
                  {options.length > 2 ? (
                    <button type="button" onClick={() => removeOption(i)} className="bg-slate-900/50 p-3.5 rounded-xl text-slate-500 group-hover:text-red-400 hover:bg-slate-800 border border-transparent hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  ) : <div className="w-[52px]"></div>}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        <button 
          type="submit"
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg py-5 rounded-2xl transition-all hover:shadow-lg hover:shadow-slate-900/50 border border-slate-600 tracking-wide mt-4"
        >
          Review Target State
        </button>
      </form>

      {/* Pre-Signing Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !loading && setShowSummary(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg glass-panel p-8 rounded-3xl z-10 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,255,255,0.1)]"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-cyan-400" />
                Sign Proposal Broadcast
              </h3>
              
              <div className="space-y-4 mb-8 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Contract Execution</div>
                  <div className="font-mono text-cyan-300 text-sm">create_proposal(...)</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Duration</div>
                    <div className="text-white text-sm font-medium">{form.deadlineDays} Days</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Estimated Fee</div>
                    <div className="text-slate-300 font-mono text-sm">~2,000 stroops</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-2">Payload (Options)</div>
                  <div className="flex flex-wrap gap-2">
                    {options.filter(o => o.trim()).map((o, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 border border-slate-700 truncate max-w-full">
                        {String.fromCharCode(65+i)}: {o}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowSummary(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-4 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmSubmit}
                  disabled={loading}
                  className="flex-[2] relative overflow-hidden rounded-xl font-bold text-white group disabled:opacity-80 disabled:cursor-wait"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600" />
                  {loading && <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 animate-[pulse_1s_infinite] opacity-50" />}
                  <div className="relative py-4 px-4 flex items-center justify-center gap-2">
                    {loading ? (
                      <><Hexagon className="w-5 h-5 animate-[spin_2s_linear_infinite]" /> Broadcasting to Stellar...</>
                    ) : (
                      <><ShieldAlert className="w-5 h-5" /> Sign with Freighter</>
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
