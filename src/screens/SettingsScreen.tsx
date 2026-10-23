/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Music, Smartphone, HelpCircle, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface SettingsScreenProps {
  soundSettings: {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    muted: boolean;
  };
  onUpdateSoundSettings: (settings: {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    muted: boolean;
  }) => void;
  onOpenHowItWorks: () => void;
  onResetProgress: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  soundSettings,
  onUpdateSoundSettings,
  onOpenHowItWorks,
  onResetProgress,
}) => {
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggleMute = () => {
    sound.playClick();
    onUpdateSoundSettings({
      ...soundSettings,
      muted: !soundSettings.muted,
    });
  };

  const handleReset = () => {
    sound.playClick();
    onResetProgress();
    setShowResetConfirm(false);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col p-4 bg-[#F8FAFC] text-slate-800 select-none pb-24">
      {/* Header */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#EFF2FE] text-[#4F67F7] flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800">Game Settings</h1>
            <p className="text-xs text-slate-500 font-medium">Audio, preferences & gameplay options</p>
          </div>
        </div>
      </header>

      {/* Main Settings Card */}
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col gap-4">
        {/* Audio Preferences */}
        <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100 flex flex-col gap-3.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Audio & Feedback</h2>

          {/* Master Sound FX Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-[#4F67F7] flex items-center justify-center">
                {soundSettings.muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Sound Effects</span>
                <span className="text-[11px] text-slate-400">Arrow taps, exits & feedback</span>
              </div>
            </div>

            <button
              onClick={toggleMute}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer p-0.5 ${
                !soundSettings.muted ? 'bg-[#4F67F7]' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  !soundSettings.muted ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Background Music Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-[#4F67F7] flex items-center justify-center">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Background Music</span>
                <span className="text-[11px] text-slate-400">Zen ambient audio track</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                if (soundSettings.musicVolume > 0) {
                  onUpdateSoundSettings({ ...soundSettings, musicVolume: 0 });
                } else {
                  onUpdateSoundSettings({ ...soundSettings, musicVolume: 0.35 });
                }
              }}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer p-0.5 ${
                soundSettings.musicVolume > 0 ? 'bg-[#4F67F7]' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  soundSettings.musicVolume > 0 ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptic Vibration */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-[#4F67F7] flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Haptic Vibration</span>
                <span className="text-[11px] text-slate-400">Tactile tap response</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setVibrationEnabled(!vibrationEnabled);
              }}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer p-0.5 ${
                vibrationEnabled ? 'bg-[#4F67F7]' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  vibrationEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Tutorial & Rules */}
        <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100 flex flex-col gap-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Tutorial & Rules</h2>

          <button
            onClick={() => {
              sound.playClick();
              onOpenHowItWorks();
            }}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EFF2FE] border border-[#D5E0FC] hover:bg-[#E0E7FE] transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-[#4F67F7]" />
              <span className="text-xs font-bold text-[#1E293B]">How To Play (Visual Guide)</span>
            </div>
            <span className="text-xs font-black text-[#4F67F7]">View &gt;</span>
          </button>
        </div>

        {/* Data & Reset */}
        <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100 flex flex-col gap-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Game Data</h2>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Progress & Restart Fresh</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 flex flex-col gap-2">
              <span className="text-xs font-bold text-rose-800">
                Are you sure? This clears levels and coins.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer brand info */}
        <div className="text-center text-xs text-slate-400 mt-2">
          Arrow Rescue v1.2.0 • Native Engine & Web Runtime
        </div>
      </main>
    </div>
  );
};
