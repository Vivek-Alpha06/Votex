import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { Loader2, ArrowLeft, CheckCircle2, Wallet, ExternalLink, Copy, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CountdownTimer from '../components/CountdownTimer';
import toast from 'react-hot-toast';

export default function ProposalDetail() {
  const { id } = useParams();
  const { getProposal, vote, hasVoted } = useContract();
  const { address, openModal, networkFee } = useWallet();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [validatingVote, setValidatingVote] = useState(false);
  const [voteState, setVoteState] = useState('idle'); // idle, loading, success, error
  const [alreadyVotedObj, setAlreadyVotedObj] = useState(null);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Top level load
    getProposal(Number(id)).then(p => {
      setProposal(p);
      setLoading(false);
    });
  }, [id, getProposal]);

  useEffect(() => {
    if (!address) {
      setAlreadyVotedObj(null);
      return;
    }
    setValidatingVote(true);
    hasVoted(Number(id)).then(voted => {
      setAlreadyVotedObj(voted);
    }).finally(() => {
      setValidatingVote(false);
    });
  }, [address, id, hasVoted]);

  const handleVoteClick = async () => {
    if (!address) {
      openModal();
      return;
    }
    
    if (selectedOpt === null) return;

    try {
      setVoteState('loading');
      const res = await vote(Number(id), selectedOpt, proposal.options[selectedOpt]);
      setReceipt({
        ...res, 
        optionText: proposal.options[selectedOpt]
      });
      setVoteState('success');
      setAlreadyVotedObj({ choice: selectedOpt });
      
      const p = await getProposal(Number(id));
      setProposal(p);
      toast.success("Vote recorded on-chain successfully!");
    } catch (e) {
      setVoteState('error');
      toast.error("Transaction failed or rejected");
      setTimeout(() => setVoteState('idle'), 2000);
    }
  };

  const handleCopy = () => {
    if (receipt?.txHash) {
      navigator.clipboard.writeText(receipt.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shakeAnimation = voteState === 'error' ? { x: [0, -8, 8, -4, 4, 0] } : {};

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 text-cyan-400 animate-spin" /></div>;
  if (!proposal) return <div className="text-center p-20 text-slate-400">Proposal not found or network error. Note: Contract must be deployed to load on-chain proposals.</div>;

  const minBalance = proposal?.min_balance ?? 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Link to="/proposals" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Proposals
      </Link>
      
      <div className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500" />
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-600 mb-4 inline-block tracking-wider uppercase">
              {proposal.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white neon-text mb-4">
              {proposal.title}
            </h1>
            {minBalance > 0 && (
               <div className="inline-flex items-center text-sm text-purple-300 bg-purple-900/30 px-3 py-1 rounded-full border border-purple-500/30 mt-2">
                 <Wallet className="w-4 h-4 mr-2" /> Minimum Balance Required: {minBalance} XLM
               </div>
            )}
          </div>
          <div className="flex flex-col items-end shrink-0 glass-card p-4 rounded-xl border border-slate-700 shadow-xl shadow-slate-900/50">
            <span className="text-xs text-slate-400 uppercase tracking-widest mb-1">Voting Closes In</span>
            <div className="text-xl text-cyan-50 font-bold"><CountdownTimer deadline={proposal.deadline} /></div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none mb-12">
          <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-wrap">{proposal.description}</p>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-6 md:p-8 border border-slate-700/50 relative">
          <h3 className="text-2xl font-bold text-white mb-6">Cast Your Vote</h3>
          
          <div className="space-y-4 relative z-10">
            {proposal.options.map((opt, idx) => {
              const isVotedOption = alreadyVotedObj?.choice === idx;
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedOpt(idx)}
                  disabled={voteState === 'loading' || voteState === 'success' || !!alreadyVotedObj}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    (selectedOpt === idx || isVotedOption)
                      ? 'bg-cyan-900/30 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.2)]' 
                      : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                  } ${(voteState === 'loading' || alreadyVotedObj) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className={`text-lg font-medium ${(selectedOpt === idx || isVotedOption) ? 'text-cyan-100' : 'text-slate-200'}`}>{opt}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${(selectedOpt === idx || isVotedOption) ? 'border-cyan-400' : 'border-slate-500'}`}>
                    {(selectedOpt === idx || isVotedOption) && <motion.div layoutId="vote-dot" className="w-3 h-3 rounded-full bg-cyan-400" />}
                  </div>
                </button>
              );
            })}
            
            {validatingVote ? (
              <div className="w-full mt-8 py-5 rounded-xl border border-slate-700 bg-slate-800/50 animate-pulse flex items-center justify-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-slate-500 border-t-slate-300 animate-spin" />
                <span className="text-slate-500 font-medium tracking-wide">Evaluating Eligibility...</span>
              </div>
            ) : alreadyVotedObj ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-8 py-5 rounded-xl font-bold text-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="w-6 h-6" /> ✓ You voted: {proposal.options[alreadyVotedObj.choice]}
                
                {alreadyVotedObj.txHash && (
                  <div className="absolute -bottom-6 text-xs font-mono text-emerald-500/70 hover:text-emerald-400 transition-colors">
                    <a href={`https://stellar.expert/explorer/testnet/tx/${alreadyVotedObj.txHash}`} target="_blank" rel="noreferrer">
                      View Tx: {alreadyVotedObj.txHash.slice(0, 10)}...
                    </a>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.button
                onClick={handleVoteClick}
                disabled={selectedOpt === null || voteState === 'loading' || voteState === 'success'}
                animate={shakeAnimation}
                whileTap={selectedOpt !== null && voteState === 'idle' ? { scale: 0.98 } : {}}
                className={`w-full mt-8 py-5 rounded-xl font-bold text-lg transition-all relative overflow-hidden flex items-center justify-center gap-3 ${
                  selectedOpt === null 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : voteState === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      : voteState === 'error'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                        : !address 
                          ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-[0_0_20px_rgba(138,43,226,0.4)]'
                          : 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                }`}
              >
                {voteState === 'success' && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-emerald-400 rounded-xl"
                  />
                )}
                
                {voteState === 'loading' ? (
                  <>
                    <Hexagon className="w-6 h-6 animate-[spin_2s_linear_infinite]" />
                    Submitting to Chain...
                  </>
                ) : voteState === 'success' ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" /> Vote Recorded ✓
                  </>
                ) : !address ? (
                  <>
                    <Wallet className="w-5 h-5" /> Connect to Vote
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Cast Vote
                  </>
                )}
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {receipt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mt-8 p-[1px] rounded-xl bg-gradient-to-r from-emerald-500/50 to-cyan-500/50 relative overflow-hidden"
              >
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
                  className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 z-20"
                />
                
                <div className="bg-slate-900 rounded-xl p-6 relative z-10 backdrop-blur-3xl">
                  <div className="flex items-center gap-2 mb-4 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    Status: Confirmed on Stellar
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wider">Your Choice</div>
                      <div className="text-slate-200 font-medium bg-slate-800/50 p-2 rounded truncate border border-slate-700/50">
                        {receipt.optionText}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wider">💸 Network Fee Paid</div>
                      <div className="text-emerald-300 font-medium bg-slate-800/50 p-2 rounded border border-emerald-900/50 flex items-center gap-2">
                        {receipt.fee} stroops
                        <span className="text-emerald-500/70 text-sm">({(receipt.fee / 10000000).toFixed(7)} XLM)</span>
                      </div>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <div className="text-xs text-slate-500 uppercase tracking-wider">Transaction Hash</div>
                      <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 p-2 rounded">
                        <span className="text-emerald-300 font-mono text-sm truncate flex-1">
                          {receipt.txHash}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={handleCopy} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" title='Copy'>
                            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <a 
                            href={`https://stellar.expert/explorer/testnet/tx/${receipt.txHash}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1.5 hover:bg-slate-700 rounded text-cyan-400 transition-colors flex items-center gap-1 text-xs px-2"
                            title='View on Explorer'
                          >
                            <ExternalLink className="w-3 h-3" />
                            View on Explorer
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1 md:col-span-2">
                      <div className="text-xs text-slate-500/80">
                        Timestamp: {new Date(receipt.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  );
}
