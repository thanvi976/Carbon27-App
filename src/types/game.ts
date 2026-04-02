export type Lane = 'left' | 'center' | 'right';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export type Orb = {
  id: string;
  lane: Lane;
  y: number;
};

export type Obstacle = {
  id: string;
  lane: Lane;
  y: number;
};

export type GameState = {
  status: GameStatus;
  score: number;
  health: number;
  speed: number;
  orbs: Orb[];
  obstacles: Obstacle[];
  playerLane: Lane;
};
