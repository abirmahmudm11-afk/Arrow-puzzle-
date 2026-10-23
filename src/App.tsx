/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Board,
  GameMode,
  Level,
  UserProfile,
  ShopItem,
  ItemCategory,
  MonetizationSettings,
  Direction,
} from './game/types';
import { getLevelById, getDailyLevel, getEndlessWave, getAllLevels } from './game/levels';
import {
  canArrowExit,
  getRemovableArrows,
  isBoardCleared,
  removeArrow,
  calculateStars,
  calculateCoinsReward,
} from './game/rules';
import { solveBoard } from './game/solver';
import {
  loadUserProfile,
  saveUserProfile,
  recordLevelCompletion,
  loadMonetizationSettings,
  saveMonetizationSettings,
  getLeaderboard,
} from './services/storage';
import { sound } from './audio/soundManager';
import { AdRewardType } from './services/adService';

// Components
import { ArrowBoard } from './components/ArrowBoard';
import { HeaderHUD } from './components/HeaderHUD';
import { BottomToolsHUD } from './components/BottomToolsHUD';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { PauseModal } from './components/PauseModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { RewardedAdModal } from './components/RewardedAdModal';
import { ParticleCanvas, ParticleCanvasHandle } from './components/ParticleCanvas';
import { HowItWorksModal } from './components/HowItWorksModal';
import { DailyStreakModal } from './components/DailyStreakModal';
import { SuperOffersModal } from './components/SuperOffersModal';

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { QuizzesScreen } from './screens/QuizzesScreen';
import { ReferScreen } from './screens/ReferScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ModeSelectScreen } from './screens/ModeSelectScreen';
import { LevelSelectScreen } from './screens/LevelSelectScreen';
import { DailyChallengeScreen } from './screens/DailyChallengeScreen';
import { ShopScreen } from './screens/ShopScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { AchievementsScreen } from './screens/AchievementsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AdminScreen } from './screens/AdminScreen';

type ScreenState =
  | 'home'
  | 'playing'
  | 'mode_select'
  | 'level_select'
  | 'daily_menu'
  | 'shop'
  | 'inventory'
  | 'leaderboard'
  | 'achievements'
  | 'profile'
  | 'admin';

