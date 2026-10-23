/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Star, Lock, CheckCircle2, FastForward, Sparkles } from 'lucide-react';
import { LevelResult } from '../game/types';
import { getAllLevels } from '../game/levels';
import { sound } from '../audio/soundManager';

interface LevelSelectScreenProps {
  completedLevels: Record<number, LevelResult>;
  skippedLevels: number[];
  highestUnlockedLevel: number;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

const TIERS = [
  { name: 'Novice', range: [1, 20], title: 'Tier 1: Morning Glade' },
  { name: 'Apprentice', range: [21, 40], title: 'Tier 2: Amber Cascade' },
  { name: 'Adept', range: [41, 60], title: 'Tier 3: Azure Sanctuary' },
  { name: 'Expert', range: [61, 80], title: 'Tier 4: Obsidian Labyrinth' },
  { name: 'Master', range: [81, 105], title: 'Tier 5: Zenith Core' },
];

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  completedLevels,
  skippedLevels,
  highestUnlockedLevel,
  onSelectLevel,
  onBack,
}) => {
  const [activeTierIdx, setActiveTierIdx] = useState(0);

  const allLevels = getAllLevels(105);
  const activeTier = TIERS[activeTierIdx];
  const tierLevels = allLevels.filter(
    (l) => l.id >= activeTier.range[0] && l.id <= activeTier.range[1]
  );

  const totalStars = Object.values(completedLevels).reduce((acc, cur) => acc + cur.stars, 0);

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

        <div className="flex flex-col items-center">
          <h2 className="text-base font-bold tracking-wider uppercase text-zinc-100">
            Level Select
          </h2>
          <span className="text-[11px] text-zinc-400">105 Playable Levels</span>
        </div>

        <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-mono font-bold text-amber-300">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="tabular-nums">{totalStars}</span>
        </div>
      </div>

      {/* Tier Category Selector Tabs */}
      <div className="w-full max-w-md mx-auto flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar">
        {TIERS.map((tier, idx) => (
          <button
            key={tier.name}
            onClick={() => {
              sound.playClick();
              setActiveTierIdx(idx);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTierIdx === idx
                ? 'bg-sky-500 text-zinc-950 shadow-md shadow-sky-500/25'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {tier.name}
          </button>
        ))}
      </div>

      {/* Tier Title Banner */}
      <div className="w-full max-w-md mx-auto text-xs text-zinc-400 font-semibold mb-2">
        {activeTier.title} ({activeTier.range[0]} - {activeTier.range[1]})
      </div>

      {/* Levels Grid (4 columns) */}
      <div className="w-full max-w-md mx-auto grid grid-cols-4 gap-2.5 py-2 flex-1 overflow-y-auto max-h-[70vh]">
        {tierLevels.map((lvl) => {
          const isCompleted = !!completedLevels[lvl.id];
          const isSkipped = skippedLevels.includes(lvl.id);
          const isUnlocked = lvl.id <= highestUnlockedLevel;
          const starsEarned = completedLevels[lvl.id]?.stars || 0;

          return (
            <button
              key={lvl.id}
              onClick={() => {
                if (!isUnlocked) {
                  sound.playBlocked();
                  return;
                }
                sound.playClick();
                onSelectLevel(lvl.id);
              }}
              disabled={!isUnlocked}
              className={`relative aspect-square rounded-2xl p-2 flex flex-col items-center justify-between border transition-all ${
                !isUnlocked
                  ? 'bg-zinc-900/40 border-zinc-800/50 opacity-40 cursor-not-allowed text-zinc-600'
                  : isCompleted
                  ? 'bg-zinc-900/90 border-emerald-500/40 hover:border-emerald-400 hover:scale-105 active:scale-95 cursor-pointer shadow-md'
                  : isSkipped
                  ? 'bg-zinc-900/90 border-amber-500/40 hover:border-amber-400 hover:scale-105 active:scale-95 cursor-pointer shadow-md'
                  : 'bg-zinc-900/90 border-sky-500/40 hover:border-sky-400 hover:scale-105 active:scale-95 cursor-pointer shadow-md'
              }`}
            >
              {/* Top status indicator */}
              <div className="w-full flex items-center justify-between text-[10px]">
                <span className="font-mono text-zinc-400 font-medium">#{lvl.id}</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isSkipped ? (
                  <FastForward className="w-3.5 h-3.5 text-amber-400" />
                ) : !isUnlocked ? (
                  <Lock className="w-3.5 h-3.5 text-zinc-600" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                )}
              </div>

              {/* Level Number */}
              <span className="font-black text-lg text-zinc-100 font-mono">
                {lvl.id}
              </span>

              {/* Bottom Stars */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-2.5 h-2.5 ${
                      s <= starsEarned
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
