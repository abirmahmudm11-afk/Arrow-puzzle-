/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import {
  Play,
  HelpCircle,
  Shield,
  Trophy,
  Gift,
  Gem,
  Calendar,
  Layers,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { sound } from '../audio/soundManager';

interface HomeScreenProps {
  currentLevelId: number;
  coins: number;
  currentStreak: number;
  lastDailyClaimDate?: string;
  onPlayLevel: (levelId: number) => void;
  onOpenHowItWorks: () => void;
  onOpenDailyStreak: () => void;
  onOpenDailyChallenge: () => void;
  onOpenSuperOffers: () => void;
  onOpenPlayAGame: () => void;
  onOpenLevelSelect: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentLevelId,
  coins,
  currentStreak,
  lastDailyClaimDate,
  onPlayLevel,
  onOpenHowItWorks,
  onOpenDailyStreak,
  onOpenDailyChallenge,
  onOpenSuperOffers,
  onOpenPlayAGame,
  onOpenLevelSelect,
}) => {
  // Today's formatted date string e.g. "October 23"
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const todayStr = new Date().toISOString().split('T')[0];
  const isStreakClaimed = lastDailyClaimDate === todayStr;

  // Bind Enter and Space keys to start game directly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sound.startMusic();
        sound.playClick();
        onPlayLevel(currentLevelId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLevelId, onPlayLevel]);

  return (
    <div className="relative min-h-screen w-full flex flex-col p-4 bg-[#F8FAFC] text-slate-800 select-none pb-24">
      {/* Top Header Bar */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-2">
        {/* Left: How it works button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenHowItWorks();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFF2FE] hover:bg-[#E0E7FE] border border-[#D5E0FC] text-xs font-bold text-[#3B49A2] transition cursor-pointer shadow-xs"
        >
          <HelpCircle className="w-4 h-4 text-[#4F67F7]" />
          <span>How it works?</span>
        </button>

        {/* Right: Coins pill */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFF2FE] border border-[#D5E0FC] shadow-xs">
          <span className="text-xs font-black font-mono text-[#1E293B] tabular-nums">{coins}</span>
          <div className="w-4 h-4 rounded-full bg-amber-400 border border-amber-500 flex items-center justify-center shadow-xs">
            <span className="text-[10px] font-black text-amber-950 leading-none">🪙</span>
          </div>
        </div>
      </header>

      {/* Brand Title Lockup with Kicker */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center text-center my-3">
        {/* Sleek brand title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4F67F7] to-[#6355FE] flex items-center justify-center text-white shadow-md shadow-indigo-300">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 2L20 10H14V22H10V10H4L12 2Z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-slate-900 via-indigo-950 to-[#4F67F7] bg-clip-text text-transparent">
            Arrow Rescue
          </h1>
        </div>

        {/* Subtitle kicker from screenshot */}
        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-[#4F67F7] mt-1">
          SOLVE • RESCUE • EARN REWARDS
        </p>
      </div>

      {/* Main Home Content Grid */}
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col gap-3.5">
        {/* Row 1: Daily Streak & Challenge Cards */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {/* Card 1: Daily Streak */}
          <div className="flex flex-col justify-between p-3.5 rounded-3xl bg-[#EFF2FE] border border-[#D5E0FC] shadow-xs">
            <div>
              <div className="w-9 h-9 rounded-2xl bg-white border border-[#D5E0FC] flex items-center justify-center text-[#4F67F7] mb-2 shadow-xs">
                <Shield className="w-5 h-5 text-[#4F67F7] fill-[#4F67F7]/20" />
              </div>
              <h2 className="text-sm font-black text-slate-900">Daily Streak</h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {currentStreak} Days Active
              </p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onOpenDailyStreak();
              }}
              className="mt-3 w-full py-2 px-2.5 rounded-full bg-white hover:bg-slate-50 active:scale-95 text-[#3B49A2] font-black text-[11px] border border-[#D5E0FC] transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
            >
              <span>{isStreakClaimed ? 'Results' : 'Check in'}</span>
            </button>
          </div>

          {/* Card 2: Challenge */}
          <div className="flex flex-col justify-between p-3.5 rounded-3xl bg-[#EFF2FE] border border-[#D5E0FC] shadow-xs">
            <div>
              <div className="w-9 h-9 rounded-2xl bg-white border border-[#D5E0FC] flex items-center justify-center text-amber-500 mb-2 shadow-xs">
                <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
              </div>
              <h2 className="text-sm font-black text-slate-900">Challenge</h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {todayFormatted}
              </p>
            </div>

            <button
              onClick={() => {
                sound.startMusic();
                sound.playClick();
                onOpenDailyChallenge();
              }}
              className="mt-3 w-full py-2 px-2.5 rounded-full bg-gradient-to-r from-[#4F67F7] to-[#6355FE] hover:brightness-105 active:scale-98 text-white font-black text-[11px] transition cursor-pointer flex items-center justify-center gap-1 shadow-xs shadow-indigo-300"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Play</span>
            </button>
          </div>
        </div>

        {/* Row 2: Hero Level Card */}
        <div className="w-full rounded-3xl bg-white p-5 shadow-xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
          {/* Subtle decorative background vector pattern */}
          <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 100 100">
              <polygon points="50,10 90,50 60,50 60,90 40,90 40,50 10,50" fill="#000" />
            </svg>
          </div>

          {/* Level Header Indicator */}
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#4F67F7] bg-[#EFF2FE] px-3 py-1 rounded-full">
              PROGRESSION
            </span>
            <button
              onClick={() => {
                sound.playClick();
                onOpenLevelSelect();
              }}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#4F67F7] transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Levels</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Level Title */}
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Level {currentLevelId}
          </h2>

          {/* Mini preview graphics of arrows */}
          <div className="w-24 h-24 my-3 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center relative p-2 shadow-inner">
            <svg viewBox="0 0 64 64" className="w-16 h-16">
              {/* Outer border dots */}
              <circle cx="20" cy="50" r="3" fill="#111827" />
              <line x1="20" y1="50" x2="20" y2="20" stroke="#111827" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M20 12 L30 24 L10 24 Z" fill="#111827" />

              <circle cx="50" cy="20" r="3" fill="#111827" />
              <line x1="50" y1="20" x2="26" y2="20" stroke="#111827" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M18 20 L30 10 L30 30 Z" fill="#111827" />
            </svg>
          </div>

          {/* Giant Blue-Purple Play Button matching screenshot */}
          <button
            data-start="true"
            onClick={() => {
              sound.startMusic();
              sound.playClick();
              onPlayLevel(currentLevelId);
            }}
            className="w-full py-4 px-6 bg-gradient-to-r from-[#4F67F7] to-[#6355FE] hover:brightness-105 active:scale-98 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-400/40 flex items-center justify-center gap-3 transition cursor-pointer mt-1"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>Play</span>
          </button>
        </div>

        {/* Row 3: Secondary Cards: Super Offers & Play a game */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {/* Super Offers Card */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSuperOffers();
            }}
            className="flex flex-col justify-between p-3.5 rounded-3xl bg-[#EFF2FE] hover:bg-[#E5ECFE] border border-[#D5E0FC] transition text-left cursor-pointer shadow-xs active:scale-98"
          >
            <div className="w-9 h-9 rounded-2xl bg-white border border-[#D5E0FC] flex items-center justify-center text-rose-500 mb-2 shadow-xs">
              <Gift className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Super Offers</h3>
              <p className="text-[11px] text-slate-500 font-medium">Coin tasks & boosts</p>
            </div>
          </button>

          {/* Play a game Card */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenPlayAGame();
            }}
            className="flex flex-col justify-between p-3.5 rounded-3xl bg-[#EFF2FE] hover:bg-[#E5ECFE] border border-[#D5E0FC] transition text-left cursor-pointer shadow-xs active:scale-98"
          >
            <div className="w-9 h-9 rounded-2xl bg-white border border-[#D5E0FC] flex items-center justify-center text-sky-500 mb-2 shadow-xs">
              <Gem className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Play a game</h3>
              <p className="text-[11px] text-slate-500 font-medium">Time Rush & Arcade</p>
            </div>
          </button>
        </div>
      </main>

      {/* Control Hint Line Required by ultra-mode game craft */}
      <footer className="w-full text-center py-1 text-[11px] text-slate-400 font-medium tracking-wide">
        Tap Arrow to Clear • Enter / Space to Play Level
      </footer>
    </div>
  );
};
