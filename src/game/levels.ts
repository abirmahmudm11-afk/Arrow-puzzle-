/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Level, Arrow } from './types';
import { generateBoardReversePlayout, solveBoard } from './solver';

// Handcrafted introductory tutorial levels
const HANDCRAFTED_LEVELS: Level[] = [
  {
    id: 1,
    name: 'First Step',
    category: 'Novice',
    rows: 3,
    cols: 3,
    arrows: [
      { id: 'l1_1', r: 0, c: 1, dir: 'up' },
      { id: 'l1_2', r: 1, c: 1, dir: 'up' },
    ],
    optimalMoves: 2,
    moveLimit: 4,
    timeLimit: 45,
  },
  {
    id: 2,
    name: 'Perpendicular Paths',
    category: 'Novice',
    rows: 3,
    cols: 3,
    arrows: [
      { id: 'l2_1', r: 1, c: 2, dir: 'right' },
      { id: 'l2_2', r: 0, c: 1, dir: 'down' },
      { id: 'l2_3', r: 2, c: 1, dir: 'up' },
    ],
    optimalMoves: 3,
    moveLimit: 5,
    timeLimit: 45,
  },
  {
    id: 3,
    name: 'Corner Unwind',
    category: 'Novice',
    rows: 3,
    cols: 3,
    arrows: [
      { id: 'l3_1', r: 0, c: 0, dir: 'left' },
      { id: 'l3_2', r: 0, c: 2, dir: 'left' },
      { id: 'l3_3', r: 2, c: 0, dir: 'up' },
      { id: 'l3_4', r: 2, c: 2, dir: 'right' },
    ],
    optimalMoves: 4,
    moveLimit: 6,
    timeLimit: 45,
  },
  {
    id: 4,
    name: 'Crossroads',
    category: 'Novice',
    rows: 4,
    cols: 4,
    arrows: [
      { id: 'l4_1', r: 0, c: 1, dir: 'up' },
      { id: 'l4_2', r: 1, c: 1, dir: 'up' },
      { id: 'l4_3', r: 1, c: 2, dir: 'left' },
      { id: 'l4_4', r: 2, c: 2, dir: 'down' },
      { id: 'l4_5', r: 3, c: 1, dir: 'down' },
    ],
    optimalMoves: 5,
    moveLimit: 8,
    timeLimit: 50,
  },
  {
    id: 5,
    name: 'Pinwheel',
    category: 'Novice',
    rows: 4,
    cols: 4,
    arrows: [
      { id: 'l5_1', r: 0, c: 2, dir: 'up' },
      { id: 'l5_2', r: 1, c: 0, dir: 'left' },
      { id: 'l5_3', r: 2, c: 3, dir: 'right' },
      { id: 'l5_4', r: 3, c: 1, dir: 'down' },
      { id: 'l5_5', r: 1, c: 2, dir: 'left' },
      { id: 'l5_6', r: 2, c: 1, dir: 'right' },
    ],
    optimalMoves: 6,
    moveLimit: 9,
    timeLimit: 50,
  },
];

// Cache generated levels so we compute them deterministically once
const LEVEL_CACHE: Level[] = [...HANDCRAFTED_LEVELS];

/**
 * Deterministically generates levels 6 through 120 based on level index.
 */
