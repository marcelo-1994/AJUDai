import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, X, ChevronRight, Trophy, Maximize2, Minimize2 } from 'lucide-react';
import { MemoryGame } from './games/MemoryGame';
import { TicTacToe } from './games/TicTacToe';
import { DominoesGame } from './games/DominoesGame';

export const IdleOverlay = () => {
  const [isIdle, setIsIdle] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Configuration state
  const [gameType, setGameType] = useState<'chess' | 'cards' | 'dominoes' | 'tictactoe'>(
    (localStorage.getItem('idle_game_type') as any) || 'chess'
  );
  const [pauseInterval, setPauseInterval] = useState<number>(
    parseInt(localStorage.getItem('idle_pause_interval') || '20')
  );
  const [disabled, setDisabled] = useState<boolean>(
    localStorage.getItem('idle_disabled') === 'true'
  );

  const IDLE_TIME = React.useMemo(() => pauseInterval * 60 * 1000, [pauseInterval]);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (disabled) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    
    if (!isIdle && !showGame) {
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, IDLE_TIME);
    }
  }, [isIdle, showGame, disabled, IDLE_TIME]);

  useEffect(() => {
    const handleStorageChange = () => {
      setGameType((localStorage.getItem('idle_game_type') as any) || 'chess');
      setPauseInterval(parseInt(localStorage.getItem('idle_pause_interval') || '20'));
      setDisabled(localStorage.getItem('idle_disabled') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetIdleTimer));
    
    resetIdleTimer();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      events.forEach(event => window.removeEventListener(event, resetIdleTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsIdle(false);
    setShowGame(false);
    setShowWelcomeBack(true);
    setTimeout(() => setShowWelcomeBack(false), 3000);
    resetIdleTimer();
  };

  const handleCoffeeAction = () => {
    setShowGame(true);
  };

  const toggleFullScreen = () => {
    const element = document.documentElement;
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  useEffect(() => {
    if (showGame && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, [showGame]);

  return (
    <>
      <AnimatePresence>
        {isIdle && !showGame && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-8 right-8 z-[100] cursor-pointer group"
            onClick={handleCoffeeAction}
            onMouseEnter={handleCoffeeAction}
          >
            <div className="relative">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 whitespace-nowrap font-bold text-sm animate-bounce">
                Hora do café! ☕
              </div>
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-full shadow-2xl border-4 border-indigo-500 relative overflow-hidden">
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Coffee className="h-12 w-12 text-indigo-500" />
                </motion.div>
                {/* Steam animation */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        y: [0, -20],
                        opacity: [0, 0.5, 0],
                        x: [0, i % 2 === 0 ? 5 : -5]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: i * 0.4,
                        ease: "easeOut"
                      }}
                      className="w-1 h-4 bg-zinc-400/30 rounded-full blur-[1px]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="max-w-4xl w-full bg-zinc-900 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative">
              <button 
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white z-20 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="grid md:grid-cols-2 h-full">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
                    <Trophy className="h-3 w-3" /> Pausa Estratégica: {gameType === 'chess' ? 'Xadrez' : gameType === 'cards' ? 'Cartas' : 'Dominó'}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    Um momento para <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">sua mente.</span>
                  </h2>
                  <p className="text-zinc-400 text-lg mb-8">
                    Grandes ideias surgem nos momentos de descanso. Aproveite sua pausa para visualizar seu próximo movimento.
                  </p>
                  <Button onClick={handleClose} className="w-fit bg-white text-black hover:bg-zinc-200 rounded-2xl h-14 px-8 text-lg font-bold group">
                    Voltar ao Trabalho
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                <div className="bg-zinc-800/50 p-8 flex items-center justify-center relative overflow-hidden">
                  <button 
                    onClick={toggleFullScreen}
                    className="absolute top-6 left-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white z-20 transition-colors"
                    title="Alternar Tela Cheia"
                  >
                    {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                  </button>

                  <div className="w-full h-full flex items-center justify-center">
                    {gameType === 'chess' && (
                      <div className="text-white text-center">
                        <div className="text-9xl">♟</div>
                        <p className="mt-4 text-xl">Jogo de Xadrez em desenvolvimento...</p>
                      </div>
                    )}
                    {gameType === 'cards' && <MemoryGame />}
                    {gameType === 'tictactoe' && <TicTacToe />}
                    {gameType === 'dominoes' && <DominoesGame />}
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]"></div>
                  <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWelcomeBack && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[120] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold text-lg flex items-center gap-3 border border-emerald-400/50"
          >
            <div className="bg-white/20 p-2 rounded-full">
              <Rocket className="h-5 w-5" />
            </div>
            Bom trabalho de volta! 🚀
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Button = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => (
  <button 
    onClick={onClick}
    className={`inline-flex items-center justify-center transition-all active:scale-95 ${className}`}
  >
    {children}
  </button>
);

const Rocket = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
    <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
  </svg>
);
