/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Play, Calendar, Timer, Footprints, Infinity as InfinityIcon, Coffee, Lock } from 'lucide-react';
import { GameMode } from '../game/types';
import { sound } from '../audio/soundManager';

interface ModeSelectScreenProps {
  levelsCompleted: number;
  onSelectMode: (mode: GameMode) => void;
  onBack: () => void;
}

export const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({
  levelsCompleted,
  onSelectMode,
  onBack,
}) => {
  const modes: {
    id: GameMode;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    requiredLevels: number;
  }[] = [
    {
      id: 'classic',
      name: 'Classic Progression',
      description: 'Journey through 105+ handcrafted and vector puzzles across 5 mastery tiers.',
      icon: <Play className="w-6 h-6 text-sky-400" />,
      color: 'border-sky-500/40 bg-sky-950/20',
      requiredLevels: 0,
    },
    {
      id: 'daily',
      name: 'Daily Challenge',
      description: 'One unique synchronized puzzle per calendar day with streak bonus coins.',
      icon: <Calendar className="w-6 h-6 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-emerald-950/20',
      requiredLevels: 0,
    },
    {
      id: 'time',
      name: 'Time Trial Challenge',
      description: 'Race against the ticking clock! Speed, precision, and quick spatial parsing.',
      icon: <Timer className="w-6 h-6 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-950/20',
      requiredLevels: 3,
    },
    {
      id: 'limited',
      name: 'Limited Strategic Moves',
      description: 'Strict moves budget. Plan every clearance path ahead of time without waste.',
      icon: <Footprints className="w-6 h-6 text-purple-400" />,
      color: 'border-purple-500/40 bg-purple-950/20',
      requiredLevels: 5,
    },
    {
      id: 'endless',
      name: 'Endless Flow Waves',
      description: 'Consecutive puzzle boards scaling in grid dimension and arrow density.',
      icon: <InfinityIcon className="w-6 h-6 text-rose-400" />,
      color: 'border-rose-500/40 bg-rose-950/20',
      requiredLevels: 8,
    },
    {
      id: 'relax',
      name: 'Zen Relax Mode',
      description: 'No clocks, no move limits, unlimited hints. Pure spatial meditation.',
      icon: <Coffee className="w-6 h-6 text-teal-400" />,
      color: 'border-teal-500/40 bg-teal-950/20',
      requiredLevels: 0,
    },
  ];

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

        <h2 className="text-lg font-bold tracking-wider uppercase text-zinc-100">
          Select Game Mode
        </h2>

        <div className="w-9" />
      </div>

      {/* Modes List */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-3 my-auto py-4">
        {modes.map((m) => {
          const isLocked = levelsCompleted < m.requiredLevels;

          return (
            <button
              key={m.id}
              onClick={() => {
                if (isLocked) {
                  sound.playBlocked();
                  return;
                }
                sound.playClick();
                onSelectMode(m.id);
              }}
              disabled={isLocked}
              className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                isLocked
                  ? 'bg-zinc-900/40 border-zinc-800/60 opacity-60 cursor-not-allowed'
                  : `${m.color} hover:scale-[1.02] active:scale-[0.99] cursor-pointer shadow-lg`
              }`}
            >
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
                {isLocked ? <Lock className="w-6 h-6 text-zinc-500" /> : m.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-zinc-100">{m.name}</h3>
                  {isLocked && (
                    <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                      Unlock at Lvl {m.requiredLevels}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                  {m.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
