import { useEffect, useState } from 'react';
import { useContract } from '../hooks/useContract';
import ProposalCard from '../components/ProposalCard';
import { Loader2 } from 'lucide-react';

export default function Proposals() {
  const { getActiveProposals, loading } = useContract();
  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    getActiveProposals()
      .then(setProposals)
      .catch(() => setError(true));
  }, [getActiveProposals]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-4xl font-bold text-white neon-text mb-2">Active Proposals</h2>
          <p className="text-slate-400">Cast your vote on open government proposals.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        </div>
      ) : error || proposals.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl border border-dashed border-slate-700">
          <h3 className="text-2xl text-slate-300 font-bold mb-2">No active proposals found</h3>
          <p className="text-slate-500">Either the contract is not deployed or there are currently no open voting proposals on-chain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {proposals.map(p => (
            <ProposalCard key={p.id} proposal={p} />
          ))}
        </div>
      )}
    </div>
  );
}
