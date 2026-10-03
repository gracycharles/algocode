'use client';

import React, { useEffect, useState } from 'react';
import { screenManager } from '@/lib/screenManager';
import { haptics } from '@/lib/haptics';
import {
  Maximize,
  Minimize,
  Sun,
  SunMedium,
  Vibrate,
  VibrateOff,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface TopBarProps {
  activeTab: '3x3' | '4x4' | '5x5' | 'drill' | 'notation' | 'stats';
  onTabChange: (tab: '3x3' | '4x4' | '5x5' | 'drill' | 'notation' | 'stats') => void;
}

export default function TopBar({ activeTab, onTabChange }: TopBarProps) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [alwaysOn, setAlwaysOn] = useState<boolean>(() => screenManager.isAlwaysOn());
  const [hapticsOn, setHapticsOn] = useState<boolean>(() => haptics.isHapticsEnabled());
  const [soundOn, setSoundOn] = useState<boolean>(() => haptics.isSoundEnabled());

  useEffect(() => {
    const unsub = screenManager.subscribe((state) => {
      setAlwaysOn(state.alwaysOn);
      setIsFullscreen(state.fullscreen);
    });

    return () => unsub();
  }, []);

  const toggleAlwaysOn = () => {
    const next = !alwaysOn;
    screenManager.setAlwaysOn(next);
    setAlwaysOn(next);
    haptics.trigger('tick');
  };

  const toggleFullscreenMode = () => {
    screenManager.toggleFullscreen();
    haptics.trigger('tick');
  };

  const toggleHaptics = () => {
    const next = !hapticsOn;
    haptics.setHapticsEnabled(next);
    setHapticsOn(next);
    haptics.trigger('turn');
  };

  const toggleSound = () => {
    const next = !soundOn;
    haptics.setSoundEnabled(next);
    setSoundOn(next);
    haptics.trigger('turn');
  };

  return (
    <header className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-slate-800 bg-[#090d13]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onTabChange('3x3');
        }}
        className="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors shrink-0"
      >
        Algocube
      </a>

      {/* Zone 2: Clean navigation links */}
      <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-300">
        <button
          onClick={() => onTabChange('3x3')}
          className={`transition-colors hover:text-white py-1 ${
            activeTab === '3x3' ? 'text-white font-semibold underline underline-offset-8 decoration-blue-500 decoration-2' : 'text-slate-400'
          }`}
        >
          3x3 Speed
        </button>
        <button
          onClick={() => onTabChange('4x4')}
          className={`transition-colors hover:text-white py-1 ${
            activeTab === '4x4' ? 'text-white font-semibold underline underline-offset-8 decoration-amber-500 decoration-2' : 'text-slate-400'
          }`}
        >
          4x4 Revenge
        </button>
        <button
          onClick={() => onTabChange('5x5')}
          className={`transition-colors hover:text-white py-1 ${
            activeTab === '5x5' ? 'text-white font-semibold underline underline-offset-8 decoration-purple-500 decoration-2' : 'text-slate-400'
          }`}
        >
          5x5 Professor
        </button>
        <button
          onClick={() => onTabChange('drill')}
          className={`transition-colors hover:text-white py-1 ${
            activeTab === 'drill' ? 'text-white font-semibold underline underline-offset-8 decoration-emerald-500 decoration-2' : 'text-slate-400'
          }`}
        >
          Stopwatch
        </button>
        <button
          onClick={() => onTabChange('notation')}
          className={`transition-colors hover:text-white py-1 ${
            activeTab === 'notation' ? 'text-white font-semibold underline underline-offset-8 decoration-sky-500 decoration-2' : 'text-slate-400'
          }`}
        >
          Notation
        </button>
        <button
          onClick={() => onTabChange('stats')}
          className={`transition-colors hover:text-white py-1 ${
            activeTab === 'stats' ? 'text-white font-semibold underline underline-offset-8 decoration-rose-500 decoration-2' : 'text-slate-400'
          }`}
        >
          Progress
        </button>
      </nav>

      {/* Zone 3: Primary action toggles */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={toggleAlwaysOn}
          title={alwaysOn ? "Screen Keep-Awake: Active" : "Keep-Awake Off"}
          className={`min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            alwaysOn
              ? 'bg-amber-950/60 text-amber-300 border-amber-800/80 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          {alwaysOn ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <SunMedium className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Always-On</span>
        </button>

        <button
          onClick={toggleHaptics}
          title={hapticsOn ? "Haptic Vibration Active" : "Haptics Disabled"}
          className="min-h-[38px] min-w-[38px] p-2 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:text-white transition-colors flex items-center justify-center"
        >
          {hapticsOn ? <Vibrate className="w-4 h-4 text-emerald-400" /> : <VibrateOff className="w-4 h-4 text-slate-500" />}
        </button>

        <button
          onClick={toggleSound}
          title={soundOn ? "Magnetic Click Sound Active" : "Muted"}
          className="min-h-[38px] min-w-[38px] p-2 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:text-white transition-colors flex items-center justify-center"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        <button
          onClick={toggleFullscreenMode}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
          className="min-h-[38px] min-w-[38px] p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
