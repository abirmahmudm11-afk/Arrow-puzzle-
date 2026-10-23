/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface GridPoint {
  r: number;
  c: number;
}

export interface Arrow {
  id: string;
  r: number; // Head Row (0-indexed)
  c: number; // Head Col (0-indexed)
  dir: Direction;
  // Optional path points from tail to head for winding/bending maze arrows
  points?: GridPoint[];
}

export interface Board {
  rows: number;
  cols: number;
  arrows: Arrow[];
}

export type GameMode = 'classic' | 'daily' | 'time' | 'limited' | 'endless' | 'relax';

export interface Level {
  id: number;
  name: string;
  category: 'Novice' | 'Apprentice' | 'Adept' | 'Expert' | 'Master';
  rows: number;
  cols: number;
  arrows: Arrow[];
  optimalMoves: number;
  moveLimit?: number; // for limited moves mode
  timeLimit?: number; // in seconds for time mode
  initialHearts?: number; // default 3 hearts
}

export interface LevelResult {
  levelId: number;
  stars: number;
  moves: number;
  timeTaken: number;
  completedAt: string;
}

export type ItemCategory = 'powerup' | 'skin' | 'theme' | 'effect' | 'avatar' | 'title';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  price: number;
  icon: string;
  color?: string;
  consumable?: boolean;
  value?: string;
  isSeasonal?: boolean;
  featured?: boolean;
  published?: boolean;
}

export interface PlayerStats {
  totalPuzzlesSolved: number;
  totalMovesMade: number;
  totalHintsUsed: number;
  levelsCompletedCount: number;
  threeStarCount: number;
  totalCoinsEarned: number;
  currentStreak: number;
  longestStreak: number;
  bestEndlessWave: number;
  bestTimeTrialScore: number;
}

export interface UserProfile {
  id: string;
  email?: string;
  displayName: string;
  isGuest: boolean;
  coins: number;
  completedLevels: Record<number, LevelResult>;
  skippedLevels: number[];
  equipped: {
    skin: string;
    theme: string;
    effect: string;
    avatar: string;
    title: string;
  };
  inventory: Record<string, number | boolean>; // itemId -> count or boolean (for cosmetics)
  stats: PlayerStats;
  lastDailyDate?: string;
  dailyStreak: number;
  skipAdsProgress: number; // 0 to 11
  soundSettings: {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    muted: boolean;
  };
  themePreference: 'dark' | 'light';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: string;
  title: string;
  score: number; // e.g. total stars or levels cleared
  stars: number;
  levelsSolved: number;
  streak: number;
  isCurrentUser?: boolean;
}

export interface MonetizationSettings {
  adsEnabled: boolean;
  doubleRewardsMultiplier: number;
  levelSkipAdsRequired: number; // Default 11
  adsPerClueRequired: number; // Default 1
  coinsPerFreeAd: number; // e.g. 50
  dailyBonusMultiplier: number;
  testMode: boolean;
  enableExtraMovesAd: boolean;
  enableExtraTimeAd: boolean;
  enableEndlessRevivalAd: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: string;
  maxProgress: number;
}
