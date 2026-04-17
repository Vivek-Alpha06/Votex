import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { ShieldCheck, Wallet, Loader2, X } from 'lucide-react';
import clsx from 'clsx';

export default function ConnectModal() {
  const { isModalOpen, closeModal, connect } = useWallet();
  const [loadingWallet, setLoadingWallet] = useState(null);
  const [successWallet, setSuccessWallet] = useState(null);
  const [errorWallet, setErrorWallet] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Reset internal states when opened
  useEffect(() => {
    if (isModalOpen) {
      setLoadingWallet(null);
      setSuccessWallet(null);
      setErrorWallet(null);
      setErrorMsg("");
    }
  }, [isModalOpen]);

  const handleConnect = async (walletName) => {
    if (walletName !== 'Freighter') return;

    setLoadingWallet(walletName);
    setErrorWallet(null);
    setErrorMsg("");

    try {
      await connect();
      setLoadingWallet(null);
      setSuccessWallet(walletName);

      // Animation success wait, then close
      setTimeout(() => {
        closeModal();
      }, 1200);

    } catch (e) {
      setLoadingWallet(null);
      setErrorWallet(walletName);
      setErrorMsg(e.message || "Connection failed");
      
      // Auto reset error state after some time
      setTimeout(() => {
        setErrorWallet(null);
        setErrorMsg("");
      }, 3000);
    }
  };

  const shakeVariants = {
    shake: {
      x: [0, -8, 8, -4, 4, 0],
      transition: { duration: 0.4 }
    },
    idle: { x: 0 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.85, 
      transition: { duration: 0.2, ease: "easeIn" } 
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={closeModal}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[20px]"
          />
          
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-sm glass-panel p-6 rounded-3xl z-10 border border-purple-500/30 overflow-hidden shadow-[0_0_40px_rgba(138,43,226,0.15)]"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500" />
            
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 mt-2">
              <div className="mx-auto w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-700 mb-4 shadow-lg shadow-purple-900/20">
                <Wallet className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Connect Wallet</h2>
              <p className="text-slate-400 text-sm mt-1 font-light">Securely connect to Votex</p>
            </div>

            <div className="space-y-3">
              {/* Freighter */}
              <motion.button
                variants={shakeVariants}
                animate={errorWallet === 'Freighter' ? "shake" : "idle"}
                onClick={() => handleConnect('Freighter')}
                className="w-full relative group overflow-hidden rounded-xl bg-slate-800 border border-slate-700 p-[1px] transition-all hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(138,43,226,0.3)] hover:border-purple-500/50"
              >
                <div className="px-5 py-4 bg-slate-900 rounded-xl flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <img src="https://stellar.org/favicon.ico" alt="Freighter" className="w-5 h-5 opacity-80" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block font-medium text-white group-hover:text-purple-300 transition-colors">
                      Freighter
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center h-6">
                    {loadingWallet === 'Freighter' && (
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    )}
                    {successWallet === 'Freighter' && (
                      <svg className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <motion.path
                          d="M5 13L9 17L19 7"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </motion.button>

              {errorWallet === 'Freighter' && (
                <motion.p initial={{ opacity: 0, h: 0 }} animate={{ opacity: 1, h: 'auto' }} className="text-red-400 text-xs font-medium text-center px-2">
                  {errorMsg}
                </motion.p>
              )}

              {/* Albedo */}
              <button disabled className="w-full relative group overflow-hidden rounded-xl bg-slate-800/50 border border-slate-800 p-[1px] transition-all hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
                <div className="px-5 py-4 bg-slate-900/80 rounded-xl flex items-center gap-4 relative z-10 opacity-60 mix-blend-luminosity hover:mix-blend-normal">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <span className="font-bold text-slate-500">A</span>
                  </div>
                  <div className="flex-1 text-left flex items-center gap-2">
                    <span className="font-medium text-slate-400">Albedo</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded bg-slate-800 text-slate-300">Coming Soon</span>
                  </div>
                </div>
              </button>

              {/* xBull */}
              <button disabled className="w-full relative group overflow-hidden rounded-xl bg-slate-800/50 border border-slate-800 p-[1px] transition-all hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
                <div className="px-5 py-4 bg-slate-900/80 rounded-xl flex items-center gap-4 relative z-10 opacity-60 mix-blend-luminosity hover:mix-blend-normal">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <span className="font-bold text-slate-500">X</span>
                  </div>
                  <div className="flex-1 text-left flex items-center gap-2">
                    <span className="font-medium text-slate-400">xBull</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded bg-slate-800 text-slate-300">Coming Soon</span>
                  </div>
                </div>
              </button>
            </div>
            
            <p className="text-center text-xs font-mono text-slate-600 mt-6">
              Secured by Stellar Network
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
