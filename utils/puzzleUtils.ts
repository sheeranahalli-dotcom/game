import { Tile } from '../types';

// Helper to load an image object from a URL
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Allow parsing external images if headers permit
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

// Slices an image into grid * grid pieces
export const sliceImage = async (
  imageSrc: string,
  gridSize: number
): Promise<string[]> => {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // We want to work with a square aspect ratio.
  const size = Math.min(img.width, img.height);
  const offsetX = (img.width - size) / 2;
  const offsetY = (img.height - size) / 2;

  // Set tile size (try to keep resolution high)
  const tileSize = Math.floor(size / gridSize);
  
  // We'll scale it down/up to a reasonable texture size per tile (e.g., 256px)
  // to avoid massive memory usage if the source is 4k, but keep it crisp.
  const targetTileSize = Math.min(512, tileSize); 

  canvas.width = targetTileSize;
  canvas.height = targetTileSize;

  const pieces: string[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Clear canvas
      ctx.clearRect(0, 0, targetTileSize, targetTileSize);
      
      // Draw the specific slice
      ctx.drawImage(
        img,
        offsetX + col * tileSize, // Source X
        offsetY + row * tileSize, // Source Y
        tileSize,                 // Source Width
        tileSize,                 // Source Height
        0,                        // Dest X
        0,                        // Dest Y
        targetTileSize,           // Dest Width
        targetTileSize            // Dest Height
      );
      
      pieces.push(canvas.toDataURL('image/jpeg', 0.9));
    }
  }

  return pieces;
};

// Generate initial solved state
export const generateSolvedState = (imagePieces: string[], gridSize: number): Tile[] => {
  const tiles: Tile[] = imagePieces.map((url, index) => ({
    id: index,
    currentPos: index,
    correctPos: index,
    imageUrl: url,
    isEmpty: index === (gridSize * gridSize - 1) // Last tile is empty by default
  }));
  return tiles;
};

// Check if puzzle is solvable (Standard Inversion Count method)
// However, a simpler way to ensure solvability is to start solved and simulate random moves.
export const shuffleTiles = (initialTiles: Tile[], gridSize: number, moves: number = 100): Tile[] => {
  let tiles = [...initialTiles];
  let emptyIdx = tiles.findIndex(t => t.isEmpty);
  let previousIdx = -1; // Prevent immediate backtracking for better shuffles

  for (let i = 0; i < moves; i++) {
    const validMoves: number[] = [];
    const row = Math.floor(emptyIdx / gridSize);
    const col = emptyIdx % gridSize;

    if (row > 0) validMoves.push(emptyIdx - gridSize); // Up
    if (row < gridSize - 1) validMoves.push(emptyIdx + gridSize); // Down
    if (col > 0) validMoves.push(emptyIdx - 1); // Left
    if (col < gridSize - 1) validMoves.push(emptyIdx + 1); // Right

    // Filter out the tile we just moved from to encourage mixing
    const filteredMoves = validMoves.filter(idx => idx !== previousIdx);
    const targetIdx = filteredMoves.length > 0 
      ? filteredMoves[Math.floor(Math.random() * filteredMoves.length)]
      : validMoves[Math.floor(Math.random() * validMoves.length)];

    // Swap
    const newTiles = [...tiles];
    // We swap the *contents* at the positions in the array
    // Actually, in our state structure, the array index is the position. 
    // Wait, typical react state for this: Array of Tiles where index is position? 
    // OR Array of Tiles where we map visual position?
    
    // Let's stick to: Array index = Current Position on Grid. 
    // We swap the objects at these indices.
    
    [newTiles[emptyIdx], newTiles[targetIdx]] = [newTiles[targetIdx], newTiles[emptyIdx]];
    
    // Update their internal currentPos tracker if we use it, 
    // though strictly array index is enough if we render by index.
    // Let's update internal state for consistency.
    newTiles[emptyIdx].currentPos = emptyIdx;
    newTiles[targetIdx].currentPos = targetIdx;

    previousIdx = emptyIdx;
    emptyIdx = targetIdx;
    tiles = newTiles;
  }

  return tiles;
};

export const isSolved = (tiles: Tile[]): boolean => {
  return tiles.every(tile => tile.currentPos === tile.correctPos);
};