export default function App() {
  // Persistence state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [monetization, setMonetization] = useState<MonetizationSettings>(() =>
    loadMonetizationSettings()
  );

  // Screen navigation state
  const [screen, setScreen] = useState<ScreenState>('home');
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Modals on Home
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showDailyStreak, setShowDailyStreak] = useState(false);
  const [showSuperOffers, setShowSuperOffers] = useState(false);

  // Gameplay state
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [currentLevel, setCurrentLevel] = useState<Level>(() => getLevelById(1));
  const [currentBoard, setCurrentBoard] = useState<Board>(() => ({
    rows: currentLevel.rows,
    cols: currentLevel.cols,
    arrows: [...currentLevel.arrows],
  }));

  // Undo move history
  const [history, setHistory] = useState<Board[]>([]);

  // Turn metrics & Lives
  const [movesMade, setMovesMade] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | undefined>(undefined);
  const [moveLimit, setMoveLimit] = useState<number | undefined>(undefined);
  const [endlessWave, setEndlessWave] = useState(1);

  // Hammer powerup state
  const [isHammerActive, setIsHammerActive] = useState(false);

  // Modals
  const [isPaused, setIsPaused] = useState(false);
  const [levelCompletedData, setLevelCompletedData] = useState<{
    stars: number;
    coins: number;
    moves: number;
    timeTaken: number;
  } | null>(null);
  const [gameOverData, setGameOverData] = useState<{
    reason: 'out_of_moves' | 'out_of_time' | 'endless_loss' | 'out_of_hearts';
  } | null>(null);

  // Clues & Laser
  const [highlightArrowId, setHighlightArrowId] = useState<string | null>(null);
  const [showLaserBeam, setShowLaserBeam] = useState(false);
  const [scannedArrowIds, setScannedArrowIds] = useState<string[]>([]);

  // Rewarded Ad Modal State
  const [activeAdConfig, setActiveAdConfig] = useState<{
    rewardType: AdRewardType;
    title: string;
    benefitDescription: string;
    onCompleted: () => void;
  } | null>(null);

  const particleCanvasRef = useRef<ParticleCanvasHandle | null>(null);
  const timerRef = useRef<number | null>(null);

  // Synchronize document.body.dataset.state for Ultra Mode state tracking
  useEffect(() => {
    let state = 'title';
    if (screen === 'playing') {
      if (isPaused) state = 'paused';
      else if (levelCompletedData || gameOverData) state = 'gameover';
      else state = 'playing';
    }
    document.body.dataset.state = state;
  }, [screen, isPaused, levelCompletedData, gameOverData]);

  // Autostart query parameter support (?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      startLevel(1, 'classic');
    }
  }, []);

  // Keyboard controls listener (Esc/P for Pause, M for Mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (screen === 'playing' && !levelCompletedData && !gameOverData && !activeAdConfig) {
          e.preventDefault();
          setIsPaused((prev) => !prev);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, isPaused, levelCompletedData, gameOverData, activeAdConfig]);

  // Timer loop for time mode & metrics
  useEffect(() => {
    if (screen === 'playing' && !isPaused && !levelCompletedData && !gameOverData) {
      timerRef.current = window.setInterval(() => {
        setTimeElapsed((prev) => prev + 1);

        if (gameMode === 'time') {
          setTimeLeft((prev) => {
            if (prev === undefined) return undefined;
            if (prev <= 1) {
              sound.playBlocked();
              setGameOverData({ reason: 'out_of_time' });
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen, isPaused, levelCompletedData, gameOverData, gameMode]);

  // Start a specific level
  const startLevel = (lvlId: number, mode: GameMode = 'classic') => {
    sound.startMusic();
    let lvl: Level;
    if (mode === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      lvl = getDailyLevel(today);
    } else if (mode === 'endless') {
      lvl = getEndlessWave(endlessWave);
    } else {
      lvl = getLevelById(lvlId);
    }

    setCurrentLevel(lvl);
    setCurrentBoard({
      rows: lvl.rows,
      cols: lvl.cols,
      arrows: lvl.arrows.map((a) => ({ ...a })),
    });
    setHistory([]);
    setMovesMade(0);
    setHearts(lvl.initialHearts || 3);
    setTimeElapsed(0);
    setIsPaused(false);
    setIsHammerActive(false);
    setLevelCompletedData(null);
    setGameOverData(null);
    setHighlightArrowId(null);
    setShowLaserBeam(false);
    setScannedArrowIds([]);
    setGameMode(mode);

    if (mode === 'time') {
      setTimeLeft(lvl.timeLimit || 45);
    } else {
      setTimeLeft(undefined);
    }

    if (mode === 'limited') {
      setMoveLimit(lvl.moveLimit || lvl.optimalMoves + 4);
    } else {
      setMoveLimit(undefined);
    }

    setScreen('playing');
  };

  // Helper for victory resolution
  const triggerVictory = (finalMoves: number) => {
    sound.playVictory();
    const starsEarned = calculateStars(finalMoves, currentLevel.optimalMoves);
    const isDaily = gameMode === 'daily';
    const coinsEarned = calculateCoinsReward(starsEarned, currentLevel.category, isDaily);

    const updatedProfile = recordLevelCompletion(
      userProfile,
      {
        levelId: currentLevel.id,
        stars: starsEarned,
        moves: finalMoves,
        timeTaken: timeElapsed,
        completedAt: new Date().toISOString(),
      },
      coinsEarned
    );

    if (isDaily) {
      updatedProfile.lastDailyDate = new Date().toISOString().split('T')[0];
      updatedProfile.dailyStreak += 1;
      saveUserProfile(updatedProfile);
    }

    setUserProfile(updatedProfile);

    setLevelCompletedData({
      stars: starsEarned,
      coins: coinsEarned,
      moves: finalMoves,
      timeTaken: timeElapsed,
    });

    particleCanvasRef.current?.burst(window.innerWidth / 2, window.innerHeight / 3, '#4f67f7', 45);
  };

  // Handle arrow clearance event
  const handleArrowCleared = (arrowId: string) => {
    setHistory((prev) => [...prev, currentBoard]);

    const nextBoard = removeArrow(currentBoard, arrowId);
    setCurrentBoard(nextBoard);
    const nextMoves = movesMade + 1;
    setMovesMade(nextMoves);

    setHighlightArrowId(null);
    setShowLaserBeam(false);
    setScannedArrowIds([]);

    if (gameMode === 'limited' && moveLimit !== undefined) {
      if (nextMoves >= moveLimit && !isBoardCleared(nextBoard)) {
        sound.playBlocked();
        setGameOverData({ reason: 'out_of_moves' });
        return;
      }
    }

    if (isBoardCleared(nextBoard)) {
      triggerVictory(nextMoves);
    }
  };

  // Handle arrow blocked (lose 1 heart!)
  const handleArrowBlocked = (arrowId: string, blockerId?: string) => {
    setHearts((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        sound.playBlocked();
        setGameOverData({ reason: 'out_of_hearts' });
      }
      return Math.max(0, next);
    });
  };

  // 1. Star Blast Powerup (Destroys 3 blocking arrows)
  const handleStarBlast = () => {
    const currentCount = (userProfile.inventory['powerup_star_blast'] as number) || 0;
    if (currentCount <= 0 && gameMode !== 'relax') {
      handleWatchAdForPowerup('star');
      return;
    }
    if (currentBoard.arrows.length === 0) return;

    sound.playReward();

    // Find up to 3 candidate arrows to remove (prefer blockers)
    const blockingIds = new Set<string>();
    for (const a of currentBoard.arrows) {
      const chk = canArrowExit(currentBoard, a.id);
      if (chk.blocker) blockingIds.add(chk.blocker.id);
    }
    const candidateIds = Array.from(blockingIds);
    while (candidateIds.length < 3 && candidateIds.length < currentBoard.arrows.length) {
      const remain = currentBoard.arrows.filter((a) => !candidateIds.includes(a.id));
      if (remain.length === 0) break;
      candidateIds.push(remain[Math.floor(Math.random() * remain.length)].id);
    }

    let nextBoard = { ...currentBoard };
    for (const id of candidateIds) {
      nextBoard = removeArrow(nextBoard, id);
    }
    setCurrentBoard(nextBoard);
    setMovesMade((m) => m + 1);

    particleCanvasRef.current?.burst(window.innerWidth / 2, window.innerHeight / 2, '#fbbf24', 35);

    if (gameMode !== 'relax') {
      const updatedInventory = {
        ...userProfile.inventory,
        powerup_star_blast: Math.max(0, currentCount - 1),
      };
      const updated = { ...userProfile, inventory: updatedInventory };
      setUserProfile(updated);
      saveUserProfile(updated);
    }

    if (isBoardCleared(nextBoard)) {
      triggerVictory(movesMade + 1);
    }
  };

  // 2. Hammer Powerup (Smash any single arrow)
  const handleHammer = () => {
    const currentCount = (userProfile.inventory['powerup_hammer'] as number) || 0;
    if (currentCount <= 0 && gameMode !== 'relax') {
      handleWatchAdForPowerup('hammer');
      return;
    }
    setIsHammerActive((prev) => !prev);
  };

  const handleSmashArrow = (arrowId: string) => {
    const currentCount = (userProfile.inventory['powerup_hammer'] as number) || 0;
    setIsHammerActive(false);

    const nextBoard = removeArrow(currentBoard, arrowId);
    setCurrentBoard(nextBoard);
    setMovesMade((m) => m + 1);

    if (gameMode !== 'relax') {
      const updatedInventory = {
        ...userProfile.inventory,
        powerup_hammer: Math.max(0, currentCount - 1),
      };
      const updated = { ...userProfile, inventory: updatedInventory };
      setUserProfile(updated);
      saveUserProfile(updated);
    }

    if (isBoardCleared(nextBoard)) {
      triggerVictory(movesMade + 1);
    }
  };

  // 3. Shuffle Powerup (Reorient stuck arrows)
  const handleShuffle = () => {
    const currentCount = (userProfile.inventory['powerup_shuffle'] as number) || 0;
    if (currentCount <= 0 && gameMode !== 'relax') {
      handleWatchAdForPowerup('shuffle');
      return;
    }
    if (currentBoard.arrows.length === 0) return;

    sound.playWoosh();
    const dirs: Direction[] = ['up', 'down', 'left', 'right'];

    const shuffledArrows = currentBoard.arrows.map((a) => {
      const otherDirs = dirs.filter((d) => d !== a.dir);
      const newDir = otherDirs[Math.floor(Math.random() * otherDirs.length)];
      return { ...a, dir: newDir };
    });

    setCurrentBoard({
      ...currentBoard,
      arrows: shuffledArrows,
    });

    particleCanvasRef.current?.burst(window.innerWidth / 2, window.innerHeight / 2, '#38bdf8', 25);

    if (gameMode !== 'relax') {
      const updatedInventory = {
        ...userProfile.inventory,
        powerup_shuffle: Math.max(0, currentCount - 1),
      };
      const updated = { ...userProfile, inventory: updatedInventory };
      setUserProfile(updated);
      saveUserProfile(updated);
    }
  };

  // 4. Hint Powerup (Highlights clear arrow with laser)
  const handleHint = () => {
    const removable = getRemovableArrows(currentBoard);
    if (removable.length === 0) {
      sound.playBlocked();
      return;
    }
    const currentCount = (userProfile.inventory['powerup_hint'] as number) || 0;
    if (currentCount <= 0 && gameMode !== 'relax') {
      handleWatchAdForPowerup('hint');
      return;
    }

    sound.playHint();
    const targetArrow = removable[0];
    setHighlightArrowId(targetArrow.id);
    setShowLaserBeam(true);

    if (gameMode !== 'relax') {
      const updatedInventory = {
        ...userProfile.inventory,
        powerup_hint: Math.max(0, currentCount - 1),
      };
      const updated = {
        ...userProfile,
        inventory: updatedInventory,
        stats: { ...userProfile.stats, totalHintsUsed: userProfile.stats.totalHintsUsed + 1 },
      };
      setUserProfile(updated);
      saveUserProfile(updated);
    }
  };

  // Watch Ad for extra powerup
  const handleWatchAdForPowerup = (type: 'star' | 'hammer' | 'shuffle' | 'hint') => {
    const key =
      type === 'star'
        ? 'powerup_star_blast'
        : type === 'hammer'
        ? 'powerup_hammer'
        : type === 'shuffle'
        ? 'powerup_shuffle'
        : 'powerup_hint';

    const name =
      type === 'star'
        ? 'Star Blast'
        : type === 'hammer'
        ? 'Hammer'
        : type === 'shuffle'
        ? 'Shuffle'
        : 'Hint';

    setActiveAdConfig({
      rewardType: 'free_clue',
      title: `Watch Ad for +1 ${name}`,
      benefitDescription: `Watch this sponsored video to receive 1 free ${name} power-up!`,
      onCompleted: () => {
        const current = (userProfile.inventory[key] as number) || 0;
        const updatedInventory = { ...userProfile.inventory, [key]: current + 1 };
        const updated = { ...userProfile, inventory: updatedInventory };
        setUserProfile(updated);
        saveUserProfile(updated);
        setActiveAdConfig(null);
      },
    });
  };

  // Revive with ad
  const handleReviveWithAd = () => {
    setActiveAdConfig({
      rewardType: 'extra_time',
      title: 'Watch Ad for Extra Heart',
      benefitDescription: 'Watch this sponsored video to revive with +1 Heart and resume playing!',
      onCompleted: () => {
        setHearts(1);
        setGameOverData(null);
        setActiveAdConfig(null);
      },
    });
  };

  // Ad for Double Coins
  const handleWatchAdForDouble = () => {
    if (!levelCompletedData) return;
    const bonus = levelCompletedData.coins;

    setActiveAdConfig({
      rewardType: 'double_coins',
      title: 'Watch Ad for 2× Rewards',
      benefitDescription: `Watch this rewarded ad to double your level victory reward: +${bonus} additional coins!`,
      onCompleted: () => {
        const updatedProfile = {
          ...userProfile,
          coins: userProfile.coins + bonus,
          stats: {
            ...userProfile.stats,
            totalCoinsEarned: userProfile.stats.totalCoinsEarned + bonus,
          },
        };
        setUserProfile(updatedProfile);
        saveUserProfile(updatedProfile);
        setActiveAdConfig(null);
      },
    });
  };

  // Ad for level skip progress
  const handleWatchAdForSkip = () => {
    setActiveAdConfig({
      rewardType: 'level_skip_progress',
      title: 'Level Skip Ad Progress',
      benefitDescription: `Completed ads add +1 skip progress. Current progress: ${userProfile.skipAdsProgress}/11 ads.`,
      onCompleted: () => {
        const newProgress = Math.min(11, userProfile.skipAdsProgress + 1);
        const updatedProfile = {
          ...userProfile,
          skipAdsProgress: newProgress,
        };
        setUserProfile(updatedProfile);
        saveUserProfile(updatedProfile);
        setActiveAdConfig(null);
      },
    });
  };

  const handleSkipLevelNow = () => {
    if (userProfile.skipAdsProgress < 11) return;

    const nextLevelId = currentLevel.id + 1;
    const updatedProfile = {
      ...userProfile,
      skipAdsProgress: 0,
      skippedLevels: Array.from(new Set([...userProfile.skippedLevels, currentLevel.id])),
    };
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
    setIsPaused(false);
    startLevel(nextLevelId, 'classic');
  };

  // Shop purchase
  const handleBuyItem = (item: ShopItem): boolean => {
    if (userProfile.coins < item.price) return false;

    let updatedInventory = { ...userProfile.inventory };
    if (item.consumable) {
      const addCount = item.value ? parseInt(item.value) : 1;
      const currentCount = (updatedInventory[item.id] as number) || 0;
      updatedInventory[item.id] = currentCount + addCount;
    } else {
      updatedInventory[item.id] = true;
    }

    const updatedProfile: UserProfile = {
      ...userProfile,
      coins: userProfile.coins - item.price,
      inventory: updatedInventory,
    };

    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
    return true;
  };

  // Equip item
  const handleEquipItem = (category: ItemCategory, itemId: string) => {
    const updatedEquipped = { ...userProfile.equipped };
    if (category === 'skin') updatedEquipped.skin = itemId;
    if (category === 'theme') updatedEquipped.theme = itemId;
    if (category === 'effect') updatedEquipped.effect = itemId;
    if (category === 'avatar') updatedEquipped.avatar = itemId;
    if (category === 'title') updatedEquipped.title = itemId;

    const updated = { ...userProfile, equipped: updatedEquipped };
    setUserProfile(updated);
    saveUserProfile(updated);
  };

  // Audio mute toggle
  const toggleMute = () => {
    const newMuted = !userProfile.soundSettings.muted;
    sound.setMuted(newMuted);
    const updated = {
      ...userProfile,
      soundSettings: { ...userProfile.soundSettings, muted: newMuted },
    };
    setUserProfile(updated);
    saveUserProfile(updated);
  };

  // Sound settings updater
  const handleSoundSettingChange = (newSettings: {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    muted: boolean;
  }) => {
    sound.setMuted(newSettings.muted);
    sound.setMusicVolume(newSettings.musicVolume);
    sound.setSfxVolume(newSettings.sfxVolume);

    const updated = {
      ...userProfile,
      soundSettings: newSettings,
    };
    setUserProfile(updated);
    saveUserProfile(updated);
  };

  // Earn coins helper (from Quizzes / Offers / Daily)
  const handleAddCoins = (amount: number) => {
    const updated = {
      ...userProfile,
      coins: userProfile.coins + amount,
      stats: {
        ...userProfile.stats,
        totalCoinsEarned: userProfile.stats.totalCoinsEarned + amount,
      },
    };
    setUserProfile(updated);
    saveUserProfile(updated);
  };

  // Power-up bundle reward helper (from Referral milestones)
  const handleAddPowerupBundle = () => {
    const updatedInventory = {
      ...userProfile.inventory,
      powerup_star_blast: ((userProfile.inventory['powerup_star_blast'] as number) || 0) + 1,
      powerup_hammer: ((userProfile.inventory['powerup_hammer'] as number) || 0) + 1,
      powerup_shuffle: ((userProfile.inventory['powerup_shuffle'] as number) || 0) + 1,
      powerup_hint: ((userProfile.inventory['powerup_hint'] as number) || 0) + 1,
    };
    const updated = { ...userProfile, inventory: updatedInventory };
    setUserProfile(updated);
    saveUserProfile(updated);
  };

  // Reset all game data
  const handleResetProgress = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Determine current active level for home preview
  const highestSolvedLevel = Object.keys(userProfile.completedLevels).length;
  const currentResumeLevel = Math.max(1, highestSolvedLevel + 1);

  return (
    <div className="relative min-h-screen w-full bg-[#F8FAFC] text-slate-800 flex flex-col justify-between font-sans selection:bg-[#EFF2FE]">
      {/* Particle canvas for physics bursts */}
      <ParticleCanvas ref={particleCanvasRef} />

      {/* Main Home / Bottom Navigation Views */}
      {screen === 'home' && (
        <div className="w-full flex-1 flex flex-col">
          {activeTab === 'home' && (
            <HomeScreen
              currentLevelId={currentResumeLevel}
              coins={userProfile.coins}
              currentStreak={userProfile.dailyStreak}
              lastDailyClaimDate={userProfile.lastDailyDate}
              onPlayLevel={(lvl) => startLevel(lvl, 'classic')}
              onOpenHowItWorks={() => setShowHowItWorks(true)}
              onOpenDailyStreak={() => setShowDailyStreak(true)}
              onOpenDailyChallenge={() => setScreen('daily_menu')}
              onOpenSuperOffers={() => setShowSuperOffers(true)}
              onOpenPlayAGame={() => setScreen('mode_select')}
              onOpenLevelSelect={() => setScreen('level_select')}
            />
          )}

          {activeTab === 'quizzes' && (
            <QuizzesScreen
              coins={userProfile.coins}
              onEarnCoins={handleAddCoins}
              onBack={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'leaders' && (
            <LeaderboardScreen
              entries={getLeaderboard(userProfile)}
              userCoins={userProfile.coins}
            />
          )}

          {activeTab === 'refer' && (
            <ReferScreen
              coins={userProfile.coins}
              onRewardCoins={handleAddCoins}
              onAddPowerupBundle={handleAddPowerupBundle}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              soundSettings={userProfile.soundSettings}
              onUpdateSoundSettings={handleSoundSettingChange}
              onOpenHowItWorks={() => setShowHowItWorks(true)}
              onResetProgress={handleResetProgress}
            />
          )}

          {/* Fixed 5-tab Bottom Navigation */}
          <BottomNavBar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
            }}
          />
        </div>
      )}

      {/* Mode Select Screen */}
      {screen === 'mode_select' && (
        <ModeSelectScreen
          unlockedModes={['classic', 'daily', 'time', 'limited', 'endless', 'relax']}
          currentEndlessWave={endlessWave}
          onSelectMode={(mode) => {
            if (mode === 'daily') {
              setScreen('daily_menu');
            } else {
              startLevel(currentResumeLevel, mode);
            }
          }}
          onBack={() => setScreen('home')}
        />
      )}

      {/* Level Select Screen */}
      {screen === 'level_select' && (
        <LevelSelectScreen
          levels={getAllLevels(105)}
          completedLevels={userProfile.completedLevels}
          skippedLevels={userProfile.skippedLevels}
          highestUnlockedLevel={Math.max(1, highestSolvedLevel + 1)}
          onSelectLevel={(lvlId) => startLevel(lvlId, 'classic')}
          onBack={() => setScreen('home')}
        />
      )}

      {/* Daily Challenge Screen */}
      {screen === 'daily_menu' && (
        <DailyChallengeScreen
          currentStreak={userProfile.dailyStreak}
          lastCompletedDate={userProfile.lastDailyDate}
          onStartDaily={() => startLevel(1, 'daily')}
          onBack={() => setScreen('home')}
        />
      )}

      {/* Shop Screen */}
      {screen === 'shop' && (
        <ShopScreen
          coins={userProfile.coins}
          inventory={userProfile.inventory}
          equipped={userProfile.equipped}
          onBuyItem={handleBuyItem}
          onEquipItem={handleEquipItem}
          onWatchAdForCoins={() => {
            setActiveAdConfig({
              rewardType: 'coins_50',
              title: 'Watch Ad for Free Coins',
              benefitDescription: 'Watching 1 rewarded partner ad will grant 50 free coins!',
              onCompleted: () => {
                handleAddCoins(50);
                setActiveAdConfig(null);
              },
            });
          }}
          onBack={() => setScreen('home')}
        />
      )}

      {/* Vault / Inventory Screen */}
      {screen === 'inventory' && (
        <InventoryScreen
          inventory={userProfile.inventory}
          equipped={userProfile.equipped}
          onEquipItem={handleEquipItem}
          onBack={() => setScreen('home')}
        />
      )}

      {/* Profile Screen */}
      {screen === 'profile' && (
        <ProfileScreen
          profile={userProfile}
          onBack={() => setScreen('home')}
          onEquipAvatar={(av) => handleEquipItem('avatar', av)}
        />
      )}

      {/* Admin Screen */}
      {screen === 'admin' && (
        <AdminScreen
          settings={monetization}
          onUpdateSettings={(newSettings) => {
            setMonetization(newSettings);
            saveMonetizationSettings(newSettings);
          }}
          onAddTestCoins={handleAddCoins}
          onBack={() => setScreen('home')}
        />
      )}

      {/* Gameplay View */}
      {screen === 'playing' && (
        <div className="relative min-h-screen w-full flex flex-col justify-between py-2 overflow-hidden bg-white">
          {/* Top Bar HUD */}
          <HeaderHUD
            mode={gameMode}
            levelTitle={
              gameMode === 'daily'
                ? 'Daily Challenge'
                : gameMode === 'endless'
                ? `Wave ${endlessWave}`
                : `Level ${currentLevel.id}`
            }
            category={currentLevel.category}
            coins={userProfile.coins}
            movesMade={movesMade}
            hearts={hearts}
            moveLimit={moveLimit}
            timeLeft={timeLeft}
            isMuted={userProfile.soundSettings.muted}
            onBack={() => setScreen('home')}
            onPause={() => setIsPaused(true)}
            onToggleMute={toggleMute}
          />

          {/* Central Interactive Arrow Grid Board */}
          <main className="my-auto w-full flex items-center justify-center p-2">
            <ArrowBoard
              board={currentBoard}
              skinId={userProfile.equipped.skin}
              themeId={userProfile.equipped.theme}
              effectId={userProfile.equipped.effect}
              highlightArrowId={highlightArrowId}
              showLaserBeam={showLaserBeam}
              scannedArrowIds={scannedArrowIds}
              disabled={isPaused || !!levelCompletedData || !!gameOverData}
              isHammerActive={isHammerActive}
              onArrowCleared={handleArrowCleared}
              onArrowBlocked={handleArrowBlocked}
              onSmashArrow={handleSmashArrow}
              onBurstParticles={(x, y, color) => particleCanvasRef.current?.burst(x, y, color)}
            />
          </main>

          {/* Bottom 4 Power-ups HUD */}
          <BottomToolsHUD
            starBlastsLeft={(userProfile.inventory['powerup_star_blast'] as number) || 0}
            hammersLeft={(userProfile.inventory['powerup_hammer'] as number) || 0}
            shufflesLeft={(userProfile.inventory['powerup_shuffle'] as number) || 0}
            hintsLeft={(userProfile.inventory['powerup_hint'] as number) || 0}
            isHammerActive={isHammerActive}
            onStarBlast={handleStarBlast}
            onHammer={handleHammer}
            onShuffle={handleShuffle}
            onHint={handleHint}
            onBuyOrWatchPowerup={handleWatchAdForPowerup}
          />

          {/* Pause Modal */}
          {isPaused && (
            <PauseModal
              levelId={currentLevel.id}
              skipAdsProgress={userProfile.skipAdsProgress}
              soundSettings={userProfile.soundSettings}
              onResume={() => setIsPaused(false)}
              onRestart={() => {
                setIsPaused(false);
                startLevel(currentLevel.id, gameMode);
              }}
              onWatchAdForSkip={handleWatchAdForSkip}
              onSkipLevelNow={handleSkipLevelNow}
              onSoundSettingChange={handleSoundSettingChange}
              onExit={() => {
                setIsPaused(false);
                setScreen('home');
              }}
            />
          )}

          {/* Level Complete Modal */}
          {levelCompletedData && (
            <LevelCompleteModal
              levelId={currentLevel.id}
              stars={levelCompletedData.stars}
              moves={levelCompletedData.moves}
              optimalMoves={currentLevel.optimalMoves}
              timeTaken={levelCompletedData.timeTaken}
              normalRewardCoins={levelCompletedData.coins}
              isDaily={gameMode === 'daily'}
              onClaimNormal={() => {}}
              onWatchAdForDouble={handleWatchAdForDouble}
              onNextLevel={() => {
                if (gameMode === 'endless') {
                  const nextWave = endlessWave + 1;
                  setEndlessWave(nextWave);
                  startLevel(nextWave, 'endless');
                } else if (gameMode === 'daily') {
                  setScreen('daily_menu');
                } else {
                  startLevel(currentLevel.id + 1, gameMode);
                }
              }}
              onReplay={() => startLevel(currentLevel.id, gameMode)}
            />
          )}

          {/* Game Over Modal */}
          {gameOverData && (
            <GameOverModal
              mode={gameMode}
              reason={gameOverData.reason}
              canReviveWithAd={monetization.adsEnabled}
              onReviveWithAd={handleReviveWithAd}
              onRestart={() => startLevel(currentLevel.id, gameMode)}
              onExit={() => setScreen('home')}
            />
          )}
        </div>
      )}

      {/* How It Works Modal */}
      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}

      {/* Daily Streak Modal */}
      {showDailyStreak && (
        <DailyStreakModal
          currentStreak={userProfile.dailyStreak}
          lastClaimDate={userProfile.lastDailyDate}
          onClaimDay={(day, coins) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const updated = {
              ...userProfile,
              coins: userProfile.coins + coins,
              dailyStreak: userProfile.dailyStreak + 1,
              lastDailyDate: todayStr,
            };
            setUserProfile(updated);
            saveUserProfile(updated);
          }}
          onClose={() => setShowDailyStreak(false)}
        />
      )}

      {/* Super Offers Modal */}
      {showSuperOffers && (
        <SuperOffersModal
          onClaimReward={(coins) => handleAddCoins(coins)}
          onClose={() => setShowSuperOffers(false)}
        />
      )}

      {/* Rewarded Ad Interactive Modal Overlay */}
      {activeAdConfig && (
        <RewardedAdModal
          rewardType={activeAdConfig.rewardType}
          title={activeAdConfig.title}
          benefitDescription={activeAdConfig.benefitDescription}
          onAdCompleted={activeAdConfig.onCompleted}
          onAdClosed={() => setActiveAdConfig(null)}
        />
      )}
    </div>
  );
}
