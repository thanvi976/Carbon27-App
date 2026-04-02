import type { Lane } from '../../types/game';

export const LANES: Lane[] = ['left', 'center', 'right'];
export const ORB_SPAWN_MS = 1500;
export const OBSTACLE_SPAWN_MS = 2000;
export const POWER_UP_SPAWN_MS = 8000;

export type SpawnEngineState = {
  nextOrbAt: number;
  nextObstacleAt: number;
  nextPowerUpAt: number;
  rngState: number;
  laneCursor: number;
};

export function createSpawnEngine(startAt: number, seed: number): SpawnEngineState {
  return {
    nextOrbAt: startAt + ORB_SPAWN_MS,
    nextObstacleAt: startAt + OBSTACLE_SPAWN_MS,
    nextPowerUpAt: startAt + POWER_UP_SPAWN_MS,
    rngState: seed >>> 0,
    laneCursor: 0,
  };
}

function nextRand(state: SpawnEngineState): number {
  state.rngState = (1664525 * state.rngState + 1013904223) >>> 0;
  return state.rngState / 4294967296;
}

function laneFromIndex(index: number): Lane {
  return LANES[((index % LANES.length) + LANES.length) % LANES.length];
}

export function dueSpawns(state: SpawnEngineState, now: number): { orb: boolean; obstacle: boolean } {
  const orb = now >= state.nextOrbAt;
  const obstacle = now >= state.nextObstacleAt;
  if (orb) {
    state.nextOrbAt += ORB_SPAWN_MS;
  }
  if (obstacle) {
    state.nextObstacleAt += OBSTACLE_SPAWN_MS;
  }
  return { orb, obstacle };
}

export function duePowerUp(state: SpawnEngineState, now: number): boolean {
  if (now < state.nextPowerUpAt) return false;
  state.nextPowerUpAt += POWER_UP_SPAWN_MS;
  return true;
}

/**
 * Deterministic-fair lane selection:
 * - advances through lanes in a cycle
 * - applies a small seeded random offset
 * - avoids blocked lane when requested
 */
export function pickSpawnLane(state: SpawnEngineState, blockedLane?: Lane): Lane {
  const base = state.laneCursor;
  state.laneCursor = (state.laneCursor + 1) % LANES.length;
  const offset = Math.floor(nextRand(state) * LANES.length);

  for (let i = 0; i < LANES.length; i += 1) {
    const lane = laneFromIndex(base + offset + i);
    if (!blockedLane || lane !== blockedLane) {
      return lane;
    }
  }
  return 'center';
}

export function laneIndex(lane: Lane): number {
  return lane === 'left' ? 0 : lane === 'center' ? 1 : 2;
}

export function intersectsVertically(
  entityY: number,
  entityHeight: number,
  targetTop: number,
  targetBottom: number
): boolean {
  const entityBottom = entityY + entityHeight;
  return entityBottom >= targetTop && entityY <= targetBottom;
}
