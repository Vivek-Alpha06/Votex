import { useEffect, useState } from 'react';
import { useContract } from '../../hooks/useContract';
import { ShieldCheck, Plus, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { getStats } = useContract();
  const [stats, setStats] = useState({ proposals: 0, totalVotes: 0 });

  useEffect(() => {
    getStats().then(setStats);
  }, [getStats]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 mb-10 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-white neon-text mb-2">Government Dashboard</h2>
          <p className="text-slate-400">Total overview of the Votex ecosystem.</p>
        </div>
        <Link 
          to="/admin/create"
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(138,43,226,0.5)]"
        >
          <Plus className="w-5 h-5" />
          Create Proposal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 border-t-2 border-t-cyan-500">
          <div className="flex items-center gap-4 text-slate-300 mb-4">
            <FileText className="w-8 h-8 text-cyan-400" />
            <span className="text-lg font-medium text-white">Total Proposals</span>
          </div>
          <div className="text-4xl font-bold text-cyan-200">{stats.proposals}</div>
        </div>
        <div className="glass-card p-6 border-t-2 border-t-purple-500">
          <div className="flex items-center gap-4 text-slate-300 mb-4">
            <CheckCircle className="w-8 h-8 text-purple-400" />
            <span className="text-lg font-medium text-white">Votes Cast</span>
          </div>
          <div className="text-4xl font-bold text-purple-200">{stats.totalVotes}</div>
        </div>
        <div className="glass-card p-6 border-t-2 border-t-emerald-500">
          <div className="flex items-center gap-4 text-slate-300 mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <span className="text-lg font-medium text-white">Network Status</span>
          </div>
          <div className="text-2xl font-bold text-emerald-300">Testnet Linked</div>
        </div>
      </div>
      
      <div className="glass-panel p-8 rounded-2xl border border-slate-700/50 text-center">
        <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-300 mb-2">Immutable Logs</h3>
        <p className="text-slate-500 max-w-lg mx-auto">This panel connects directly to the blockchain to read aggregated statistics based on the Soroban contract states.</p>
      </div>
    </div>
  );
}
