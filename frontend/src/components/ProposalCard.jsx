import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';
import { motion } from 'framer-motion';

export default function ProposalCard({ proposal }) {
  const isClosed = false; // logic handles via deadline typically or is_closed flag
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2 inline-block">
            {proposal.category}
          </span>
          <h3 className="text-xl font-bold text-white neon-text line-clamp-1">{proposal.title}</h3>
        </div>
        <div className="text-right whitespace-nowrap ml-4">
          <div className="text-[10px] uppercase text-slate-400 mb-1 tracking-wider">Remaining</div>
          <CountdownTimer deadline={proposal.deadline} />
        </div>
      </div>
      
      <p className="text-slate-300 flex-grow mb-6 line-clamp-3 text-sm">{proposal.description}</p>
      
      <div className="mb-6 space-y-2">
        {proposal.options.slice(0, 3).map((opt, idx) => {
          const percent = proposal.total_votes > 0 ? ((proposal.vote_counts[idx] / proposal.total_votes) * 100).toFixed(1) : 0;
          return (
            <div key={idx} className="relative h-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/50">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border-r border-cyan-500/30 transition-all duration-1000"
                style={{ width: `${percent}%` }}
              />
              <div className="absolute inset-0 flex justify-between items-center px-3 z-10 text-xs font-medium">
                <span className="text-slate-200">{opt}</span>
                <span className="text-slate-400 font-mono">{percent}% ({proposal.vote_counts[idx] || 0})</span>
              </div>
            </div>
          );
        })}
        {proposal.options.length > 3 && (
          <div className="text-xs text-center text-slate-500 italic">+ {proposal.options.length - 3} more options</div>
        )}
      </div>

      <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-700/50">
        <span className="text-xs font-mono text-slate-400">Total: <span className="text-white font-bold">{proposal.total_votes}</span> votes</span>
        <Link 
          to={`/proposals/${proposal.id}`}
          className="px-5 py-2 rounded-lg bg-slate-800 border border-cyan-500/50 font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-white hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all text-sm"
        >
          {isClosed ? 'VIEW RESULTS' : 'VOTE NOW'}
        </Link>
      </div>
    </motion.div>
  );
}
