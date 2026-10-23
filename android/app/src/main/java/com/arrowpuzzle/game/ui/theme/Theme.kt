package com.arrowpuzzle.game.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Slate950 = Color(0xFF020617)
val Zinc900 = Color(0xFF18181B)
val Zinc800 = Color(0xFF27272A)
val Sky400 = Color(0xFF38BDF8)
val Sky500 = Color(0xFF0EA5E9)
val Amber400 = Color(0xFFFBBF24)
val Emerald400 = Color(0xFF34D399)
val Red500 = Color(0xFFEF4444)

private val DarkColorScheme = darkColorScheme(
    primary = Sky400,
    secondary = Amber400,
    background = Slate950,
    surface = Zinc900,
    onPrimary = Color.Black,
    onSecondary = Color.Black,
    onBackground = Color.White,
    onSurface = Color.White
)

@Composable
fun ArrowPuzzleTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
