/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Play, Calendar, Compass, ShoppingBag, Backpack, Trophy, Award, User, Settings, Sparkles } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface TitleScreenProps {
  currentLevelId: number;
  totalStars: number;
  coins: number;
  onStartGame: (levelId: number) => void;
  onSelectModes: () => void;
  onSelectLevels: () => void;
  onSelectDaily: () => void;
  onOpenShop: () => void;
  onOpenInventory: () => void;
  onOpenLeaderboard: () => void;
  onOpenAchievements: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  currentLevelId,
  totalStars,
  coins,
  onStartGame,
  onSelectModes,
  onSelectLevels,
  onSelectDaily,
  onOpenShop,
  onOpenInventory,
  onOpenLeaderboard,
  onOpenAchievements,
  onOpenProfile,
  onOpenAdmin,
}) => {
  // Bind Enter and Space keys to start game directly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sound.startMusic();
        sound.playClick();
        onStartGame(currentLevelId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLevelId, onStartGame]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 bg-radial from-slate-900 via-zinc-950 to-black text-white select-none overflow-hidden">
      {/* Ambient background floating directional vectors */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-md flex items-center justify-between py-2 px-1">
        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/80 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition cursor-pointer"
        >
          <User className="w-3.5 h-3.5 text-sky-400" />
          <span>Profile</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Total Stars Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-mono font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="tabular-nums">{totalStars} Stars</span>
          </div>

          {/* Admin link */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAdmin();
            }}
            aria-label="Admin settings"
            className="p-1.5 rounded-full bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Center Interactive Hero Showcase & Bespoke SVG Title Lockup */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto max-w-sm w-full py-4">
        {/* Hero Interactive Arrow Centerpiece */}
        <div className="relative w-28 h-28 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-xl animate-pulse" />
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(56,189,248,0.7)]">
            <polygon
              points="50,15 85,50 65,50 65,85 35,85 35,50 15,50"
              fill="url(#title-grad)"
              stroke="#38bdf8"
              strokeWidth="3"
            />
            <defs>
              <linearGradient id="title-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title Lockup */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
          Arrow<span className="text-sky-400">Flow</span>
        </h1>
        <p className="text-xs sm:text-sm font-medium text-zinc-400 tracking-wide mt-1">
          Zen Vector Escape & Tactical Clearance
        </p>

        {/* Primary Start CTA */}
        <div className="w-full mt-7 flex flex-col gap-3">
          <button
            data-start="true"
            onClick={() => {
              sound.startMusic();
              sound.playClick();
              onStartGame(currentLevelId);
            }}
            className="w-full py-4 px-6 bg-linear-to-r from-sky-500 via-indigo-500 to-sky-600 hover:from-sky-400 hover:to-indigo-400 text-zinc-950 font-black text-base rounded-2xl shadow-xl shadow-sky-500/30 flex items-center justify-center gap-3 transition transform active:scale-98 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-zinc-950" />
            <span>CONTINUE (LEVEL {currentLevelId})</span>
          </button>

          {/* Quick Primary Modes Grid */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              onClick={() => {
                sound.startMusic();
                sound.playClick();
                onSelectDaily();
              }}
              className="py-3 px-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700 flex items-center justify-center gap-2 text-xs font-bold text-zinc-200 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Daily Puzzle</span>
            </button>

            <button
              onClick={() => {
                sound.startMusic();
                sound.playClick();
                onSelectModes();
              }}
              className="py-3 px-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700 flex items-center justify-center gap-2 text-xs font-bold text-zinc-200 transition cursor-pointer"
            >
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Game Modes</span>
            </button>
          </div>
        </div>

        {/* Secondary Hub Navigation */}
        <div className="grid grid-cols-4 gap-2 w-full mt-4">
          <button
            onClick={() => {
              sound.playClick();
              onSelectLevels();
            }}
            className="flex flex-col items-center py-2 px-1 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer text-zinc-300"
          >
            <Compass className="w-5 h-5 mb-1 text-sky-400" />
            <span className="text-[10px] font-semibold">Levels</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenShop();
            }}
            className="flex flex-col items-center py-2 px-1 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer text-zinc-300"
          >
            <ShoppingBag className="w-5 h-5 mb-1 text-amber-400" />
            <span className="text-[10px] font-semibold">Shop</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenInventory();
            }}
            className="flex flex-col items-center py-2 px-1 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer text-zinc-300"
          >
            <Backpack className="w-5 h-5 mb-1 text-purple-400" />
            <span className="text-[10px] font-semibold">Vault</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="flex flex-col items-center py-2 px-1 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer text-zinc-300"
          >
            <Trophy className="w-5 h-5 mb-1 text-yellow-400" />
            <span className="text-[10px] font-semibold">Ranks</span>
          </button>
        </div>
      </div>

      {/* Flat Control Hint Line Required by ultra-mode game craft */}
      <footer className="relative z-10 w-full text-center py-2 text-[11px] text-zinc-500 font-mono tracking-wider">
        Tap Arrow to Clear · Enter / Space to Play · Esc Pause · M Mute
      </footer>
    </div>
  );
};
