/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { canArrowExit, isBoardCleared, removeArrow, calculateStars, calculateCoinsReward } from './rules';
import { solveBoard, generateBoardReversePlayout } from './solver';
import { getAllLevels, getDailyLevel } from './levels';
import { Board } from './types';

test('canArrowExit correctly identifies clear vs blocked arrows', () => {
  // 3x3 board:
  // Arrow 1 at (0, 1) pointing 'up' -> clear (row 0 pointing up is already at edge)
  // Arrow 2 at (1, 1) pointing 'up' -> blocked by Arrow 1 at (0, 1)
  // Arrow 3 at (1, 0) pointing 'right' -> blocked by Arrow 2 at (1, 1)
  const board: Board = {
    rows: 3,
    cols: 3,
    arrows: [
      { id: 'a1', r: 0, c: 1, dir: 'up' },
      { id: 'a2', r: 1, c: 1, dir: 'up' },
      { id: 'a3', r: 1, c: 0, dir: 'right' },
    ],
  };

  const check1 = canArrowExit(board, 'a1');
  assert.equal(check1.canExit, true);
  assert.equal(check1.blocker, undefined);

  const check2 = canArrowExit(board, 'a2');
  assert.equal(check2.canExit, false);
  assert.equal(check2.blocker?.id, 'a1');

  const check3 = canArrowExit(board, 'a3');
  assert.equal(check3.canExit, false);
  assert.equal(check3.blocker?.id, 'a2');
});

test('canArrowExit detects collisions with winding multi-point arrow bodies', () => {
  // Arrow 1 has an L-shaped body: tail at (0, 0), corner at (1, 0), head at (1, 1) pointing right
  // Arrow 2 is at (0, 2) pointing left towards col 0 -> path intersects Arrow 1's tail at (0, 0)
  const board: Board = {
    rows: 3,
    cols: 3,
    arrows: [
      {
        id: 'w1',
        r: 1,
        c: 1,
        dir: 'right',
        points: [
          { r: 0, c: 0 },
          { r: 1, c: 0 },
          { r: 1, c: 1 },
        ],
      },
      { id: 'w2', r: 0, c: 2, dir: 'left' },
      { id: 'w3', r: 2, c: 2, dir: 'down' },
    ],
  };

  // w1 points right from (1, 1). Ray goes to (1, 2). (1, 2) is clear! So w1 can exit.
  const checkW1 = canArrowExit(board, 'w1');
  assert.equal(checkW1.canExit, true);

  // w2 points left from (0, 2). Ray visits (0, 1) and (0, 0). (0, 0) is part of w1's body! So w2 is blocked.
  const checkW2 = canArrowExit(board, 'w2');
  assert.equal(checkW2.canExit, false);
  assert.equal(checkW2.blocker?.id, 'w1');

  // w3 is at (2, 2) pointing down -> edge is right below, path clear
  const checkW3 = canArrowExit(board, 'w3');
  assert.equal(checkW3.canExit, true);
});

test('removeArrow and isBoardCleared work accurately', () => {
  const initialBoard: Board = {
    rows: 2,
    cols: 2,
    arrows: [
      { id: '1', r: 0, c: 0, dir: 'left' },
      { id: '2', r: 1, c: 1, dir: 'right' },
    ],
  };

  assert.equal(isBoardCleared(initialBoard), false);

  const step1 = removeArrow(initialBoard, '1');
  assert.equal(step1.arrows.length, 1);
  assert.equal(isBoardCleared(step1), false);

  const step2 = removeArrow(step1, '2');
  assert.equal(step2.arrows.length, 0);
  assert.equal(isBoardCleared(step2), true);
});

test('solveBoard finds optimal sequential clearance', () => {
  const board: Board = {
    rows: 3,
    cols: 3,
    arrows: [
      { id: 'top', r: 0, c: 1, dir: 'up' },
      { id: 'mid', r: 1, c: 1, dir: 'up' },
      { id: 'left', r: 1, c: 0, dir: 'right' },
    ],
  };

  const solution = solveBoard(board);
  assert.ok(solution !== null);
  // 'top' must be removed before 'mid', and 'mid' must be removed before 'left'
  assert.deepEqual(solution, ['top', 'mid', 'left']);
});

test('generateBoardReversePlayout creates 100% solvable boards', () => {
  const board = generateBoardReversePlayout(4, 4, 6, 12345);
  assert.ok(board.arrows.length > 0);

  const solution = solveBoard(board);
  assert.ok(solution !== null, 'Generated board must be solvable');
  assert.equal(solution.length, board.arrows.length);
});

test('calculateStars and rewards work predictably', () => {
  assert.equal(calculateStars(5, 5), 3);
  assert.equal(calculateStars(6, 5), 2);
  assert.equal(calculateStars(7, 5), 2);
  assert.equal(calculateStars(9, 5), 1);

  assert.ok(calculateCoinsReward(3, 'Master') > calculateCoinsReward(1, 'Novice'));
  assert.ok(calculateCoinsReward(3, 'Novice', true) > calculateCoinsReward(3, 'Novice', false));
});

test('getAllLevels generates at least 100 valid levels and daily level works', () => {
  const levels = getAllLevels(105);
  assert.equal(levels.length, 105);
  assert.ok(levels[0].arrows.length >= 2);
  assert.ok(levels[104].arrows.length > 20);

  const daily = getDailyLevel('2026-10-23');
  assert.ok(daily.arrows.length > 0);
  assert.equal(daily.rows, 6);
});
