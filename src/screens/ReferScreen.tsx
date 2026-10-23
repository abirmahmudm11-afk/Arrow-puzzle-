/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Share2, Copy, Check, Users, Gift, Sparkles, Award } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface ReferScreenProps {
  coins: number;
  onRewardCoins: (amount: number) => void;
  onAddPowerupBundle: () => void;
}

export const ReferScreen: React.FC<ReferScreenProps> = ({
  coins,
  onRewardCoins,
  onAddPowerupBundle,
}) => {
  const [copied, setCopied] = useState(false);
  const [invitedCount, setInvitedCount] = useState(1);
  const [claimedMilestones, setClaimedMilestones] = useState<Record<number, boolean>>({});

  const referralCode = 'RESCUE-789X';

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    sound.playClick();
    if (navigator.share) {
      navigator.share({
        title: 'Arrow Rescue - Puzzle Game',
        text: `Play Arrow Rescue with me! Use my referral code ${referralCode} to get 100 free coins.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handleSimulateInvite = () => {
    sound.playReward();
    setInvitedCount((c) => c + 1);
  };

  const handleClaimMilestone = (targetCount: number, rewardType: 'coins' | 'bundle', value: number) => {
    if (claimedMilestones[targetCount] || invitedCount < targetCount) return;
    sound.playReward();
    setClaimedMilestones((prev) => ({ ...prev, [targetCount]: true }));

    if (rewardType === 'coins') {
      onRewardCoins(value);
    } else {
      onAddPowerupBundle();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col p-4 bg-[#F8FAFC] text-slate-800 select-none pb-24">
      {/* Top Header */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#EFF2FE] text-[#4F67F7] flex items-center justify-center font-bold">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800">Refer & Earn</h1>
            <p className="text-xs text-slate-500 font-medium">Invite friends for free power-ups & coins!</p>
          </div>
        </div>

        {/* Coin pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFF2FE] border border-[#D5E0FC] shadow-xs">
          <span className="text-xs font-black font-mono text-[#1E293B] tabular-nums">{coins}</span>
          <span className="text-xs">🪙</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col gap-4">
        {/* Referral Code Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
            <Gift className="w-7 h-7 text-[#4F67F7]" />
          </div>

          <div>
            <h2 className="text-base font-black text-slate-800">Your Exclusive Invite Code</h2>
            <p className="text-xs text-slate-500 mt-0.5">Share with friends to claim escalating milestone rewards</p>
          </div>

          {/* Code box */}
          <div className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#EFF2FE] border border-[#D5E0FC]">
            <span className="text-base font-black font-mono tracking-wider text-[#3B49A2] px-2">
              {referralCode}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-[#4F67F7] text-xs font-bold shadow-xs border border-[#D5E0FC] transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#4F67F7] to-[#6355FE] hover:brightness-105 active:scale-98 text-white font-black text-sm rounded-2xl shadow-md shadow-indigo-200 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>SHARE INVITE LINK</span>
          </button>
        </div>

        {/* Milestone Progression */}
        <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4F67F7]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Milestones ({invitedCount} Joined)
              </h3>
            </div>
            {/* Quick simulator button so user can test the mechanism */}
            <button
              onClick={handleSimulateInvite}
              className="text-[10px] font-bold text-[#4F67F7] bg-[#EFF2FE] hover:bg-[#E0E7FE] px-2.5 py-1 rounded-full cursor-pointer transition"
            >
              + Simulate Friend Join
            </button>
          </div>

          {/* Milestones list */}
          <div className="flex flex-col gap-2.5 mt-1">
            {/* Milestone 1 */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-800 block">1 Friend Joined</span>
                <span className="text-[11px] text-amber-600 font-semibold">+100 Coins</span>
              </div>
              <button
                onClick={() => handleClaimMilestone(1, 'coins', 100)}
                disabled={claimedMilestones[1] || invitedCount < 1}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                  claimedMilestones[1]
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : invitedCount >= 1
                    ? 'bg-[#4F67F7] text-white hover:brightness-105 active:scale-95 shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {claimedMilestones[1] ? 'Claimed' : 'Claim'}
              </button>
            </div>

            {/* Milestone 2 */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-800 block">3 Friends Joined</span>
                <span className="text-[11px] text-amber-600 font-semibold">+300 Coins</span>
              </div>
              <button
                onClick={() => handleClaimMilestone(3, 'coins', 300)}
                disabled={claimedMilestones[3] || invitedCount < 3}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                  claimedMilestones[3]
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : invitedCount >= 3
                    ? 'bg-[#4F67F7] text-white hover:brightness-105 active:scale-95 shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {claimedMilestones[3] ? 'Claimed' : 'Claim'}
              </button>
            </div>

            {/* Milestone 3 */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#EFF2FE] border border-[#D5E0FC]">
              <div>
                <span className="text-xs font-black text-[#1E293B] block">5 Friends Joined</span>
                <span className="text-[11px] text-[#4F67F7] font-bold">Free Power-Up Bundle (All 4)</span>
              </div>
              <button
                onClick={() => handleClaimMilestone(5, 'bundle', 0)}
                disabled={claimedMilestones[5] || invitedCount < 5}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                  claimedMilestones[5]
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : invitedCount >= 5
                    ? 'bg-gradient-to-r from-[#4F67F7] to-[#6355FE] text-white hover:brightness-105 active:scale-95 shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {claimedMilestones[5] ? 'Claimed' : 'Claim'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
