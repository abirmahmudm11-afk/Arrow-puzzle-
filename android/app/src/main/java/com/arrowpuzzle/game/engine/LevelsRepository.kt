package com.arrowpuzzle.game.engine

import com.arrowpuzzle.game.model.Arrow
import com.arrowpuzzle.game.model.Direction
import com.arrowpuzzle.game.model.Level

object LevelsRepository {

    private val handcrafted = listOf(
        Level(
            id = 1,
            name = "First Step",
            category = "Novice",
            rows = 3,
            cols = 3,
            arrows = listOf(
                Arrow("l1_1", 0, 1, Direction.UP),
                Arrow("l1_2", 1, 1, Direction.UP)
            ),
            optimalMoves = 2,
            moveLimit = 4,
            timeLimit = 45
        ),
        Level(
            id = 2,
            name = "Perpendicular Paths",
            category = "Novice",
            rows = 3,
            cols = 3,
            arrows = listOf(
                Arrow("l2_1", 1, 2, Direction.RIGHT),
                Arrow("l2_2", 0, 1, Direction.DOWN),
                Arrow("l2_3", 2, 1, Direction.UP)
            ),
            optimalMoves = 3,
            moveLimit = 5,
            timeLimit = 45
        ),
        Level(
            id = 3,
            name = "Corner Unwind",
            category = "Novice",
            rows = 3,
            cols = 3,
            arrows = listOf(
                Arrow("l3_1", 0, 0, Direction.LEFT),
                Arrow("l3_2", 0, 2, Direction.LEFT),
                Arrow("l3_3", 2, 0, Direction.UP),
                Arrow("l3_4", 2, 2, Direction.RIGHT)
            ),
            optimalMoves = 4,
            moveLimit = 6,
            timeLimit = 45
        ),
        Level(
            id = 4,
            name = "Crossroads",
            category = "Novice",
            rows = 4,
            cols = 4,
            arrows = listOf(
                Arrow("l4_1", 0, 1, Direction.UP),
                Arrow("l4_2", 1, 1, Direction.UP),
                Arrow("l4_3", 1, 2, Direction.LEFT),
                Arrow("l4_4", 2, 2, Direction.DOWN),
                Arrow("l4_5", 3, 1, Direction.DOWN)
            ),
            optimalMoves = 5,
            moveLimit = 8,
            timeLimit = 50
        ),
        Level(
            id = 5,
            name = "Pinwheel",
            category = "Novice",
            rows = 4,
            cols = 4,
            arrows = listOf(
                Arrow("l5_1", 0, 2, Direction.UP),
                Arrow("l5_2", 1, 0, Direction.LEFT),
                Arrow("l5_3", 2, 3, Direction.RIGHT),
                Arrow("l5_4", 3, 1, Direction.DOWN),
                Arrow("l5_5", 1, 2, Direction.LEFT),
                Arrow("l5_6", 2, 1, Direction.RIGHT)
            ),
            optimalMoves = 6,
            moveLimit = 9,
            timeLimit = 50
        )
    )

    private val levelCache = mutableListOf<Level>().apply { addAll(handcrafted) }

    fun getLevel(id: Int): Level {
        if (id in 1..levelCache.size) {
            return levelCache[id - 1]
        }
        for (i in (levelCache.size + 1)..id) {
            levelCache.add(generateDeterministicLevel(i))
        }
        return levelCache[id - 1]
    }

    fun getAllLevels(count: Int = 105): List<Level> {
        if (levelCache.size < count) {
            for (i in (levelCache.size + 1)..count) {
                levelCache.add(generateDeterministicLevel(i))
            }
        }
        return levelCache.take(count)
    }

    private fun generateDeterministicLevel(id: Int): Level {
        val (rows, cols, arrowCount, category) = when {
            id <= 20 -> listOf(4, 4, minOf(8, 5 + (id - 5) / 3), "Novice")
            id <= 40 -> listOf(5, 5, minOf(13, 9 + (id - 20) / 3), "Apprentice")
            id <= 60 -> listOf(6, 6, minOf(19, 14 + (id - 40) / 3), "Adept")
            id <= 80 -> listOf(7, 7, minOf(26, 20 + (id - 60) / 3), "Expert")
            else -> listOf(8, 8, minOf(34, 27 + (id - 80) / 3), "Master")
        }

        val seed = 918273L + id * 1337L
        val board = ArrowSolver.generateBoardReversePlayout(rows as Int, cols as Int, arrowCount as Int, seed)
        val optimal = ArrowSolver.solveBoard(board)?.size ?: board.arrows.size

        return Level(
            id = id,
            name = "Puzzle $id",
            category = category as String,
            rows = board.rows,
            cols = board.cols,
            arrows = board.arrows,
            optimalMoves = optimal,
            moveLimit = optimal + maxOf(3, (optimal * 0.4f).toInt()),
            timeLimit = maxOf(30, 20 + optimal * 5)
        )
    }

    fun getDailyLevel(dateStr: String): Level {
        var hash = 0
        for (c in dateStr) {
            hash = (hash shl 5) - hash + c.code
        }
        val seed = kotlin.math.abs(hash).toLong() + 77777L
        val board = ArrowSolver.generateBoardReversePlayout(6, 6, 16, seed)
        val optimal = ArrowSolver.solveBoard(board)?.size ?: board.arrows.size

        return Level(
            id = 999999,
            name = "Daily Zen ($dateStr)",
            category = "Adept",
            rows = board.rows,
            cols = board.cols,
            arrows = board.arrows,
            optimalMoves = optimal,
            moveLimit = optimal + 6,
            timeLimit = 90
        )
    }

    fun getEndlessWave(wave: Int): Level {
        val rows = minOf(8, 4 + wave / 3)
        val arrowCount = minOf(rows * rows - 6, 5 + wave * 2)
        val seed = 54321L + wave * 98765L
        val board = ArrowSolver.generateBoardReversePlayout(rows, rows, arrowCount, seed)
        val optimal = ArrowSolver.solveBoard(board)?.size ?: board.arrows.size

        return Level(
            id = 100000 + wave,
            name = "Wave $wave",
            category = if (wave <= 3) "Novice" else if (wave <= 7) "Apprentice" else "Adept",
            rows = rows,
            cols = rows,
            arrows = board.arrows,
            optimalMoves = optimal,
            moveLimit = optimal + 4,
            timeLimit = maxOf(25, 45 - wave * 2)
        )
    }
}
