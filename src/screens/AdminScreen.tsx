/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Shield, Sliders, DollarSign, ToggleLeft, ToggleRight, Plus, RefreshCw, Check } from 'lucide-react';
import { MonetizationSettings, ShopItem } from '../game/types';
import { INITIAL_SHOP_ITEMS } from '../services/shopData';
import { sound } from '../audio/soundManager';

interface AdminScreenProps {
  settings: MonetizationSettings;
  onUpdateSettings: (settings: MonetizationSettings) => void;
  onAddTestCoins: (amount: number) => void;
  onBack: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  settings,
  onUpdateSettings,
  onAddTestCoins,
  onBack,
}) => {
  const [currentSettings, setCurrentSettings] = useState<MonetizationSettings>(settings);
  const [saveBanner, setSaveBanner] = useState(false);

  const handleToggle = (key: keyof MonetizationSettings) => {
    sound.playClick();
    const updated = {
      ...currentSettings,
      [key]: !currentSettings[key],
    };
    setCurrentSettings(updated);
    onUpdateSettings(updated);
    triggerBanner();
  };

  const handleNumberChange = (key: keyof MonetizationSettings, val: number) => {
    const updated = {
      ...currentSettings,
      [key]: val,
    };
    setCurrentSettings(updated);
    onUpdateSettings(updated);
    triggerBanner();
  };

  const triggerBanner = () => {
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2000);
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
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Admin & Monetization Console</span>
        </h2>

        <div className="w-9" />
      </div>

      {saveBanner && (
        <div className="w-full max-w-md mx-auto mt-2 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>Configuration saved successfully</span>
        </div>
      )}

      <div className="w-full max-w-md mx-auto flex flex-col gap-4 flex-1 overflow-y-auto max-h-[80vh] py-4">
        {/* Test Coins Dispenser */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Economy Sandbox
          </span>
          <p className="text-xs text-zinc-400">
            Dispense coins to test in-game purchases, chests, power-ups, and cosmetics.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => {
                sound.playCoin();
                onAddTestCoins(250);
              }}
              className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer"
            >
              +250 Coins
            </button>
            <button
              onClick={() => {
                sound.playCoin();
                onAddTestCoins(1000);
              }}
              className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer"
            >
              +1,000 Coins
            </button>
          </div>
        </div>

        {/* Section 14.F Monetization Settings */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Rewarded Ads Settings (Section 14)
          </span>

          {/* Enable Rewarded Ads */}
          <div className="flex items-center justify-between text-xs py-1">
            <div>
              <p className="font-semibold text-zinc-200">Rewarded Ads Engine</p>
              <p className="text-[11px] text-zinc-400">Toggle overall rewarded ad availability</p>
            </div>
            <button
              onClick={() => handleToggle('adsEnabled')}
              className="p-1 text-sky-400 cursor-pointer"
            >
              {currentSettings.adsEnabled ? (
                <ToggleRight className="w-8 h-8 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-zinc-600" />
              )}
            </button>
          </div>

          {/* Test Mode */}
          <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-800 pt-2">
            <div>
              <p className="font-semibold text-zinc-200">AdMob / Web Ads Test Mode</p>
              <p className="text-[11px] text-zinc-400">Uses 5-second simulated video test ads</p>
            </div>
            <button
              onClick={() => handleToggle('testMode')}
              className="p-1 text-sky-400 cursor-pointer"
            >
              {currentSettings.testMode ? (
                <ToggleRight className="w-8 h-8 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-zinc-600" />
              )}
            </button>
          </div>

          {/* Number of Ads required for level skip (default: 11) */}
          <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-800 pt-2">
            <div>
              <p className="font-semibold text-zinc-200">Ads for Level Skip</p>
              <p className="text-[11px] text-zinc-400">Default requirement: 11 completed ads</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="25"
                value={currentSettings.levelSkipAdsRequired}
                onChange={(e) => handleNumberChange('levelSkipAdsRequired', parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-center font-mono font-bold text-amber-400 text-xs"
              />
            </div>
          </div>

          {/* 2x Reward Multiplier */}
          <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-800 pt-2">
            <div>
              <p className="font-semibold text-zinc-200">Double Reward Multiplier</p>
              <p className="text-[11px] text-zinc-400">Multiplier applied on level complete</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-300 font-bold">2.0×</span>
            </div>
          </div>

          {/* Coins per free ad */}
          <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-800 pt-2">
            <div>
              <p className="font-semibold text-zinc-200">Coins Per Free Ad</p>
              <p className="text-[11px] text-zinc-400">Reward when watching free ad in shop</p>
            </div>
            <input
              type="number"
              min="10"
              max="500"
              value={currentSettings.coinsPerFreeAd}
              onChange={(e) => handleNumberChange('coinsPerFreeAd', parseInt(e.target.value) || 50)}
              className="w-16 px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-center font-mono font-bold text-amber-400 text-xs"
            />
          </div>

          {/* Extra time / Extra moves toggles */}
          <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-800 pt-2">
            <div>
              <p className="font-semibold text-zinc-200">Extra Moves & Time Ads</p>
              <p className="text-[11px] text-zinc-400">Revive failed challenges with ad</p>
            </div>
            <button
              onClick={() => handleToggle('enableExtraMovesAd')}
              className="p-1 cursor-pointer"
            >
              {currentSettings.enableExtraMovesAd ? (
                <ToggleRight className="w-8 h-8 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-zinc-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
