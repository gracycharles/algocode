'use client';

import React from 'react';

interface ColorNotationProps {
  notation: string; // e.g. "R U R' U'" or "Rw U2 Rw'" or "R"
  size?: 'sm' | 'md' | 'lg';
  activeMoveIndex?: number; // optionally highlight the currently executing move
  className?: string;
}

export function getMoveColorClasses(move: string): {
  bg: string;
  text: string;
  border: string;
} {
  const clean = move.trim().replace(/[0-9]/g, '');
  const mainChar = clean.replace("'", '').toUpperCase();

  switch (mainChar) {
    case 'R':
      return {
        bg: 'bg-blue-950/80 hover:bg-blue-900/90',
        text: 'text-blue-300 font-bold',
        border: 'border-blue-500/60',
      };
    case 'L':
      return {
        bg: 'bg-rose-950/80 hover:bg-rose-900/90',
        text: 'text-rose-300 font-bold',
        border: 'border-rose-500/60',
      };
    case 'U':
      return {
        bg: 'bg-amber-950/80 hover:bg-amber-900/90',
        text: 'text-amber-300 font-bold',
        border: 'border-amber-500/60',
      };
    case 'D':
      return {
        bg: 'bg-purple-950/80 hover:bg-purple-900/90',
        text: 'text-purple-300 font-bold',
        border: 'border-purple-500/60',
      };
    case 'F':
      return {
        bg: 'bg-emerald-950/80 hover:bg-emerald-900/90',
        text: 'text-emerald-300 font-bold',
        border: 'border-emerald-500/60',
      };
    case 'B':
      return {
        bg: 'bg-sky-950/80 hover:bg-sky-900/90',
        text: 'text-sky-300 font-bold',
        border: 'border-sky-500/60',
      };
    case 'M':
    case 'E':
    case 'S':
      return {
        bg: 'bg-indigo-950/80 hover:bg-indigo-900/90',
        text: 'text-indigo-300 font-bold',
        border: 'border-indigo-500/60',
      };
    case 'X':
    case 'Y':
    case 'Z':
      return {
        bg: 'bg-slate-900 hover:bg-slate-800',
        text: 'text-slate-300 font-semibold',
        border: 'border-slate-700',
      };
    default:
      return {
        bg: 'bg-slate-900 hover:bg-slate-800',
        text: 'text-slate-200 font-bold',
        border: 'border-slate-700',
      };
  }
}

export function ColorNotation({
  notation,
  size = 'md',
  activeMoveIndex = -1,
  className = '',
}: ColorNotationProps) {
  if (!notation) return null;

  const moves = notation.trim().split(/\s+/);

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[11px] gap-1',
    md: 'px-2 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }[size];

  return (
    <div className={`flex flex-wrap items-center gap-1.5 font-mono ${className}`}>
      {moves.map((move, idx) => {
        const colors = getMoveColorClasses(move);
        const isPrime = move.includes("'");
        const isDouble = move.includes('2');
        const isWide = move.toLowerCase().includes('w') || move.startsWith('2') || move.startsWith('3');
        const isActive = activeMoveIndex === idx;

        return (
          <span
            key={`${move}-${idx}`}
            className={`inline-flex items-center rounded-md border font-mono transition-all ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses} ${
              isActive
                ? 'ring-2 ring-yellow-400 scale-110 shadow-md shadow-yellow-500/20 font-black'
                : ''
            }`}
          >
            <span>{move}</span>
            {isWide && (
              <span className="text-[9px] px-1 bg-white/10 rounded font-sans uppercase font-normal tracking-tight text-white/80">
                Wide
              </span>
            )}
            {isPrime && (
              <span className="text-[10px] text-rose-400 font-sans font-bold" title="Counter-clockwise">
                ′
              </span>
            )}
            {isDouble && (
              <span className="text-[10px] text-amber-300 font-sans font-bold" title="180° Turn">
                2
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
