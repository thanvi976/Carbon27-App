import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import type { GameStatus, Lane } from '../../types/game';
import {
  createSpawnEngine,
  duePowerUp,
  dueSpawns,
  intersectsVertically,
  laneIndex,
  pickSpawnLane,
  type SpawnEngineState,
} from '../../utils/game/runnerEngine';

let HapticsModule: any = null;
try {
  HapticsModule = require('expo-haptics');
} catch {
  HapticsModule = null;
}

const MAX_ORBS = 12;
const MAX_OBSTACLES = 10;
const PLAYER_SIZE = 64;
const PLAYER_BOTTOM_OFFSET = 124;
const ORB_SIZE = 30;
const OBSTACLE_WIDTH = 46;
const OBSTACLE_HEIGHT = 56;
const INITIAL_HEALTH = 3;
const INITIAL_SPEED = 4.2;
const SURVIVAL_TICK_MS = 1000;
const INVULN_MS = 1500;
const BEST_SCORE_KEY = 'carbon_runner_best';
const PLAYER_RENDER_SIZE = 50;
const ORB_RENDER_SIZE = 24;
const ORB_GLOW_PADDING = 6;
const OBSTACLE_RENDER_WIDTH = 62;
const OBSTACLE_RENDER_HEIGHT = 46;
const MAX_PARTICLE_SLOTS = 4;
const MAX_POWER_UP_SLOTS = 3;
const POWER_UP_SIZE = 42;

type PowerUpType = 'shield' | 'magnet' | 'slow';
type ObstacleType = 'cloud' | 'factory' | 'car';

type EntitySlot = {
  id: string | null;
  lane: Lane;
  y: number;
  x: number;
  active: boolean;
  xAnim: Animated.Value;
  yAnim: Animated.Value;
  opacity: Animated.Value;
  type?: PowerUpType;
  obstacleType?: ObstacleType;
};

type ParticleSlot = {
  active: boolean;
  baseX: Animated.Value;
  baseY: Animated.Value;
  dx: Animated.Value;
  dy: Animated.Value;
  opacity: Animated.Value;
};

function createSlots(count: number): EntitySlot[] {
  return Array.from({ length: count }, () => ({
    id: null,
    lane: 'center',
    y: -1000,
    x: 0,
    active: false,
    xAnim: new Animated.Value(0),
    yAnim: new Animated.Value(-1000),
    opacity: new Animated.Value(0),
  }));
}

function createParticleSlots(count: number): ParticleSlot[] {
  return Array.from({ length: count }, () => ({
    active: false,
    baseX: new Animated.Value(-1000),
    baseY: new Animated.Value(-1000),
    dx: new Animated.Value(0),
    dy: new Animated.Value(0),
    opacity: new Animated.Value(0),
  }));
}

function laneFromIndex(index: number): Lane {
  return index <= 0 ? 'left' : index >= 2 ? 'right' : 'center';
}

function obstacleConfig(type: ObstacleType) {
  if (type === 'factory') {
    return { emoji: '🏭', bg: '#2A1A1A', border: '#8B4A3A', width: 58, height: 64, speedMul: 1 };
  }
  if (type === 'car') {
    return { emoji: '🚗', bg: '#1A1A2A', border: '#4A4A8A', width: 54, height: 54, speedMul: 1.5 };
  }
  return { emoji: '☁️', bg: '#3A2A2A', border: COLORS.error, width: 64, height: 48, speedMul: 1 };
}

