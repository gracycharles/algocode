'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CubeType,
  NOTATION_GUIDE_3X3,
  NOTATION_GUIDE_4X4,
  NOTATION_GUIDE_5X5,
  NotationInfo,
} from '@/lib/algorithms';
import { voiceCoach } from '@/lib/voiceCoach';
import { haptics } from '@/lib/haptics';
import { ColorNotation } from '@/lib/notationFormatter';
import { Volume2, BookOpen, Layers, Lightbulb, Hand } from 'lucide-react';

interface NotationReferenceProps {
  cubeType: CubeType;
  onExecuteMove?: (move: string) => void;
}

export default function NotationReference({ cubeType, onExecuteMove }: NotationReferenceProps) {
  const [selectedNotation, setSelectedNotation] = useState<NotationInfo | null>(null);

  const guide =
    cubeType === '5x5'
      ? NOTATION_GUIDE_5X5
      : cubeType === '4x4'
      ? NOTATION_GUIDE_4X4
      : NOTATION_GUIDE_3X3;

  const handleTestMove = (item: NotationInfo) => {
    setSelectedNotation(item);
    voiceCoach.speakMove(item.notation, item.description);
    haptics.trigger('turn');
    onExecuteMove?.(item.notation);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/60 flex flex-col shadow-md">
          <div className="relative h-44 w-full bg-slate-950">
            <Image
              src={
                cubeType === '5x5'
                  ? '/images/cube_5x5_professor.jpg'
                  : cubeType === '4x4'
                  ? '/images/cube_4x4_revenge.jpg'
                  : '/images/cube_3x3_speedcube.jpg'
              }
              alt={cubeType === '3x3' ? "Speedcube Anatomy" : `${cubeType} Layer Detail`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-medium">
              <span>{cubeType === '3x3' ? "3x3 Competition Core" : `${cubeType} Slice Layers Architecture`}</span>
              <span className="text-blue-300 font-mono text-[11px] bg-black/70 px-2 py-0.5 rounded border border-blue-500/40">HD Studio Asset</span>
            </div>
          </div>
          <div className="p-4 text-xs text-slate-300 space-y-1.5 flex-1">
            <strong className="text-white block font-semibold text-sm">
              {cubeType === '3x3' ? "Mechanics & Magnetics" : `${cubeType} Slice Geometry & Parities`}
            </strong>
            <p className="text-slate-400 leading-relaxed">
              {cubeType === '4x4'
                ? "The 4x4 (Rubik's Revenge) has 56 outer pieces with no stationary center anchors. Centers must be grouped into 2x2 blocks and edge halves paired before 3x3 reduction and parity fixes."
                : cubeType === '5x5'
                ? "The 5x5 contains 98 movable pieces across 5 distinct slices. Solving requires reducing composite centers (3x3 blocks) and pairing 1x3 wing edges before finishing as a standard 3x3."
                : "Modern speedcubes use neodymium magnets placed inside corner and edge feet to snap layers into alignment, eliminating mechanical lockups."}
            </p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/60 flex flex-col shadow-md">
          <div className="relative h-44 w-full bg-slate-950">
            <Image
              src="/images/fingertricks_grip.jpg"
              alt="Speedcubing Ergonomic Hand Placement"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-medium">
              <span>Home Grip & Index Flicks</span>
              <span className="text-amber-300 font-mono text-[11px] bg-black/70 px-2 py-0.5 rounded border border-amber-500/40">Ergonomic Tip</span>
            </div>
          </div>
          <div className="p-4 text-xs text-slate-300 space-y-2 flex-1">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <strong className="text-white font-semibold text-sm">
                Tip to Remember (Home Grip Rule)
              </strong>
            </div>
            <p className="text-amber-200/90 leading-relaxed bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/40">
              Keep both thumbs centered on the front face, index fingers resting on top corners, and ring fingers supporting the bottom layer. Never turn with your full palm.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Interactive {cubeType} Move Notation (Tap to Test on 3D Cube)</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono">Audio callouts enabled</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {guide.map((item) => {
            const isSelected = selectedNotation?.notation === item.notation;
            return (
              <button
                key={item.notation}
                onClick={() => handleTestMove(item)}
                className={`min-h-[76px] p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-blue-950/60 border-blue-500 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-400/40'
                    : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <ColorNotation notation={item.notation} size="md" />
                  <Volume2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                </div>
                <div>
                  <span className="text-xs font-semibold block text-slate-200">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-slate-400 block line-clamp-1 mt-0.5">
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedNotation && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ColorNotation notation={selectedNotation.notation} size="lg" />
              <span className="font-bold text-base text-white">
                {selectedNotation.name}
              </span>
            </div>
            <span className="text-amber-400 font-mono font-semibold px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
              {selectedNotation.angle}
            </span>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed">
            {selectedNotation.description}
          </p>
          <div className="pt-2.5 border-t border-slate-800 flex items-center gap-2 text-slate-300">
            <Hand className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Fingertrick Tip: <strong className="text-amber-200">{selectedNotation.fingerTrick}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
