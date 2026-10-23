/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, RotateCcw, Heart, Home, Tv } from 'lucide-react';
import { GameMode } from '../game/types';
import { sound } from '../audio/soundManager';

interface GameOverModalProps {
  mode: GameMode;
  reason: 'out_of_moves' | 'out_of_time' | 'endless_loss' | 'out_of_hearts';
  canReviveWithAd: boolean;
  onReviveWithAd: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  mode,
  reason,
  canReviveWithAd,
  onReviveWithAd,
  onRestart,
  onExit,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-100 shadow-2xl p-6 text-slate-800 flex flex-col items-center gap-4 text-center animate-scale-up">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
          {reason === 'out_of_hearts' ? (
            <Heart className="w-7 h-7 fill-rose-500" />
          ) : (
            <AlertCircle className="w-7 h-7" />
          )}
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900">
            {reason === 'out_of_hearts'
              ? 'No Hearts Left!'
              : reason === 'out_of_time'
              ? 'Time Ran Out'
              : reason === 'out_of_moves'
              ? 'Move Limit Reached'
              : 'Wave Failed'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            {reason === 'out_of_hearts'
              ? 'You hit blocked arrows 3 times. Revive to continue or try again!'
              : reason === 'out_of_time'
              ? 'The countdown expired before all arrows escaped.'
              : 'You used all allotted moves for this puzzle.'}
          </p>
        </div>

        {/* Revive Button */}
        {canReviveWithAd && (
          <button
            onClick={() => {
              sound.playClick();
              onReviveWithAd();
            }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-105 text-white font-black rounded-2xl shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer text-xs"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>REVIVE (+1 HEART / WATCH AD)</span>
          </button>
        )}

        <div className="flex gap-2 w-full mt-1">
          {/* Restart */}
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="flex-1 py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          {/* Return Home */}
          <button
            onClick={() => {
              sound.playClick();
              onExit();
            }}
            className="flex-1 py-3 px-3 rounded-2xl bg-[#EFF2FE] hover:bg-[#E0E7FE] text-[#3B49A2] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
