'use client';

import React, { useState, useEffect } from 'react';
import { progressStore, UserStats } from '@/lib/progressStore';
import { CUBE_ALGORITHMS, Algorithm } from '@/lib/algorithms';
import { haptics } from '@/lib/haptics';
import { ColorNotation } from '@/lib/notationFormatter';
import {
  CheckCircle2,
  Clock,
  Zap,
  RotateCcw,
  ArrowRight,
  Trophy,
} from 'lucide-react';

interface ProgressStatsProps {
  onSelectAlgorithm?: (algorithm: Algorithm) => void;
}

export default function ProgressStats({ onSelectAlgorithm }: ProgressStatsProps) {
  const [stats3x3, setStats3x3] = useState({ total: 10, mastered: 0, learning: 0, notStarted: 10, percentage: 0 });
  const [stats4x4, setStats4x4] = useState({ total: 5, mastered: 0, learning: 0, notStarted: 5, percentage: 0 });
  const [stats5x5, setStats5x5] = useState({ total: 5, mastered: 0, learning: 0, notStarted: 5, percentage: 0 });
  const [userStats, setUserStats] = useState<UserStats>({
    totalMovesExecuted: 0,
    totalPracticeTimeSeconds: 0,
    algorithmsMasteredCount: 0,
    streakDays: 1,
    lastActiveDate: '',
  });
  const [filterType, setFilterType] = useState<'all' | '3x3' | '4x4' | '5x5'>('all');

  useEffect(() => {
    setStats3x3(progressStore.getCubeStats('3x3'));
    setStats4x4(progressStore.getCubeStats('4x4'));
    setStats5x5(progressStore.getCubeStats('5x5'));
    setUserStats(progressStore.getStats());

    const unsub = progressStore.subscribe(() => {
      setStats3x3(progressStore.getCubeStats('3x3'));
      setStats4x4(progressStore.getCubeStats('4x4'));
      setStats5x5(progressStore.getCubeStats('5x5'));
      setUserStats(progressStore.getStats());
    });
    return () => unsub();
  }, []);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    if (mins === 0) return `${remainingSec}s`;
    return `${mins}m ${remainingSec}s`;
  };

  const filteredAlgorithms = CUBE_ALGORITHMS.filter((a) => {
    if (filterType === 'all') return true;
    return a.cubeType === filterType;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Metrics Row (Responsive 1/2/3/5 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 3x3 Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-200 font-bold">
              3x3 Speed
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {stats3x3.percentage}%
            </span>
          </div>
          <div className="my-2.5">
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {stats3x3.mastered} / {stats3x3.total}
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats3x3.percentage}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-300 font-medium">
            {stats3x3.learning} training · {stats3x3.notStarted} queued
          </span>
        </div>

        {/* 4x4 Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-200 font-bold">
              4x4 Revenge
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {stats4x4.percentage}%
            </span>
          </div>
          <div className="my-2.5">
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {stats4x4.mastered} / {stats4x4.total}
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats4x4.percentage}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-300 font-medium">
            {stats4x4.learning} training · {stats4x4.notStarted} queued
          </span>
        </div>

        {/* 5x5 Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-200 font-bold">
              5x5 Professor
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {stats5x5.percentage}%
            </span>
          </div>
          <div className="my-2.5">
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {stats5x5.mastered} / {stats5x5.total}
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats5x5.percentage}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-300 font-medium">
            {stats5x5.learning} training · {stats5x5.notStarted} queued
          </span>
        </div>

        {/* Moves Executed */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-200 font-bold">
            <span className="uppercase tracking-wider">Total Turns</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {userStats.totalMovesExecuted}
            </div>
            <span className="text-[11px] text-slate-300 block font-medium">Rotations Executed</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono font-bold">
            🔥 {userStats.streakDays} Day Practice Streak
          </span>
        </div>

        {/* Practice Time */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-200 font-bold">
            <span className="uppercase tracking-wider">Practice Time</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {formatSeconds(userStats.totalPracticeTimeSeconds)}
            </div>
            <span className="text-[11px] text-slate-300 block font-medium">Total Drills Elapsed</span>
          </div>
          <span className="text-[11px] text-slate-300 font-medium">
            {userStats.algorithmsMasteredCount} total algorithms mastered
          </span>
        </div>
      </div>

      {/* Detailed Algorithms Progress Table */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">Algorithm Mastery Catalog</h3>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-700 text-xs">
            {(['all', '3x3', '4x4', '5x5'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  haptics.trigger('tick');
                }}
                className={`px-3 py-1 rounded font-bold transition-all uppercase ${
                  filterType === type
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {type === 'all' ? 'All' : `${type}`}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-900/90 shadow-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-200 uppercase font-mono tracking-wider border-b border-slate-700 font-bold">
              <tr>
                <th className="py-3 px-4">Algorithm / Stage</th>
                <th className="py-3 px-4">Cube</th>
                <th className="py-3 px-4">Moves Sequence</th>
                <th className="py-3 px-4">Best Speed</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredAlgorithms.map((alg) => {
                const prog = progressStore.getProgress(alg.id);
                return (
                  <tr
                    key={alg.id}
                    onClick={() => onSelectAlgorithm?.(alg)}
                    className="hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">
                        {alg.name}
                      </span>
                      <span className="text-xs text-slate-300 block mt-0.5 font-medium">
                        {alg.stageName} · {alg.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-300">
                      {alg.cubeType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-200">
                      <ColorNotation notation={alg.shortName} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-amber-300 font-bold text-sm">
                      {prog.bestTimeSeconds ? `${prog.bestTimeSeconds}s` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      {prog.status === 'mastered' ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Mastered
                        </span>
                      ) : prog.status === 'learning' ? (
                        <span className="text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">Learning</span>
                      ) : (
                        <span className="text-slate-400 font-medium">Not Started</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAlgorithm?.(alg);
                        }}
                        className="p-1.5 rounded hover:bg-slate-700 text-slate-300 group-hover:text-blue-400 transition-colors border border-transparent hover:border-slate-600"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <span className="font-medium">Progress is automatically synchronized to local storage.</span>
        <button
          onClick={() => {
            if (confirm('Reset all learned algorithms and speed records?')) {
              progressStore.resetAll();
              haptics.trigger('reset');
            }
          }}
          className="hover:text-rose-400 text-slate-300 transition-colors flex items-center gap-1 py-1 font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Progress</span>
        </button>
      </div>
    </div>
  );
}
