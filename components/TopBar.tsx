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
  Box,
  Layers,
  Timer,
  BookOpen,
  Award,
} from 'lucide-react';

interface TopBarProps {
  activeTab: '3x3' | '4x4' | '5x5' | 'drill' | 'notation' | 'stats';
  onTabChange: (tab: '3x3' | '4x4' | '5x5' | 'drill' | 'notation' | 'stats') => void;
}

export default function TopBar({ activeTab, onTabChange }: TopBarProps) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [alwaysOn, setAlwaysOn] = useState<boolean>(false);
  const [hapticsOn, setHapticsOn] = useState<boolean>(true);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  useEffect(() => {
    setAlwaysOn(screenManager.isAlwaysOn());
    setHapticsOn(haptics.isHapticsEnabled());
    setSoundOn(haptics.isSoundEnabled());

    const unsubScreen = screenManager.subscribe((state) => {
      setAlwaysOn(state.alwaysOn);
      setIsFullscreen(state.fullscreen);
    });

    return () => {
      unsubScreen();
    };
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

  const navItems = [
    { id: '3x3' as const, label: '3x3 CFOP', icon: Box },
    { id: '4x4' as const, label: '4x4 Revenge', icon: Layers },
    { id: '5x5' as const, label: '5x5 Professor', icon: Box },
    { id: 'drill' as const, label: 'Stopwatch', icon: Timer },
    { id: 'notation' as const, label: 'Notation', icon: BookOpen },
    { id: 'stats' as const, label: 'Mastery', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#070b12]/95 backdrop-blur-md">
      <div className="max-w-[1520px] mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('3x3');
            }}
            className="flex items-center gap-2 group text-white hover:text-blue-400 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-mono font-bold text-sm shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40">
              3D
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight leading-tight">Algocube</span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline leading-none">Speedcubing Suite</span>
            </div>
          </a>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-1 max-w-[720px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`min-h-[36px] px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  isActive
                    ? item.id === '3x3'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                      : item.id === '4x4'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                      : item.id === '5x5'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                      : item.id === 'drill'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                      : item.id === 'notation'
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-1 ring-sky-400'
                      : 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                    : 'bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Sensory & Mode Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={toggleAlwaysOn}
            title={alwaysOn ? "Screen Keep-Awake: Active (Screen will not sleep)" : "Enable Screen Keep-Awake"}
            className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              alwaysOn
                ? 'bg-amber-950/80 text-amber-300 border-amber-700 shadow-sm'
                : 'bg-slate-900 text-slate-200 border-slate-700 hover:text-white hover:bg-slate-800'
            }`}
          >
            {alwaysOn ? <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <SunMedium className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Always-On</span>
          </button>

          <button
            onClick={toggleHaptics}
            title={hapticsOn ? "Tactile Vibration: Enabled" : "Vibration Disabled"}
            className={`min-h-[36px] min-w-[36px] p-2 rounded-lg border transition-colors flex items-center justify-center ${
              hapticsOn
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {hapticsOn ? <Vibrate className="w-4 h-4 text-emerald-400" /> : <VibrateOff className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleSound}
            title={soundOn ? "Tactile Snaps Sound: Active" : "Sound Muted"}
            className={`min-h-[36px] min-w-[36px] p-2 rounded-lg border transition-colors flex items-center justify-center ${
              soundOn
                ? 'bg-blue-950/80 text-blue-300 border-blue-700'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreenMode}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
            className="min-h-[36px] min-w-[36px] p-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
