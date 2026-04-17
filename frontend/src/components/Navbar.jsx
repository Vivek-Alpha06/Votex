import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { ShieldCheck, LogOut, Wallet } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Navbar() {
  const { address, shortAddress, isAdmin, disconnect, openModal } = useWallet();
  const location = useLocation();
  const [isHoveringWallet, setIsHoveringWallet] = useState(false);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Active Proposals', path: '/proposals' },
    { name: 'My Votes', path: '/my-votes' },
    { name: 'Results', path: '/results' },
  ];

  if (isAdmin) {
    links.push({ name: 'Admin Panel', path: '/admin', adminOnly: true });
  }

  links.push({ name: 'Verify', path: '/verify' });

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b-0 border-x-0 border-t-0 border-white/10 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-cyan-400" />
          <span className="text-2xl font-bold text-white neon-text">Votex</span>
          {isAdmin && (
            <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/50 hidden md:inline-block">
              GOV ADMIN
            </span>
          )}
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 relative">
          {links.map((link, idx) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && link.path !== '/admin' && location.pathname.startsWith(link.path));
            const isAdminLink = link.adminOnly;

            return (
              <Link
                key={link.path + idx}
                to={link.path}
                className={clsx(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 z-10 flex items-center gap-2",
                  isActive 
                    ? "text-cyan-300" 
                    : isAdminLink
                      ? "text-purple-300/70 hover:text-purple-300"
                      : "text-slate-400 hover:text-white"
                )}
              >
                {isAdminLink && <ShieldCheck className="w-4 h-4 opacity-50" />}
                {link.name}
                {isActive && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-slate-700/80 rounded-lg -z-10 shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {isAdminLink && !isActive && (
                  <div className="absolute inset-0 bg-purple-500/5 rounded-lg -z-10" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-4">
          {!address ? (
            <button
              onClick={openModal}
              className="relative overflow-hidden group rounded-lg p-[1px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg animate-[pulse_3s_ease-in-out_infinite] opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative px-4 py-2 bg-slate-900 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-all group-hover:bg-slate-800">
                <Wallet className="w-4 h-4 text-cyan-400" />
                Connect Wallet
              </div>
            </button>
          ) : (
            <div 
              className="relative w-36 h-10 perspective-1000"
              onMouseEnter={() => setIsHoveringWallet(true)}
              onMouseLeave={() => setIsHoveringWallet(false)}
            >
              <AnimatePresence initial={false}>
                {!isHoveringWallet ? (
                  <motion.div
                    key="wallet-info"
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={{ rotateX: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center gap-2 px-3 bg-slate-900 border border-slate-700/50 rounded-lg shadow-inner"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-[pulse_2s_ease-in-out_infinite]" />
                    <span className="text-sm font-mono text-slate-300">{shortAddress}</span>
                  </motion.div>
                ) : (
                  <motion.button
                    key="disconnect-btn"
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={{ rotateX: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={disconnect}
                    className="absolute inset-0 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg w-full transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Disconnect</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
