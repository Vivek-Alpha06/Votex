import Results from '../Results';

export default function AdminResults() {
  return (
    <div>
      <div className="mb-4 text-purple-400 font-mono text-sm max-w-5xl mx-auto flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" /> Admin View Active
      </div>
      <Results />
    </div>
  );
}
