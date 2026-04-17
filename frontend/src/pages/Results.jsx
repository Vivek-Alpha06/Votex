import { BarChart3, Hexagon, CheckCircle2 } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Results() {
  const { getClosedProposals } = useContract();
  const [closed, setClosed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClosedProposals()
      .then(setClosed)
      .finally(() => setLoading(false));
  }, [getClosedProposals]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-white neon-text mb-2">Final Results</h2>
          <p className="text-slate-400">View outcomes for all finalized proposals.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><BarChart3 className="w-12 h-12 text-cyan-400 animate-pulse" /></div>
      ) : closed.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl border border-dashed border-slate-700">
          <BarChart3 className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-70" />
          <h3 className="text-2xl text-slate-300 font-bold mb-2">No finalized results yet</h3>
          <p className="text-slate-500">When campaigns close, their verified outcomes will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {closed.map((p, i) => {
             // Basic fallback logic reading array to determine winner
             let total = 0;
             let maxVotes = -1;
             let winnerIdx = -1;
             p.vote_counts?.forEach((count, idx) => {
               const c = Number(count);
               total += c;
               if (c > maxVotes) {
                 maxVotes = c;
                 winnerIdx = idx;
               }
             });
             
             // Check quorum logic fallback
             const quorum = Number(p.quorum);
             const quorumMet = quorum === 0 || total >= quorum;

             return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                key={p.id} className="glass-panel p-8 rounded-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500 opacity-50" />
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold text-slate-400 border border-slate-700 px-2 py-1 rounded inline-block mb-3 tracking-widest uppercase">Closed: {p.category}</span>
                    <h3 className="text-2xl font-bold text-white leading-tight">{p.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-sm text-slate-400">
                    <Hexagon className="w-4 h-4 text-cyan-500" /> {total} Total Votes
                  </div>
                </div>

                <div className="grid gap-3 mb-6">
                  {p.options.map((opt, oIdx) => {
                    const count = p.vote_counts ? Number(p.vote_counts[oIdx]) : 0;
                    let percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    const isWinner = oIdx === winnerIdx && quorumMet;
                    return (
                      <div key={oIdx} className="relative">
                        <div className="flex justify-between text-sm mb-1 z-10 px-1">
                          <span className={`${isWinner ? 'text-emerald-300 font-bold' : 'text-slate-300'}`}>{opt}</span>
                          <span className={`${isWinner ? 'text-emerald-300 font-bold' : 'text-slate-400'}`}>{percentage}% ({count})</span>
                        </div>
                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${isWinner ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-slate-700'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                  <div className="text-sm font-medium">
                    {quorum > 0 ? (
                      quorumMet ? (
                        <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Quorum Met ({total}/{quorum})</span>
                      ) : (
                        <span className="text-red-400">Quorum Failed ({total}/{quorum})</span>
                      )
                    ) : (
                      <span className="text-slate-500">No Quorum Required</span>
                    )}
                  </div>
                  <div className="text-sm">
                    {quorumMet && maxVotes > 0 ? (
                      <span className="text-white">Winner: <span className="text-emerald-400 font-bold">{p.options[winnerIdx]}</span></span>
                    ) : (
                      <span className="text-slate-500 italic">No valid outcome</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
