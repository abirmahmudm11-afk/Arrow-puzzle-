/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Arrow, Board, Direction } from '../game/types';
import { canArrowExit } from '../game/rules';
import { sound } from '../audio/soundManager';

interface ArrowBoardProps {
  board: Board;
  skinId: string;
  themeId: string;
  effectId: string;
  highlightArrowId?: string | null;
  showLaserBeam?: boolean;
  scannedArrowIds?: string[];
  disabled?: boolean;
  isHammerActive?: boolean;
  onArrowCleared: (arrowId: string) => void;
  onArrowBlocked?: (arrowId: string, blockerId?: string) => void;
  onSmashArrow?: (arrowId: string) => void;
  onBurstParticles?: (x: number, y: number, color?: string) => void;
}

export const ArrowBoard: React.FC<ArrowBoardProps> = ({
  board,
  skinId,
  themeId,
  effectId,
  highlightArrowId,
  showLaserBeam,
  scannedArrowIds = [],
  disabled = false,
  isHammerActive = false,
  onArrowCleared,
  onArrowBlocked,
  onSmashArrow,
  onBurstParticles,
}) => {
  const [animatingOutIds, setAnimatingOutIds] = useState<Record<string, Direction>>({});
  const [smashedIds, setSmashedIds] = useState<Record<string, boolean>>({});
  const [blockedArrowId, setBlockedArrowId] = useState<string | null>(null);
  const [activeBlockerId, setActiveBlockerId] = useState<string | null>(null);

  // Clear temporary shake / blocker highlight after 450ms
  useEffect(() => {
    if (blockedArrowId) {
      const t = setTimeout(() => {
        setBlockedArrowId(null);
        setActiveBlockerId(null);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [blockedArrowId]);

  const handleArrowClick = (e: React.MouseEvent<HTMLButtonElement>, arrow: Arrow) => {
    if (disabled || animatingOutIds[arrow.id] || smashedIds[arrow.id]) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Hammer smash powerup handling
    if (isHammerActive) {
      sound.playSmash ? sound.playSmash() : sound.playWoosh();
      setSmashedIds((prev) => ({ ...prev, [arrow.id]: true }));
      if (onBurstParticles) {
        onBurstParticles(centerX, centerY, '#ef4444');
      }
      setTimeout(() => {
        if (onSmashArrow) {
          onSmashArrow(arrow.id);
        } else {
          onArrowCleared(arrow.id);
        }
        setSmashedIds((prev) => {
          const copy = { ...prev };
          delete copy[arrow.id];
          return copy;
        });
      }, 200);
      return;
    }

    // Normal arrow tap
    sound.playTap();
    const check = canArrowExit(board, arrow.id);

    if (!check.canExit) {
      sound.playBlocked();
      setBlockedArrowId(arrow.id);
      setActiveBlockerId(check.blocker?.id || null);
      if (onArrowBlocked) {
        onArrowBlocked(arrow.id, check.blocker?.id);
      }
      return;
    }

    // Arrow can exit!
    sound.playWoosh();
    setAnimatingOutIds((prev) => ({ ...prev, [arrow.id]: arrow.dir }));

    if (onBurstParticles) {
      onBurstParticles(centerX, centerY, '#4f67f7');
    }

    // Trigger state change after flight animation
    setTimeout(() => {
      onArrowCleared(arrow.id);
      setAnimatingOutIds((prev) => {
        const copy = { ...prev };
        delete copy[arrow.id];
        return copy;
      });
    }, 240);
  };

  // Determine board theme styling - matches screenshots: clean white container
  const getThemeContainerClass = () => {
    switch (themeId) {
      case 'theme_ocean':
        return 'bg-gradient-to-b from-sky-900 to-slate-900 border-cyan-700/50 shadow-cyan-950/40 text-white';
      case 'theme_forest':
        return 'bg-gradient-to-b from-emerald-900 to-zinc-900 border-emerald-700/50 shadow-emerald-950/40 text-white';
      case 'theme_sunset':
        return 'bg-gradient-to-b from-purple-900 to-rose-900 border-pink-700/50 shadow-purple-950/40 text-white';
      case 'theme_matrix':
        return 'bg-zinc-950 border-emerald-500/60 shadow-emerald-950/40 text-emerald-400';
      default:
        // Pure White / Screenshot Match
        return 'bg-white border-2 border-slate-100 shadow-xl shadow-slate-200/50';
    }
  };

  const getCellBorderClass = () => {
    switch (themeId) {
      case 'theme_ocean':
        return 'border-cyan-800/20 bg-cyan-950/10';
      case 'theme_forest':
        return 'border-emerald-800/20 bg-emerald-950/10';
      case 'theme_sunset':
        return 'border-purple-800/20 bg-purple-950/10';
      case 'theme_matrix':
        return 'border-emerald-900/30 bg-emerald-950/20';
      default:
        return 'border-slate-100/80 bg-slate-50/40';
    }
  };

  // Direction rotation angle
  const getRotationDeg = (dir: Direction) => {
    switch (dir) {
      case 'up':
        return 0;
      case 'right':
        return 90;
      case 'down':
        return 180;
      case 'left':
        return 270;
    }
  };

  // Render SVG Arrow artwork based on equipped skin
  const renderArrowGraphic = (arrow: Arrow, isHighlighted: boolean, isBlocker: boolean) => {
    let mainColor = '#111827'; // Crisp solid black from screenshot
    let strokeColor = '#000000';
    let filter = 'none';

    if (skinId === 'skin_neon') {
      mainColor = '#06b6d4';
      strokeColor = '#0891b2';
      filter = 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.7))';
    } else if (skinId === 'skin_crystal') {
      mainColor = '#8b5cf6';
      strokeColor = '#7c3aed';
      filter = 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.6))';
    } else if (skinId === 'skin_golden') {
      mainColor = '#d97706';
      strokeColor = '#b45309';
      filter = 'drop-shadow(0 0 5px rgba(217, 119, 6, 0.7))';
    } else if (skinId === 'skin_fire') {
      mainColor = '#ea580c';
      strokeColor = '#c2410c';
      filter = 'drop-shadow(0 0 5px rgba(234, 88, 12, 0.7))';
    }

    if (isBlocker) {
      mainColor = '#ef4444';
      strokeColor = '#b91c1c';
      filter = 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.9))';
    } else if (isHighlighted) {
      mainColor = '#10b981';
      strokeColor = '#059669';
      filter = 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.9))';
    }

    // If arrow has multi-point path (maze arrow)
    if (arrow.points && arrow.points.length > 1) {
      // Points are in grid coordinates relative to bounding box or cell
      // For single cell display, render directed arrow with elbow
      return (
        <svg viewBox="0 0 64 64" className="w-full h-full p-1.5" style={{ filter }}>
          <circle cx="32" cy="52" r="5" fill={mainColor} />
          <path
            d="M32 50 L32 24 L20 24 L32 8 L44 24 L32 24"
            fill="none"
            stroke={mainColor}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon points="32,6 45,23 19,23" fill={mainColor} />
        </svg>
      );
    }

    // Standard arrow: bold black shaft with circular base and prominent arrowhead (matching screenshots)
    return (
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full p-2 transition-transform duration-200"
        style={{ filter }}
      >
        {/* Tail base circle */}
        <circle cx="32" cy="52" r="4.5" fill={mainColor} />

        {/* Arrow shaft */}
        <line
          x1="32"
          y1="50"
          x2="32"
          y2="18"
          stroke={mainColor}
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Arrowhead */}
        <path
          d="M32 8 L47 26 L17 26 Z"
          fill={mainColor}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const highlightedArrow = highlightArrowId ? board.arrows.find((a) => a.id === highlightArrowId) : null;

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto select-none">
      {/* Hammer Active Banner */}
      {isHammerActive && (
        <div className="mb-2 px-3 py-1 bg-red-500 text-white font-bold text-xs rounded-full shadow-md animate-pulse flex items-center gap-1.5">
          <span>🔨 Hammer Ready: Tap any arrow to smash!</span>
        </div>
      )}

      {/* Board Perimeter Frame */}
      <div
        className={`relative rounded-3xl p-3 overflow-hidden transition-all duration-300 ${getThemeContainerClass()}`}
        style={{
          width: 'min(92vw, 420px)',
          height: 'min(92vw, 420px)',
        }}
      >
        {/* Subtle grid dots */}
        <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Board Cells Grid */}
        <div
          className="relative w-full h-full grid gap-1.5"
          style={{
            gridTemplateRows: `repeat(${board.rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${board.cols}, minmax(0, 1fr))`,
          }}
        >
          {/* Background grid tiles */}
          {Array.from({ length: board.rows * board.cols }).map((_, idx) => {
            const r = Math.floor(idx / board.cols);
            const c = idx % board.cols;
            return (
              <div
                key={`cell_${r}_${c}`}
                className={`w-full h-full rounded-2xl border ${getCellBorderClass()} flex items-center justify-center transition-colors`}
              />
            );
          })}

          {/* Super Clue Laser Trajectory Beam */}
          {showLaserBeam && highlightedArrow && (
            <div
              className="absolute pointer-events-none z-20 flex items-center justify-center"
              style={{
                top: `${(highlightedArrow.r / board.rows) * 100}%`,
                left: `${(highlightedArrow.c / board.cols) * 100}%`,
                width: `${(1 / board.cols) * 100}%`,
                height: `${(1 / board.rows) * 100}%`,
              }}
            >
              <div
                className={`absolute bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-pulse rounded-full ${
                  highlightedArrow.dir === 'up'
                    ? 'w-1 bottom-1/2 -top-[400px]'
                    : highlightedArrow.dir === 'down'
                    ? 'w-1 top-1/2 -bottom-[400px]'
                    : highlightedArrow.dir === 'left'
                    ? 'h-1 right-1/2 -left-[400px]'
                    : 'h-1 left-1/2 -right-[400px]'
                }`}
              />
            </div>
          )}

          {/* Active Arrow Tokens */}
          {board.arrows.map((arrow) => {
            const isBlocked = blockedArrowId === arrow.id;
            const isBlocker = activeBlockerId === arrow.id;
            const isHighlighted = highlightArrowId === arrow.id;
            const isScanned = scannedArrowIds.includes(arrow.id);
            const exitDir = animatingOutIds[arrow.id];
            const isSmashed = smashedIds[arrow.id];

            // Exit flight translation
            let flightTransform = '';
            if (exitDir === 'up') flightTransform = 'translate-y-[-240%] opacity-0 scale-90';
            else if (exitDir === 'down') flightTransform = 'translate-y-[240%] opacity-0 scale-90';
            else if (exitDir === 'left') flightTransform = 'translate-x-[-240%] opacity-0 scale-90';
            else if (exitDir === 'right') flightTransform = 'translate-x-[240%] opacity-0 scale-90';

            return (
              <button
                key={arrow.id}
                onClick={(e) => handleArrowClick(e, arrow)}
                disabled={disabled || !!exitDir || isSmashed}
                aria-label={`Arrow pointing ${arrow.dir} at row ${arrow.r + 1}, column ${arrow.c + 1}`}
                className={`absolute z-10 flex items-center justify-center rounded-2xl cursor-pointer transition-all ${
                  exitDir
                    ? `duration-240 ease-in ${flightTransform}`
                    : isSmashed
                    ? 'scale-125 opacity-0 duration-200 rotate-12'
                    : 'duration-150 ease-out active:scale-95 hover:scale-105'
                } ${isBlocked ? 'animate-shake ring-2 ring-red-500 bg-red-100/80 shadow-md shadow-red-200' : ''} ${
                  isBlocker ? 'animate-pulse ring-3 ring-red-400 bg-red-50 shadow-lg shadow-red-300' : ''
                } ${
                  isHighlighted
                    ? 'animate-bounce ring-3 ring-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-200'
                    : ''
                } ${
                  isScanned
                    ? 'ring-2 ring-emerald-400 bg-emerald-50/50 shadow-md'
                    : ''
                } ${
                  isHammerActive ? 'cursor-crosshair hover:ring-2 hover:ring-red-400' : ''
                }`}
                style={{
                  top: `${(arrow.r / board.rows) * 100}%`,
                  left: `${(arrow.c / board.cols) * 100}%`,
                  width: `${(1 / board.cols) * 100}%`,
                  height: `${(1 / board.rows) * 100}%`,
                  padding: '2px',
                }}
              >
                <div
                  className="w-full h-full flex items-center justify-center transition-transform duration-200"
                  style={{
                    transform: `rotate(${getRotationDeg(arrow.dir)}deg)`,
                  }}
                >
                  {renderArrowGraphic(arrow, isHighlighted, isBlocker)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Blocked message notification */}
      {blockedArrowId && (
        <div className="absolute -bottom-8 px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold tracking-wide shadow-md animate-fade-in flex items-center gap-1.5">
          <span>⚠️ Path blocked! -1 Heart lost</span>
        </div>
      )}
    </div>
  );
};
