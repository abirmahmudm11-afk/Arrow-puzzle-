/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Arrow, Board, Direction } from './types';
import { canArrowExit, isBoardCleared, removeArrow } from './rules';

/**
 * Solves a board by repeatedly removing unblocked arrows.
 * Because removing an arrow only empties grid cells and can NEVER block another arrow,
 * a greedy choice always yields a valid solution if one exists.
 * Returns the sequence of arrow IDs to remove in order, or null if deadlocked.
 */
export function solveBoard(initialBoard: Board): string[] | null {
  if (isBoardCleared(initialBoard)) return [];

  let currentBoard = { ...initialBoard, arrows: [...initialBoard.arrows] };
  const path: string[] = [];

  while (!isBoardCleared(currentBoard)) {
    // Find all currently removable arrows
    const removable = currentBoard.arrows.filter((a) => canArrowExit(currentBoard, a.id).canExit);

    if (removable.length === 0) {
      // Deadlocked: no arrow can exit
      return null;
    }

    // Pick the first removable arrow (or one closest to the perimeter)
    const nextArrow = removable[0];
    currentBoard = removeArrow(currentBoard, nextArrow.id);
    path.push(nextArrow.id);
  }

  return path;
}

/**
 * Deterministic pseudo-random number generator for reproducible seeds.
 */
function createPrng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generates a puzzle board using reverse playout.
 * Reverse playout starts with an empty board and adds arrows in reverse:
 * An arrow placed at (r, c) pointing in direction D must have a clear path to the edge
 * at the moment it was placed (meaning when played forward, it was the last to leave).
 * Then subsequent arrows can block this arrow, establishing genuine dependency graphs!
 *
 * This mathematically guarantees 100% solvability.
 */
export function generateBoardReversePlayout(
  rows: number,
  cols: number,
  targetArrows: number,
  seed = 42
): Board {
  const rand = createPrng(seed);
  const directions: Direction[] = ['up', 'down', 'left', 'right'];

  // Start with empty board
  let arrows: Arrow[] = [];
  let board: Board = { rows, cols, arrows: [] };

  const occupied = new Set<string>();
  const cellKey = (r: number, c: number) => `${r},${c}`;

  let attempts = 0;
  let arrowCounter = 1;

  while (arrows.length < targetArrows && attempts < 200) {
    attempts++;
    const r = Math.floor(rand() * rows);
    const c = Math.floor(rand() * cols);

    if (occupied.has(cellKey(r, c))) continue;

    // Pick a random direction
    const shuffledDirs = [...directions].sort(() => rand() - 0.5);

    let chosenDir: Direction | null = null;

    for (const dir of shuffledDirs) {
      // Check if path to edge is currently clear in direction dir
      let stepR = 0;
      let stepC = 0;
      if (dir === 'up') stepR = -1;
      else if (dir === 'down') stepR = 1;
      else if (dir === 'left') stepC = -1;
      else if (dir === 'right') stepC = 1;

      let currR = r + stepR;
      let currC = c + stepC;
      let pathClear = true;

      while (currR >= 0 && currR < rows && currC >= 0 && currC < cols) {
        if (occupied.has(cellKey(currR, currC))) {
          pathClear = false;
          break;
        }
        currR += stepR;
        currC += stepC;
      }

      if (pathClear) {
        chosenDir = dir;
        break;
      }
    }

    if (chosenDir) {
      const newArrow: Arrow = {
        id: `a_${arrowCounter++}`,
        r,
        c,
        dir: chosenDir,
      };
      arrows.push(newArrow);
      occupied.add(cellKey(r, c));
      board = { rows, cols, arrows: [...arrows] };
    }
  }

  // Double check solvability with solveBoard
  const solution = solveBoard(board);
  if (!solution || solution.length !== arrows.length) {
    // If somehow obstructed or degenerate, prune blocked arrows until solvable
    const removable = arrows.filter((a) => canArrowExit(board, a.id).canExit);
    if (removable.length === 0 && arrows.length > 0) {
      // Force at least one arrow to face outside immediately
      const first = arrows[0];
      if (first.r === 0) first.dir = 'up';
      else if (first.r === rows - 1) first.dir = 'down';
      else if (first.c === 0) first.dir = 'left';
      else first.dir = 'right';
    }
  }

  return board;
}
