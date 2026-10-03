'use client';

import { CUBE_ALGORITHMS, CubeType } from './algorithms';

export type AlgorithmStatus = 'not_started' | 'learning' | 'mastered';

export interface AlgorithmProgress {
  algorithmId: string;
  status: AlgorithmStatus;
  timesPracticed: number;
  bestTimeSeconds?: number;
  lastPracticed?: string;
  notes?: string;
}

export interface UserStats {
  totalMovesExecuted: number;
  totalPracticeTimeSeconds: number;
  algorithmsMasteredCount: number;
  streakDays: number;
  lastActiveDate: string;
}

const STORAGE_KEY_PROGRESS = 'algocube_progress_v1';
const STORAGE_KEY_STATS = 'algocube_stats_v1';

class ProgressStore {
  private progressMap: Map<string, AlgorithmProgress> = new Map();
  private stats: UserStats = {
    totalMovesExecuted: 0,
    totalPracticeTimeSeconds: 0,
    algorithmsMasteredCount: 0,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
  };
  private subscribers: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.load();
    }
  }

  private load() {
    try {
      const savedProgress = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (savedProgress) {
        const parsed: Record<string, AlgorithmProgress> = JSON.parse(savedProgress);
        Object.entries(parsed).forEach(([id, p]) => {
          this.progressMap.set(id, p);
        });
      } else {
        CUBE_ALGORITHMS.forEach((alg) => {
          this.progressMap.set(alg.id, {
            algorithmId: alg.id,
            status: alg.id === '3x3-sexy-move' ? 'learning' : 'not_started',
            timesPracticed: 0,
          });
        });
        this.save();
      }

      const savedStats = localStorage.getItem(STORAGE_KEY_STATS);
      if (savedStats) {
        this.stats = JSON.parse(savedStats);
      }
    } catch {}
  }

  private save() {
    if (typeof window === 'undefined') return;
    try {
      const obj: Record<string, AlgorithmProgress> = {};
      this.progressMap.forEach((v, k) => {
        obj[k] = v;
      });
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(obj));
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(this.stats));
    } catch {}
    this.notify();
  }

  public getProgress(algorithmId: string): AlgorithmProgress {
    const existing = this.progressMap.get(algorithmId);
    if (existing) return existing;
    const initial: AlgorithmProgress = {
      algorithmId,
      status: 'not_started',
      timesPracticed: 0,
    };
    this.progressMap.set(algorithmId, initial);
    return initial;
  }

  public setStatus(algorithmId: string, status: AlgorithmStatus) {
    const current = this.getProgress(algorithmId);
    current.status = status;
    current.lastPracticed = new Date().toISOString();
    this.progressMap.set(algorithmId, current);

    let masteredCount = 0;
    this.progressMap.forEach((p) => {
      if (p.status === 'mastered') masteredCount++;
    });
    this.stats.algorithmsMasteredCount = masteredCount;

    this.save();
  }

  public recordPractice(algorithmId: string, movesCount: number, elapsedSeconds: number) {
    const current = this.getProgress(algorithmId);
    current.timesPracticed = (current.timesPracticed || 0) + 1;
    current.lastPracticed = new Date().toISOString();
    if (elapsedSeconds > 0) {
      if (!current.bestTimeSeconds || elapsedSeconds < current.bestTimeSeconds) {
        current.bestTimeSeconds = Number(elapsedSeconds.toFixed(2));
      }
    }
    if (current.status === 'not_started') {
      current.status = 'learning';
    }
    this.progressMap.set(algorithmId, current);

    this.stats.totalMovesExecuted += movesCount;
    this.stats.totalPracticeTimeSeconds += Math.round(elapsedSeconds);
    this.save();
  }

  public getStats(): UserStats {
    return { ...this.stats };
  }

  public getCubeStats(cubeType: CubeType): {
    total: number;
    mastered: number;
    learning: number;
    notStarted: number;
    percentage: number;
  } {
    const algs = CUBE_ALGORITHMS.filter((a) => a.cubeType === cubeType);
    let mastered = 0;
    let learning = 0;
    let notStarted = 0;

    algs.forEach((a) => {
      const p = this.getProgress(a.id);
      if (p.status === 'mastered') mastered++;
      else if (p.status === 'learning') learning++;
      else notStarted++;
    });

    const total = algs.length;
    const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

    return { total, mastered, learning, notStarted, percentage };
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify() {
    this.subscribers.forEach((cb) => cb());
  }

  public resetAll() {
    this.progressMap.clear();
    CUBE_ALGORITHMS.forEach((alg) => {
      this.progressMap.set(alg.id, {
        algorithmId: alg.id,
        status: 'not_started',
        timesPracticed: 0,
      });
    });
    this.stats = {
      totalMovesExecuted: 0,
      totalPracticeTimeSeconds: 0,
      algorithmsMasteredCount: 0,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };
    this.save();
  }
}

export const progressStore = new ProgressStore();
