'use client';

import React, { useState, useEffect } from 'react';
import { progressStore, UserStats } from '@/lib/progressStore';
import { CUBE_ALGORITHMS, Algorithm } from '@/lib/algorithms';
import { haptics } from '@/lib/haptics';
import {
  CheckCircle2,
  Clock,
  Zap,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

interface ProgressStatsProps {
  onSelectAlgorithm?: (algorithm: Algorithm) => void;
}

export default function ProgressStats({ onSelectAlgorithm }: ProgressStatsProps) {
  const [stats3x3, setStats3x3] = useState(() => progressStore.getCubeStats('3x3'));
  const [stats4x4, setStats4x4] = useState(() => progressStore.getCubeStats('4x4'));
  const [stats5x5, setStats5x5] = useState(() => progressStore.getCubeStats('5x5'));
  const [userStats, setUserStats] = useState<UserStats>(() => progressStore.getStats());
  const [filterType, setFilterType] = useState<'all' | '3x3' | '4x4' | '5x5'>('all');

  useEffect(() => {
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
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
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
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats3x3.percentage}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            {stats3x3.learning} training · {stats3x3.notStarted} queued
          </span>
        </div>

        {/* 4x4 Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
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
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats4x4.percentage}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            {stats4x4.learning} training · {stats4x4.notStarted} queued
          </span>
        </div>

        {/* 5x5 Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
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
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats5x5.percentage}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400">
            {stats5x5.learning} training · {stats5x5.notStarted} queued
          </span>
        </div>

        {/* Total Moves Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
              Total Turns
            </span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2.5">
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {userStats.totalMovesExecuted.toLocaleString()}
            </div>
          </div>
          <span className="text-[11px] text-amber-400 font-mono">
            Tactile muscle memory
          </span>
        </div>

        {/* Time Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
              Practice Time
            </span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2.5">
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {formatSeconds(userStats.totalPracticeTimeSeconds)}
            </div>
          </div>
          <span className="text-[11px] text-blue-400 font-mono">
            Always-on timer
          </span>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">
              Algorithm Catalog & Mastery Status
            </h3>
            <span className="text-xs text-slate-400">
              Select any sequence to open in 3D viewer with British voice coaching
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs overflow-x-auto scrollbar-none">
            {(['all', '3x3', '4x4', '5x5'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  haptics.trigger('tick');
                }}
                className={`min-h-[36px] px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
                  filterType === type
                    ? 'bg-slate-800 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type === 'all' ? 'All' : `${type}`}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Algorithm / Stage</th>
                <th className="py-3 px-4">Cube</th>
                <th className="py-3 px-4">Moves Sequence</th>
                <th className="py-3 px-4">Best Speed</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredAlgorithms.map((alg) => {
                const prog = progressStore.getProgress(alg.id);
                return (
                  <tr
                    key={alg.id}
                    onClick={() => onSelectAlgorithm?.(alg)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white block">
                        {alg.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {alg.stageName} · {alg.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                      {alg.cubeType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 max-w-xs truncate">
                      {alg.shortName}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-amber-300">
                      {prog.bestTimeSeconds ? `${prog.bestTimeSeconds}s` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      {prog.status === 'mastered' ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mastered
                        </span>
                      ) : prog.status === 'learning' ? (
                        <span className="text-amber-400 font-medium">Learning</span>
                      ) : (
                        <span className="text-slate-500">Not Started</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAlgorithm?.(alg);
                        }}
                        className="p-1.5 rounded hover:bg-slate-700/60 text-slate-400 group-hover:text-blue-400 transition-colors"
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

      <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
        <span>Progress is automatically synchronized to local storage.</span>
        <button
          onClick={() => {
            if (confirm('Reset all learned algorithms and speed records?')) {
              progressStore.resetAll();
              haptics.trigger('reset');
            }
          }}
          className="hover:text-rose-400 transition-colors flex items-center gap-1 py-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Progress</span>
        </button>
      </div>
    </div>
  );
}
