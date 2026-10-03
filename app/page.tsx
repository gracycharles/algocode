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
import { ColorNotation } from '@/lib/notationFormatter';

import TopBar from '@/components/TopBar';
import CubeViewer3D from '@/components/CubeViewer3D';
import MoveBreakdown from '@/components/MoveBreakdown';
import PracticeDrill from '@/components/PracticeDrill';
import NotationReference from '@/components/NotationReference';
import ProgressStats from '@/components/ProgressStats';
import ReductionGuide from '@/components/ReductionGuide';

import {
  ChevronRight,
  CheckCircle2,
  Box,
  Layers,
  Timer,
  BookOpen,
  Award,
  Search,
  X,
  HelpCircle,
  Sparkles,
  BookMarked,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'3x3' | '4x4' | '5x5' | 'drill' | 'notation' | 'stats'>('3x3');
  const [selectedCubeType, setSelectedCubeType] = useState<CubeType>('3x3');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>(CUBE_ALGORITHMS[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showGuide, setShowGuide] = useState<boolean>(false);
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
    setSearchQuery('');
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
    if (selectedCategory !== 'All' && a.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = a.name.toLowerCase().includes(q);
      const matchShort = a.shortName.toLowerCase().includes(q);
      const matchStage = a.stageName.toLowerCase().includes(q);
      const matchCategory = a.category.toLowerCase().includes(q);
      const matchMnemonic = a.mnemonic?.toLowerCase().includes(q) ?? false;
      const matchMoves = a.moves.join(' ').toLowerCase().includes(q);
      return matchName || matchShort || matchStage || matchCategory || matchMnemonic || matchMoves;
    }
    return true;
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
        {/* Stage Status & Category Filter Header */}
        {(activeTab === '3x3' || activeTab === '4x4' || activeTab === '5x5') && (
          <div className="flex flex-col gap-3 border-b border-slate-800 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    selectedCubeType === '5x5'
                      ? 'bg-purple-500 shadow-purple-500/50 shadow-sm'
                      : selectedCubeType === '4x4'
                      ? 'bg-amber-500 shadow-amber-500/50 shadow-sm'
                      : 'bg-blue-500 shadow-blue-500/50 shadow-sm'
                  }`}
                />
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {selectedCubeType === '3x3'
                    ? '3x3 Speedcubing Masterclass'
                    : selectedCubeType === '4x4'
                    ? "4x4 Rubik's Revenge"
                    : "5x5 Professor's Cube"}
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200">
                  {displayedAlgorithms.length} Algorithms
                </span>

                {(selectedCubeType === '4x4' || selectedCubeType === '5x5') && (
                  <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="ml-2 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>How to Solve a Scrambled {selectedCubeType}</span>
                  </button>
                )}
              </div>

              {/* Instant Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search algorithm or trigger..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-blue-400 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* High Contrast Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-200 shrink-0 mr-1">
                Filter:
              </span>
              {categories.map((cat) => {
                const isCatSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      haptics.trigger('tick');
                    }}
                    className={`min-h-[34px] px-3.5 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                      isCatSelected
                        ? 'bg-blue-600 text-white border border-blue-400 shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                        : 'bg-slate-900 text-slate-200 border border-slate-700/90 hover:bg-slate-800 hover:text-white hover:border-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reduction Guide Modal / Section if Toggled */}
        {showGuide && (selectedCubeType === '4x4' || selectedCubeType === '5x5') && (
          <ReductionGuide
            cubeType={selectedCubeType}
            onSelectAlgorithm={handleSelectAlgorithm}
            onClose={() => setShowGuide(false)}
          />
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
                    className={`min-h-[108px] p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? selectedCubeType === '5x5'
                          ? 'bg-purple-950/60 border-purple-400 shadow-lg shadow-purple-500/20 ring-2 ring-purple-400'
                          : selectedCubeType === '4x4'
                          ? 'bg-amber-950/60 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                          : 'bg-blue-950/60 border-blue-400 shadow-lg shadow-blue-500/20 ring-2 ring-blue-400'
                        : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-blue-300 font-mono">
                          {alg.category}
                        </span>
                        {isMastered ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px] shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[11px] font-mono font-bold shrink-0 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            {alg.moves.length} moves
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white leading-tight line-clamp-1">
                        {alg.name}
                      </h4>
                      {alg.mnemonic && (
                        <span className="text-[11px] bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent font-semibold block truncate mt-0.5">
                          ✨ {alg.mnemonic}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 gap-2">
                      <ColorNotation notation={alg.shortName} size="sm" />
                      <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
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
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === '3x3' ? 'text-blue-400 font-bold' : 'text-slate-300'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>3x3</span>
        </button>

        <button
          onClick={() => handleTabChange('4x4')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === '4x4' ? 'text-amber-400 font-bold' : 'text-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>4x4</span>
        </button>

        <button
          onClick={() => handleTabChange('5x5')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === '5x5' ? 'text-purple-400 font-bold' : 'text-slate-300'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>5x5</span>
        </button>

        <button
          onClick={() => handleTabChange('drill')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === 'drill' ? 'text-emerald-400 font-bold' : 'text-slate-300'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>Timer</span>
        </button>

        <button
          onClick={() => handleTabChange('notation')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === 'notation' ? 'text-sky-400 font-bold' : 'text-slate-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Guide</span>
        </button>

        <button
          onClick={() => handleTabChange('stats')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
            activeTab === 'stats' ? 'text-rose-400 font-bold' : 'text-slate-300'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Stats</span>
        </button>
      </nav>
    </div>
  );
}
