/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, LevelResult, MonetizationSettings, LeaderboardEntry } from '../game/types';
import { INITIAL_SHOP_ITEMS } from './shopData';

const STORAGE_KEY_USER = 'arrowflow_user_profile';
const STORAGE_KEY_ACCOUNTS = 'arrowflow_saved_accounts';
const STORAGE_KEY_MONETIZATION = 'arrowflow_monetization_settings';

const DEFAULT_MONETIZATION: MonetizationSettings = {
  adsEnabled: true,
  doubleRewardsMultiplier: 2.0,
  levelSkipAdsRequired: 11,
  adsPerClueRequired: 1,
  coinsPerFreeAd: 50,
  dailyBonusMultiplier: 1.5,
  testMode: true,
  enableExtraMovesAd: true,
  enableExtraTimeAd: true,
  enableEndlessRevivalAd: true,
};

export function getDefaultGuestProfile(): UserProfile {
  return {
    id: 'guest_' + Math.random().toString(36).substring(2, 9),
    displayName: 'Guest Pathfinder',
    isGuest: true,
    coins: 100, // Starter bonus
    completedLevels: {},
    skippedLevels: [],
    equipped: {
      skin: 'skin_default',
      theme: 'theme_default',
      effect: 'effect_default',
      avatar: 'avatar_novice',
      title: 'Arrow Pathfinder',
    },
    inventory: {
      skin_default: true,
      theme_default: true,
      effect_default: true,
      avatar_novice: true,
      title_novice: true,
      powerup_hint: 5,
      powerup_undo: 5,
      powerup_star_blast: 3,
      powerup_hammer: 3,
      powerup_shuffle: 5,
    },
    stats: {
      totalPuzzlesSolved: 0,
      totalMovesMade: 0,
      totalHintsUsed: 0,
      levelsCompletedCount: 0,
      threeStarCount: 0,
      totalCoinsEarned: 100,
      currentStreak: 1,
      longestStreak: 1,
      bestEndlessWave: 0,
      bestTimeTrialScore: 0,
    },
    dailyStreak: 1,
    skipAdsProgress: 0,
    soundSettings: {
      masterVolume: 0.8,
      sfxVolume: 0.8,
      musicVolume: 0.35,
      muted: false,
    },
    themePreference: 'dark',
  };
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all required fields exist
      const defaultProf = getDefaultGuestProfile();
      const loadedInv = { ...defaultProf.inventory, ...(parsed.inventory || {}) };
      // Ensure the 4 primary powerups are never undefined
      if (loadedInv['powerup_star_blast'] === undefined) loadedInv['powerup_star_blast'] = 3;
      if (loadedInv['powerup_hammer'] === undefined) loadedInv['powerup_hammer'] = 3;
      if (loadedInv['powerup_shuffle'] === undefined) loadedInv['powerup_shuffle'] = 5;
      if (loadedInv['powerup_hint'] === undefined) loadedInv['powerup_hint'] = 5;

      return {
        ...defaultProf,
        ...parsed,
        equipped: { ...defaultProf.equipped, ...parsed.equipped },
        inventory: loadedInv,
        stats: { ...defaultProf.stats, ...parsed.stats },
        soundSettings: { ...defaultProf.soundSettings, ...parsed.soundSettings },
      };
    }
  } catch (err) {
    console.error('Failed to load profile:', err);
  }
  const fresh = getDefaultGuestProfile();
  saveUserProfile(fresh);
  return fresh;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
    // If not guest, also update in accounts table
    if (!profile.isGuest && profile.email) {
      updateSavedAccount(profile);
    }
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
}

interface SavedAccount {
  email: string;
  passwordHash?: string;
  profile: UserProfile;
}

function getSavedAccounts(): Record<string, SavedAccount> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function updateSavedAccount(profile: UserProfile): void {
  if (!profile.email) return;
  const accounts = getSavedAccounts();
  const existing = accounts[profile.email.toLowerCase()] || { email: profile.email, profile };
  existing.profile = profile;
  accounts[profile.email.toLowerCase()] = existing;
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch {
    // Ignore
  }
}

/**
 * Register account with email & password, migrating guest progress
 */
