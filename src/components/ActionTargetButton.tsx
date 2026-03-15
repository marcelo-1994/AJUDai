import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ActionTargetButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const whatsappNumber = "5594991233751";
  const message = encodeURIComponent("Olá Marcelo! Estou pronto para produzir e entregar valor verdadeiro no AJUDAÍ+. Quero começar agora!");

  const handleInitialClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setIsClicked(true);
    setTimeout(() => {
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
      setIsClicked(false);
      setShowConfirm(false);
    }, 800);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto my-16 flex flex-col items-center justify-center">
      
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        {!showConfirm ? (
          <motion.button
            key="target-btn"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleInitialClick}
            className="relative group w-full p-1 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500"
          >
            {/* Inner Container */}
            <div className="relative bg-zinc-950 rounded-[22px] px-8 py-12 overflow-hidden flex flex-col items-center justify-center gap-6 transition-all duration-500 group-hover:bg-zinc-900">
              
              {/* Target Reticle Animation */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Outer Ring */}
                <motion.div 
                  animate={{ rotate: isHovered ? 180 : 0 }}
                  transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                  className="absolute inset-0 border-2 border-dashed border-indigo-500/50 rounded-full"
                />
                
                {/* Inner Ring */}
                <motion.div 
                  animate={{ rotate: isHovered ? -180 : 0, scale: isHovered ? 1.1 : 1 }}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                  className="absolute inset-4 border-2 border-emerald-500/50 rounded-full"
                />

                {/* Center Target */}
                <motion.div
                  animate={{ scale: isHovered ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="relative z-10 bg-indigo-600 p-4 rounded-full shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                >
                  <Target className="w-10 h-10 text-white" />
                </motion.div>

                {/* Crosshairs */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                  <div className="w-full h-[1px] bg-indigo-500/30" />
                  <div className="absolute h-full w-[1px] bg-indigo-500/30" />
                </div>
              </div>

              {/* Text Content */}
              <div className="text-center z-10 space-y-2">
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 uppercase tracking-widest">
                  Pronto para Produzir?
                </h3>
                <p className="text-zinc-400 font-medium text-lg">
                  Entregue valor real. Conecte-se diretamente.
                </p>
              </div>

              {/* Action Indicator */}
              <motion.div 
                animate={{ x: isHovered ? 10 : 0 }}
                className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-sm mt-4"
              >
                Iniciar Missão <ArrowRight className="w-5 h-5" />
              </motion.div>

            </div>
          </motion.button>
        ) : (
          <motion.div
            key="confirm-card"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            className="w-full bg-zinc-900 border border-indigo-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(79,70,229,0.15)] relative overflow-hidden"
          >
            {/* Scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />

            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                <ShieldAlert className="w-10 h-10 text-amber-400" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white uppercase tracking-wider">
                  Confirmação de Missão
                </h3>
                <p className="text-zinc-400 text-lg">
                  Você está prestes a entrar em contato direto com a liderança. 
                  <br/>
                  <span className="text-white font-medium">Você está realmente comprometido em entregar valor?</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row w-full gap-4 mt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-4 px-6 rounded-xl border border-white/10 text-zinc-400 font-bold uppercase tracking-wider hover:bg-white/5 hover:text-white transition-colors"
                >
                  Abortar
                </button>
                
                <button
                  onClick={handleConfirm}
                  disabled={isClicked}
                  className="flex-1 py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClicked ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Target className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      Confirmar & Executar
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
