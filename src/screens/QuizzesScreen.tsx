/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, Sparkles, Coins, ArrowRight, RotateCcw } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface QuizzesScreenProps {
  coins: number;
  onEarnCoins: (amount: number) => void;
  onBack: () => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'When an arrow points UP from row 0 (the top edge), what happens when tapped?',
    options: [
      'It gets blocked by the ceiling',
      'It immediately exits the board safely',
      'It rotates 90 degrees to the right',
      'It loses 1 heart',
    ],
    correctIndex: 1,
    explanation: 'Row 0 is already at the perimeter! Since nothing is ahead of it, it exits freely.',
  },
  {
    id: 2,
    question: 'Which power-up allows you to directly smash ANY arrow, even if completely blocked?',
    options: ['Shuffle', 'Star Blast', 'Hammer', 'Hint'],
    correctIndex: 2,
    explanation: 'The Hammer gives you destructive tactical power to smash and eliminate any stubborn blocker!',
  },
  {
    id: 3,
    question: 'What penalty is incurred when you tap an arrow whose path is blocked by another arrow?',
    options: ['You lose 1 Heart', 'Level immediately resets', 'You lose 50 coins', 'Arrows reverse direction'],
    correctIndex: 0,
    explanation: 'Tapping a blocked arrow causes an obstruction and deducts 1 of your 3 hearts.',
  },
  {
    id: 4,
    question: 'How does the Star Blast power-up rescue your puzzle board?',
    options: [
      'It adds 60 seconds to the timer',
      'It instantly destroys 3 random blocking arrows',
      'It reveals the entire solution in green',
      'It grants 500 free coins',
    ],
    correctIndex: 1,
    explanation: 'Star Blast summons a starry explosion that blasts away 3 obstructive arrows!',
  },
  {
    id: 5,
    question: 'What is the most effective general strategy in Arrow Rescue puzzles?',
    options: [
      'Tap arrows in the exact center first',
      'Clear arrows pointing toward outer edges first',
      'Tap arrows randomly as fast as possible',
      'Wait for the arrows to move on their own',
    ],
    correctIndex: 1,
    explanation: 'Unwinding from the outside in peels away outer layers, freeing trapped interior arrows.',
  },
];

export const QuizzesScreen: React.FC<QuizzesScreenProps> = ({ coins, onEarnCoins, onBack }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredMap, setAnsweredMap] = useState<Record<number, boolean>>({});

  const currentQ = QUIZ_QUESTIONS[currentQIndex];
  const isFinished = currentQIndex >= QUIZ_QUESTIONS.length;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      sound.playReward();
      setScore((s) => s + 1);
      if (!answeredMap[currentQ.id]) {
        onEarnCoins(50);
        setAnsweredMap((prev) => ({ ...prev, [currentQ.id]: true }));
      }
    } else {
      sound.playBlocked();
    }
  };

  const handleNext = () => {
    sound.playClick();
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentQIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col p-4 bg-[#F8FAFC] text-slate-800 select-none pb-24">
      {/* Top Header */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#EFF2FE] text-[#4F67F7] flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800">Puzzle Quizzes</h1>
            <p className="text-xs text-slate-500 font-medium">Test logic & earn +50 coins each!</p>
          </div>
        </div>

        {/* Coin pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFF2FE] border border-[#D5E0FC] shadow-xs">
          <span className="text-xs font-black font-mono text-[#1E293B] tabular-nums">{coins}</span>
          <span className="text-xs">🪙</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
        {!isFinished ? (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col gap-5">
            {/* Question Progress Tracker */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#4F67F7] bg-[#EFF2FE] px-3 py-1 rounded-full">
                Question {currentQIndex + 1} of {QUIZ_QUESTIONS.length}
              </span>
              <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+50 Coins</span>
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-base font-bold text-slate-800 leading-snug">
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div className="flex flex-col gap-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:bg-[#EFF2FE] hover:border-[#D5E0FC]';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-300';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-300';
                  } else {
                    btnStyle = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={`opt_${idx}`}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs font-semibold transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {isAnswered && (
              <div className="p-3.5 rounded-2xl bg-[#EFF2FE] border border-[#D5E0FC] text-xs text-slate-700 animate-fade-in">
                <strong className="block text-[#4F67F7] mb-0.5">
                  {selectedOption === currentQ.correctIndex ? '🎉 Spot On!' : '💡 Good Try!'}
                </strong>
                {currentQ.explanation}
              </div>
            )}

            {/* Next Button */}
            {isAnswered && (
              <button
                onClick={handleNext}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#4F67F7] to-[#6355FE] hover:brightness-105 active:scale-98 text-white font-black text-sm rounded-2xl shadow-md shadow-indigo-200 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>NEXT QUESTION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* Finished Screen */
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-1">
              <Award className="w-8 h-8 text-amber-500" />
            </div>

            <h2 className="text-xl font-black text-slate-800">Quiz Completed!</h2>
            <p className="text-xs text-slate-500">
              You scored <strong className="text-[#4F67F7]">{score}</strong> out of {QUIZ_QUESTIONS.length} questions correctly.
            </p>

            <div className="w-full p-3.5 rounded-2xl bg-[#EFF2FE] border border-[#D5E0FC] flex items-center justify-center gap-2 text-sm font-black text-[#4F67F7]">
              <Coins className="w-5 h-5 text-amber-500" />
              <span>+{score * 50} Coins Added to Balance</span>
            </div>

            <button
              onClick={handleRestart}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#4F67F7] to-[#6355FE] text-white font-black text-sm rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PRACTICE AGAIN</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
