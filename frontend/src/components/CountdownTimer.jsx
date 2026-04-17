import { useState, useEffect } from 'react';

export default function CountdownTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(deadline) - now;
      if (diff <= 0) return setTimeLeft('Closed');
      
      const d = Math.floor(diff / (24 * 3600));
      const h = Math.floor((diff % (24 * 3600)) / 3600);
      const m = Math.floor((diff % 3600) / 60);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    calc();
    const int = setInterval(calc, 60000);
    return () => clearInterval(int);
  }, [deadline]);

  return <span className={`font-mono font-bold px-2 py-1 rounded bg-slate-900 border border-slate-700 ${timeLeft === 'Closed' ? 'text-red-400' : 'text-purple-400 neon-text'}`}>{timeLeft}</span>;
}
