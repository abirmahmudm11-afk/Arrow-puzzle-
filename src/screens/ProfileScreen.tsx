/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  LogIn,
  LogOut,
  Mail,
  Lock,
  Volume2,
  VolumeX,
  Sliders,
  Sun,
  Moon,
  Trash2,
  CheckCircle2,
  Shield,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../game/types';
import {
  registerAccount,
  loginAccount,
  signInWithGoogle,
  signOutUser,
} from '../services/storage';
import { sound } from '../audio/soundManager';

interface ProfileScreenProps {
  userProfile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  onProfileUpdated,
  onBack,
}) => {
  const [authMode, setAuthMode] = useState<'idle' | 'login' | 'register' | 'forgot'>('idle');
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleGoogleLogin = () => {
    sound.playClick();
    // Simulate real Google OAuth identity capture
    const googleEmail = 'abirmahmudm11@gmail.com';
    const displayName = 'Abir Mahmud';
    const res = signInWithGoogle(googleEmail, displayName, userProfile);
    if (res.success) {
      sound.playVictory();
      setAuthSuccess('Google Account linked successfully! Progress merged.');
      onProfileUpdated(res.profile);
      setTimeout(() => {
        setAuthSuccess(null);
        setAuthMode('idle');
      }, 2000);
    }
  };

  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === 'register') {
      const res = registerAccount(emailInput, passInput, nameInput, userProfile);
      if (!res.success) {
        sound.playBlocked();
        setAuthError(res.error || 'Registration failed');
      } else if (res.profile) {
        sound.playVictory();
        setAuthSuccess('Account created and guest progress merged!');
        onProfileUpdated(res.profile);
        setTimeout(() => {
          setAuthSuccess(null);
          setAuthMode('idle');
        }, 2000);
      }
    } else if (authMode === 'login') {
      const res = loginAccount(emailInput, passInput, userProfile);
      if (!res.success) {
        sound.playBlocked();
        setAuthError(res.error || 'Login failed');
      } else if (res.profile) {
        sound.playVictory();
        setAuthSuccess('Logged in successfully! Progress synchronized.');
        onProfileUpdated(res.profile);
        setTimeout(() => {
          setAuthSuccess(null);
          setAuthMode('idle');
        }, 2000);
      }
    } else if (authMode === 'forgot') {
      sound.playClick();
      setAuthSuccess(`Password reset instructions sent to ${emailInput}`);
      setTimeout(() => {
        setAuthSuccess(null);
        setAuthMode('login');
      }, 2500);
    }
  };

  const handleSignOut = () => {
    sound.playClick();
    const guest = signOutUser();
    onProfileUpdated(guest);
  };

  const handleSoundChange = (type: 'sfx' | 'music' | 'mute', val: number | boolean) => {
    if (type === 'sfx') sound.setSfxVolume(val as number);
    if (type === 'music') sound.setMusicVolume(val as number);
    if (type === 'mute') sound.setMuted(val as boolean);

    onProfileUpdated({
      ...userProfile,
      soundSettings: sound.getSettings(),
    });
  };

  const handleThemeToggle = () => {
    sound.playClick();
    const nextTheme = userProfile.themePreference === 'dark' ? 'light' : 'dark';
    onProfileUpdated({
      ...userProfile,
      themePreference: nextTheme,
    });
  };

  const handleDeleteAccountData = () => {
    localStorage.clear();
    sound.playClick();
    window.location.reload();
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
          <User className="w-4 h-4 text-sky-400" />
          <span>Player Profile</span>
        </h2>

        <div className="w-9" />
      </div>

      <div className="w-full max-w-md mx-auto flex flex-col gap-4 flex-1 overflow-y-auto max-h-[80vh] py-4">
        {/* Profile Card */}
        <div className="p-5 rounded-3xl bg-linear-to-b from-sky-950/30 via-zinc-900 to-zinc-900 border border-sky-500/30 flex items-center gap-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center font-black text-2xl">
            {userProfile.displayName[0]?.toUpperCase() || 'P'}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-zinc-100">{userProfile.displayName}</h3>
              {userProfile.isGuest ? (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  Guest
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                  Synced
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400 mt-0.5">{userProfile.email || 'Local Guest Device'}</p>
            <p className="text-xs font-semibold text-amber-400 mt-1">{userProfile.equipped.title}</p>
          </div>
        </div>

        {/* Auth / Account Linking Section */}
        {userProfile.isGuest && authMode === 'idle' && (
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Account Synchronization
            </span>
            <p className="text-xs text-zinc-400">
              Sign in to automatically save and sync your stars, coins, skins, and levels across devices.
            </p>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => setAuthMode('login')}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition cursor-pointer"
              >
                Email Login
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition cursor-pointer"
              >
                Register
              </button>
            </div>
          </div>
        )}

        {/* Email Auth Form if active */}
        {authMode !== 'idle' && (
          <form
            onSubmit={handleEmailAuthSubmit}
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700 flex flex-col gap-3 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                {authMode === 'login' ? 'Email Sign In' : authMode === 'register' ? 'Create Account' : 'Reset Password'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('idle');
                  setAuthError(null);
                }}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            {authError && (
              <div className="p-2 rounded-lg bg-red-950/70 border border-red-500/50 text-red-300 text-xs">
                {authError}
              </div>
            )}
            {authSuccess && (
              <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs">
                {authSuccess}
              </div>
            )}

            {authMode === 'register' && (
              <input
                type="text"
                placeholder="Display Name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs outline-none focus:border-sky-500"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs outline-none focus:border-sky-500"
              required
            />

            {authMode !== 'forgot' && (
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs outline-none focus:border-sky-500"
                required
              />
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs transition cursor-pointer"
            >
              {authMode === 'login' ? 'Sign In' : authMode === 'register' ? 'Register & Merge Progress' : 'Send Reset Link'}
            </button>

            {authMode === 'login' && (
              <button
                type="button"
                onClick={() => setAuthMode('forgot')}
                className="text-[11px] text-zinc-400 hover:underline text-center"
              >
                Forgot your password?
              </button>
            )}
          </form>
        )}

        {/* Sign Out Button if Authenticated */}
        {!userProfile.isGuest && (
          <button
            onClick={handleSignOut}
            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-zinc-400" />
            <span>Sign Out to Guest Mode</span>
          </button>
        )}

        {/* Preferences (Audio & Theme) */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Game Settings</span>
          </span>

          {/* Theme Preference Toggle */}
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-zinc-300">Theme</span>
            <button
              onClick={handleThemeToggle}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {userProfile.themePreference === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>

          {/* SFX Volume */}
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-zinc-300">Sound Effects</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={userProfile.soundSettings.sfxVolume}
              onChange={(e) => handleSoundChange('sfx', parseFloat(e.target.value))}
              className="w-32 accent-sky-400 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Music Volume */}
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-zinc-300">Zen Music</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={userProfile.soundSettings.musicVolume}
              onChange={(e) => handleSoundChange('music', parseFloat(e.target.value))}
              className="w-32 accent-sky-400 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Clear Data / Account Deletion */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Danger Zone</span>
          </span>
          <p className="text-[11px] text-zinc-400">
            Reset all saved levels, coins, and local progress on this device.
          </p>

          {showDeleteConfirm ? (
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccountData}
                className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Yes, Reset All
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="py-1.5 text-xs text-red-400 hover:text-red-300 text-left underline"
            >
              Reset local save data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
