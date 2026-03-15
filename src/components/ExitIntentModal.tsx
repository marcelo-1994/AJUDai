import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X } from 'lucide-react';

export function ExitIntentModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Show modal if mouse leaves from the top of the viewport (indicating intent to close tab or change URL)
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        playSound();
      }
    };

    const playSound = () => {
      try {
        // A peaceful, soft chime sound
        const audio = new Audio('https://cdn.freesound.org/previews/411/411460_5121236-lq.mp3');
        audio.volume = 0.3;
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Autoplay prevented by browser:', error);
          });
        }
      } catch (err) {
        console.error('Error playing sound:', err);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsVisible(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-zinc-900 border border-white/10 p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center overflow-hidden"
          >
            {/* Decorative top gradient */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
            
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-24 h-24 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl"
              />
              <Heart className="h-12 w-12 text-indigo-400 relative z-10" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="h-6 w-6 text-purple-400 absolute -top-2 -right-2" />
                <Sparkles className="h-4 w-4 text-emerald-400 absolute -bottom-1 -left-1" />
              </motion.div>
            </div>

            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
              Já vai?
            </h2>
            
            <p className="text-zinc-300 mb-8 text-lg leading-relaxed">
              Tem certeza que você quer fechar o AjudaAí+? <br/><br/>
              <span className="text-indigo-300 font-medium">Estamos aqui, quando precisar.</span> Vá em paz! ✌️
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setIsVisible(false)}
                className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25"
              >
                Ficar mais um pouco
              </button>
              <button 
                onClick={() => setIsVisible(false)}
                className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-2xl font-medium transition-colors"
              >
                Pode fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
