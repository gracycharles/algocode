'use client';

import React from 'react';
import { Algorithm, MoveStep } from '@/lib/algorithms';
import { voiceCoach } from '@/lib/voiceCoach';
import { haptics } from '@/lib/haptics';
import { ColorNotation } from '@/lib/notationFormatter';
import { Volume2, Sparkles, Hand, HelpCircle, Layers, Lightbulb } from 'lucide-react';

interface MoveBreakdownProps {
  algorithm: Algorithm;
  currentStepIndex: number;
  onStepSelect?: (index: number) => void;
}

export default function MoveBreakdown({
  algorithm,
  currentStepIndex,
  onStepSelect,
}: MoveBreakdownProps) {
  const activeStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const currentStep: MoveStep = algorithm.moveSteps[activeStepIndex] || algorithm.moveSteps[0];

  const playStepAudio = (step: MoveStep) => {
    voiceCoach.speakMove(step.move, step.instruction);
    haptics.trigger('turn');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Active Step Card */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <ColorNotation notation={currentStep.move} size="lg" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
                Move {activeStepIndex + 1} of {algorithm.moves.length}
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">
                {currentStep.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => playStepAudio(currentStep)}
            title="Hear British Voice Callout"
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0 border border-slate-700/80"
          >
            <Volume2 className="w-4 h-4" />
            <span>Voice</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-slate-800/80">
          <div className="flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-emerald-300 block uppercase tracking-wide">Layer & Direction</span>
              <p className="text-sm text-slate-200 mt-0.5 leading-snug">{currentStep.instruction}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Hand className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-amber-300 block uppercase tracking-wide">Ergonomic Fingertrick</span>
              <p className="text-sm text-slate-200 mt-0.5 leading-snug">{currentStep.fingerTrick}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Aid & Execution Strategy */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 shadow-sm">
        {algorithm.mnemonic && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-900 border border-amber-800/80 text-xs flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="text-amber-400 font-bold uppercase tracking-wider block text-[11px]">
                Tip to Remember (Mnemonic Hook)
              </span>
              <span className="text-amber-200 font-medium text-sm block mt-0.5 leading-snug">
                "{algorithm.mnemonic}"
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Execution Strategy & Mechanics</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {algorithm.explanation}
        </p>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-300 font-semibold uppercase tracking-wider text-[11px] block">
              Tactile Speed Cue
            </strong>
            <span className="text-slate-200 mt-0.5 block">{algorithm.tactileTip}</span>
          </div>
        </div>
      </div>

      {/* Complete Sequence */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Complete Move Sequence ({algorithm.moves.length} Steps)
        </h4>
        <div className="divide-y divide-slate-800/60 rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          {algorithm.moveSteps.map((step, idx) => {
            const isCurrent = idx === activeStepIndex;
            return (
              <div
                key={`${step.move}-${idx}`}
                onClick={() => {
                  onStepSelect?.(idx);
                  haptics.trigger('tick');
                }}
                className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                  isCurrent
                    ? 'bg-blue-950/40 text-white border-l-4 border-blue-500'
                    : 'hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-500 w-5">
                    {idx + 1}.
                  </span>
                  <ColorNotation notation={step.move} size="sm" />
                  <div>
                    <span className="text-sm font-medium block leading-tight">{step.title}</span>
                    <span className="text-xs text-slate-400 block line-clamp-1">
                      {step.instruction}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playStepAudio(step);
                  }}
                  className="p-1.5 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-600"
                  title="Speak Move"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
