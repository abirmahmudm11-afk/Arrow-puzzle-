/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle2, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { AdRewardType } from '../services/adService';
import { sound } from '../audio/soundManager';

interface RewardedAdModalProps {
  rewardType: AdRewardType;
  title: string;
  benefitDescription: string;
  onAdCompleted: () => void;
  onAdClosed: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  rewardType,
  title,
  benefitDescription,
  onAdCompleted,
  onAdClosed,
}) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [adStarted, setAdStarted] = useState(true);
  const hasRewardedRef = useRef(false);

  useEffect(() => {
    let timer: number | null = null;
    if (adStarted && timeLeft > 0 && !isCompleted) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timer) clearInterval(timer);
            setIsCompleted(true);
            sound.playCoin();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [adStarted, timeLeft, isCompleted]);

  const handleClaimReward = () => {
    if (!hasRewardedRef.current && isCompleted) {
      hasRewardedRef.current = true;
      sound.playVictory();
      onAdCompleted();
    }
  };

  const handleAttemptClose = () => {
    if (isCompleted) {
      handleClaimReward();
      return;
    }
    setShowExitWarning(true);
  };

  const confirmExitEarly = () => {
    sound.playClick();
    onAdClosed();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl text-white">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/90 border-b border-zinc-700">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Rewarded Partner Ad</span>
          </div>

          <button
            onClick={handleAttemptClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
            aria-label="Close ad"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video / Creative Simulation Area */}
        <div className="relative aspect-video w-full bg-linear-to-br from-indigo-950 via-zinc-900 to-purple-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25)_0%,transparent_70%)] pointer-events-none" />

          {/* Ad Creative Content */}
          <div className="relative z-10 flex flex-col items-center max-w-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/10">
              <Play className="w-8 h-8 text-indigo-400 fill-indigo-400 ml-1" />
            </div>
            <h4 className="font-bold text-base tracking-wide text-zinc-100">
              {title}
            </h4>
            <p className="text-xs text-zinc-300 mt-1 line-clamp-2">
              {benefitDescription}
            </p>
          </div>

          {/* Progress / Timer Badge */}
          <div className="absolute top-3 left-3 bg-black/60 px-2.5 py-1 rounded-full text-xs font-mono font-medium text-zinc-200 border border-white/10">
            {isCompleted ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ad Finished
              </span>
            ) : (
              <span>Reward in: {timeLeft}s</span>
            )}
          </div>
        </div>

        {/* Continuous Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-800">
          <div
            className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
            style={{ width: `${((5 - timeLeft) / 5) * 100}%` }}
          />
        </div>

        {/* Bottom Actions Area */}
        <div className="p-4 bg-zinc-900 flex flex-col gap-2.5">
          {isCompleted ? (
            <button
              onClick={handleClaimReward}
              className="w-full py-3 px-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-zinc-950" />
              <span>Claim Your Reward!</span>
            </button>
          ) : (
            <div className="text-center py-2 text-xs text-zinc-400">
              Please watch until the timer reaches zero to earn this reward.
            </div>
          )}
        </div>

        {/* Early Exit Confirmation Warning */}
        {showExitWarning && !isCompleted && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h5 className="font-bold text-lg text-white">Leave without reward?</h5>
            <p className="text-xs text-zinc-300 mt-1 max-w-xs">
              If you close the ad now, your progress or reward will not be granted.
            </p>
            <div className="flex gap-3 mt-5 w-full max-w-xs">
              <button
                onClick={() => setShowExitWarning(false)}
                className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
              >
                Keep Watching
              </button>
              <button
                onClick={confirmExitEarly}
                className="flex-1 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs border border-zinc-700 transition"
              >
                Leave Anyway
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
