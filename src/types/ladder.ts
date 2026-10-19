export interface Player {
  id: string;
  name: string;
  avatar: string; // emoji
  color: string;
}

export interface Prize {
  id: string;
  text: string;
  isPenalty?: boolean;
  color?: string;
}

export interface Rung {
  id: string;
  col: number; // left column index (0 to numCols - 2)
  row: number; // row index (0 to numRows - 1)
}

export interface LadderPathStep {
  col: number;
  row: number; // 0 (top) to numRows (bottom)
  isTurn?: boolean;
}

export interface PlayerResult {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  playerColor: string;
  startCol: number;
  endCol: number;
  prize: Prize;
  path: LadderPathStep[];
}

export type LadderDensity = 'easy' | 'normal' | 'crazy';

export interface PresetTheme {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: string;
  playerCount: number;
  defaultPlayers: { name: string; avatar: string }[];
  defaultPrizes: { text: string; isPenalty?: boolean }[];
  density: LadderDensity;
}

export type GameStage = 'setup' | 'playing' | 'completed';
