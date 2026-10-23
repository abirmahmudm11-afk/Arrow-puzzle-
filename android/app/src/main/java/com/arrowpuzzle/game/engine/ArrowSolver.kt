package com.arrowpuzzle.game.engine

import com.arrowpuzzle.game.model.Arrow
import com.arrowpuzzle.game.model.Board
import com.arrowpuzzle.game.model.Direction
import java.util.Random

object ArrowSolver {

    /**
     * Solves a board by iteratively picking unblocked arrows.
     * Returns ordered list of arrow IDs to remove, or null if deadlocked.
     */
    fun solveBoard(initialBoard: Board): List<String>? {
        if (ArrowRules.isBoardCleared(initialBoard)) return emptyList()

        var currentBoard = initialBoard.copy(arrows = initialBoard.arrows.toList())
        val solution = mutableListOf<String>()

        while (!ArrowRules.isBoardCleared(currentBoard)) {
            val removable = currentBoard.arrows.filter { ArrowRules.canArrowExit(currentBoard, it.id).first }
            if (removable.isEmpty()) {
                return null // Deadlock
            }
            val next = removable.first()
            currentBoard = ArrowRules.removeArrow(currentBoard, next.id)
            solution.add(next.id)
        }

        return solution
    }

    /**
     * Mathematically guarantees 100% solvable board by reverse-playout.
     */
    fun generateBoardReversePlayout(rows: Int, cols: Int, targetArrows: Int, seed: Long = 42L): Board {
        val rand = Random(seed)
        val directions = Direction.values()

        val arrows = mutableListOf<Arrow>()
        val occupied = mutableSetOf<String>()
        var counter = 1
        var attempts = 0

        while (arrows.size < targetArrows && attempts < 250) {
            attempts++
            val r = rand.nextInt(rows)
            val c = rand.nextInt(cols)
            val key = "$r,$c"
            if (occupied.contains(key)) continue

            val shuffledDirs = directions.toMutableList().apply { shuffle(rand) }
            var chosenDir: Direction? = null

            for (dir in shuffledDirs) {
                var stepR = 0
                var stepC = 0
                when (dir) {
                    Direction.UP -> stepR = -1
                    Direction.DOWN -> stepR = 1
                    Direction.LEFT -> stepC = -1
                    Direction.RIGHT -> stepC = 1
                }

                var currR = r + stepR
                var currC = c + stepC
                var clear = true

                while (currR in 0 until rows && currC in 0 until cols) {
                    if (occupied.contains("$currR,$currC")) {
                        clear = false
                        break
                    }
                    currR += stepR
                    currC += stepC
                }

                if (clear) {
                    chosenDir = dir
                    break
                }
            }

            if (chosenDir != null) {
                arrows.add(Arrow(id = "arr_${counter++}", r = r, c = c, dir = chosenDir))
                occupied.add(key)
            }
        }

        val board = Board(rows = rows, cols = cols, arrows = arrows)
        val sol = solveBoard(board)
        if (sol == null || sol.size != arrows.size) {
            // Safety: ensure at least one arrow points out directly
            if (arrows.isNotEmpty()) {
                val first = arrows[0]
                arrows[0] = first.copy(
                    dir = if (first.r == 0) Direction.UP
                    else if (first.r == rows - 1) Direction.DOWN
                    else if (first.c == 0) Direction.LEFT
                    else Direction.RIGHT
                )
            }
        }

        return Board(rows = rows, cols = cols, arrows = arrows)
    }
}
