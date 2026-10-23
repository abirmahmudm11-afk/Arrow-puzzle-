package com.arrowpuzzle.game.engine

import com.arrowpuzzle.game.model.Arrow
import com.arrowpuzzle.game.model.Board
import com.arrowpuzzle.game.model.Direction

object ArrowRules {

    /**
     * Checks whether an arrow can exit in its pointing direction without colliding.
     * Returns Pair(canExit, blockerArrow)
     */
    fun canArrowExit(board: Board, arrowId: String): Pair<Boolean, Arrow?> {
        val arrow = board.arrows.find { it.id == arrowId } ?: return Pair(false, null)

        var stepR = 0
        var stepC = 0
        when (arrow.dir) {
            Direction.UP -> stepR = -1
            Direction.DOWN -> stepR = 1
            Direction.LEFT -> stepC = -1
            Direction.RIGHT -> stepC = 1
        }

        var currR = arrow.r + stepR
        var currC = arrow.c + stepC

        while (currR in 0 until board.rows && currC in 0 until board.cols) {
            val blocker = board.arrows.find { it.r == currR && it.c == currC }
            if (blocker != null) {
                return Pair(false, blocker)
            }
            currR += stepR
            currC += stepC
        }

        return Pair(true, null)
    }

    fun getRemovableArrows(board: Board): List<Arrow> {
        return board.arrows.filter { canArrowExit(board, it.id).first }
    }

    fun isBoardCleared(board: Board): Boolean {
        return board.arrows.isEmpty()
    }

    fun removeArrow(board: Board, arrowId: String): Board {
        return board.copy(arrows = board.arrows.filter { it.id != arrowId })
    }

    fun calculateStars(moves: Int, optimalMoves: Int): Int {
        return when {
            moves <= optimalMoves -> 3
            moves <= optimalMoves + 2 -> 2
            else -> 1
        }
    }

    fun calculateCoinsReward(stars: Int, category: String, isDaily: Boolean = false): Int {
        var base = when (category) {
            "Apprentice" -> 35
            "Adept" -> 50
            "Expert" -> 75
            "Master" -> 100
            else -> 25
        }
        if (isDaily) base = 150

        val multiplier = when (stars) {
            3 -> 1.5f
            2 -> 1.2f
            else -> 1.0f
        }
        return (base * multiplier).toInt()
    }
}
