/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Gift, Check, Coins, Sparkles, Award } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface SuperOffersModalProps {
  onClaimReward: (rewardCoins: number) => void;
  onClose: () => void;
}

interface OfferTask {
  id: string;
  title: string;
  desc: string;
  rewardCoins: number;
  completed: boolean;
}

export const SuperOffersModal: React.FC<SuperOffersModalProps> = ({ onClaimReward, onClose }) => {
  const [tasks, setTasks] = useState<OfferTask[]>([
    {
      id: 'task_1',
      title: 'Welcome Starter Bonus',
      desc: 'Claim your exclusive newcomer rescue package',
      rewardCoins: 150,
      completed: false,
    },
    {
      id: 'task_2',
      title: 'Tactical Trajectory Master',
      desc: 'Clear 3 levels without losing any hearts',
      rewardCoins: 200,
      completed: false,
    },
    {
      id: 'task_3',
      title: 'Power-Up Enthusiast',
      desc: 'Deploy Star Blast or Hammer in puzzle combat',
      rewardCoins: 120,
      completed: false,
    },
    {
      id: 'task_4',
      title: 'Daily Dedication',
      desc: 'Inspect the Daily Challenge puzzle and test your skill',
      rewardCoins: 180,
      completed: false,
    },
  ]);

  const [claimedIds, setClaimedIds] = useState<Record<string, boolean>>({});

  const handleClaim = (task: OfferTask) => {
    if (claimedIds[task.id]) return;
    sound.playReward();
    setClaimedIds((prev) => ({ ...prev, [task.id]: true }));
    onClaimReward(task.rewardCoins);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-[#4F67F7] flex items-center justify-center">
              <Gift className="w-5 h-5 text-[#4F67F7]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 leading-tight">Super Offers</h3>
              <p className="text-xs text-slate-500 font-medium">Complete tasks to earn huge coin boosts!</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tasks List */}
        <div className="flex flex-col gap-3 my-1">
          {tasks.map((task) => {
            const isClaimed = claimedIds[task.id];
            return (
              <div
                key={task.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 hover:border-[#D5E0FC] transition"
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-bold text-xs text-slate-800">{task.title}</span>
                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                      +{task.rewardCoins} 🪙
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{task.desc}</p>
                </div>

                <button
                  onClick={() => handleClaim(task)}
                  disabled={isClaimed}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer shrink-0 ${
                    isClaimed
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#4F67F7] to-[#6355FE] text-white hover:brightness-105 active:scale-95 shadow-xs'
                  }`}
                >
                  {isClaimed ? 'Claimed' : 'Claim'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 font-medium">
          New offers refresh weekly. Keep rescuing arrows!
        </div>
      </div>
    </div>
  );
};
