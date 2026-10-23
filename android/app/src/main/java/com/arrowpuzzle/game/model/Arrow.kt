package com.arrowpuzzle.game.model

data class Arrow(
    val id: String = "",
    val r: Int = 0,
    val c: Int = 0,
    val dir: Direction = Direction.UP
)
