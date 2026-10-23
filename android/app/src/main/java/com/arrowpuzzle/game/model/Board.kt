package com.arrowpuzzle.game.model

data class Board(
    val rows: Int = 3,
    val cols: Int = 3,
    val arrows: List<Arrow> = emptyList()
)

enum class GameMode {
    CLASSIC,
    DAILY,
    TIME,
    LIMITED,
    ENDLESS,
    RELAX
}
