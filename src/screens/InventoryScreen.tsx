/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Backpack, Check, Sparkles, Zap, Moon, Crown, Gem, Lightbulb } from 'lucide-react';
import { UserProfile, ItemCategory, ShopItem } from '../game/types';
import { INITIAL_SHOP_ITEMS } from '../services/shopData';
import { sound } from '../audio/soundManager';

interface InventoryScreenProps {
  userProfile: UserProfile;
  onEquipItem: (category: ItemCategory, itemId: string) => void;
  onBack: () => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  userProfile,
  onEquipItem,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<ItemCategory>('skin');

  // Find all items in initial catalog that user owns
  const ownedItems = INITIAL_SHOP_ITEMS.filter((item) => {
    if (item.consumable) return false;
    return !!userProfile.inventory[item.id] || item.price === 0;
  }).filter((item) => item.category === activeTab);

  const isEquipped = (item: ShopItem) => {
    if (item.category === 'skin') return userProfile.equipped.skin === item.id;
    if (item.category === 'theme') return userProfile.equipped.theme === item.id;
    if (item.category === 'effect') return userProfile.equipped.effect === item.id;
    if (item.category === 'avatar') return userProfile.equipped.avatar === item.id;
    if (item.category === 'title') return userProfile.equipped.title === (item.value || item.name);
    return false;
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
          <Backpack className="w-4 h-4 text-purple-400" />
          <span>Player Vault</span>
        </h2>

        <div className="w-9" />
      </div>

      {/* Equipped Loadout Showcase Card */}
      <div className="w-full max-w-md mx-auto my-3 p-4 rounded-3xl bg-linear-to-b from-purple-950/30 via-zinc-900 to-zinc-900 border border-purple-500/30 flex flex-col gap-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
          Current Equipped Loadout
        </span>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex flex-col">
            <span className="text-[9px] text-zinc-400">Arrow Skin</span>
            <span className="font-bold text-zinc-200 truncate capitalize">
              {userProfile.equipped.skin.replace('skin_', '')}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex flex-col">
            <span className="text-[9px] text-zinc-400">Board Theme</span>
            <span className="font-bold text-zinc-200 truncate capitalize">
              {userProfile.equipped.theme.replace('theme_', '')}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex flex-col">
            <span className="text-[9px] text-zinc-400">Exit Effect</span>
            <span className="font-bold text-zinc-200 truncate capitalize">
              {userProfile.equipped.effect.replace('effect_', '')}
            </span>
          </div>
        </div>
      </div>

      {/* Consumable Powers Stock summary */}
      <div className="w-full max-w-md mx-auto grid grid-cols-4 gap-2 mb-3">
        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center text-center">
          <span className="text-[10px] text-zinc-400">Hints</span>
          <span className="text-sm font-bold font-mono text-amber-400">
            {(userProfile.inventory['powerup_hint'] as number) || 0}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center text-center">
          <span className="text-[10px] text-zinc-400">Super Hints</span>
          <span className="text-sm font-bold font-mono text-purple-400">
            {(userProfile.inventory['powerup_super_hint'] as number) || 0}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center text-center">
          <span className="text-[10px] text-zinc-400">Scanners</span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            {(userProfile.inventory['powerup_scanner'] as number) || 0}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center text-center">
          <span className="text-[10px] text-zinc-400">Undos</span>
          <span className="text-sm font-bold font-mono text-sky-400">
            {(userProfile.inventory['powerup_undo'] as number) || 0}
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="w-full max-w-md mx-auto flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
        {[
          { id: 'skin', label: 'Arrow Skins' },
          { id: 'theme', label: 'Themes' },
          { id: 'effect', label: 'Effects' },
          { id: 'avatar', label: 'Avatars' },
          { id: 'title', label: 'Titles' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sound.playClick();
              setActiveTab(tab.id as ItemCategory);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Owned Items Grid */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[50vh] py-2">
        {ownedItems.map((item) => {
          const equipped = isEquipped(item);

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                equipped
                  ? 'bg-purple-950/30 border-purple-500/50'
                  : 'bg-zinc-900/80 border-zinc-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                  style={{
                    backgroundColor: item.color ? `${item.color}25` : '#27272a',
                    color: item.color || '#38bdf8',
                  }}
                >
                  {item.category === 'skin' && <Zap className="w-5 h-5" />}
                  {item.category === 'theme' && <Moon className="w-5 h-5" />}
                  {item.category === 'effect' && <Sparkles className="w-5 h-5" />}
                  {item.category === 'avatar' && <Crown className="w-5 h-5" />}
                  {item.category === 'title' && <Gem className="w-5 h-5" />}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-zinc-100">{item.name}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-1">{item.description}</p>
                </div>
              </div>

              {equipped ? (
                <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In Use
                </span>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick();
                    onEquipItem(item.category, item.id);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition cursor-pointer"
                >
                  Equip
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
