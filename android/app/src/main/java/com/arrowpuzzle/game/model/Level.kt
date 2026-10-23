package com.arrowpuzzle.game.model

data class Level(
    val id: Int = 1,
    val name: String = "Level 1",
    val category: String = "Novice",
    val rows: Int = 3,
    val cols: Int = 3,
    val arrows: List<Arrow> = emptyList(),
    val optimalMoves: Int = 2,
    val moveLimit: Int? = null,
    val timeLimit: Int? = null
)

data class LevelResult(
    val levelId: Int = 0,
    val stars: Int = 0,
    val moves: Int = 0,
    val timeTaken: Int = 0,
    val completedAt: Long = System.currentTimeMillis()
)
