package com.arrowpuzzle.game.model

enum class ItemCategory {
    POWERUP,
    SKIN,
    THEME,
    EFFECT,
    AVATAR,
    TITLE,
    CHEST
}

enum class ItemRarity {
    COMMON,
    RARE,
    EPIC,
    LEGENDARY
}

data class ShopItem(
    val id: String,
    val name: String,
    val description: String,
    val category: ItemCategory,
    val rarity: ItemRarity,
    val price: Int,
    val colorHex: Long = 0xFF38BDF8,
    val consumable: Boolean = false,
    val consumableCount: Int = 1
)

object ShopCatalog {
    val items = listOf(
        // Power-ups
        ShopItem("powerup_hint", "Single Clue", "Highlights one valid arrow ready to exit.", ItemCategory.POWERUP, ItemRarity.COMMON, 30, consumable = true),
        ShopItem("powerup_super_hint", "Super Clue", "Highlights valid arrow + laser guide beam.", ItemCategory.POWERUP, ItemRarity.RARE, 55, consumable = true),
        ShopItem("powerup_scanner", "Arrow Scanner", "Pulses all currently clear arrows.", ItemCategory.POWERUP, ItemRarity.EPIC, 75, consumable = true),
        ShopItem("powerup_undo", "Time Undo", "Reverses your last arrow move.", ItemCategory.POWERUP, ItemRarity.COMMON, 20, consumable = true),
        ShopItem("powerup_extra_moves", "+5 Moves Pack", "Adds 5 moves in Limited Moves mode.", ItemCategory.POWERUP, ItemRarity.RARE, 45, consumable = true, consumableCount = 5),
        ShopItem("powerup_extra_time", "+20s Time Pack", "Adds 20 seconds in Time Trial mode.", ItemCategory.POWERUP, ItemRarity.RARE, 45, consumable = true, consumableCount = 20),

        // Arrow Skins
        ShopItem("skin_default", "Default Sleek", "Clean modern minimalist arrows.", ItemCategory.SKIN, ItemRarity.COMMON, 0, colorHex = 0xFF38BDF8),
        ShopItem("skin_neon", "Neon Cyberpunk", "Vibrant luminescent arrows with high-voltage glow.", ItemCategory.SKIN, ItemRarity.RARE, 250, colorHex = 0xFF06B6D4),
        ShopItem("skin_crystal", "Crystal Prism", "Faceted jewel arrows with gemstone shimmer.", ItemCategory.SKIN, ItemRarity.EPIC, 450, colorHex = 0xFFA855F7),
        ShopItem("skin_fire", "Blazing Embers", "Volcanic arrows radiating flame embers.", ItemCategory.SKIN, ItemRarity.RARE, 320, colorHex = 0xFFF97316),
        ShopItem("skin_ice", "Glacial Frost", "Chiseled arctic ice arrows with sub-zero edges.", ItemCategory.SKIN, ItemRarity.RARE, 320, colorHex = 0xFF67E8F9),
        ShopItem("skin_golden", "Royal Aurum", "Solid 24k polished gold arrows.", ItemCategory.SKIN, ItemRarity.LEGENDARY, 800, colorHex = 0xFFFBBF24),

        // Board Themes
        ShopItem("theme_default", "Midnight Slate", "Calm obsidian zinc board with gentle ambient glow.", ItemCategory.THEME, ItemRarity.COMMON, 0, colorHex = 0xFF0F172A),
        ShopItem("theme_ocean", "Sapphire Abyss", "Deep oceanic navy blues with aquatic glow.", ItemCategory.THEME, ItemRarity.RARE, 280, colorHex = 0xFF0369A1),
        ShopItem("theme_forest", "Emerald Sanctuary", "Peaceful moss and botanical green tones.", ItemCategory.THEME, ItemRarity.RARE, 280, colorHex = 0xFF047857),
        ShopItem("theme_sunset", "Dusk Horizon", "Twilight purple and warm peach dusk gradient.", ItemCategory.THEME, ItemRarity.EPIC, 420, colorHex = 0xFF7E22CE),
        ShopItem("theme_matrix", "Matrix Cyber Grid", "Futuristic terminal wireframe coordinates.", ItemCategory.THEME, ItemRarity.EPIC, 480, colorHex = 0xFF15803D),

        // Visual Effects
        ShopItem("effect_default", "Clean Pulse", "Clean soft dissipation puff.", ItemCategory.EFFECT, ItemRarity.COMMON, 0),
        ShopItem("effect_sparks", "Golden Stardust", "Glistening particle sparks on exit.", ItemCategory.EFFECT, ItemRarity.RARE, 220, colorHex = 0xFFFACC15),
        ShopItem("effect_confetti", "Celebration Confetti", "Festive rainbow confetti burst.", ItemCategory.EFFECT, ItemRarity.RARE, 250, colorHex = 0xFFEC4899),
        ShopItem("effect_sonic", "Sonic Shockwave", "Expanding circular supersonic shockwaves.", ItemCategory.EFFECT, ItemRarity.EPIC, 380, colorHex = 0xFF38BDF8)
    )
}
