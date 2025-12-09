import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tile, Difficulty, GameState } from './types';
import { generatePuzzleImage } from './services/geminiService';
import { sliceImage, generateSolvedState, shuffleTiles, isSolved } from './utils/puzzleUtils';
import Board from './components/Board';
import Controls from './components/Controls';
import { SparklesIcon, PhotoIcon } from '@heroicons/react/24/solid';

// Default placeholder if generation fails or initial load
const DEFAULT_IMAGE = "https://picsum.photos/800/800";

const App: React.FC = () => {
  // State
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [showNumbers, setShowNumbers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Board with a default or current image
  const initializeBoard = useCallback(async (imgSrc: string) => {
    try {
      const pieces = await sliceImage(imgSrc, difficulty);
      const initialTiles = generateSolvedState(pieces, difficulty);
      setTiles(initialTiles);
      setCurrentImage(imgSrc);
      setGameState(GameState.IDLE);
      setMoves(0);
      setTimeElapsed(0);
      if (timerRef.current) window.clearInterval(timerRef.current);
    } catch (err) {
      console.error(err);
      setError("Failed to load image onto board.");
    }
  }, [difficulty]);

  // Initial Load
  useEffect(() => {
    // Only load default if no image is set yet
    if (!currentImage) {
      initializeBoard(DEFAULT_IMAGE);
    } else {
        // Re-slice if difficulty changes
        initializeBoard(currentImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]); // Don't add currentImage to deps to avoid loops

  // Timer Logic
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      timerRef.current = window.setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Game Logic: Move Tile
  const handleTileClick = (index: number) => {
    if (gameState !== GameState.PLAYING) return;

    const emptyIndex = tiles.findIndex(t => t.isEmpty);
    const gridSize = difficulty;
    
    // Check adjacency
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;

    const isAdjacent = 
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newTiles = [...tiles];
      // Swap logic for the array
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      
      // Update position tracking
      newTiles[index].currentPos = index;
      newTiles[emptyIndex].currentPos = emptyIndex;

      setTiles(newTiles);
      setMoves(m => m + 1);

      if (isSolved(newTiles)) {
        setGameState(GameState.WON);
      }
    }
  };

  const handleStartGame = () => {
    const shuffled = shuffleTiles(tiles, difficulty, difficulty * 20); // More moves for harder diff
    setTiles(shuffled);
    setGameState(GameState.PLAYING);
    setMoves(0);
    setTimeElapsed(0);
  };

  const handleReset = () => {
    if (currentImage) {
      initializeBoard(currentImage);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    
    setGameState(GameState.GENERATING);
    setError(null);
    try {
      const base64Image = await generatePuzzleImage(prompt);
      await initializeBoard(base64Image);
      // Determine difficulty based on keywords (easter egg feature)
      if (prompt.toLowerCase().includes("hard")) setDifficulty(Difficulty.HARD);
    } catch (err) {
      setError("Failed to generate image. Try a simpler prompt or check API key.");
      setGameState(GameState.IDLE);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          initializeBoard(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pb-20 md:p-8 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-2xl flex flex-col items-center mb-8 space-y-2">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-display tracking-tight text-center">
          NEURO SNAP
        </h1>
        <p className="text-slate-400 text-sm md:text-base text-center max-w-md">
          Generate. Shuffle. Solve. Powered by Gemini.
        </p>
      </header>

      {/* Main Grid Layout */}
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Game Board */}
        <div className="flex flex-col items-center order-2 lg:order-1 w-full">
            <div className="relative group w-full flex justify-center">
                <Board 
                    tiles={tiles} 
                    difficulty={difficulty} 
                    gameState={gameState} 
                    onTileClick={handleTileClick}
                    showNumbers={showNumbers}
                />
                
                {/* Overlay for Win State */}
                {gameState === GameState.WON && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl animate-in fade-in duration-500 max-w-md mx-auto aspect-square">
                        <h2 className="text-5xl font-display font-bold text-yellow-400 drop-shadow-lg mb-2 animate-bounce">SOLVED!</h2>
                        <p className="text-white text-lg">Moves: {moves} | Time: {timeElapsed}s</p>
                        <button 
                            onClick={handleStartGame}
                            className="mt-6 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-full transition-all hover:scale-105"
                        >
                            Play Again
                        </button>
                    </div>
                )}

                {/* Overlay for Generating State */}
                {gameState === GameState.GENERATING && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 rounded-xl max-w-md mx-auto aspect-square">
                        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-cyan-400 font-display animate-pulse">Dreaming up a puzzle...</p>
                    </div>
                )}
            </div>

            <Controls 
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                gameState={gameState}
                onShuffle={handleStartGame}
                onSolve={handleReset}
                moves={moves}
                timeElapsed={timeElapsed}
                showNumbers={showNumbers}
                setShowNumbers={setShowNumbers}
                previewImage={currentImage}
            />
        </div>

        {/* Right Column: Generation & Settings */}
        <div className="flex flex-col gap-6 order-1 lg:order-2 w-full max-w-md mx-auto">
            
            {/* Generator Card */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                <div className="flex items-center gap-2 mb-4 text-cyan-400">
                    <SparklesIcon className="w-6 h-6" />
                    <h2 className="text-xl font-bold font-display">AI Image Generator</h2>
                </div>
                
                <div className="space-y-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe an image... e.g., 'Cyberpunk city with neon lights' or 'A cute cat astronaut'"
                        className="w-full h-24 bg-slate-900 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none transition-all placeholder:text-slate-600"
                        disabled={gameState === GameState.PLAYING || gameState === GameState.GENERATING}
                    />
                    
                    <button
                        onClick={handleGenerateImage}
                        disabled={!prompt.trim() || gameState === GameState.GENERATING || gameState === GameState.PLAYING}
                        className={`
                            w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                            ${!prompt.trim() || gameState === GameState.PLAYING
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/25'}
                        `}
                    >
                        {gameState === GameState.GENERATING ? 'Generating...' : 'Generate New Puzzle'}
                    </button>
                    {error && <p className="text-rose-400 text-sm mt-2 text-center">{error}</p>}
                </div>
            </div>

            {/* Separator */}
            <div className="flex items-center gap-4">
                <div className="h-px bg-slate-700 flex-1"></div>
                <span className="text-slate-500 text-xs uppercase tracking-widest">OR</span>
                <div className="h-px bg-slate-700 flex-1"></div>
            </div>

            {/* Upload Card */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                 <div className="flex items-center gap-2 mb-4 text-purple-400">
                    <PhotoIcon className="w-6 h-6" />
                    <h2 className="text-xl font-bold font-display">Upload Image</h2>
                </div>
                
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                />
                <button
                     onClick={() => fileInputRef.current?.click()}
                     disabled={gameState === GameState.PLAYING}
                     className="w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-purple-500 hover:bg-slate-700/50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Click to Upload File
                </button>
            </div>
            
            {/* Info Panel */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 text-sm text-slate-400">
                <p>
                    <strong className="text-slate-200">Tip:</strong> Use the "Show Numbers" toggle if you get stuck. 
                    The AI generates square (1:1) images. If you upload a non-square image, it will be cropped to the center.
                </p>
            </div>

        </div>
      </main>
    </div>
  );
};

export default App;