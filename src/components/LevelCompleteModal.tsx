/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, Coins, ArrowRight, RotateCcw, Sparkles, Check } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface LevelCompleteModalProps {
  levelId: number;
  stars: number;
  moves: number;
  optimalMoves: number;
  timeTaken: number;
  normalRewardCoins: number;
  isDaily?: boolean;
  onClaimNormal: () => void;
  onWatchAdForDouble: () => void;
  onNextLevel: () => void;
  onReplay: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelId,
  stars,
  moves,
  optimalMoves,
  timeTaken,
  normalRewardCoins,
  isDaily = false,
  onClaimNormal,
  onWatchAdForDouble,
  onNextLevel,
  onReplay,
}) => {
  const [hasClaimed, setHasClaimed] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState<number | null>(null);

  const handleClaimNormal = () => {
    if (hasClaimed) return;
    setHasClaimed(true);
    setClaimedAmount(normalRewardCoins);
    sound.playCoin();
    onClaimNormal();
  };

  const handleWatchAdDouble = () => {
    if (hasClaimed) return;
    sound.playClick();
    onWatchAdForDouble();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-100 shadow-2xl p-6 text-slate-800 flex flex-col items-center gap-4 animate-scale-up text-center">
        {/* Title Lockup */}
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#4F67F7] flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PUZZLE CLEARED!</span>
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {isDaily ? 'Daily Challenge' : `Level ${levelId}`}
          </h3>
        </div>

        {/* 3 Stars Banner */}
        <div className="flex items-center justify-center gap-3 my-1">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            return (
              <div
                key={`star_${starIdx}`}
                className={`relative transition-all duration-300 ${
                  isEarned ? 'scale-110 drop-shadow-md' : 'scale-90 opacity-40'
                }`}
              >
                <Star
                  className={`w-10 h-10 ${
                    isEarned
                      ? 'fill-amber-400 text-amber-500 animate-bounce'
                      : 'fill-slate-200 text-slate-300'
                  }`}
                  style={{ animationDelay: `${starIdx * 150}ms` }}
                />
              </div>
            );
          })}
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="p-2.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Moves Used</span>
            <span className="text-sm font-black font-mono text-slate-800">
              {moves} <span className="text-[10px] text-slate-400 font-normal">/ {optimalMoves} opt</span>
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Time Taken</span>
            <span className="text-sm font-black font-mono text-slate-800">{timeTaken}s</span>
          </div>
        </div>

        {/* Reward Pill */}
        <div className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#EFF2FE] border border-[#D5E0FC]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-sm shadow-xs">
              🪙
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-500 block">Reward Earned</span>
              <span className="text-xs font-black text-slate-800">
                +{claimedAmount !== null ? claimedAmount : normalRewardCoins} Coins
              </span>
            </div>
          </div>

          {!hasClaimed ? (
            <button
              onClick={handleWatchAdDouble}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 active:scale-95 text-white font-black text-xs shadow-xs transition cursor-pointer flex items-center gap-1"
            >
              <span>2X BONUS</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Claimed</span>
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2 mt-1">
          <button
            onClick={() => {
              sound.playClick();
              onNextLevel();
            }}
            className="w-full py-4 px-6 bg-gradient-to-r from-[#4F67F7] to-[#6355FE] hover:brightness-105 active:scale-98 text-white font-black text-base rounded-2xl shadow-xl shadow-indigo-300 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>NEXT LEVEL</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onReplay();
            }}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay This Level</span>
          </button>
        </div>
      </div>
    </div>
  );
};
