/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Calendar, Flame, Coins, Play, CheckCircle2, Trophy } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface DailyChallengeScreenProps {
  currentStreak: number;
  longestStreak: number;
  lastDailyDate?: string;
  todayDateStr: string;
  onPlayDaily: () => void;
  onBack: () => void;
}

export const DailyChallengeScreen: React.FC<DailyChallengeScreenProps> = ({
  currentStreak,
  longestStreak,
  lastDailyDate,
  todayDateStr,
  onPlayDaily,
  onBack,
}) => {
  const isAlreadyCompletedToday = lastDailyDate === todayDateStr;

  return (
    <div className="relative min-h-screen w-full flex flex-col p-4 bg-zinc-950 text-white select-none">
      {/* Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between py-2 border-b border-zinc-800">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition cursor-pointer"
          aria-label="Back to main menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold tracking-wider uppercase text-zinc-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Daily Challenge</span>
        </h2>

        <div className="w-9" />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center my-auto py-6 text-center gap-5">
        {/* Date Display */}
        <div className="px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
          Puzzle of the Day: <span className="text-emerald-400 font-bold">{todayDateStr}</span>
        </div>

        {/* Streak Showcase Card */}
        <div className="w-full p-5 rounded-3xl bg-linear-to-b from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/30 flex items-center justify-around shadow-xl">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-1 shadow-md shadow-orange-500/20">
              <Flame className="w-6 h-6 fill-orange-400" />
            </div>
            <span className="text-2xl font-black font-mono text-white tabular-nums">
              {currentStreak}
            </span>
            <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
              Day Streak
            </span>
          </div>

          <div className="h-12 w-px bg-zinc-800" />

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1 shadow-md shadow-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black font-mono text-white tabular-nums">
              {longestStreak}
            </span>
            <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
              Best Streak
            </span>
          </div>
        </div>

        {/* Rewards Breakdown */}
        <div className="w-full p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-300">Completion Bonus</span>
          <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>+150 Coins + Streak Bonus</span>
          </div>
        </div>

        {/* Action Button */}
        {isAlreadyCompletedToday ? (
          <div className="w-full p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Completed for Today! Come back tomorrow.</span>
          </div>
        ) : (
          <button
            onClick={() => {
              sound.playClick();
              onPlayDaily();
            }}
            className="w-full py-4 px-6 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-zinc-950" />
            <span>PLAY TODAY'S DAILY PUZZLE</span>
          </button>
        )}
      </div>
    </div>
  );
};
