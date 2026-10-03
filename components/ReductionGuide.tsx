'use client';

import React, { useState } from 'react';
import { Algorithm, CUBE_ALGORITHMS } from '@/lib/algorithms';
import { ColorNotation } from '@/lib/notationFormatter';
import {
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Layers,
  Box,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  X,
  Play,
  ArrowRight,
} from 'lucide-react';

interface SubStepInfo {
  label: string;
  code: string;
  desc: string;
}

interface StepInfo {
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  subSteps?: SubStepInfo[];
  tip: string;
  recommendedAlgId: string;
  color: string;
  badgeColor: string;
}

interface ReductionGuideProps {
  cubeType: '4x4' | '5x5';
  onSelectAlgorithm: (alg: Algorithm) => void;
  onClose?: () => void;
}

export default function ReductionGuide({
  cubeType,
  onSelectAlgorithm,
  onClose,
}: ReductionGuideProps) {
  const steps5x5: StepInfo[] = [
    {
      stepNumber: 1,
      title: 'Phase 1: Build the 6 Composite Centers (3x3 Blocks)',
      subtitle: 'Reduce center pieces first without disturbing fixed orientations',
      description:
        'A scrambled 5x5 has 54 center pieces (9 per face). Group matching colors to create 3x3 center blocks on all 6 sides in standard color order (White top, Yellow bottom, Green front, Red right).',
      tip: 'Use the Inner Slice Commutator to swap misplaced center dots without scrambling previously completed centers.',
      recommendedAlgId: '5x5-center-commutator',
      color: 'from-blue-600 to-indigo-700',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-700',
    },
    {
      stepNumber: 2,
      title: 'Phase 2: Pair Composite Edges (12x 1x3 Edge Trios)',
      subtitle: 'Combine 1 Center Edge + 2 Wing Edges into solid 1x3 composite edges',
      description:
        'A 5x5 edge consists of 3 pieces: 1 Center Edge + 2 Outer Wings (Upper Wing & Lower Wing). Freeslicing pairs them in two stages:',
      subSteps: [
        {
          label: 'A. Upper Wing Pairing',
          code: 'Uw\' (R U R\' F R\' F\' R) Uw',
          desc: 'Turn top two layers (Uw\') to connect the top wing to the center edge. If the wing orientation is upside down, execute Edge Flip (R U R\' F R\' F\' R) before slicing back with Uw.',
        },
        {
          label: 'B. Lower Wing Pairing',
          code: '3Uw\' (R U R\' F R\' F\' R) 3Uw',
          desc: 'Turn top three layers (3Uw\') to connect the bottom wing to the center edge, flip if inverted, then slice back with 3Uw to restore centers.',
        },
        {
          label: 'C. Last 2 Edges (L2E) Wing Swap',
          code: '2R2 U2 2R2 Uw2 2R2 2Uw2',
          desc: 'When 10 edges are solved and freeslicing is unavailable, place the final 2 edges facing each other on Front-Left & Front-Right and execute this algorithm to swap misaligned wings directly.',
        },
      ],
      tip: 'Remember: If the wing colors are inverted before slicing, execute Edge Flip (R U R\' F R\' F\' R) first so colors match when joined!',
      recommendedAlgId: '5x5-freeslice-pairing',
      color: 'from-amber-600 to-orange-700',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
    },
    {
      stepNumber: 3,
      title: 'Phase 3: Solve as a Standard 3x3 Cube',
      subtitle: 'Treat center blocks as 3x3 centers and edge trios as single edges',
      description:
        'Once all 6 centers and 12 edge trios are reduced, the 5x5 behaves exactly like a regular 3x3! Execute standard 3x3 CFOP (Cross, F2L, OLL, PLL) or Layer-by-Layer.',
      tip: 'Never make single-slice inner turns during 3x3 phase! Only use outer face turns (R, L, U, D, F, B).',
      recommendedAlgId: '3x3-sexy-move',
      color: 'from-emerald-600 to-teal-700',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    },
    {
      stepNumber: 4,
      title: 'Phase 4: Solve Special Parity Errors (If Occurs)',
      subtitle: 'Fix single flipped wing or swapped edge pairs at the end',
      description:
        'On big cubes like 5x5, a single edge wing pair may end up flipped upside down (OLL Parity) or two opposite wings swapped (PLL Parity). These states are impossible on a 3x3 and require parity algorithms.',
      tip: 'Apply 5x5 OLL Parity if 1 edge trio is flipped. Apply 5x5 PLL Parity if opposite wings are swapped during last 2 edges.',
      recommendedAlgId: '5x5-oll-parity',
      color: 'from-purple-600 to-pink-700',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-700',
    },
  ];

  const steps4x4: StepInfo[] = [
    {
      stepNumber: 1,
      title: 'Phase 1: Group Center Blocks (2x2 Centers)',
      subtitle: 'Build 6 centers in standard color scheme',
      description:
        'Build 2x2 center blocks in standard order (White opposite Yellow, Green opposite Blue, Red opposite Orange).',
      tip: 'Build White first, then Yellow opposite, then side centers in order.',
      recommendedAlgId: '4x4-center-half',
      color: 'from-amber-600 to-orange-700',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
    },
    {
      stepNumber: 2,
      title: 'Phase 2: Pair Composite Edges (12x Edge Pairs)',
      subtitle: 'Pair 2 matching edge halves into 12 composite edge pairs',
      description:
        'Match corresponding edge pieces using wide slice turns (Uw) and the Edge Flipping algorithm (R U R\' F R\' F\' R).',
      tip: 'Use Uw\' (R U R\' F R\' F\' R) Uw to pair wings without breaking centers.',
      recommendedAlgId: '4x4-edge-pairing',
      color: 'from-blue-600 to-indigo-700',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-700',
    },
    {
      stepNumber: 3,
      title: 'Phase 3: Solve as Standard 3x3',
      subtitle: 'Execute 3x3 CFOP or Layer-by-Layer',
      description: 'Treat composite 2x2 centers as single centers and 1x2 edges as single edges.',
      tip: 'Only turn outer layers during 3x3 stage.',
      recommendedAlgId: '3x3-sexy-move',
      color: 'from-emerald-600 to-teal-700',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    },
    {
      stepNumber: 4,
      title: 'Phase 4: OLL & PLL Parity Fixes',
      subtitle: 'Resolve single flipped edge or swapped corners/edges',
      description:
        'Apply 4x4 OLL Parity if top cross has an odd edge count. Apply 4x4 PLL Parity if 2 opposite edges or corners need swapping.',
      tip: 'Use 4x4 OLL Parity or PLL Parity algorithms to complete the puzzle.',
      recommendedAlgId: '4x4-oll-parity',
      color: 'from-purple-600 to-pink-700',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-700',
    },
  ];

  const steps = cubeType === '5x5' ? steps5x5 : steps4x4;

  const handleLaunchAlg = (algId: string) => {
    const alg = CUBE_ALGORITHMS.find((a) => a.id === algId);
    if (alg) {
      onSelectAlgorithm(alg);
      onClose?.();
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-700 text-xs font-bold font-mono">
              Beginner Guide &amp; Masterclass
            </span>
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Reduction Method
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            How to Solve a Scrambled {cubeType} Cube (Step-by-Step)
          </h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Crucial Beginner Explanation Banner */}
      <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-700/80 text-xs text-amber-200 flex items-start gap-3 shadow-md">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <strong className="text-amber-300 font-bold text-sm block">
            Why a single algorithm cannot solve a scrambled {cubeType} all at once:
          </strong>
          <p className="text-slate-200">
            Big cubes like the {cubeType} are solved using the <strong>Reduction Method</strong> in 4 distinct phases. An individual algorithm is a specific tool for a specific phase—not a single sequence that solves a full scramble from scratch!
          </p>
        </div>
      </div>

      {/* 4 Reduction Phases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((s) => {
          const recAlg = CUBE_ALGORITHMS.find((a) => a.id === s.recommendedAlgId);
          return (
            <div
              key={s.stepNumber}
              className={`p-4 rounded-xl bg-slate-950/90 border border-slate-700/80 flex flex-col justify-between gap-3 shadow-md transition-all hover:border-blue-500/80`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${s.badgeColor}`}>
                    Phase {s.stepNumber}
                  </span>
                  {recAlg && (
                    <span className="text-[11px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {recAlg.moves.length} moves
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white leading-tight">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {s.description}
                </p>

                {/* Optional Sub-steps for Phase 2 */}
                {s.subSteps && (
                  <div className="space-y-2 pt-2">
                    {s.subSteps.map((sub, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-blue-300">
                          <span>{sub.label}</span>
                        </div>
                        <ColorNotation notation={sub.code} size="sm" />
                        <p className="text-[11px] text-slate-300 leading-snug pt-0.5">{sub.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-800">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-start gap-2 text-slate-200">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 font-semibold block text-[11px]">Key Strategy:</strong>
                    <span>{s.tip}</span>
                  </div>
                </div>

                {recAlg && (
                  <button
                    onClick={() => handleLaunchAlg(recAlg.id)}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-between transition-colors shadow-md shadow-blue-600/30"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                      <span className="truncate">Load {recAlg.name} in 3D</span>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