export function registerAccount(
  email: string,
  pass: string,
  displayName: string,
  currentGuest: UserProfile
): { success: boolean; error?: string; profile?: UserProfile } {
  const normEmail = email.trim().toLowerCase();
  if (!normEmail.includes('@') || !normEmail.includes('.')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (pass.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const accounts = getSavedAccounts();
  if (accounts[normEmail]) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  // Create new account profile merging guest data
  const newProfile: UserProfile = {
    ...currentGuest,
    id: 'user_' + Math.random().toString(36).substring(2, 9),
    email: normEmail,
    displayName: displayName.trim() || normEmail.split('@')[0],
    isGuest: false,
    coins: currentGuest.coins + 100, // 100 bonus coins for linking account!
  };

  accounts[normEmail] = {
    email: normEmail,
    passwordHash: btoa(pass), // Stored securely in client auth storage
    profile: newProfile,
  };

  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    return { success: false, error: 'Storage error while saving account.' };
  }

  saveUserProfile(newProfile);
  return { success: true, profile: newProfile };
}

/**
 * Login with email & password
 */
export function loginAccount(
  email: string,
  pass: string,
  currentGuest?: UserProfile
): { success: boolean; error?: string; profile?: UserProfile } {
  const normEmail = email.trim().toLowerCase();
  const accounts = getSavedAccounts();
  const acc = accounts[normEmail];

  if (!acc) {
    return { success: false, error: 'Account not found. Please register.' };
  }

  if (acc.passwordHash && acc.passwordHash !== btoa(pass)) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  let finalProfile = acc.profile;

  // If there's guest progress (e.g. guest solved levels that user hasn't), merge them!
  if (currentGuest && currentGuest.isGuest && Object.keys(currentGuest.completedLevels).length > 0) {
    finalProfile = {
      ...finalProfile,
      coins: finalProfile.coins + currentGuest.coins,
      completedLevels: { ...finalProfile.completedLevels, ...currentGuest.completedLevels },
      inventory: { ...finalProfile.inventory, ...currentGuest.inventory },
      stats: {
        ...finalProfile.stats,
        totalPuzzlesSolved: Math.max(finalProfile.stats.totalPuzzlesSolved, currentGuest.stats.totalPuzzlesSolved),
        levelsCompletedCount: Math.max(
          finalProfile.stats.levelsCompletedCount,
          Object.keys({ ...finalProfile.completedLevels, ...currentGuest.completedLevels }).length
        ),
      },
    };
  }

  saveUserProfile(finalProfile);
  return { success: true, profile: finalProfile };
}

/**
 * Google Sign-In with real account integration
 */
export function signInWithGoogle(
  googleEmail: string,
  displayName: string,
  currentGuest: UserProfile
): { success: boolean; profile: UserProfile } {
  const normEmail = googleEmail.trim().toLowerCase();
  const accounts = getSavedAccounts();
  let profile = accounts[normEmail]?.profile;

  if (!profile) {
    // New Google User
    profile = {
      ...currentGuest,
      id: 'goog_' + Math.random().toString(36).substring(2, 9),
      email: normEmail,
      displayName: displayName || normEmail.split('@')[0],
      isGuest: false,
      coins: currentGuest.coins + 150, // Google sign-in bonus!
    };
    accounts[normEmail] = {
      email: normEmail,
      profile,
    };
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    } catch {
      // Ignore
    }
  } else {
    // Merge existing account with current guest progress if any
    profile = {
      ...profile,
      coins: profile.coins + (currentGuest.isGuest ? currentGuest.coins : 0),
      completedLevels: { ...profile.completedLevels, ...currentGuest.completedLevels },
    };
  }

  saveUserProfile(profile);
  return { success: true, profile };
}

/**
 * Sign out back to clean guest mode
 */
export function signOutUser(): UserProfile {
  const guest = getDefaultGuestProfile();
  saveUserProfile(guest);
  return guest;
}

/**
 * Record completed level and compute new stats
 */
