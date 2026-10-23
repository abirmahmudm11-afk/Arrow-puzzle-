package com.arrowpuzzle.game.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.arrowpuzzle.game.model.Arrow
import com.arrowpuzzle.game.model.Board
import com.arrowpuzzle.game.model.Direction

@Composable
fun PuzzleBoardView(
    board: Board,
    skinColorHex: Long = 0xFF111827,
    highlightArrowId: String? = null,
    showLaserBeam: Boolean = false,
    onArrowTapped: (Arrow) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .padding(16.dp)
            .clip(RoundedCornerShape(24.dp))
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(board) {
                    detectTapGestures { offset ->
                        val cellW = size.width / board.cols
                        val cellH = size.height / board.rows
                        val c = (offset.x / cellW).toInt().coerceIn(0, board.cols - 1)
                        val r = (offset.y / cellH).toInt().coerceIn(0, board.rows - 1)

                        val tapped = board.arrows.find { it.r == r && it.c == c }
                        if (tapped != null) {
                            onArrowTapped(tapped)
                        }
                    }
                }
        ) {
            val cellW = size.width / board.cols
            val cellH = size.height / board.rows

            // Draw board background - pure crisp white matching screenshot
            drawRoundRect(
                color = Color(0xFFFFFFFF),
                cornerRadius = CornerRadius(24.dp.toPx())
            )

            // Draw grid cells with subtle border
            for (r in 0 until board.rows) {
                for (c in 0 until board.cols) {
                    val x = c * cellW
                    val y = r * cellH
                    drawRoundRect(
                        color = Color(0xFFF8FAFC),
                        topLeft = Offset(x + 3.dp.toPx(), y + 3.dp.toPx()),
                        size = Size(cellW - 6.dp.toPx(), cellH - 6.dp.toPx()),
                        cornerRadius = CornerRadius(12.dp.toPx())
                    )
                }
            }

            // Draw laser guide beam if active
            if (showLaserBeam && highlightArrowId != null) {
                val hl = board.arrows.find { it.id == highlightArrowId }
                if (hl != null) {
                    val cx = hl.c * cellW + cellW / 2
                    val cy = hl.r * cellH + cellH / 2
                    val endOffset = when (hl.dir) {
                        Direction.UP -> Offset(cx, 0f)
                        Direction.DOWN -> Offset(cx, size.height)
                        Direction.LEFT -> Offset(0f, cy)
                        Direction.RIGHT -> Offset(size.width, cy)
                    }
                    drawLine(
                        color = Color(0xFF10B981),
                        start = Offset(cx, cy),
                        end = endOffset,
                        strokeWidth = 6.dp.toPx(),
                        cap = StrokeCap.Round
                    )
                }
            }

            // Draw active arrows - solid black arrow with tail dot and arrowhead
            for (arrow in board.arrows) {
                val cx = arrow.c * cellW + cellW / 2
                val cy = arrow.r * cellH + cellH / 2
                val isHighlighted = arrow.id == highlightArrowId

                drawArrowShape(
                    cx = cx,
                    cy = cy,
                    size = minOf(cellW, cellH) * 0.72f,
                    dir = arrow.dir,
                    color = if (isHighlighted) Color(0xFF10B981) else Color(skinColorHex)
                )
            }
        }
    }
}

private fun DrawScope.drawArrowShape(
    cx: Float,
    cy: Float,
    size: Float,
    dir: Direction,
    color: Color
) {
    val degrees = when (dir) {
        Direction.UP -> 0f
        Direction.RIGHT -> 90f
        Direction.DOWN -> 180f
        Direction.LEFT -> 270f
    }

    rotate(degrees, pivot = Offset(cx, cy)) {
        val halfW = size / 2
        val halfH = size / 2

        // Tail circle base
        drawCircle(
            color = color,
            radius = 4.dp.toPx(),
            center = Offset(cx, cy + halfH * 0.75f)
        )

        // Arrow shaft line
        drawLine(
            color = color,
            start = Offset(cx, cy + halfH * 0.75f),
            end = Offset(cx, cy - halfH * 0.2f),
            strokeWidth = 4.dp.toPx(),
            cap = StrokeCap.Round
        )

        // Arrowhead tip
        val headPath = Path().apply {
            moveTo(cx, cy - halfH) // Tip
            lineTo(cx + halfW * 0.75f, cy - halfH * 0.15f) // Right barb
            lineTo(cx - halfW * 0.75f, cy - halfH * 0.15f) // Left barb
            close()
        }
        drawPath(headPath, color = color)
    }
}
