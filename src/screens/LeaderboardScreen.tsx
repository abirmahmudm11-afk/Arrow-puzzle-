/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, Medal, Star, Flame, Crown, User } from 'lucide-react';
import { LeaderboardEntry } from '../game/types';
import { sound } from '../audio/soundManager';

interface LeaderboardScreenProps {
  entries: LeaderboardEntry[];
  userCoins: number;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  entries,
  userCoins,
}) => {
  const top1 = entries.find((e) => e.rank === 1) || entries[0];
  const top2 = entries.find((e) => e.rank === 2) || entries[1];
  const top3 = entries.find((e) => e.rank === 3) || entries[2];

  return (
    <div className="relative min-h-screen w-full flex flex-col p-4 bg-[#F8FAFC] text-slate-800 select-none pb-24">
      {/* Header */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800">Global Leaders</h1>
            <p className="text-xs text-slate-500 font-medium">Top arrow puzzle tacticians</p>
          </div>
        </div>

        {/* Coins pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFF2FE] border border-[#D5E0FC] shadow-xs">
          <span className="text-xs font-black font-mono text-[#1E293B] tabular-nums">{userCoins}</span>
          <span className="text-xs">🪙</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col gap-4">
        {/* Top 3 Podium Card */}
        <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100 flex flex-col items-center">
          <div className="w-full flex items-end justify-center gap-3 pt-4 pb-2">
            {/* Rank 2 (Silver) */}
            {top2 && (
              <div className="flex-1 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-black text-slate-600 text-sm shadow-xs relative">
                  <span>{top2.displayName.slice(0, 2).toUpperCase()}</span>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-800 text-[10px] font-black flex items-center justify-center">
                    2
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2 truncate max-w-[80px]">
                  {top2.displayName}
                </span>
                <span className="text-[10px] font-bold text-slate-500 font-mono">
                  Lvl {top2.levelsSolved}
                </span>
                <div className="w-full h-14 bg-[#EFF2FE] rounded-t-xl mt-2 flex items-center justify-center border-t border-slate-200">
                  <span className="text-sm font-black text-slate-400">🥈</span>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold) */}
            {top1 && (
              <div className="flex-1 flex flex-col items-center">
                <div className="relative">
                  <Crown className="w-6 h-6 text-amber-500 fill-amber-400 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
                  <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center font-black text-amber-700 text-base shadow-md">
                    <span>{top1.displayName.slice(0, 2).toUpperCase()}</span>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-amber-950 text-xs font-black flex items-center justify-center shadow-xs">
                      1
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-900 mt-2 truncate max-w-[90px]">
                  {top1.displayName}
                </span>
                <span className="text-[10px] font-black text-amber-600 font-mono">
                  Lvl {top1.levelsSolved}
                </span>
                <div className="w-full h-20 bg-gradient-to-t from-amber-100 to-amber-50 rounded-t-xl mt-2 flex items-center justify-center border-t-2 border-amber-300 shadow-xs">
                  <span className="text-lg font-black text-amber-600">🥇</span>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3 && (
              <div className="flex-1 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-700/40 flex items-center justify-center font-black text-amber-800 text-sm shadow-xs relative">
                  <span>{top3.displayName.slice(0, 2).toUpperCase()}</span>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] font-black flex items-center justify-center">
                    3
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2 truncate max-w-[80px]">
                  {top3.displayName}
                </span>
                <span className="text-[10px] font-bold text-slate-500 font-mono">
                  Lvl {top3.levelsSolved}
                </span>
                <div className="w-full h-10 bg-[#EFF2FE] rounded-t-xl mt-2 flex items-center justify-center border-t border-slate-200">
                  <span className="text-sm font-black text-amber-700">🥉</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Ranks List */}
        <div className="bg-white rounded-3xl p-4 shadow-xl border border-slate-100 flex flex-col gap-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 px-2 py-1">
            Global Leaderboard
          </h2>

          <div className="flex flex-col gap-2 max-h-[35vh] overflow-y-auto pr-1">
            {entries.map((entry) => (
              <div
                key={entry.userId}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  entry.isCurrentUser
                    ? 'bg-[#EFF2FE] border-[#4F67F7] shadow-xs ring-1 ring-[#4F67F7]'
                    : 'bg-[#F8FAFC] border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-mono font-black text-xs text-slate-700">
                    {entry.rank}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      {entry.displayName}
                      {entry.isCurrentUser && (
                        <span className="text-[10px] bg-[#4F67F7] text-white font-bold px-1.5 py-0.2 rounded-md">
                          YOU
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Level {entry.levelsSolved} Solved
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black font-mono text-[#4F67F7]">
                    {entry.coins} 🪙
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
