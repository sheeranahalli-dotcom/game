import React from 'react';
import { Tile, Difficulty, GameState } from '../types';

interface BoardProps {
  tiles: Tile[];
  difficulty: Difficulty;
  gameState: GameState;
  onTileClick: (index: number) => void;
  showNumbers: boolean;
}

const Board: React.FC<BoardProps> = ({ tiles, difficulty, gameState, onTileClick, showNumbers }) => {
  // Dynamic grid template columns class
  const getGridClass = () => {
    switch (difficulty) {
      case Difficulty.EASY: return 'grid-cols-3';
      case Difficulty.MEDIUM: return 'grid-cols-4';
      case Difficulty.HARD: return 'grid-cols-5';
      default: return 'grid-cols-4';
    }
  };

  return (
    <div 
      className={`grid ${getGridClass()} gap-1 bg-slate-800 p-2 rounded-xl shadow-2xl border-4 border-slate-700 w-full max-w-md aspect-square mx-auto transition-all duration-300`}
    >
      {tiles.map((tile, index) => {
        // Correct position visualization (optional hints)
        const isCorrect = tile.correctPos === tile.currentPos;
        
        if (tile.isEmpty) {
          return (
            <div 
              key={`empty-${tile.id}`} 
              className="w-full h-full bg-slate-900/50 rounded-md inner-shadow"
            />
          );
        }

        return (
          <button
            key={tile.id}
            onClick={() => gameState === GameState.PLAYING && onTileClick(index)}
            disabled={gameState !== GameState.PLAYING}
            className={`
              relative w-full h-full overflow-hidden rounded-md cursor-pointer
              transition-transform duration-200 active:scale-95
              hover:brightness-110 hover:shadow-lg hover:z-10
              focus:outline-none focus:ring-2 focus:ring-cyan-400
              ${gameState === GameState.WON ? 'animate-pulse ring-2 ring-green-500' : ''}
              ${isCorrect && gameState === GameState.PLAYING ? 'ring-1 ring-green-500/30' : ''}
            `}
          >
            <img 
              src={tile.imageUrl} 
              alt={`Tile ${tile.id}`}
              className="w-full h-full object-cover pointer-events-none select-none"
            />
            {showNumbers && (
              <div className="absolute top-1 left-1 bg-black/60 text-white text-xs font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                {tile.correctPos + 1}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Board;