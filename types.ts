export interface Tile {
  id: number;
  currentPos: number; // 0 to (size*size - 1)
  correctPos: number; // 0 to (size*size - 1)
  imageUrl: string;
  isEmpty: boolean;
}

export enum GameState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  PLAYING = 'PLAYING',
  WON = 'WON'
}

export enum Difficulty {
  EASY = 3,   // 3x3
  MEDIUM = 4, // 4x4
  HARD = 5    // 5x5
}

export interface PuzzleConfig {
  difficulty: Difficulty;
  imageSrc: string | null;
  moves: number;
  timeElapsed: number;
}