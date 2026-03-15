import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const CARD_SYMBOLS = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍒', '🍍', '🥝'];

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledCards = [...CARD_SYMBOLS, ...CARD_SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setIsWon(false);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlippedCards;
      
      if (cards[firstId].symbol === cards[secondId].symbol) {
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstId].isMatched = true;
          matchedCards[secondId].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          
          if (matchedCards.every(card => card.isMatched)) {
            setIsWon(true);
          }
        }, 600);
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstId].isFlipped = false;
          resetCards[secondId].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-4">
      <div className="flex justify-between w-full text-white font-bold">
        <span>Movimentos: {moves}</span>
        <button onClick={initializeGame} className="text-indigo-400 hover:text-indigo-300 transition-colors">Reiniciar</button>
      </div>

      <div className="grid grid-cols-4 gap-3 w-full aspect-square">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(card.id)}
            className={`relative aspect-square cursor-pointer rounded-xl transition-all duration-500 preserve-3d ${
              card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
            }`}
          >
            <div className={`absolute inset-0 w-full h-full backface-hidden rounded-xl border-2 border-white/10 bg-zinc-800 flex items-center justify-center text-3xl`}>
              ❓
            </div>
            <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl border-2 border-indigo-500/50 bg-indigo-500/10 flex items-center justify-center text-4xl ${
              card.isMatched ? 'opacity-50' : ''
            }`}>
              {card.symbol}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isWon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold text-emerald-400 mb-2">Parabéns! 🎉</h3>
            <p className="text-zinc-400">Você completou em {moves} movimentos.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