export function CarbonRunnerScreen() {
  const navigation = useNavigation();
  const [status, setStatus] = useState<GameStatus>('idle');
  const statusRef = useRef<GameStatus>('idle');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(INITIAL_HEALTH);
  const [bestScore, setBestScore] = useState(0);
  const [layoutReady, setLayoutReady] = useState(false);
  const [speedTier, setSpeedTier] = useState('CITY PACE');
  const [survivalTimeState, setSurvivalTimeState] = useState(0);
  const [comboLabel, setComboLabel] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [magnetActive, setMagnetActive] = useState(false);
  const [slowActive, setSlowActive] = useState(false);

  const scoreRef = useRef(0);
  const healthRef = useRef(INITIAL_HEALTH);
  const speedRef = useRef(INITIAL_SPEED);
  const playerLaneRef = useRef<Lane>('center');
  const rafRef = useRef<number | null>(null);
  const lastFrameTsRef = useRef<number | null>(null);
  const survivalTimeRef = useRef(0);
  const survivalClockRef = useRef(0);
  const orbsCollectedRef = useRef(0);
  const invulnerableUntilRef = useRef(0);
  const entityIdRef = useRef(1);
  const spawnEngineRef = useRef<SpawnEngineState | null>(null);
  const widthRef = useRef(0);
  const heightRef = useRef(0);
  const laneCentersRef = useRef<[number, number, number]>([0, 0, 0]);
  const shieldActiveRef = useRef(false);
  const magnetActiveRef = useRef(false);
  const magnetUntilRef = useRef(0);
  const slowActiveRef = useRef(false);
  const slowUntilRef = useRef(0);
  const savedSpeedRef = useRef(0);

  const playerXAnim = useRef(new Animated.Value(0)).current;
  const redFlash = useRef(new Animated.Value(0)).current;
  const goldFlash = useRef(new Animated.Value(0)).current;
  const whiteFlash = useRef(new Animated.Value(0)).current;
  const magnetToastOpacity = useRef(new Animated.Value(0)).current;
  const startBlink = useRef(new Animated.Value(1)).current;
  const comboRef = useRef(0);
  const comboOpacity = useRef(new Animated.Value(0)).current;
  const scoreScale = useRef(new Animated.Value(1)).current;
  const newBestScale = useRef(new Animated.Value(0.8)).current;

  const orbSlotsRef = useRef<EntitySlot[]>(createSlots(MAX_ORBS));
  const orbXRef = useRef<number[]>(Array(MAX_ORBS).fill(0));
  const obstacleSlotsRef = useRef<EntitySlot[]>(createSlots(MAX_OBSTACLES));
  const powerUpSlotsRef = useRef<EntitySlot[]>(createSlots(MAX_POWER_UP_SLOTS));
  const particleSlotsRef = useRef<ParticleSlot[]>(createParticleSlots(MAX_PARTICLE_SLOTS));

  const playerTop = useMemo(() => heightRef.current - PLAYER_BOTTOM_OFFSET - PLAYER_SIZE, [layoutReady]);
  const playerBottom = useMemo(() => playerTop + PLAYER_SIZE, [playerTop]);

  const laneCenterX = useCallback((lane: Lane): number => {
    const centers = laneCentersRef.current;
    return centers[laneIndex(lane)];
  }, []);

  const triggerFlash = useCallback((flash: Animated.Value) => {
    flash.stopAnimation();
    flash.setValue(0.55);
    Animated.timing(flash, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const safeHaptic = useCallback(async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch {
      // no-op on unsupported runtimes
    }
  }, []);

  const clearSlots = useCallback((slots: EntitySlot[]) => {
    for (const slot of slots) {
      slot.active = false;
      slot.id = null;
      slot.y = -1000;
      slot.x = 0;
      slot.opacity.setValue(0);
      slot.yAnim.setValue(-1000);
    }
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastFrameTsRef.current = null;
  }, []);

  const syncPlayerLane = useCallback(
    (lane: Lane) => {
      playerLaneRef.current = lane;
      const targetX = laneCenterX(lane) - PLAYER_SIZE / 2;
      Animated.timing(playerXAnim, {
        toValue: targetX,
        duration: 110,
        useNativeDriver: true,
      }).start();
    },
    [laneCenterX, playerXAnim]
  );

  const resetGame = useCallback(() => {
    scoreRef.current = 0;
    healthRef.current = INITIAL_HEALTH;
    speedRef.current = INITIAL_SPEED;
    survivalTimeRef.current = 0;
    survivalClockRef.current = 0;
    orbsCollectedRef.current = 0;
    invulnerableUntilRef.current = 0;
    entityIdRef.current = 1;
    setScore(0);
    setSurvivalTimeState(0);
    setSpeedTier('CITY PACE');
    setHealth(INITIAL_HEALTH);
    setShowExitConfirm(false);
    setIsNewBest(false);
    comboRef.current = 0;
    comboOpacity.setValue(0);
    setComboLabel('');
    clearSlots(orbSlotsRef.current);
    clearSlots(obstacleSlotsRef.current);
    clearSlots(powerUpSlotsRef.current);
    shieldActiveRef.current = false;
    magnetActiveRef.current = false;
    magnetUntilRef.current = 0;
    slowActiveRef.current = false;
    slowUntilRef.current = 0;
    savedSpeedRef.current = 0;
    setShieldActive(false);
    setMagnetActive(false);
    setSlowActive(false);
    magnetToastOpacity.setValue(0);
    for (let i = 0; i < orbSlotsRef.current.length; i += 1) {
      const slot = orbSlotsRef.current[i];
      const laneX = laneCenterX(slot.lane);
      slot.x = laneX;
      slot.xAnim.setValue(laneX);
      orbXRef.current[i] = laneX;
    }
    syncPlayerLane('center');
    spawnEngineRef.current = createSpawnEngine(Date.now(), Date.now());
  }, [clearSlots, laneCenterX, magnetToastOpacity, syncPlayerLane]);

  const spawnInSlot = useCallback((slots: EntitySlot[], lane: Lane, type?: PowerUpType) => {
    const slot = slots.find((s) => !s.active);
    if (!slot) return;
    slot.active = true;
    slot.id = `e-${entityIdRef.current++}`;
    slot.lane = lane;
    slot.y = -80;
    slot.x = laneCenterX(lane);
    slot.xAnim.setValue(slot.x);
    slot.yAnim.setValue(slot.y);
    slot.opacity.setValue(1);
    slot.type = type;
    if (!type) {
      slot.obstacleType = 'cloud';
    }
  }, [laneCenterX]);

  const pickObstacleType = useCallback((orbCount: number): ObstacleType => {
    if (orbCount >= 20 && orbCount % 20 === 0) return 'factory';
    if (orbCount >= 15 && orbCount % 15 === 0) return 'car';
    if (orbCount < 10) return 'cloud';
    if (orbCount < 20) return Math.random() < 0.7 ? 'cloud' : 'factory';
    const r = Math.random();
    if (r < 0.5) return 'cloud';
    if (r < 0.8) return 'factory';
    return 'car';
  }, []);

  const processEntities = useCallback(
    (
      slots: EntitySlot[],
      sizeW: number,
      sizeH: number,
      now: number,
      onHit: (slot: EntitySlot) => void,
      matchAllLanes = false
    ) => {
      const moveScale = 1;
      for (const slot of slots) {
        if (!slot.active) continue;
        slot.y += speedRef.current * moveScale;
        slot.yAnim.setValue(slot.y);

        if (slot.y > heightRef.current + 120) {
          slot.active = false;
          slot.id = null;
          slot.opacity.setValue(0);
          continue;
        }

        const sameLane = matchAllLanes || slot.lane === playerLaneRef.current;
        if (!sameLane) continue;
        const entityLeft = laneCenterX(slot.lane) - sizeW / 2;
        const playerLeft = laneCenterX(playerLaneRef.current) - PLAYER_SIZE / 2;
        const horizontalOverlap = matchAllLanes || Math.abs(entityLeft - playerLeft) <= 40;
        const verticalOverlap = intersectsVertically(slot.y, sizeH, playerTop, playerBottom);
        if (horizontalOverlap && verticalOverlap) {
          onHit(slot);
        }
      }
      if (now >= invulnerableUntilRef.current) {
        invulnerableUntilRef.current = 0;
      }
    },
    [laneCenterX, playerBottom, playerTop]
  );

  const updateBestScore = useCallback(async (currentScore: number) => {
    try {
      const stored = await AsyncStorage.getItem(BEST_SCORE_KEY);
      const existing = stored ? Number(stored) || 0 : 0;
      const nextBest = currentScore > existing ? currentScore : existing;
      const didBeatBest = currentScore > existing;
      if (nextBest !== existing) {
        await AsyncStorage.setItem(BEST_SCORE_KEY, String(nextBest));
      }
      setBestScore(nextBest);
      setIsNewBest(didBeatBest);
      if (didBeatBest) {
        newBestScale.setValue(0.8);
        Animated.timing(newBestScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
        void safeHaptic(() =>
          HapticsModule?.notificationAsync?.(HapticsModule.NotificationFeedbackType.Success) ?? Promise.resolve()
        );
      }
    } catch {
      setBestScore(currentScore);
    }
  }, [newBestScale, safeHaptic]);

  const popScore = useCallback(() => {
    scoreScale.stopAnimation();
    scoreScale.setValue(1);
    Animated.sequence([
      Animated.timing(scoreScale, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.timing(scoreScale, { toValue: 1, duration: 130, useNativeDriver: true }),
    ]).start();
  }, [scoreScale]);

  const speedFromOrbCount = useCallback((orbCount: number): { speed: number; tier: string } => {
    if (orbCount <= 5) return { speed: 4.2, tier: 'CITY PACE' };
    if (orbCount <= 15) return { speed: 5.5, tier: 'RUSH HOUR' };
    if (orbCount <= 30) return { speed: 7.0, tier: 'STORM WARNING' };
    return { speed: 9.0, tier: 'CRITICAL ZONE' };
  }, []);

  const applyTierSpeed = useCallback(() => {
    const { speed, tier } = speedFromOrbCount(orbsCollectedRef.current);
    setSpeedTier(tier);
    if (slowActiveRef.current) {
      savedSpeedRef.current = speed;
      speedRef.current = speed * 0.5;
    } else {
      savedSpeedRef.current = speed;
      speedRef.current = speed;
    }
  }, [speedFromOrbCount]);

  const showCombo = useCallback((comboCount: number) => {
    if (comboCount < 2) {
      setComboLabel('');
      comboOpacity.setValue(0);
      return;
    }
    setComboLabel(`x${comboCount} COMBO`);
    comboOpacity.stopAnimation();
    comboOpacity.setValue(1);
    Animated.timing(comboOpacity, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [comboOpacity]);

  const playOrbBurst = useCallback((x: number, y: number) => {
    const slot = particleSlotsRef.current.find((p) => !p.active);
    if (!slot) return;
    slot.active = true;
    slot.baseX.setValue(x);
    slot.baseY.setValue(y);
    slot.dx.setValue(0);
    slot.dy.setValue(0);
    slot.opacity.setValue(1);
    const vectors = [
      { x: -18, y: -18 },
      { x: 18, y: -18 },
      { x: -18, y: 18 },
      { x: 18, y: 18 },
    ];
    const vector = vectors[Math.floor(Math.random() * vectors.length)];
    Animated.parallel([
      Animated.timing(slot.dx, { toValue: vector.x, duration: 400, useNativeDriver: true }),
      Animated.timing(slot.dy, { toValue: vector.y, duration: 400, useNativeDriver: true }),
      Animated.timing(slot.opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      slot.active = false;
      slot.baseX.setValue(-1000);
      slot.baseY.setValue(-1000);
    });
  }, []);

  const endGame = useCallback(() => {
    stopLoop();
    statusRef.current = 'gameover';
    setStatus('gameover');
    void updateBestScore(scoreRef.current);
  }, [stopLoop, updateBestScore]);

  const frame = useCallback(
    (ts: number) => {
      if (statusRef.current !== 'playing') return;
      const last = lastFrameTsRef.current ?? ts;
      const dt = Math.min(34, ts - last);
      lastFrameTsRef.current = ts;
      const frameScale = dt / 16.6667;
      const now = Date.now();

      if (magnetActiveRef.current && now >= magnetUntilRef.current) {
        magnetActiveRef.current = false;
        setMagnetActive(false);
      }
      if (slowActiveRef.current && now >= slowUntilRef.current) {
        slowActiveRef.current = false;
        setSlowActive(false);
        applyTierSpeed();
      }
      speedRef.current += 0;

      const collectOrb = (slot: EntitySlot) => {
        const burstX = slot.x - 2;
        const burstY = slot.y + ORB_SIZE / 2 - 2;
        slot.active = false;
        slot.opacity.setValue(0);
        comboRef.current += 1;
        orbsCollectedRef.current += 1;
        applyTierSpeed();
        const gain = 10 * Math.min(5, Math.max(1, comboRef.current));
        scoreRef.current += gain;
        setScore(scoreRef.current);
        popScore();
        showCombo(comboRef.current);
        playOrbBurst(burstX, burstY);
        triggerFlash(goldFlash);
        void safeHaptic(() =>
          HapticsModule?.impactAsync?.(HapticsModule.ImpactFeedbackStyle.Light) ?? Promise.resolve()
        );
      };

      if (magnetActiveRef.current) {
        const targetX = laneCenterX(playerLaneRef.current);
        const targetY = playerTop;
        for (let i = 0; i < orbSlotsRef.current.length; i += 1) {
          const slot = orbSlotsRef.current[i];
          if (!slot.active) continue;
          const currentX = orbXRef.current[i] ?? slot.x;
          const nextX = currentX + (targetX - currentX) * 0.12;
          const nextY = slot.y + (targetY - slot.y) * 0.12;
          orbXRef.current[i] = nextX;
          slot.x = nextX;
          slot.y = nextY;
          slot.xAnim.setValue(nextX);
          slot.yAnim.setValue(nextY);
          if (Math.abs(slot.y - playerTop) < 20) {
            collectOrb(slot);
          }
        }
      } else {
        processEntities(orbSlotsRef.current, ORB_SIZE, ORB_SIZE, now, (slot) => {
          if (!slot.active) return;
          collectOrb(slot);
        });
      }

      for (const slot of obstacleSlotsRef.current) {
        if (!slot.active) continue;
        const cfg = obstacleConfig(slot.obstacleType ?? 'cloud');
        slot.y += speedRef.current * cfg.speedMul;
        slot.yAnim.setValue(slot.y);
        if (slot.y > heightRef.current + 120) {
          slot.active = false;
          slot.id = null;
          slot.opacity.setValue(0);
          continue;
        }
        if (slot.lane !== playerLaneRef.current) continue;
        const entityLeft = slot.x - cfg.width / 2;
        const playerLeft = laneCenterX(playerLaneRef.current) - PLAYER_SIZE / 2;
        const horizontalOverlap = Math.abs(entityLeft - playerLeft) <= 40;
        const verticalOverlap = intersectsVertically(slot.y, cfg.height, playerTop, playerBottom);
        if (!horizontalOverlap || !verticalOverlap) continue;
        if (now < invulnerableUntilRef.current) continue;
        slot.active = false;
        slot.opacity.setValue(0);
        if (shieldActiveRef.current) {
          shieldActiveRef.current = false;
          setShieldActive(false);
          triggerFlash(goldFlash);
          continue;
        }
        comboRef.current = 0;
        setComboLabel('');
        comboOpacity.setValue(0);
        invulnerableUntilRef.current = now + INVULN_MS;
        healthRef.current = Math.max(0, healthRef.current - 1);
        setHealth(healthRef.current);
        triggerFlash(redFlash);
        void safeHaptic(() =>
          HapticsModule?.impactAsync?.(HapticsModule.ImpactFeedbackStyle.Heavy) ?? Promise.resolve()
        );
        if (healthRef.current <= 0) {
          void safeHaptic(() =>
            HapticsModule?.notificationAsync?.(HapticsModule.NotificationFeedbackType.Error) ?? Promise.resolve()
          );
          endGame();
        }
      }

      processEntities(powerUpSlotsRef.current, POWER_UP_SIZE, POWER_UP_SIZE, now, (slot) => {
        if (!slot.active || !slot.type) return;
        slot.active = false;
        slot.opacity.setValue(0);
        if (slot.type === 'shield') {
          shieldActiveRef.current = true;
          setShieldActive(true);
        } else if (slot.type === 'magnet') {
          magnetActiveRef.current = true;
          magnetUntilRef.current = now + 5000;
          setMagnetActive(true);
          magnetToastOpacity.stopAnimation();
          magnetToastOpacity.setValue(1);
          Animated.timing(magnetToastOpacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }).start();
        } else {
          slowActiveRef.current = true;
          slowUntilRef.current = now + 4000;
          setSlowActive(true);
          applyTierSpeed();
        }
        triggerFlash(whiteFlash);
        void safeHaptic(() =>
          HapticsModule?.impactAsync?.(HapticsModule.ImpactFeedbackStyle.Medium) ?? Promise.resolve()
        );
      });

      if (statusRef.current !== 'playing') return;

      survivalTimeRef.current += dt;
      survivalClockRef.current += dt;
      if (survivalClockRef.current >= SURVIVAL_TICK_MS) {
        const steps = Math.floor(survivalClockRef.current / SURVIVAL_TICK_MS);
        survivalClockRef.current -= steps * SURVIVAL_TICK_MS;
        const wholeSeconds = Math.floor(survivalTimeRef.current / 1000);
        setSurvivalTimeState(wholeSeconds);
      }

      const engine = spawnEngineRef.current;
      if (engine) {
        const due = dueSpawns(engine, now);
        const spawnPowerUp = duePowerUp(engine, now);
        if (due.orb || due.obstacle) {
          const orbLane = due.orb ? pickSpawnLane(engine) : undefined;
          const obstacleLane = due.obstacle ? pickSpawnLane(engine, orbLane) : undefined;
          if (orbLane) spawnInSlot(orbSlotsRef.current, orbLane);
          if (obstacleLane) {
            spawnInSlot(obstacleSlotsRef.current, obstacleLane);
            const spawned = obstacleSlotsRef.current.find((s) => s.active && s.lane === obstacleLane && s.y === -80);
            if (spawned) {
              spawned.obstacleType = pickObstacleType(orbsCollectedRef.current);
            }
          }
          if (spawnPowerUp) {
            const powerLane = pickSpawnLane(engine, obstacleLane);
            const r = Math.floor(Math.random() * 3);
            const powerType: PowerUpType = r === 0 ? 'shield' : r === 1 ? 'magnet' : 'slow';
            spawnInSlot(powerUpSlotsRef.current, powerLane, powerType);
          }
        } else if (spawnPowerUp) {
          const powerLane = pickSpawnLane(engine);
          const r = Math.floor(Math.random() * 3);
          const powerType: PowerUpType = r === 0 ? 'shield' : r === 1 ? 'magnet' : 'slow';
          spawnInSlot(powerUpSlotsRef.current, powerLane, powerType);
        }
      }

      for (const slot of orbSlotsRef.current) {
        if (slot.active) {
          if (!magnetActiveRef.current) {
            slot.y += speedRef.current * (frameScale - 1);
            slot.yAnim.setValue(slot.y);
          }
        }
      }
      for (const slot of obstacleSlotsRef.current) {
        if (slot.active) {
          const cfg = obstacleConfig(slot.obstacleType ?? 'cloud');
          slot.y += speedRef.current * cfg.speedMul * (frameScale - 1);
          slot.yAnim.setValue(slot.y);
        }
      }
      for (const slot of powerUpSlotsRef.current) {
        if (slot.active) {
          slot.y += speedRef.current * (frameScale - 1);
          slot.yAnim.setValue(slot.y);
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    },
    [applyTierSpeed, comboOpacity, endGame, goldFlash, laneCenterX, pickObstacleType, playOrbBurst, popScore, processEntities, redFlash, safeHaptic, showCombo, spawnInSlot, triggerFlash, whiteFlash]
  );

  const startLoop = useCallback(() => {
    stopLoop();
    lastFrameTsRef.current = null;
    rafRef.current = requestAnimationFrame(frame);
  }, [frame, stopLoop]);

  const startGame = useCallback(() => {
    if (!layoutReady) return;
    resetGame();
    statusRef.current = 'playing';
    setStatus('playing');
    startLoop();
  }, [layoutReady, resetGame, startLoop]);

  const pauseGame = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    statusRef.current = 'paused';
    setStatus('paused');
    stopLoop();
  }, [stopLoop]);

  const requestExit = useCallback(() => {
    setShowExitConfirm(true);
    if (statusRef.current === 'playing') {
      statusRef.current = 'paused';
      setStatus('paused');
      stopLoop();
    }
  }, [stopLoop]);

  const resumeGame = useCallback(() => {
    if (statusRef.current !== 'paused') return;
    statusRef.current = 'playing';
    setStatus('playing');
    startLoop();
  }, [startLoop]);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      widthRef.current = width;
      heightRef.current = height;
      laneCentersRef.current = [width / 6, width / 2, (5 * width) / 6];
      setLayoutReady(true);
      const targetX = laneCenterX(playerLaneRef.current) - PLAYER_SIZE / 2;
      playerXAnim.setValue(targetX);
      for (const slot of orbSlotsRef.current) {
        slot.x = laneCenterX(slot.lane);
        slot.xAnim.setValue(laneCenterX(slot.lane));
      }
      for (let i = 0; i < orbSlotsRef.current.length; i += 1) {
        orbXRef.current[i] = laneCenterX(orbSlotsRef.current[i].lane);
      }
      for (const slot of obstacleSlotsRef.current) {
        slot.x = laneCenterX(slot.lane);
        slot.xAnim.setValue(laneCenterX(slot.lane));
      }
      for (const slot of powerUpSlotsRef.current) {
        slot.x = laneCenterX(slot.lane);
        slot.xAnim.setValue(laneCenterX(slot.lane));
      }
    },
    [laneCenterX, playerXAnim]
  );

  const moveByTap = useCallback(
    (tapX: number) => {
      if (statusRef.current !== 'playing') return;
      const current = laneIndex(playerLaneRef.current);
      const isLeftTap = tapX < widthRef.current / 2;
      const next = isLeftTap ? Math.max(0, current - 1) : Math.min(2, current + 1);
      if (next !== current) {
        syncPlayerLane(laneFromIndex(next));
        void safeHaptic(() =>
          HapticsModule?.impactAsync?.(HapticsModule.ImpactFeedbackStyle.Light) ?? Promise.resolve()
        );
      }
    },
    [safeHaptic, syncPlayerLane]
  );

  const handlePress = useCallback(
    (x: number) => {
      if (statusRef.current === 'idle') {
        startGame();
        return;
      }
      if (statusRef.current === 'playing') {
        moveByTap(x);
      }
    },
    [moveByTap, startGame]
  );

  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);

  useEffect(() => {
    if (status === 'gameover') {
      stopLoop();
    }
  }, [status, stopLoop]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(BEST_SCORE_KEY);
        setBestScore(stored ? Number(stored) || 0 : 0);
      } catch {
        setBestScore(0);
      }
    })();
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(startBlink, { toValue: 0.35, duration: 700, useNativeDriver: true }),
        Animated.timing(startBlink, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [startBlink]);

  const backgroundColor =
    score <= 50 ? '#0C0C0C' : score <= 150 ? '#0D110D' : score <= 300 ? '#0A130A' : '#081208';
  const smogOpacity = score <= 50 ? 0.4 : score <= 150 ? 0.2 : 0;
  const heartSlots = [0, 1, 2];
  const dashedSegments = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  const cityMessage =
    score <= 100
      ? '🏭 The city needs your help'
      : score <= 300
        ? '🌿 The city is breathing again'
        : score <= 500
          ? '⚡ Clean energy champion!'
          : '🌍 Carbon zero hero!';
  const survivalLabel = `${Math.floor(survivalTimeState / 60)}:${String(survivalTimeState % 60).padStart(2, '0')}`;

  return (
    <View style={[styles.container, { backgroundColor }]} onLayout={onLayout}>
      <View pointerEvents="none" style={[styles.smog, { opacity: smogOpacity }]} />
      <Pressable style={StyleSheet.absoluteFill} onPress={(e) => handlePress(e.nativeEvent.locationX)}>
        <View pointerEvents="none" style={styles.laneRow}>
          {[0, 1].map((divider) => (
            <View key={`lane-${divider}`} style={styles.dashColumn}>
              {dashedSegments.map((seg) => (
                <View key={`dash-${divider}-${seg}`} style={styles.laneDash} />
              ))}
            </View>
          ))}
        </View>

        {orbSlotsRef.current.map((slot, i) => (
          <Animated.View
            key={`orb-slot-${i}`}
            pointerEvents="none"
            style={[
              styles.orbGlow,
              {
                opacity: slot.opacity,
                transform: [
                  { translateX: Animated.add(slot.xAnim, new Animated.Value(-(ORB_RENDER_SIZE / 2 + ORB_GLOW_PADDING))) },
                  { translateY: slot.yAnim },
                ],
              },
            ]}
          >
            <View style={styles.orbInner} />
          </Animated.View>
        ))}

        {particleSlotsRef.current.map((particle, i) => (
          <Animated.View
            key={`particle-${i}`}
            pointerEvents="none"
            style={[
              styles.particleDot,
              {
                opacity: particle.opacity,
                transform: [
                  { translateX: Animated.add(particle.baseX, particle.dx) },
                  { translateY: Animated.add(particle.baseY, particle.dy) },
                ],
              },
            ]}
          />
        ))}

        {obstacleSlotsRef.current.map((slot, i) => {
          const cfg = obstacleConfig(slot.obstacleType ?? 'cloud');
          return (
            <Animated.View
              key={`obstacle-slot-${i}`}
              pointerEvents="none"
              style={[
                styles.obstacle,
                {
                  width: cfg.width,
                  height: cfg.height,
                  backgroundColor: cfg.bg,
                  borderColor: cfg.border,
                  opacity: slot.opacity,
                  transform: [
                    { translateX: Animated.add(slot.xAnim, new Animated.Value(-cfg.width / 2)) },
                    { translateY: slot.yAnim },
                  ],
                },
              ]}
            >
              <Text style={styles.obstacleEmoji}>{cfg.emoji}</Text>
            </Animated.View>
          );
        })}

        {powerUpSlotsRef.current.map((slot, i) => {
          const borderColor = slot.type === 'shield' ? '#378ADD' : slot.type === 'magnet' ? '#C8B89A' : '#8B9E7E';
          const emoji = slot.type === 'shield' ? '🛡️' : slot.type === 'magnet' ? '🧲' : '⏳';
          return (
            <Animated.View
              key={`power-slot-${i}`}
              pointerEvents="none"
              style={[
                styles.powerUp,
                {
                  borderColor,
                  opacity: slot.opacity,
                  transform: [
                    { translateX: Animated.add(slot.xAnim, new Animated.Value(-POWER_UP_SIZE / 2)) },
                    { translateY: slot.yAnim },
                  ],
                },
              ]}
            >
              <Text style={styles.powerUpEmoji}>{emoji}</Text>
            </Animated.View>
          );
        })}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.player,
            {
              borderColor: shieldActive ? '#378ADD' : COLORS.gold,
              borderWidth: shieldActive ? 3 : 2,
              transform: [
                { translateX: Animated.add(playerXAnim, new Animated.Value((PLAYER_SIZE - PLAYER_RENDER_SIZE) / 2)) },
                { translateY: heightRef.current - PLAYER_BOTTOM_OFFSET - PLAYER_SIZE + (PLAYER_SIZE - PLAYER_RENDER_SIZE) / 2 },
              ],
              opacity: invulnerableUntilRef.current > Date.now() ? 0.6 : 1,
            },
          ]}
        >
          <Text style={styles.playerEmoji}>🏃</Text>
        </Animated.View>

        <View style={styles.hud}>
          <View style={styles.scoreWrap}>
            <View style={styles.scoreLine}>
              <Animated.Text style={[TYPOGRAPHY.section, styles.score, { transform: [{ scale: scoreScale }] }]}>
                {score}
              </Animated.Text>
              {magnetActive ? <Text style={styles.scoreMagnet}>🧲</Text> : null}
            </View>
            <Text style={styles.scoreLabel}>PTS</Text>
            {shieldActive ? <Text style={[styles.powerLabel, { color: '#378ADD' }]}>🛡️ SHIELD</Text> : null}
            {magnetActive ? <Text style={[styles.powerLabel, { color: '#C8B89A' }]}>🧲 MAGNET</Text> : null}
            {slowActive ? <Text style={[styles.powerLabel, { color: '#8B9E7E' }]}>⏳ SLOW</Text> : null}
          </View>
          <View style={styles.hudCenterActions}>
            <TouchableOpacity onPress={pauseGame} disabled={status !== 'playing'} style={styles.pauseBtn}>
              <View style={styles.pauseBars}>
                <View style={styles.pauseBar} />
                <View style={styles.pauseBar} />
              </View>
            </TouchableOpacity>
            {status === 'paused' || status === 'gameover' ? (
              <TouchableOpacity onPress={requestExit} style={styles.exitTap}>
                <Text style={styles.exitTapText}>EXIT</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.heartsWrap}>
            {heartSlots.map((i) => (
              <View key={`heart-${i}`} style={[styles.heartBox, i < health ? styles.heartOn : styles.heartOff]} />
            ))}
          </View>
        </View>
        <View pointerEvents="none" style={styles.hudSeparator} />
        <Text pointerEvents="none" style={styles.speedTierText}>
          {speedTier} {survivalLabel}
        </Text>

        {comboLabel ? (
          <Animated.Text
            pointerEvents="none"
            style={[
              styles.comboText,
              {
                opacity: comboOpacity,
                transform: [
                  { translateX: Animated.add(playerXAnim, new Animated.Value((PLAYER_SIZE - PLAYER_RENDER_SIZE) / 2 - 18)) },
                  { translateY: heightRef.current - PLAYER_BOTTOM_OFFSET - PLAYER_SIZE - 28 },
                ],
              },
            ]}
          >
            {comboLabel}
          </Animated.Text>
        ) : null}

        <Animated.Text pointerEvents="none" style={[styles.magnetActiveToast, { opacity: magnetToastOpacity }]}>
          🧲 MAGNET
        </Animated.Text>

        {status === 'idle' ? (
          <View style={styles.overlay}>
            <View style={styles.startCard}>
              <Text style={styles.startTitle}>CARBON RUNNER</Text>
              <Text style={styles.startSubtitle}>DODGE POLLUTION · COLLECT ENERGY</Text>
              <Animated.Text style={[styles.startTap, { opacity: startBlink }]}>TAP TO START</Animated.Text>
            </View>
          </View>
        ) : null}

        {status === 'paused' ? (
          <View style={[styles.overlay, styles.darkOverlay]}>
            {showExitConfirm ? (
              <View style={styles.confirmCard}>
                <Text style={styles.confirmText}>Exit game? Progress will be lost.</Text>
                <View style={{ height: 12 }} />
                <TouchableOpacity style={styles.confirmExitBtn} onPress={() => navigation.goBack()}>
                  <Text style={styles.confirmExitText}>Yes, Exit</Text>
                </TouchableOpacity>
                <View style={{ height: 12 }} />
                <Button title="Keep Playing" variant="primary" onPress={() => { setShowExitConfirm(false); resumeGame(); }} />
              </View>
            ) : (
              <>
                <Text style={styles.pauseTitle}>PAUSED</Text>
                <View style={styles.pauseActionsWrap}>
                  <TouchableOpacity style={styles.pauseActionPrimary} onPress={resumeGame}>
                    <Text style={styles.pauseActionTextPrimary}>RESUME</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pauseActionOutline} onPress={startGame}>
                    <Text style={styles.pauseActionTextOutline}>RESTART</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pauseActionOutline} onPress={requestExit}>
                    <Text style={[styles.pauseActionTextOutline, { color: COLORS.textMuted }]}>EXIT</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ) : null}

        {status === 'gameover' ? (
          <View style={[styles.overlay, styles.darkOverlay]}>
            <Text style={styles.gameOverTitle}>GAME OVER</Text>
            {isNewBest ? (
              <Animated.Text style={[styles.newBestText, { transform: [{ scale: newBestScale }] }]}>✨ NEW BEST!</Animated.Text>
            ) : null}
            <View style={styles.scoreGrid}>
              <View style={styles.scoreCell}>
                <Text style={styles.scoreCellLabel}>SCORE</Text>
                <Text style={styles.scoreCellValue}>{score}</Text>
              </View>
              <View style={styles.scoreCell}>
                <Text style={styles.scoreCellLabel}>BEST</Text>
                <Text style={styles.scoreCellValue}>{bestScore}</Text>
              </View>
            </View>
            <Text style={styles.cityMessage}>{cityMessage}</Text>
            <View style={{ height: 10 }} />
            <View style={styles.gameOverButtonWrap}>
              <Button title="Restart" variant="primary" onPress={startGame} />
              <View style={{ height: 12 }} />
              <Button title="Exit" variant="secondary" onPress={() => navigation.goBack()} />
            </View>
          </View>
        ) : null}
      </Pressable>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.redFlash, { opacity: redFlash }]} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.goldFlash, { opacity: goldFlash }]} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.whiteFlash, { opacity: whiteFlash }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  laneRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
  },
  dashColumn: {
    height: '100%',
    justifyContent: 'space-evenly',
  },
  laneDash: {
    width: 1,
    height: 36,
    backgroundColor: '#1A1A1A',
    opacity: 0.95,
  },
  smog: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '30%',
    backgroundColor: '#4A3728',
  },
  player: {
    position: 'absolute',
    width: PLAYER_RENDER_SIZE,
    height: PLAYER_RENDER_SIZE,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerEmoji: {
    fontSize: 24,
    lineHeight: 20,
  },
  orbGlow: {
    position: 'absolute',
    width: ORB_RENDER_SIZE + ORB_GLOW_PADDING * 2,
    height: ORB_RENDER_SIZE + ORB_GLOW_PADDING * 2,
    borderRadius: 50,
    padding: ORB_GLOW_PADDING,
    backgroundColor: COLORS.sage,
    opacity: 0.3,
  },
  orbInner: {
    width: ORB_RENDER_SIZE,
    height: ORB_RENDER_SIZE,
    borderRadius: 12,
    backgroundColor: COLORS.sage,
  },
  obstacle: {
    position: 'absolute',
    width: OBSTACLE_RENDER_WIDTH,
    height: OBSTACLE_RENDER_HEIGHT,
    borderRadius: 8,
    backgroundColor: '#3A2A2A',
    borderWidth: 1,
    borderColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  obstacleEmoji: {
    fontSize: 26,
  },
  powerUp: {
    position: 'absolute',
    width: POWER_UP_SIZE,
    height: POWER_UP_SIZE,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12,12,12,0.7)',
  },
  powerUpEmoji: {
    fontSize: 24,
  },
  particleDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.sage,
  },
  hud: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  scoreWrap: {
    alignItems: 'flex-start',
  },
  scoreLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  score: {
    color: COLORS.gold,
    lineHeight: 24,
  },
  scoreMagnet: {
    color: COLORS.gold,
    fontSize: 16,
  },
  scoreLabel: {
    marginTop: 0,
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  powerLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 3,
  },
  hudCenterActions: {
    alignItems: 'center',
  },
  pauseBtn: {
    padding: 8,
  },
  pauseBars: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseBar: {
    width: 4,
    height: 16,
    borderRadius: 1,
    backgroundColor: COLORS.gold,
  },
  exitTap: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  exitTapText: {
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  heartsWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  heartBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  heartOn: {
    backgroundColor: COLORS.error,
  },
  heartOff: {
    backgroundColor: '#2A2A2A',
  },
  hudSeparator: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 78,
    height: 0.5,
    backgroundColor: COLORS.gold,
    opacity: 0.3,
  },
  speedTierText: {
    position: 'absolute',
    top: 84,
    alignSelf: 'center',
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 2,
  },
  comboText: {
    position: 'absolute',
    color: COLORS.gold,
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '500',
  },
  magnetActiveToast: {
    position: 'absolute',
    alignSelf: 'center',
    top: '46%',
    color: COLORS.gold,
    fontSize: 14,
    letterSpacing: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    gap: 12,
    paddingHorizontal: 24,
  },
  darkOverlay: {
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  startCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 10,
  },
  startTitle: {
    color: COLORS.gold,
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 4,
  },
  startSubtitle: {
    color: COLORS.sage,
    fontSize: 11,
    letterSpacing: 2,
    textAlign: 'center',
  },
  startTap: {
    color: COLORS.textPrimary,
    marginTop: 6,
    fontSize: 12,
    letterSpacing: 2,
  },
  pauseTitle: {
    color: COLORS.textMuted,
    letterSpacing: 4,
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 8,
  },
  pauseActionsWrap: {
    width: '100%',
    maxWidth: 280,
    gap: 14,
  },
  pauseActionPrimary: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseActionOutline: {
    width: '100%',
    paddingVertical: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseActionTextPrimary: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
    color: COLORS.bgPrimary,
  },
  pauseActionTextOutline: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  gameOverTitle: {
    color: COLORS.error,
    letterSpacing: 4,
    fontSize: 24,
    fontWeight: '300',
  },
  scoreGrid: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },
  scoreCell: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  scoreCellLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  scoreCellValue: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '300',
  },
  gameOverButtonWrap: {
    width: '100%',
    maxWidth: 320,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.bgCard,
    borderColor: COLORS.border,
    borderWidth: 1,
    padding: 16,
  },
  confirmText: {
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontSize: 14,
  },
  confirmExitBtn: {
    height: 52,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmExitText: {
    ...TYPOGRAPHY.label,
    color: COLORS.bgPrimary,
    letterSpacing: 2,
  },
  cityMessage: {
    color: COLORS.sage,
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 1,
  },
  newBestText: {
    color: COLORS.gold,
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 4,
  },
  actionBtn: {
    backgroundColor: COLORS.bgCard,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 10,
    minWidth: 140,
  },
  actionBtnPrimary: {
    backgroundColor: '#2B2B2B',
    borderColor: COLORS.gold,
  },
  actionText: {
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
  },
  redFlash: {
    backgroundColor: 'rgba(196,120,90,0.4)',
  },
  goldFlash: {
    backgroundColor: 'rgba(200,184,154,0.28)',
  },
  whiteFlash: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
});
