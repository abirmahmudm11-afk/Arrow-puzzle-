/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ArrowRight, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface HowItWorksModalProps {
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EFF2FE] text-[#4F67F7] flex items-center justify-center font-bold text-sm">
              ?
            </div>
            <h3 className="text-lg font-black text-slate-800">How It Works</h3>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps List */}
        <div className="flex flex-col gap-3.5 my-1 text-xs text-slate-600">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
              1
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm block mb-0.5">Tap To Exit</span>
              Tap an arrow to shoot it off the board in the direction its tip points.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
              2
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm block mb-0.5">Clear The Path</span>
              An arrow can only exit when its entire path to the edge is free of other arrows. Clear outer arrows first!
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FFF1F2] border border-[#FFE4E6]">
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
              3
            </div>
            <div>
              <span className="font-bold text-rose-900 text-sm block mb-0.5">Watch Your Hearts</span>
              Tapping a blocked arrow costs <strong className="text-rose-600">1 Heart</strong>! You have 3 lives per level.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#EFF2FE] border border-[#D5E0FC]">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-[#4F67F7] flex items-center justify-center font-bold shrink-0 mt-0.5">
              4
            </div>
            <div>
              <span className="font-bold text-indigo-950 text-sm block mb-0.5">Tactical Power-Ups</span>
              Use <strong>Star Blast</strong> (explodes 3 blockers), <strong>Hammer</strong> (smashes any arrow), <strong>Shuffle</strong>, and <strong>Hint</strong> when you're stuck.
            </div>
          </div>
        </div>

        {/* Got it CTA */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-[#4F67F7] to-[#6355FE] hover:from-[#435be3] hover:to-[#5547ea] active:scale-98 text-white font-black text-sm rounded-2xl shadow-md shadow-indigo-300 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I'M READY TO PLAY</span>
        </button>
      </div>
    </div>
  );
};