function generateDeterministicLevel(levelId: number): Level {
  let rows = 4;
  let cols = 4;
  let arrowCount = 6;
  let category: Level['category'] = 'Novice';

  if (levelId <= 20) {
    category = 'Novice';
    rows = 4;
    cols = 4;
    arrowCount = Math.min(8, 5 + Math.floor((levelId - 5) / 3));
  } else if (levelId <= 40) {
    category = 'Apprentice';
    rows = 5;
    cols = 5;
    arrowCount = Math.min(13, 9 + Math.floor((levelId - 20) / 3));
  } else if (levelId <= 60) {
    category = 'Adept';
    rows = 6;
    cols = 6;
    arrowCount = Math.min(19, 14 + Math.floor((levelId - 40) / 3));
  } else if (levelId <= 80) {
    category = 'Expert';
    rows = 7;
    cols = 7;
    arrowCount = Math.min(26, 20 + Math.floor((levelId - 60) / 3));
  } else {
    category = 'Master';
    rows = 8;
    cols = 8;
    arrowCount = Math.min(34, 27 + Math.floor((levelId - 80) / 3));
  }

  // Consistent unique seed per level
  const seed = 918273 + levelId * 1337;
  const board = generateBoardReversePlayout(rows, cols, arrowCount, seed);

  // Compute solution to get exact optimal moves
  const solution = solveBoard(board);
  const optimalMoves = solution ? solution.length : board.arrows.length;

  const names = [
    'Whispering Grid', 'Prism Path', 'Tangled Vectors', 'Clear Horizon',
    'Vortex Exit', 'Echo Cascade', 'Spiral Way', 'Twin Junction',
    'Zenith Gate', 'Flow State', 'Obsidian Needle', 'Emerald Labyrinth',
    'Quantum Thread', 'Sovereign Path', 'Celestial Lock', 'Apex Divergence',
  ];
  const name = `${names[(levelId * 7) % names.length]} ${levelId}`;

  return {
    id: levelId,
    name,
    category,
    rows: board.rows,
    cols: board.cols,
    arrows: board.arrows,
    optimalMoves,
    moveLimit: optimalMoves + Math.max(3, Math.floor(optimalMoves * 0.4)),
    timeLimit: Math.max(30, 20 + optimalMoves * 5),
  };
}

/**
 * Returns all levels from 1 to 105.
 */
export function getAllLevels(totalCount = 105): Level[] {
  if (LEVEL_CACHE.length < totalCount) {
    for (let id = LEVEL_CACHE.length + 1; id <= totalCount; id++) {
      LEVEL_CACHE.push(generateDeterministicLevel(id));
    }
  }
  return LEVEL_CACHE.slice(0, totalCount);
}

/**
 * Gets a single level by ID (1-indexed).
 */
export function getLevelById(levelId: number): Level {
  const all = getAllLevels(Math.max(105, levelId));
  const found = all.find((l) => l.id === levelId);
  if (found) return found;
  return generateDeterministicLevel(levelId);
}

/**
 * Generates today's daily challenge puzzle based on the YYYY-MM-DD date string.
 */
export function getDailyLevel(dateStr: string): Level {
  // Hash the date string into a deterministic integer seed
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash) + 77777;

  // Daily puzzle is a balanced 6x6 with 16 arrows
  const board = generateBoardReversePlayout(6, 6, 16, seed);
  const solution = solveBoard(board);
  const optimalMoves = solution ? solution.length : board.arrows.length;

  return {
    id: 999999, // Special ID for daily
    name: `Daily Zen (${dateStr})`,
    category: 'Adept',
    rows: board.rows,
    cols: board.cols,
    arrows: board.arrows,
    optimalMoves,
    moveLimit: optimalMoves + 6,
    timeLimit: 90,
  };
}

/**
 * Generates an endless wave puzzle that scales in difficulty.
 */
export function getEndlessWave(waveNumber: number): Level {
  const rows = Math.min(8, 4 + Math.floor(waveNumber / 3));
  const cols = rows;
  const arrowCount = Math.min(rows * cols - 6, 5 + waveNumber * 2);
  const seed = 54321 + waveNumber * 98765;

  const board = generateBoardReversePlayout(rows, cols, arrowCount, seed);
  const solution = solveBoard(board);
  const optimalMoves = solution ? solution.length : board.arrows.length;

  return {
    id: 100000 + waveNumber,
    name: `Wave ${waveNumber}`,
    category: waveNumber <= 3 ? 'Novice' : waveNumber <= 7 ? 'Apprentice' : waveNumber <= 12 ? 'Adept' : 'Expert',
    rows,
    cols,
    arrows: board.arrows,
    optimalMoves,
    moveLimit: optimalMoves + 4,
    timeLimit: Math.max(25, 45 - waveNumber * 2),
  };
}
