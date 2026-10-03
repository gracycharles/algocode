'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Algorithm } from '@/lib/algorithms';
import { progressStore, AlgorithmStatus } from '@/lib/progressStore';
import { haptics } from '@/lib/haptics';
import { voiceCoach } from '@/lib/voiceCoach';
import {
  Timer,
  CheckCircle2,
  Trophy,
  RotateCcw,
  Eye,
  EyeOff,
  Award,
} from 'lucide-react';

interface PracticeDrillProps {
  algorithm: Algorithm;
  onStatusChange?: (newStatus: AlgorithmStatus) => void;
}

export default function PracticeDrill({ algorithm, onStatusChange }: PracticeDrillProps) {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeMs, setTimeMs] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number | undefined>(() => progressStore.getProgress(algorithm.id).bestTimeSeconds);
  const [status, setStatus] = useState<AlgorithmStatus>(() => progressStore.getProgress(algorithm.id).status);
  const [showMoves, setShowMoves] = useState<boolean>(true);
  const [drillSuccess, setDrillSuccess] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const unsub = progressStore.subscribe(() => {
      const prog = progressStore.getProgress(algorithm.id);
      setStatus(prog.status);
      setBestTime(prog.bestTimeSeconds);
    });
    return () => unsub();
  }, [algorithm.id]);

  const toggleTimer = () => {
    if (isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
      const elapsedSec = timeMs / 1000;
      haptics.trigger('snap');

      progressStore.recordPractice(algorithm.id, algorithm.moves.length, elapsedSec);
      const updated = progressStore.getProgress(algorithm.id);
      setBestTime(updated.bestTimeSeconds);
      setDrillSuccess(true);

      voiceCoach.speak(`Completed in ${elapsedSec.toFixed(2)} seconds. Well done!`);

      if (elapsedSec < (bestTime || 999)) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } else {
      setDrillSuccess(false);
      setTimeMs(0);
      startTimeRef.current = performance.now();
      setIsRunning(true);
      haptics.trigger('turn');

      timerRef.current = setInterval(() => {
        setTimeMs(Math.round(performance.now() - startTimeRef.current));
      }, 30);
    }
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setTimeMs(0);
    setDrillSuccess(false);
    haptics.trigger('reset');
  };

  const updateStatus = (newStatus: AlgorithmStatus) => {
    progressStore.setStatus(algorithm.id, newStatus);
    setStatus(newStatus);
    onStatusChange?.(newStatus);
    haptics.trigger(newStatus === 'mastered' ? 'success' : 'tick');

    if (newStatus === 'mastered') {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
      });
      voiceCoach.speak(`Brilliant! You have mastered ${algorithm.name}!`);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = (ms / 1000).toFixed(2);
    return `${seconds}s`;
  };

  return (
    <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Speed & Muscle Memory Drill
          </span>
          <h3 className="text-base font-semibold text-white">
            {algorithm.shortName}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => updateStatus('learning')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              status === 'learning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Learning
          </button>
          <button
            onClick={() => updateStatus('mastered')}
            className={`px-3 py-1 rounded font-medium flex items-center gap-1 transition-colors ${
              status === 'mastered'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mastered</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950/70 border border-slate-800/80">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
          <Timer className="w-4 h-4 text-blue-400" />
          <span>Execution Stopwatch</span>
        </div>

        <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white my-2 tabular-nums">
          {formatTime(timeMs)}
        </div>

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={toggleTimer}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md ${
              isRunning
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            {isRunning ? 'Stop Timer (Cube Solved)' : 'Start Execution Timer'}
          </button>

          <button
            onClick={resetTimer}
            disabled={timeMs === 0 && !isRunning}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {bestTime && (
          <div className="mt-4 flex items-center gap-2 text-xs text-amber-300 font-mono">
            <Trophy className="w-3.5 h-3.5" />
            <span>Personal Best: {bestTime}s</span>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">
            Blind Recall Drill (Hide algorithm moves to test memory)
          </span>
          <button
            onClick={() => {
              setShowMoves(!showMoves);
              haptics.trigger('tick');
            }}
            className="text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showMoves ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showMoves ? 'Hide Moves' : 'Reveal Moves'}</span>
          </button>
        </div>

        {showMoves ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {algorithm.moves.map((m, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-900 border border-slate-700 rounded text-slate-200"
              >
                {m}
              </span>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-slate-900/60 rounded border border-dashed border-slate-700/60 text-center">
            <span className="text-xs text-slate-400">
              Moves hidden. Perform on your cube, then verify with Reveal Moves!
            </span>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-blue-950/30 border border-blue-900/40 text-xs text-blue-200">
        <Award className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-white">Speed Tip: </strong>
          Focus on continuous fluid execution without pauses between moves. Fingertricks allow your hands to stay glued to the home grip position!
        </p>
      </div>
    </div>
  );
}
