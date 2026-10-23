/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Arrow, Board, Direction } from './types';

/**
 * Checks if a specific arrow can leave the board along its pointing direction
 * without colliding with any other arrow.
 */
export function canArrowExit(board: Board, arrowId: string): { canExit: boolean; blocker?: Arrow } {
  const arrow = board.arrows.find((a) => a.id === arrowId);
  if (!arrow) {
    return { canExit: false };
  }

  const { r, c, dir } = arrow;

  // Build a lookup map of cell (r, c) -> Arrow for all other arrows on board
  const occupiedMap = new Map<string, Arrow>();
  for (const other of board.arrows) {
    if (other.id === arrowId) continue;
    if (other.points && other.points.length > 0) {
      for (const pt of other.points) {
        occupiedMap.set(`${pt.r},${pt.c}`, other);
      }
    } else {
      occupiedMap.set(`${other.r},${other.c}`, other);
    }
  }

  // Check all cells between the arrow head and the edge in direction dir
  let stepR = 0;
  let stepC = 0;
  if (dir === 'up') stepR = -1;
  else if (dir === 'down') stepR = 1;
  else if (dir === 'left') stepC = -1;
  else if (dir === 'right') stepC = 1;

  let currR = r + stepR;
  let currC = c + stepC;

  while (currR >= 0 && currR < board.rows && currC >= 0 && currC < board.cols) {
    const blockingArrow = occupiedMap.get(`${currR},${currC}`);
    if (blockingArrow) {
      return { canExit: false, blocker: blockingArrow };
    }
    currR += stepR;
    currC += stepC;
  }

  return { canExit: true };
}

/**
 * Returns all arrows on the board that currently have a clear path to exit.
 */
export function getRemovableArrows(board: Board): Arrow[] {
  return board.arrows.filter((a) => canArrowExit(board, a.id).canExit);
}

/**
 * Returns true if no arrows remain on the board.
 */
export function isBoardCleared(board: Board): boolean {
  return board.arrows.length === 0;
}

/**
 * Removes an arrow from the board and returns the new board state.
 */
export function removeArrow(board: Board, arrowId: string): Board {
  return {
    ...board,
    arrows: board.arrows.filter((a) => a.id !== arrowId),
  };
}

/**
 * Calculates 1, 2, or 3 stars based on moves made vs optimal moves.
 * 3 stars: moves <= optimalMoves
 * 2 stars: moves <= optimalMoves + 2
 * 1 star: cleared level with more moves
 */
export function calculateStars(moves: number, optimalMoves: number): number {
  if (moves <= optimalMoves) return 3;
  if (moves <= optimalMoves + 2) return 2;
  return 1;
}

/**
 * Calculate base coin reward based on level stars and category.
 */
export function calculateCoinsReward(stars: number, category: string, isDaily = false): number {
  let base = 25;
  if (category === 'Apprentice') base = 35;
  else if (category === 'Adept') base = 50;
  else if (category === 'Expert') base = 75;
  else if (category === 'Master') base = 100;

  if (isDaily) {
    base = 150;
  }

  // Star bonus
  const starMultiplier = stars === 3 ? 1.5 : stars === 2 ? 1.2 : 1.0;
  return Math.round(base * starMultiplier);
}

/**
 * Get visual trajectory coordinates for arrow animation exiting the board.
 */
export function getExitTarget(
  r: number,
  c: number,
  dir: Direction,
  rows: number,
  cols: number,
  cellSize: number
): { targetX: number; targetY: number } {
  const currentX = c * cellSize + cellSize / 2;
  const currentY = r * cellSize + cellSize / 2;

  const extraDistance = cellSize * 2;

  switch (dir) {
    case 'up':
      return { targetX: currentX, targetY: -extraDistance };
    case 'down':
      return { targetX: currentX, targetY: rows * cellSize + extraDistance };
    case 'left':
      return { targetX: -extraDistance, targetY: currentY };
    case 'right':
      return { targetX: cols * cellSize + extraDistance, targetY: currentY };
  }
}
