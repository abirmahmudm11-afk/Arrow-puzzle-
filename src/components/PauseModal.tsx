/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, FastForward, Home, Sliders } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface PauseModalProps {
  levelId: number;
  skipAdsProgress: number; // 0 to 11
  soundSettings: {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    muted: boolean;
  };
  onResume: () => void;
  onRestart: () => void;
  onWatchAdForSkip: () => void;
  onSkipLevelNow: () => void;
  onSoundSettingChange: (type: 'master' | 'sfx' | 'music' | 'mute', val: number | boolean) => void;
  onExit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  levelId,
  skipAdsProgress,
  soundSettings,
  onResume,
  onRestart,
  onWatchAdForSkip,
  onSkipLevelNow,
  onSoundSettingChange,
  onExit,
}) => {
  const canSkipNow = skipAdsProgress >= 11;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 text-white flex flex-col gap-4 animate-scale-in">
        {/* Modal Title */}
        <div className="text-center">
          <h3 className="text-2xl font-black tracking-wider uppercase text-zinc-100">
            Game Paused
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Take a breath, find your flow</p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3.5 px-4 bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Resume Game</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-2xl border border-zinc-700/80 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-zinc-400" />
            <span>Restart Puzzle</span>
          </button>
        </div>

        {/* Rewarded Ad Level Skip Section */}
        <div className="p-3.5 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <FastForward className="w-4 h-4 text-amber-400" />
              <span>Rewarded Ad Level Skip</span>
            </span>
            <span className="font-mono font-bold text-amber-400">
              {Math.min(11, skipAdsProgress)}/11 Ads
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-zinc-700/60 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${(Math.min(11, skipAdsProgress) / 11) * 100}%` }}
            />
          </div>

          {canSkipNow ? (
            <button
              onClick={() => {
                sound.playVictory();
                onSkipLevelNow();
              }}
              className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>11/11 Ready! Skip Level Now</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onWatchAdForSkip();
              }}
              className="w-full py-2 px-3 bg-indigo-600/30 hover:bg-indigo-600/45 border border-indigo-500/50 text-indigo-300 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Watch Ad for Skip (+1 Progress)</span>
            </button>
          )}
          <p className="text-[10px] text-zinc-400 text-center">
            Skipping unlocks the next stage without falsely recording stars.
          </p>
        </div>

        {/* Audio Sliders & Quick Controls */}
        <div className="p-3.5 rounded-2xl bg-zinc-800/40 border border-zinc-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Audio Levels</span>
            </span>
            <button
              onClick={() => onSoundSettingChange('mute', !soundSettings.muted)}
              className="text-[11px] font-bold text-sky-400 hover:underline flex items-center gap-1"
            >
              {soundSettings.muted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{soundSettings.muted ? 'Unmute' : 'Mute All'}</span>
            </button>
          </div>

          {/* Master Volume */}
          <div className="flex items-center gap-2 text-xs">
            <span className="w-14 text-zinc-400 text-[11px]">SFX</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundSettings.sfxVolume}
              onChange={(e) => onSoundSettingChange('sfx', parseFloat(e.target.value))}
              className="flex-1 accent-sky-400 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Music Volume */}
          <div className="flex items-center gap-2 text-xs">
            <span className="w-14 text-zinc-400 text-[11px]">Music</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundSettings.musicVolume}
              onChange={(e) => onSoundSettingChange('music', parseFloat(e.target.value))}
              className="flex-1 accent-sky-400 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Exit Button */}
        <button
          onClick={() => {
            sound.playClick();
            onExit();
          }}
          className="w-full py-2.5 text-xs font-semibold text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Exit to Level Select</span>
        </button>
      </div>
    </div>
  );
};
