/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Hammer, Shuffle, Lightbulb, Plus } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface BottomToolsHUDProps {
  starBlastsLeft: number;
  hammersLeft: number;
  shufflesLeft: number;
  hintsLeft: number;
  isHammerActive?: boolean;
  onStarBlast: () => void;
  onHammer: () => void;
  onShuffle: () => void;
  onHint: () => void;
  onBuyOrWatchPowerup?: (type: 'star' | 'hammer' | 'shuffle' | 'hint') => void;
}

export const BottomToolsHUD: React.FC<BottomToolsHUDProps> = ({
  starBlastsLeft,
  hammersLeft,
  shufflesLeft,
  hintsLeft,
  isHammerActive = false,
  onStarBlast,
  onHammer,
  onShuffle,
  onHint,
  onBuyOrWatchPowerup,
}) => {
  return (
    <footer className="w-full max-w-md mx-auto px-4 py-3 select-none z-30">
      <div className="flex items-center justify-between gap-3 p-3 bg-[#EFF2FE] border border-[#D5E0FC] rounded-3xl shadow-lg shadow-indigo-100/50">
        {/* 1. Star Blast Powerup */}
        <button
          onClick={() => {
            if (starBlastsLeft > 0) {
              sound.playClick();
              onStarBlast();
            } else if (onBuyOrWatchPowerup) {
              onBuyOrWatchPowerup('star');
            }
          }}
          aria-label="Star Blast Powerup: Clears 3 blocking arrows"
          className="relative flex-1 flex flex-col items-center justify-center p-2 rounded-2xl bg-white hover:bg-amber-50/50 active:scale-95 transition cursor-pointer shadow-xs border border-slate-100"
        >
          {/* Badge count */}
          <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
            {starBlastsLeft > 0 ? starBlastsLeft : <Plus className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center mb-1">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
          </div>
          <span className="text-[11px] font-bold text-[#1E293B]">Star Blast</span>
        </button>

        {/* 2. Hammer Powerup */}
        <button
          onClick={() => {
            if (hammersLeft > 0) {
              sound.playClick();
              onHammer();
            } else if (onBuyOrWatchPowerup) {
              onBuyOrWatchPowerup('hammer');
            }
          }}
          aria-label="Hammer Powerup: Smash any arrow directly"
          className={`relative flex-1 flex flex-col items-center justify-center p-2 rounded-2xl transition cursor-pointer shadow-xs border ${
            isHammerActive
              ? 'bg-red-50 border-red-300 ring-2 ring-red-400 animate-pulse'
              : 'bg-white hover:bg-rose-50/50 border-slate-100 active:scale-95'
          }`}
        >
          {/* Badge count */}
          <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
            {hammersLeft > 0 ? hammersLeft : <Plus className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center mb-1">
            <Hammer className="w-5 h-5 text-rose-500" />
          </div>
          <span className="text-[11px] font-bold text-[#1E293B]">Hammer</span>
        </button>

        {/* 3. Shuffle Powerup */}
        <button
          onClick={() => {
            if (shufflesLeft > 0) {
              sound.playClick();
              onShuffle();
            } else if (onBuyOrWatchPowerup) {
              onBuyOrWatchPowerup('shuffle');
            }
          }}
          aria-label="Shuffle Powerup: Reorient stuck arrows"
          className="relative flex-1 flex flex-col items-center justify-center p-2 rounded-2xl bg-white hover:bg-sky-50/50 active:scale-95 transition cursor-pointer shadow-xs border border-slate-100"
        >
          {/* Badge count */}
          <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
            {shufflesLeft > 0 ? shufflesLeft : <Plus className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center mb-1">
            <Shuffle className="w-5 h-5 text-sky-600" />
          </div>
          <span className="text-[11px] font-bold text-[#1E293B]">Shuffle</span>
        </button>

        {/* 4. Hint Powerup */}
        <button
          onClick={() => {
            if (hintsLeft > 0) {
              sound.playClick();
              onHint();
            } else if (onBuyOrWatchPowerup) {
              onBuyOrWatchPowerup('hint');
            }
          }}
          aria-label="Hint Powerup: Highlight next clear arrow"
          className="relative flex-1 flex flex-col items-center justify-center p-2 rounded-2xl bg-white hover:bg-emerald-50/50 active:scale-95 transition cursor-pointer shadow-xs border border-slate-100"
        >
          {/* Badge count */}
          <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
            {hintsLeft > 0 ? hintsLeft : <Plus className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center mb-1">
            <Lightbulb className="w-5 h-5 text-emerald-600 fill-emerald-400" />
          </div>
          <span className="text-[11px] font-bold text-[#1E293B]">Hint</span>
        </button>
      </div>
    </footer>
  );
};
