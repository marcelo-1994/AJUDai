import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Domino {
  id: number;
  sides: [number, number];
}

export const DominoesGame = () => {
  const [deck, setDeck] = useState<Domino[]>([]);
  const [board, setBoard] = useState<Domino[]>([]);
  const [hand, setHand] = useState<Domino[]>([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const allDominoes: Domino[] = [];
    let id = 0;
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        allDominoes.push({ id: id++, sides: [i, j] });
      }
    }
    
    const shuffled = allDominoes.sort(() => Math.random() - 0.5);
    const initialHand = shuffled.slice(0, 7);
    const remaining = shuffled.slice(7);
    const firstPiece = remaining.pop()!;
    
    setHand(initialHand);
    setDeck(remaining);
    setBoard([firstPiece]);
    setGameOver(false);
  };

  const canPlay = (domino: Domino) => {
    const leftEnd = board[0].sides[0];
    const rightEnd = board[board.length - 1].sides[1];
    return domino.sides.includes(leftEnd) || domino.sides.includes(rightEnd);
  };

  const playPiece = (domino: Domino, side: 'left' | 'right') => {
    const newBoard = [...board];
    const leftEnd = board[0].sides[0];
    const rightEnd = board[board.length - 1].sides[1];

    let pieceToPlay = { ...domino };

    if (side === 'left') {
      if (pieceToPlay.sides[1] === leftEnd) {
        newBoard.unshift(pieceToPlay);
      } else if (pieceToPlay.sides[0] === leftEnd) {
        pieceToPlay.sides = [pieceToPlay.sides[1], pieceToPlay.sides[0]];
        newBoard.unshift(pieceToPlay);
      } else return;
    } else {
      if (pieceToPlay.sides[0] === rightEnd) {
        newBoard.push(pieceToPlay);
      } else if (pieceToPlay.sides[1] === rightEnd) {
        pieceToPlay.sides = [pieceToPlay.sides[1], pieceToPlay.sides[0]];
        newBoard.push(pieceToPlay);
      } else return;
    }

    setBoard(newBoard);
    setHand(hand.filter(h => h.id !== domino.id));
    
    if (hand.length === 1) {
      setGameOver(true);
    }
  };

  const drawPiece = () => {
    if (deck.length === 0) return;
    const newDeck = [...deck];
    const piece = newDeck.pop()!;
    setHand([...hand, piece]);
    setDeck(newDeck);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto p-4 h-full justify-center">
      <div className="flex justify-between w-full text-white font-bold">
        <span>Peças no monte: {deck.length}</span>
        <button onClick={initializeGame} className="text-indigo-400 hover:text-indigo-300 transition-colors">Reiniciar</button>
      </div>

      {/* Board */}
      <div className="w-full overflow-x-auto py-8 flex items-center justify-center min-h-[120px] bg-white/5 rounded-3xl border border-white/10">
        <div className="flex gap-1 px-4">
          {board.map((domino, i) => (
            <div key={domino.id} className="flex flex-col w-8 h-16 bg-white rounded-md border border-zinc-300 shrink-0 overflow-hidden shadow-lg">
              <div className="flex-1 flex items-center justify-center text-black font-bold border-b border-zinc-200">{domino.sides[0]}</div>
              <div className="flex-1 flex items-center justify-center text-black font-bold">{domino.sides[1]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hand */}
      <div className="flex flex-col items-center gap-4 w-full">
        <h3 className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Sua Mão</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {hand.map((domino) => {
            const playable = canPlay(domino);
            return (
              <div key={domino.id} className="group relative">
                <motion.div
                  whileHover={playable ? { y: -10, scale: 1.05 } : {}}
                  className={`flex flex-col w-10 h-20 bg-white rounded-lg border-2 transition-all ${
                    playable ? 'border-indigo-500 cursor-pointer shadow-indigo-500/20 shadow-xl' : 'border-transparent opacity-60 grayscale'
                  }`}
                >
                  <div className="flex-1 flex items-center justify-center text-black text-xl font-bold border-b border-zinc-200">{domino.sides[0]}</div>
                  <div className="flex-1 flex items-center justify-center text-black text-xl font-bold">{domino.sides[1]}</div>
                </motion.div>
                
                {playable && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex gap-2">
                    <button onClick={() => playPiece(domino, 'left')} className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-md font-bold">ESQ</button>
                    <button onClick={() => playPiece(domino, 'right')} className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-md font-bold">DIR</button>
                  </div>
                )}
              </div>
            );
          })}
          {hand.length < 10 && deck.length > 0 && (
            <button 
              onClick={drawPiece}
              className="w-10 h-20 bg-white/5 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center text-white/40 hover:border-white/40 hover:text-white/60 transition-all"
            >
              +
            </button>
          )}
        </div>
      </div>

      {gameOver && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <h3 className="text-2xl font-bold text-emerald-400">Você Venceu! 🏆</h3>
        </motion.div>
      )}
    </div>
  );
};
