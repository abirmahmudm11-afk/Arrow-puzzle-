/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Flame, Shield, Check, Gift, Sparkles, Coins } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface DailyStreakModalProps {
  currentStreak: number;
  lastClaimDate?: string;
  onClaimDay: (day: number, coins: number) => void;
  onClose: () => void;
}

const STREAK_REWARDS = [
  { day: 1, coins: 50, item: null },
  { day: 2, coins: 75, item: null },
  { day: 3, coins: 100, item: '1 Hint' },
  { day: 4, coins: 150, item: null },
  { day: 5, coins: 200, item: '1 Shuffle' },
  { day: 6, coins: 300, item: '1 Star Blast' },
  { day: 7, coins: 500, item: '1 Hammer' },
];

export const DailyStreakModal: React.FC<DailyStreakModalProps> = ({
  currentStreak,
  lastClaimDate,
  onClaimDay,
  onClose,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyClaimedToday = lastClaimDate === todayStr;

  const activeDay = Math.min(7, ((currentStreak - 1) % 7) + 1);
  const [justClaimed, setJustClaimed] = useState(false);

  const handleClaim = () => {
    if (alreadyClaimedToday || justClaimed) return;
    sound.playReward();
    const reward = STREAK_REWARDS[activeDay - 1];
    onClaimDay(activeDay, reward.coins);
    setJustClaimed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 leading-tight">Daily Streak</h3>
              <p className="text-xs text-slate-500 font-medium">Check in daily for massive rewards!</p>
            </div>
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

        {/* Current streak badge */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EFF2FE] border border-[#D5E0FC]">
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[#4F67F7]" />
            <div>
              <span className="text-xs font-bold text-slate-700 block">Streak Multiplier</span>
              <span className="text-xs text-[#4F67F7] font-semibold">{currentStreak} Days In A Row</span>
            </div>
          </div>
          <div className="px-3 py-1 bg-white rounded-full text-xs font-black text-[#4F67F7] shadow-xs">
            {alreadyClaimedToday || justClaimed ? 'Checked In' : 'Ready'}
          </div>
        </div>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-4 gap-2 my-1">
          {STREAK_REWARDS.map((r) => {
            const isCompleted = r.day < activeDay || (r.day === activeDay && (alreadyClaimedToday || justClaimed));
            const isToday = r.day === activeDay;

            return (
              <div
                key={`day_${r.day}`}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : isToday
                    ? 'bg-[#EFF2FE] border-[#4F67F7] ring-2 ring-[#4F67F7]/30 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200/80 text-slate-400'
                } ${r.day === 7 ? 'col-span-2' : ''}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider mb-1">
                  Day {r.day}
                </span>

                <div className="w-7 h-7 rounded-full flex items-center justify-center mb-1">
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  ) : r.day === 7 ? (
                    <Gift className="w-5 h-5 text-amber-500 fill-amber-400" />
                  ) : (
                    <Coins className="w-4 h-4 text-amber-500" />
                  )}
                </div>

                <span className="text-xs font-black font-mono">+{r.coins}</span>
                {r.item && <span className="text-[9px] font-bold text-indigo-600 mt-0.5">{r.item}</span>}
              </div>
            );
          })}
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={alreadyClaimedToday || justClaimed}
          className={`w-full py-3.5 px-4 font-black text-sm rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 ${
            alreadyClaimedToday || justClaimed
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-[#4F67F7] to-[#6355FE] text-white shadow-indigo-300 hover:brightness-105 active:scale-98'
          }`}
        >
          {alreadyClaimedToday || justClaimed ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>CHECKED IN FOR TODAY</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>CHECK IN NOW (+{STREAK_REWARDS[activeDay - 1].coins} COINS)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
