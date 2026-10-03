'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CUBE_ALGORITHMS,
  Algorithm,
  CubeType,
  getAlgorithmsByCube,
} from '@/lib/algorithms';
import { progressStore } from '@/lib/progressStore';
import { voiceCoach } from '@/lib/voiceCoach';
import { haptics } from '@/lib/haptics';
import { screenManager } from '@/lib/screenManager';

import TopBar from '@/components/TopBar';
import CubeViewer3D from '@/components/CubeViewer3D';
import MoveBreakdown from '@/components/MoveBreakdown';
import PracticeDrill from '@/components/PracticeDrill';
import NotationReference from '@/components/NotationReference';
import ProgressStats from '@/components/ProgressStats';

import {
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Box,
  Layers,
  Timer,
  BookOpen,
  Award,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'3x3' | '4x4' | '5x5' | 'drill' | 'notation' | 'stats'>('3x3');
  const [selectedCubeType, setSelectedCubeType] = useState<CubeType>('3x3');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>(CUBE_ALGORITHMS[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [, setProgressTick] = useState<number>(0);

  useEffect(() => {
    setIsMounted(true);
    const unsub = progressStore.subscribe(() => {
      setProgressTick((prev) => prev + 1);
    });
    return () => unsub();
  }, []);

  const handleTabChange = useCallback((tab: '3x3' | '4x4' | '5x5' | 'drill' | 'notation' | 'stats') => {
    setActiveTab(tab);
    setSelectedCategory('All');
    haptics.trigger('tick');

    if (tab === '3x3') {
      setSelectedCubeType('3x3');
      const first3x3 = CUBE_ALGORITHMS.find((a) => a.cubeType === '3x3');
      if (first3x3) {
        setSelectedAlgorithm(first3x3);
      }
      voiceCoach.speak('3x3 speedcubing algorithms loaded.');
    } else if (tab === '4x4') {
      setSelectedCubeType('4x4');
      const first4x4 = CUBE_ALGORITHMS.find((a) => a.cubeType === '4x4');
      if (first4x4) {
        setSelectedAlgorithm(first4x4);
      }
      voiceCoach.speak("4x4 Rubik's Revenge parity algorithms loaded.");
    } else if (tab === '5x5') {
      setSelectedCubeType('5x5');
      const first5x5 = CUBE_ALGORITHMS.find((a) => a.cubeType === '5x5');
      if (first5x5) {
        setSelectedAlgorithm(first5x5);
      }
      voiceCoach.speak("5x5 Professor's Cube reduction algorithms loaded.");
    }
  }, []);

  const cubeAlgorithms = getAlgorithmsByCube(selectedCubeType);
  const categories = ['All', ...Array.from(new Set(cubeAlgorithms.map((a) => a.category)))];

  const displayedAlgorithms = cubeAlgorithms.filter((a) => {
    if (selectedCategory === 'All') return true;
    return a.category === selectedCategory;
  });

  const handleSelectAlgorithm = (alg: Algorithm) => {
    setSelectedAlgorithm(alg);
    setSelectedCubeType(alg.cubeType);
    setCurrentStepIndex(-1);
    haptics.trigger('snap');
    voiceCoach.speak(`Loaded ${alg.name}.`);
  };

  const handleAlgorithmComplete = () => {
    progressStore.setStatus(selectedAlgorithm.id, 'mastered');
    voiceCoach.speak('Algorithm completed! Splendid work.');
  };

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col font-sans pb-16 lg:pb-6">
      {/* Top Header */}
      <TopBar activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="flex-1 w-full max-w-[1520px] mx-auto px-3 sm:px-6 py-4 flex flex-col gap-5">
        {/* Stage Status & Category Header */}
        {(activeTab === '3x3' || activeTab === '4x4' || activeTab === '5x5') && (
          <div className="flex flex-col gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full ${
                    selectedCubeType === '5x5'
                      ? 'bg-purple-500 shadow-purple-500/50 shadow-sm'
                      : selectedCubeType === '4x4'
                      ? 'bg-amber-500 shadow-amber-500/50 shadow-sm'
                      : 'bg-blue-500 shadow-blue-500/50 shadow-sm'
                  }`}
                />
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {selectedCubeType === '3x3'
                    ? '3x3 Speedcubing Masterclass (CFOP & Foundations)'
                    : selectedCubeType === '4x4'
                    ? "4x4 Rubik's Revenge (Parity Algorithms & Edge Slices)"
                    : "5x5 Professor's Cube (Reduction & Last Edges)"}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {displayedAlgorithms.length} Algorithms
                </span>
              </div>

              <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-300">Space</kbd> Play
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-300">←</kbd>
                  <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-300">→</kbd> Step
                </span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-500 mr-1 shrink-0">
                Filter:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    haptics.trigger('tick');
                  }}
                  className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Algorithm Teaching Workspace (for 3x3, 4x4, and 5x5) */}
        {(activeTab === '3x3' || activeTab === '4x4' || activeTab === '5x5') && (
          <div className="flex flex-col gap-6">
            {/* Algorithm Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {displayedAlgorithms.map((alg) => {
                const isSelected = selectedAlgorithm.id === alg.id;
                const isMastered = isMounted && progressStore.getProgress(alg.id).status === 'mastered';
                return (
                  <button
                    key={alg.id}
                    onClick={() => handleSelectAlgorithm(alg)}
                    className={`min-h-[92px] p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? selectedCubeType === '5x5'
                          ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-500/15 ring-2 ring-purple-500/40'
                          : selectedCubeType === '4x4'
                          ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-500/15 ring-2 ring-amber-500/40'
                          : 'bg-blue-950/40 border-blue-500/80 shadow-lg shadow-blue-500/15 ring-2 ring-blue-500/40'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/90 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400 font-mono text-[11px] truncate max-w-[170px]">
                          {alg.stageName}
                        </span>
                        {isMastered ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-medium text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> Mastered
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono">
                            {alg.moves.length} moves
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-white leading-tight line-clamp-1">
                        {alg.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                      <span className="font-mono text-slate-400 font-semibold truncate max-w-[180px]">
                        {alg.shortName}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Main Interactive Stage: 3D Cube Viewer & Move Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="h-[460px] sm:h-[540px] w-full rounded-2xl overflow-hidden shadow-2xl relative">
                  <CubeViewer3D
                    key={`${selectedCubeType}-${selectedAlgorithm.id}`}
                    cubeType={selectedCubeType}
                    algorithm={selectedAlgorithm}
                    onMoveChange={setCurrentStepIndex}
                    onAlgorithmComplete={handleAlgorithmComplete}
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>WCA Standards: White top, Yellow bottom, Green front, Red right</span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">
                    Drag to rotate view · Controls below
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-5">
                <MoveBreakdown
                  algorithm={selectedAlgorithm}
                  currentStepIndex={currentStepIndex}
                  onStepSelect={(idx) => setCurrentStepIndex(idx)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Speed Stopwatch Drill */}
        {activeTab === 'drill' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 h-[460px] sm:h-[520px] w-full rounded-2xl overflow-hidden shadow-2xl">
              <CubeViewer3D
                key={`drill-${selectedCubeType}-${selectedAlgorithm.id}`}
                cubeType={selectedCubeType}
                algorithm={selectedAlgorithm}
                onMoveChange={setCurrentStepIndex}
              />
            </div>
            <div className="lg:col-span-5">
              <PracticeDrill
                key={selectedAlgorithm.id}
                algorithm={selectedAlgorithm}
                onStatusChange={() => {}}
              />
            </div>
          </div>
        )}

        {/* Notation & Mechanical Reference */}
        {activeTab === 'notation' && (
          <NotationReference
            cubeType={selectedCubeType}
            onExecuteMove={() => {}}
          />
        )}

        {/* Overall Mastery & Progress Dashboard */}
        {activeTab === 'stats' && (
          <ProgressStats
            onSelectAlgorithm={(alg) => {
              setSelectedAlgorithm(alg);
              setSelectedCubeType(alg.cubeType);
              setActiveTab(alg.cubeType === '5x5' ? '5x5' : alg.cubeType === '4x4' ? '4x4' : '3x3');
            }}
          />
        )}
      </main>

      {/* Ergonomic Mobile & Tablet Bottom Thumb-Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b12]/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => handleTabChange('3x3')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === '3x3' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>3x3</span>
        </button>

        <button
          onClick={() => handleTabChange('4x4')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === '4x4' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>4x4</span>
        </button>

        <button
          onClick={() => handleTabChange('5x5')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === '5x5' ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>5x5</span>
        </button>

        <button
          onClick={() => handleTabChange('drill')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'drill' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>Timer</span>
        </button>

        <button
          onClick={() => handleTabChange('notation')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'notation' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Guide</span>
        </button>

        <button
          onClick={() => handleTabChange('stats')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'stats' ? 'text-rose-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Stats</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#06090e] px-4 sm:px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span>Algocube · Professional 3x3, 4x4 &amp; 5x5 Speedcubing Algorithm Masterclass</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Dual Haptics</span>
          <span aria-hidden="true">·</span>
          <span>British Voice Narration</span>
          <span aria-hidden="true">·</span>
          <span>Always-On Screen Keep-Awake</span>
        </div>
      </footer>
    </div>
  );
}
