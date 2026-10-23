/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, HelpCircle, Trophy, Share2, Settings } from 'lucide-react';
import { sound } from '../audio/soundManager';

export type NavTab = 'home' | 'quizzes' | 'leaders' | 'refer' | 'settings';

interface BottomNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
    { id: 'leaders', label: 'Leaders', icon: Trophy },
    { id: 'refer', label: 'Refer', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg shadow-slate-200/40 select-none">
      <div className="w-full max-w-md mx-auto flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                onSelectTab(tab.id);
              }}
              aria-label={`Navigate to ${tab.label}`}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer relative ${
                isActive ? 'text-[#4F67F7]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#EFF2FE] scale-110' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-black text-[#4F67F7]' : 'font-semibold text-slate-500'
                }`}
              >
                {tab.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#4F67F7]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
