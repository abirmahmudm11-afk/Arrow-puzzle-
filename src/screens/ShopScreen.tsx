/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Coins,
  ShoppingBag,
  Sparkles,
  Zap,
  Gem,
  Flame,
  Snowflake,
  Crown,
  Palette,
  Moon,
  Waves,
  Trees,
  Sunset,
  Binary,
  Lightbulb,
  Radar,
  Undo2,
  Package,
  Check,
  PackageOpen,
  Info,
} from 'lucide-react';
import { ShopItem, ItemCategory, UserProfile } from '../game/types';
import { INITIAL_SHOP_ITEMS } from '../services/shopData';
import { sound } from '../audio/soundManager';

interface ShopScreenProps {
  userProfile: UserProfile;
  onBuyItem: (item: ShopItem) => boolean;
  onEquipItem: (category: ItemCategory, itemId: string) => void;
  onBack: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  userProfile,
  onBuyItem,
  onEquipItem,
  onBack,
}) => {
  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'chests'>('powerup');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  const filteredItems = INITIAL_SHOP_ITEMS.filter((item) => item.category === activeCategory);

  const isItemOwned = (item: ShopItem) => {
    if (item.consumable) return false;
    return !!userProfile.inventory[item.id];
  };

  const isItemEquipped = (item: ShopItem) => {
    if (item.category === 'skin') return userProfile.equipped.skin === item.id;
    if (item.category === 'theme') return userProfile.equipped.theme === item.id;
    if (item.category === 'effect') return userProfile.equipped.effect === item.id;
    if (item.category === 'avatar') return userProfile.equipped.avatar === item.id;
    if (item.category === 'title') return userProfile.equipped.title === (item.value || item.name);
    return false;
  };

  const getConsumableCount = (item: ShopItem) => {
    return (userProfile.inventory[item.id] as number) || 0;
  };

  const handleOpenBuy = (item: ShopItem) => {
    sound.playClick();
    setSelectedItem(item);
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = () => {
    if (!selectedItem) return;

    if (userProfile.coins < selectedItem.price) {
      sound.playBlocked();
      setPurchaseMessage('Not enough coins! Play puzzles to earn more.');
      setTimeout(() => setPurchaseMessage(null), 2500);
      setShowConfirmModal(false);
      return;
    }

    const success = onBuyItem(selectedItem);
    setShowConfirmModal(false);

    if (success) {
      sound.playCoin();
      setPurchaseMessage(`Successfully acquired ${selectedItem.name}!`);
      setTimeout(() => setPurchaseMessage(null), 2500);
    }
  };

  // Mystery chest purchase handler
  const handleOpenChest = (chestType: 'wooden' | 'royal') => {
    const cost = chestType === 'wooden' ? 150 : 350;
    if (userProfile.coins < cost) {
      sound.playBlocked();
      setPurchaseMessage('Not enough coins for this chest!');
      setTimeout(() => setPurchaseMessage(null), 2500);
      return;
    }

    // Pick a cosmetic reward randomly
    const unownedSkins = INITIAL_SHOP_ITEMS.filter(
      (i) => (i.category === 'skin' || i.category === 'theme') && !userProfile.inventory[i.id] && i.price > 0
    );

    let grantedItem = unownedSkins[Math.floor(Math.random() * unownedSkins.length)];
    if (!grantedItem) {
      // If all owned, grant consumable pack
      grantedItem = INITIAL_SHOP_ITEMS.find((i) => i.id === 'powerup_bundle_hints')!;
    }

    const dummyItem: ShopItem = {
      id: `chest_${chestType}`,
      name: chestType === 'wooden' ? 'Wooden Mystery Chest' : 'Royal Mystery Chest',
      description: 'Contains rare cosmetics and power-ups.',
      category: 'powerup',
      rarity: chestType === 'royal' ? 'legendary' : 'rare',
      price: cost,
      icon: 'Package',
      consumable: true,
    };

    onBuyItem(dummyItem);
    // Grant target
    onBuyItem({ ...grantedItem, price: 0 });
    sound.playVictory();
    setPurchaseMessage(`Chest Opened! You unlocked: ${grantedItem.name}!`);
    setTimeout(() => setPurchaseMessage(null), 3500);
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
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>Coin Shop</span>
        </h2>

        {/* Current Coin Balance */}
        <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-mono font-bold text-amber-300">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="tabular-nums">{userProfile.coins}</span>
        </div>
      </div>

      {/* Success / Notification Banner */}
      {purchaseMessage && (
        <div className="w-full max-w-md mx-auto mt-2 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold text-center animate-fade-in flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          <span>{purchaseMessage}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="w-full max-w-md mx-auto flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar">
        {[
          { id: 'powerup', label: 'Power-Ups' },
          { id: 'skin', label: 'Arrow Skins' },
          { id: 'theme', label: 'Themes' },
          { id: 'effect', label: 'Effects' },
          { id: 'avatar', label: 'Avatars' },
          { id: 'title', label: 'Titles' },
          { id: 'chests', label: 'Mystery Chests' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              sound.playClick();
              setActiveCategory(cat.id as ItemCategory | 'chests');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/25'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Item Catalog List */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[70vh] py-1">
        {activeCategory === 'chests' ? (
          /* Mystery Chests Section */
          <div className="flex flex-col gap-3 py-2">
            {/* Wooden Chest */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-900/30 text-amber-500 border border-amber-800/50">
                  <Package className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-zinc-100">Wooden Mystery Chest</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Disclosed Odds: 60% Common, 30% Rare, 10% Epic cosmetics or hint pack.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenChest('wooden')}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <PackageOpen className="w-4 h-4" />
                <span>Open for 150 Coins</span>
              </button>
            </div>

            {/* Royal Chest */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/40 flex flex-col gap-3 shadow-lg shadow-amber-500/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Crown className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-amber-300">Royal Aurum Mystery Chest</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Disclosed Odds: 20% Rare, 50% Epic, 30% Legendary exclusive skins!
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenChest('royal')}
                className="w-full py-2.5 px-4 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <PackageOpen className="w-4 h-4" />
                <span>Open for 350 Coins</span>
              </button>
            </div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const owned = isItemOwned(item);
            const equipped = isItemEquipped(item);
            const count = getConsumableCount(item);

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 flex items-center gap-3.5 transition-all"
              >
                {/* Item icon / preview */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 shrink-0"
                  style={{
                    backgroundColor: item.color ? `${item.color}25` : '#27272a',
                    color: item.color || '#38bdf8',
                  }}
                >
                  {item.category === 'powerup' && <Lightbulb className="w-6 h-6" />}
                  {item.category === 'skin' && <Zap className="w-6 h-6" />}
                  {item.category === 'theme' && <Moon className="w-6 h-6" />}
                  {item.category === 'effect' && <Sparkles className="w-6 h-6" />}
                  {item.category === 'avatar' && <Crown className="w-6 h-6" />}
                  {item.category === 'title' && <Gem className="w-6 h-6" />}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-zinc-100 truncate">{item.name}</h3>
                    {item.rarity && item.rarity !== 'common' && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-zinc-800 text-amber-400">
                        {item.rarity}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                  {item.consumable && count > 0 && (
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold mt-1 inline-block">
                      Owned in Vault: {count}
                    </span>
                  )}
                </div>

                {/* Buy / Equip Actions */}
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  {owned ? (
                    equipped ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Equipped
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onEquipItem(item.category, item.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition cursor-pointer"
                      >
                        Equip
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleOpenBuy(item)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span className="font-mono">{item.price}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Purchase Confirmation Modal */}
      {showConfirmModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-3xl bg-zinc-900 border border-zinc-800 p-5 text-white flex flex-col items-center gap-3 text-center animate-scale-in">
            <h4 className="font-bold text-base text-zinc-100">Confirm Purchase</h4>
            <p className="text-xs text-zinc-300">
              Are you sure you want to purchase <span className="font-bold text-white">{selectedItem.name}</span> for{' '}
              <span className="font-bold text-amber-400">{selectedItem.price} coins</span>?
            </p>

            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
