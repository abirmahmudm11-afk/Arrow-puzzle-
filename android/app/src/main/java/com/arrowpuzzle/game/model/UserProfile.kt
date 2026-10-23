package com.arrowpuzzle.game.model

import com.google.firebase.database.IgnoreExtraProperties

@IgnoreExtraProperties
data class SoundSettings(
    val masterVolume: Float = 0.8f,
    val sfxVolume: Float = 0.8f,
    val musicVolume: Float = 0.4f,
    val isMuted: Boolean = false
)

@IgnoreExtraProperties
data class UserProfile(
    val id: String = "",
    val email: String? = null,
    val displayName: String = "Guest Pathfinder",
    val isGuest: Boolean = true,
    val coins: Int = 100,
    val completedLevels: Map<String, LevelResult> = emptyMap(),
    val skippedLevels: List<Int> = emptyList(),
    val equippedSkin: String = "skin_default",
    val equippedTheme: String = "theme_default",
    val equippedEffect: String = "effect_default",
    val equippedTitle: String = "Arrow Pathfinder",
    val equippedAvatar: String = "avatar_novice",
    val inventory: Map<String, Int> = mapOf(
        "skin_default" to 1,
        "theme_default" to 1,
        "effect_default" to 1,
        "powerup_hint" to 3,
        "powerup_undo" to 5
    ),
    val skipAdsProgress: Int = 0,
    val dailyStreak: Int = 1,
    val lastDailyDate: String? = null,
    val soundSettings: SoundSettings = SoundSettings()
)
