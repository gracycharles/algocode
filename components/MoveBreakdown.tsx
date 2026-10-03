'use client';

import React from 'react';
import { Algorithm, MoveStep } from '@/lib/algorithms';
import { voiceCoach } from '@/lib/voiceCoach';
import { haptics } from '@/lib/haptics';
import { Volume2, Sparkles, Hand, HelpCircle, Layers } from 'lucide-react';

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
  const currentStep: MoveStep | undefined =
    currentStepIndex >= 0 ? algorithm.moveSteps[currentStepIndex] : undefined;

  const playStepAudio = (step: MoveStep) => {
    voiceCoach.speakMove(step.move, step.instruction);
    haptics.trigger('turn');
  };

  return (
    <div className="flex flex-col gap-5">
      {currentStep ? (
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-2xl font-mono font-bold text-blue-400 shadow-inner">
                {currentStep.move}
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
                  Move {currentStepIndex + 1} of {algorithm.moves.length}
                </span>
                <h3 className="text-lg font-semibold text-white leading-tight">
                  {currentStep.title}
                </h3>
              </div>
            </div>

            <button
              onClick={() => playStepAudio(currentStep)}
              title="Hear British Voice Callout"
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Volume2 className="w-4 h-4" />
              <span>Voice</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-medium text-slate-400 block">Layer & Direction</span>
                <p className="text-sm text-slate-200 mt-0.5">{currentStep.instruction}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Hand className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-medium text-slate-400 block">Ergonomic Fingertrick</span>
                <p className="text-sm text-slate-200 mt-0.5">{currentStep.fingerTrick}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
          <p className="text-sm text-slate-400">
            Press <strong className="text-blue-400">Play</strong> or step forward to inspect move-by-move beginner finger tricks and layer mechanics.
          </p>
        </div>
      )}

      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Execution Strategy & Tactile Feel</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {algorithm.explanation}
        </p>
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-300">Tactile Cue: </strong>
            {algorithm.tactileTip}
          </div>
        </div>
        {algorithm.mnemonic && (
          <div className="text-xs text-slate-400 flex items-baseline gap-2">
            <span className="text-slate-500 uppercase tracking-wider font-mono">Mnemonic:</span>
            <span className="text-amber-300 font-mono italic">{algorithm.mnemonic}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Complete Move Sequence ({algorithm.moves.length} Steps)
        </h4>
        <div className="divide-y divide-slate-800/60 rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          {algorithm.moveSteps.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
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
                  <span className="font-mono font-bold text-sm text-blue-400 px-2 py-0.5 bg-slate-950 rounded border border-slate-800">
                    {step.move}
                  </span>
                  <div>
                    <span className="text-sm font-medium">{step.title}</span>
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
                  className="p-1.5 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
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
