import React, { useState } from 'react';
import { motion } from 'motion/react';

type Player = 'X' | 'O' | null;

export const TicTacToe = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | 'Draw'>(null);

  const calculateWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(square => square !== null)) return 'Draw';
    return null;
  };

  const handleClick = (i: number) => {
    if (winner || board[i]) return;

    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) setWinner(gameWinner);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-4">
      <div className="flex justify-between w-full text-white font-bold mb-4">
        <span className={winner ? 'text-emerald-400' : ''}>
          {winner === 'Draw' ? 'Empate!' : winner ? `Vencedor: ${winner}` : `Vez de: ${isXNext ? 'X' : 'O'}`}
        </span>
        <button onClick={resetGame} className="text-indigo-400 hover:text-indigo-300 transition-colors">Reiniciar</button>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full aspect-square">
        {board.map((square, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleClick(i)}
            className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-5xl font-bold transition-all ${
              square === 'X' ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5' : 
              square === 'O' ? 'text-purple-400 border-purple-500/30 bg-purple-500/5' : 
              'text-transparent border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            {square}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