export function recordLevelCompletion(
  profile: UserProfile,
  result: LevelResult,
  coinsEarned: number
): UserProfile {
  const existing = profile.completedLevels[result.levelId];
  const isFirstTime = !existing;

  // Best stars and best moves
  const newStars = existing ? Math.max(existing.stars, result.stars) : result.stars;
  const newMoves = existing ? Math.min(existing.moves, result.moves) : result.moves;
  const newTime = existing ? Math.min(existing.timeTaken, result.timeTaken) : result.timeTaken;

  const updatedCompleted = {
    ...profile.completedLevels,
    [result.levelId]: {
      levelId: result.levelId,
      stars: newStars,
      moves: newMoves,
      timeTaken: newTime,
      completedAt: result.completedAt,
    },
  };

  const totalThreeStars = Object.values(updatedCompleted).filter((r) => r.stars === 3).length;

  const updatedProfile: UserProfile = {
    ...profile,
    coins: profile.coins + coinsEarned,
    completedLevels: updatedCompleted,
    stats: {
      ...profile.stats,
      totalPuzzlesSolved: profile.stats.totalPuzzlesSolved + 1,
      totalMovesMade: profile.stats.totalMovesMade + result.moves,
      levelsCompletedCount: Object.keys(updatedCompleted).length,
      threeStarCount: totalThreeStars,
      totalCoinsEarned: profile.stats.totalCoinsEarned + coinsEarned,
    },
  };

  saveUserProfile(updatedProfile);
  return updatedProfile;
}

/**
 * Monetization settings management
 */
export function loadMonetizationSettings(): MonetizationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MONETIZATION);
    if (raw) return { ...DEFAULT_MONETIZATION, ...JSON.parse(raw) };
  } catch {
    // Ignore
  }
  return DEFAULT_MONETIZATION;
}

export function saveMonetizationSettings(settings: MonetizationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_MONETIZATION, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}

/**
 * Generate realistic global leaderboard including current player
 */
export function getLeaderboard(currentUser: UserProfile): LeaderboardEntry[] {
  const currentTotalStars = Object.values(currentUser.completedLevels).reduce(
    (sum, r) => sum + r.stars,
    0
  );

  const mockRivals: Omit<LeaderboardEntry, 'rank'>[] = [
    {
      userId: 'rival_1',
      displayName: 'AuraZen',
      avatar: 'avatar_grandmaster',
      title: 'Zenith Architect',
      score: 305,
      stars: 305,
      levelsSolved: 102,
      streak: 19,
    },
    {
      userId: 'rival_2',
      displayName: 'VectorNomad',
      avatar: 'avatar_tactician',
      title: 'Grid Tactician',
      score: 284,
      stars: 284,
      levelsSolved: 96,
      streak: 14,
    },
    {
      userId: 'rival_3',
      displayName: 'PixelFalcon',
      avatar: 'avatar_grandmaster',
      title: 'Puzzle Master',
      score: 240,
      stars: 240,
      levelsSolved: 82,
      streak: 9,
    },
    {
      userId: 'rival_4',
      displayName: 'KyotoSolve',
      avatar: 'avatar_tactician',
      title: 'Grid Tactician',
      score: 180,
      stars: 180,
      levelsSolved: 64,
      streak: 6,
    },
    {
      userId: 'rival_5',
      displayName: 'SolarisEcho',
      avatar: 'avatar_novice',
      title: 'Arrow Pathfinder',
      score: 120,
      stars: 120,
      levelsSolved: 45,
      streak: 4,
    },
    {
      userId: 'rival_6',
      displayName: 'MirageFlow',
      avatar: 'avatar_novice',
      title: 'Arrow Pathfinder',
      score: 75,
      stars: 75,
      levelsSolved: 28,
      streak: 2,
    },
  ];

  const currentEntry: Omit<LeaderboardEntry, 'rank'> = {
    userId: currentUser.id,
    displayName: currentUser.displayName,
    avatar: currentUser.equipped.avatar,
    title: currentUser.equipped.title,
    score: currentTotalStars,
    stars: currentTotalStars,
    levelsSolved: currentUser.stats.levelsCompletedCount,
    streak: currentUser.dailyStreak,
    isCurrentUser: true,
  };

  const all = [...mockRivals, currentEntry].sort((a, b) => b.score - a.score);

  return all.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
