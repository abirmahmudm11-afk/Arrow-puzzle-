/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronLeft, Coins, Heart, Pause, Volume2, VolumeX } from 'lucide-react';
import { GameMode } from '../game/types';
import { sound } from '../audio/soundManager';

interface HeaderHUDProps {
  mode: GameMode;
  levelTitle: string;
  category?: string;
  coins: number;
  movesMade: number;
  hearts: number; // 0 to 3
  maxHearts?: number;
  moveLimit?: number;
  timeLeft?: number;
  isMuted: boolean;
  onBack: () => void;
  onPause: () => void;
  onToggleMute: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  mode,
  levelTitle,
  category,
  coins,
  movesMade,
  hearts,
  maxHearts = 3,
  moveLimit,
  timeLeft,
  isMuted,
  onBack,
  onPause,
  onToggleMute,
}) => {
  // If in moveLimit mode or normal countdown display
  const displayMoves = moveLimit !== undefined ? Math.max(0, moveLimit - movesMade) : movesMade;

  return (
    <header className="w-full max-w-md mx-auto flex items-center justify-between px-3 py-2.5 select-none z-30">
      {/* Left Back Arrow Button */}
      <button
        onClick={() => {
          sound.playClick();
          onBack();
        }}
        aria-label="Return to home"
        className="w-10 h-10 rounded-full bg-[#EFF2FE] hover:bg-[#E0E7FE] active:scale-95 text-[#3B49A2] border border-[#D5E0FC] flex items-center justify-center transition cursor-pointer shadow-xs"
      >
        <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Moves Pill Badge - matching screenshot 'Moves 255' */}
      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFF2FE] border border-[#D5E0FC] shadow-xs">
        <span className="text-xs font-black tracking-wide text-[#3B49A2]">Moves</span>
        <span className="text-xs font-black font-mono text-[#1E293B] tabular-nums">
          {displayMoves}
        </span>
      </div>

      {/* Hearts Life Indicator - 3 Red Hearts ❤️ ❤️ ❤️ */}
      <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FFF1F2] border border-[#FFE4E6] shadow-xs">
        {Array.from({ length: maxHearts }).map((_, idx) => {
          const isAlive = idx < hearts;
          return (
            <Heart
              key={`heart_${idx}`}
              className={`w-4 h-4 transition-transform duration-300 ${
                isAlive
                  ? 'fill-red-500 text-red-500 scale-100'
                  : 'fill-slate-200 text-slate-300 scale-90 opacity-60'
              }`}
            />
          );
        })}
      </div>

      {/* Coin Counter Pill */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFF2FE] border border-[#D5E0FC] shadow-xs">
        <span className="text-xs font-black font-mono text-[#1E293B] tabular-nums">{coins}</span>
        <div className="w-4 h-4 rounded-full bg-amber-400 border border-amber-500 flex items-center justify-center shadow-xs">
          <span className="text-[10px] font-black text-amber-950 leading-none">🪙</span>
        </div>
      </div>

      {/* Pause/Mute Menu Button */}
      <button
        onClick={() => {
          sound.playClick();
          onPause();
        }}
        aria-label="Pause game"
        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 flex items-center justify-center transition cursor-pointer"
      >
        <Pause className="w-4 h-4" />
      </button>
    </header>
  );
};
