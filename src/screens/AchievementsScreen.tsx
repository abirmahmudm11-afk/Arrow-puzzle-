/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Award, CheckCircle2, Coins, Star, Trophy } from 'lucide-react';
import { UserProfile, Achievement } from '../game/types';
import { ACHIEVEMENTS } from '../services/shopData';
import { sound } from '../audio/soundManager';

interface AchievementsScreenProps {
  userProfile: UserProfile;
  onClaimAchievementReward: (achievementId: string, rewardCoins: number) => void;
  onBack: () => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  userProfile,
  onClaimAchievementReward,
  onBack,
}) => {
  const [claimedAchievements, setClaimedAchievements] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('arrowflow_claimed_achievements');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const getProgress = (ach: Achievement): number => {
    switch (ach.id) {
      case 'ach_first_level':
        return Math.min(1, userProfile.stats.levelsCompletedCount);
      case 'ach_novice_tier':
        return Math.min(20, Object.keys(userProfile.completedLevels).filter((id) => parseInt(id) <= 20).length);
      case 'ach_apprentice_tier':
        return Math.min(20, Object.keys(userProfile.completedLevels).filter((id) => parseInt(id) >= 21 && parseInt(id) <= 40).length);
      case 'ach_adept_tier':
        return Math.min(20, Object.keys(userProfile.completedLevels).filter((id) => parseInt(id) >= 41 && parseInt(id) <= 60).length);
      case 'ach_century':
        return Math.min(100, userProfile.stats.levelsCompletedCount);
      case 'ach_three_stars_25':
        return Math.min(25, userProfile.stats.threeStarCount);
      case 'ach_daily_streak_3':
        return Math.min(3, userProfile.dailyStreak);
      case 'ach_no_hints_10':
        return Math.min(10, Math.max(0, userProfile.stats.levelsCompletedCount - userProfile.stats.totalHintsUsed));
      case 'ach_endless_wave_10':
        return Math.min(10, userProfile.stats.bestEndlessWave);
      case 'ach_collector':
        const cosmeticsCount = Object.keys(userProfile.inventory).filter(
          (k) => (k.startsWith('skin_') || k.startsWith('theme_')) && userProfile.inventory[k] === true
        ).length;
        return Math.min(3, cosmeticsCount);
      default:
        return 0;
    }
  };

  const handleClaim = (ach: Achievement) => {
    if (claimedAchievements[ach.id]) return;

    sound.playVictory();
    const updated = { ...claimedAchievements, [ach.id]: true };
    setClaimedAchievements(updated);
    try {
      localStorage.setItem('arrowflow_claimed_achievements', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    onClaimAchievementReward(ach.id, ach.reward);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col p-4 bg-zinc-950 text-white select-none">
      {/* Top Header */}
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
          <Award className="w-4 h-4 text-amber-400" />
          <span>Achievements</span>
        </h2>

        <div className="w-9" />
      </div>

      {/* Achievement List */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-3 flex-1 overflow-y-auto max-h-[75vh] py-4">
        {ACHIEVEMENTS.map((ach) => {
          const progress = getProgress(ach);
          const isCompleted = progress >= ach.maxProgress;
          const isClaimed = !!claimedAchievements[ach.id];

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border flex flex-col gap-2.5 transition-all ${
                isClaimed
                  ? 'bg-zinc-900/50 border-zinc-800/60 opacity-70'
                  : isCompleted
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-zinc-900/80 border-zinc-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-zinc-100">{ach.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{ach.description}</p>
                </div>

                <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-400 shrink-0">
                  <Coins className="w-3.5 h-3.5" />
                  <span>+{ach.reward}</span>
                </div>
              </div>

              {/* Progress Bar & Claim Button */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                    style={{ width: `${(progress / ach.maxProgress) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                  {progress}/{ach.maxProgress}
                </span>

                {isClaimed ? (
                  <span className="px-3 py-1 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Claimed
                  </span>
                ) : isCompleted ? (
                  <button
                    onClick={() => handleClaim(ach)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition active:scale-95 cursor-pointer shadow-md shadow-amber-500/25"
                  >
                    Claim Reward
                  </button>
                ) : (
                  <span className="px-2.5 py-1 text-zinc-500 text-xs font-medium">In Progress</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
