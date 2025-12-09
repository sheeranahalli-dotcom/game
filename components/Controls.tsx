import React from 'react';
import { Difficulty, GameState } from '../types';

interface ControlsProps {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  gameState: GameState;
  onShuffle: () => void;
  onSolve: () => void; // Actually "Give Up" or "Reset"
  moves: number;
  timeElapsed: number;
  showNumbers: boolean;
  setShowNumbers: (v: boolean) => void;
  previewImage: string | null;
}

const Controls: React.FC<ControlsProps> = ({
  difficulty,
  setDifficulty,
  gameState,
  onShuffle,
  onSolve,
  moves,
  timeElapsed,
  showNumbers,
  setShowNumbers,
  previewImage
}) => {
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto mt-6 p-4 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700">
      {/* Stats Row */}
      <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Moves</p>
          <p className="text-xl font-bold font-display text-cyan-400">{moves}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Time</p>
          <p className="text-xl font-bold font-display text-emerald-400">{formatTime(timeElapsed)}</p>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="flex justify-between items-center gap-2">
        <span className="text-slate-300 text-sm font-medium">Grid Size:</span>
        <div className="flex bg-slate-900 rounded-lg p-1">
          {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((d) => (
            <button
              key={d}
              onClick={() => gameState !== GameState.PLAYING && setDifficulty(d)}
              disabled={gameState === GameState.PLAYING}
              className={`
                px-3 py-1.5 text-xs font-bold rounded-md transition-all
                ${difficulty === d 
                  ? 'bg-cyan-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                ${gameState === GameState.PLAYING ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {d}x{d}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
       <div className="flex justify-between items-center">
        <label className="flex items-center space-x-2 cursor-pointer group">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={showNumbers} 
              onChange={(e) => setShowNumbers(e.target.checked)} 
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${showNumbers ? 'bg-cyan-600' : 'bg-slate-600'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showNumbers ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Show Numbers</span>
        </label>
        
        {previewImage && (
             <div className="group relative">
                <span className="text-sm text-cyan-400 cursor-help border-b border-dashed border-cyan-400">Peek Image</span>
                <div className="absolute bottom-full right-0 mb-2 w-48 p-1 bg-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <img src={previewImage} alt="Preview" className="w-full rounded-md" />
                </div>
             </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        {gameState === GameState.PLAYING ? (
           <button
           onClick={onSolve}
           className="col-span-2 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-lg hover:shadow-rose-500/20 transition-all active:translate-y-0.5"
         >
           Give Up & Reset
         </button>
        ) : (
          <button
          onClick={onShuffle}
          disabled={gameState === GameState.GENERATING || !previewImage}
          className={`
            col-span-2 py-3 font-bold rounded-lg shadow-lg transition-all active:translate-y-0.5
            ${!previewImage 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-500/20'}
          `}
        >
          Start Game
        </button>
        )}
      </div>
    </div>
  );
};

export default Controls;