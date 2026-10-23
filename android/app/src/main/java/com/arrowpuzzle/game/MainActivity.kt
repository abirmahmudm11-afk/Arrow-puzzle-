package com.arrowpuzzle.game

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arrowpuzzle.game.ads.AdMobManager
import com.arrowpuzzle.game.audio.NativeSoundManager
import com.arrowpuzzle.game.engine.ArrowRules
import com.arrowpuzzle.game.engine.LevelsRepository
import com.arrowpuzzle.game.firebase.FirebaseRepository
import com.arrowpuzzle.game.model.*
import com.arrowpuzzle.game.ui.components.PuzzleBoardView
import com.arrowpuzzle.game.ui.theme.ArrowPuzzleTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var soundManager: NativeSoundManager
    private lateinit var adMobManager: AdMobManager
    private lateinit var firebaseRepo: FirebaseRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        soundManager = NativeSoundManager(this)
        adMobManager = AdMobManager(this)
        firebaseRepo = FirebaseRepository(this)

        setContent {
            ArrowPuzzleTheme {
                MainAppNav(
                    activity = this,
                    soundManager = soundManager,
                    adMobManager = adMobManager,
                    firebaseRepo = firebaseRepo
                )
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        soundManager.release()
    }
}

@Composable
fun MainAppNav(
    activity: MainActivity,
    soundManager: NativeSoundManager,
    adMobManager: AdMobManager,
    firebaseRepo: FirebaseRepository
) {
    var screen by remember { mutableStateOf("title") }
    var userProfile by remember { mutableStateOf(firebaseRepo.loadLocalProfile()) }
    var currentLevel by remember { mutableStateOf(LevelsRepository.getLevel(1)) }
    var board by remember {
        mutableStateOf(
            Board(
                rows = currentLevel.rows,
                cols = currentLevel.cols,
                arrows = currentLevel.arrows
            )
        )
    }

    var movesMade by remember { mutableStateOf(0) }
    var isPaused by remember { mutableStateOf(false) }
    var levelComplete by remember { mutableStateOf(false) }
    var highlightArrowId by remember { mutableStateOf<String?>(null) }
    var showLaserBeam by remember { mutableStateOf(false) }

    var hearts by remember { mutableStateOf(3) }
    var isHammerActive by remember { mutableStateOf(false) }

    fun startLevel(id: Int) {
        soundManager.playTap()
        val lvl = LevelsRepository.getLevel(id)
        currentLevel = lvl
        board = Board(rows = lvl.rows, cols = lvl.cols, arrows = lvl.arrows)
        movesMade = 0
        hearts = 3
        isHammerActive = false
        isPaused = false
        levelComplete = false
        highlightArrowId = null
        showLaserBeam = false
        screen = "puzzle"
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFFF8FAFC)
    ) {
        when (screen) {
            "title" -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    // Header Bar
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(
                            onClick = { Toast.makeText(activity, "Tap arrows to clear board. Clear paths to edges!", Toast.LENGTH_LONG).show() },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEFF2FE))
                        ) {
                            Text("How it works?", color = Color(0xFF3B49A2), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .background(Color(0xFFEFF2FE), RoundedCornerShape(20.dp))
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text("${userProfile.coins}", color = Color(0xFF1E293B), fontWeight = FontWeight.Black)
                            Spacer(Modifier.width(4.dp))
                            Text("🪙")
                        }
                    }

                    // Hero Title
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            "Arrow Rescue",
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF0F172A)
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            "SOLVE • RESCUE • EARN REWARDS",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF4F67F7),
                            letterSpacing = 1.sp
                        )
                    }

                    // Daily Streak & Challenge Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(20.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF2FE))
                        ) {
                            Column(Modifier.padding(12.dp)) {
                                Text("Daily Streak", fontWeight = FontWeight.Black, fontSize = 13.sp, color = Color(0xFF1E293B))
                                Text("${userProfile.dailyStreak} Days Active", fontSize = 11.sp, color = Color(0xFF64748B))
                                Spacer(Modifier.height(8.dp))
                                Button(
                                    onClick = { Toast.makeText(activity, "Daily streak checked in! +50 coins", Toast.LENGTH_SHORT).show() },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text("Check in", color = Color(0xFF3B49A2), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(20.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF2FE))
                        ) {
                            Column(Modifier.padding(12.dp)) {
                                Text("Challenge", fontWeight = FontWeight.Black, fontSize = 13.sp, color = Color(0xFF1E293B))
                                Text("Daily Puzzle", fontSize = 11.sp, color = Color(0xFF64748B))
                                Spacer(Modifier.height(8.dp))
                                Button(
                                    onClick = { startLevel(1) },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F67F7)),
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text("Play", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    // Large Center Level Play Card
                    val highest = (userProfile.completedLevels.keys.mapNotNull { it.toIntOrNull() }.maxOrNull() ?: 0) + 1
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(24.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("Level $highest", fontSize = 28.sp, fontWeight = FontWeight.Black, color = Color(0xFF0F172A))
                            Spacer(Modifier.height(12.dp))
                            Button(
                                onClick = { startLevel(highest) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp),
                                shape = RoundedCornerShape(20.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F67F7))
                            ) {
                                Icon(Icons.Default.PlayArrow, contentDescription = null, tint = Color.White)
                                Spacer(Modifier.width(8.dp))
                                Text("Play", fontWeight = FontWeight.Black, fontSize = 18.sp, color = Color.White)
                            }
                        }
                    }

                    // Super Offers & Play a game row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(20.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF2FE))
                        ) {
                            Column(Modifier.padding(12.dp)) {
                                Text("Super Offers", fontWeight = FontWeight.Black, fontSize = 13.sp, color = Color(0xFF1E293B))
                                Text("Coin tasks & boosts", fontSize = 10.sp, color = Color(0xFF64748B))
                            }
                        }

                        Card(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(20.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF2FE))
                        ) {
                            Column(Modifier.padding(12.dp)) {
                                Text("Play a game 💎", fontWeight = FontWeight.Black, fontSize = 13.sp, color = Color(0xFF1E293B))
                                Text("Time Rush & Arcade", fontSize = 10.sp, color = Color(0xFF64748B))
                            }
                        }
                    }

                    Text(
                        "Tap Arrow to Clear • Complete Path to Edge",
                        fontSize = 11.sp,
                        color = Color(0xFF94A3B8)
                    )
                }
            }

            "puzzle" -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    // Header HUD with Back, Moves 255, 3 Hearts, Coins
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(
                            onClick = { screen = "title" },
                            modifier = Modifier.background(Color(0xFFEFF2FE), RoundedCornerShape(20.dp))
                        ) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color(0xFF3B49A2))
                        }

                        // Moves pill
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .background(Color(0xFFEFF2FE), RoundedCornerShape(20.dp))
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text("Moves", fontSize = 12.sp, fontWeight = FontWeight.Black, color = Color(0xFF3B49A2))
                            Spacer(Modifier.width(6.dp))
                            Text("$movesMade", fontSize = 12.sp, fontWeight = FontWeight.Black, color = Color(0xFF1E293B))
                        }

                        // 3 Hearts Life indicator
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .background(Color(0xFFFFF1F2), RoundedCornerShape(20.dp))
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            repeat(3) { idx ->
                                Text(
                                    if (idx < hearts) "❤️" else "🖤",
                                    fontSize = 12.sp
                                )
                            }
                        }

                        // Coins pill
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .background(Color(0xFFEFF2FE), RoundedCornerShape(20.dp))
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text("${userProfile.coins}", color = Color(0xFF1E293B), fontWeight = FontWeight.Black, fontSize = 12.sp)
                            Spacer(Modifier.width(4.dp))
                            Text("🪙")
                        }
                    }

                    // Native Canvas Puzzle Board with white canvas & black arrows
                    PuzzleBoardView(
                        board = board,
                        highlightArrowId = highlightArrowId,
                        showLaserBeam = showLaserBeam,
                        onArrowTapped = { arrow ->
                            if (isHammerActive) {
                                soundManager.playWoosh()
                                isHammerActive = false
                                val nextBoard = ArrowRules.removeArrow(board, arrow.id)
                                board = nextBoard
                                movesMade++
                                if (ArrowRules.isBoardCleared(nextBoard)) {
                                    soundManager.playVictory()
                                    levelComplete = true
                                }
                            } else {
                                val check = ArrowRules.canArrowExit(board, arrow.id)
                                if (!check.first) {
                                    soundManager.playBlocked()
                                    hearts = maxOf(0, hearts - 1)
                                    Toast.makeText(activity, "Path blocked! -1 Heart lost", Toast.LENGTH_SHORT).show()
                                    if (hearts <= 0) {
                                        Toast.makeText(activity, "Out of hearts! Try again", Toast.LENGTH_SHORT).show()
                                        startLevel(currentLevel.id)
                                    }
                                } else {
                                    soundManager.playWoosh()
                                    val nextBoard = ArrowRules.removeArrow(board, arrow.id)
                                    board = nextBoard
                                    movesMade++
                                    highlightArrowId = null
                                    showLaserBeam = false

                                    if (ArrowRules.isBoardCleared(nextBoard)) {
                                        soundManager.playVictory()
                                        val stars = ArrowRules.calculateStars(movesMade, currentLevel.optimalMoves)
                                        val coins = ArrowRules.calculateCoinsReward(stars, currentLevel.category)
                                        val updated = userProfile.copy(
                                            coins = userProfile.coins + coins,
                                            completedLevels = userProfile.completedLevels + (currentLevel.id.toString() to LevelResult(currentLevel.id, stars, movesMade, 30))
                                        )
                                        userProfile = updated
                                        firebaseRepo.saveLocalProfile(updated)
                                        levelComplete = true
                                    }
                                }
                            }
                        }
                    )

                    // 4 Powerups HUD: Star Blast, Hammer, Shuffle, Hint
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFEFF2FE), RoundedCornerShape(24.dp))
                            .padding(horizontal = 8.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        // 1. Star Blast
                        IconButton(onClick = {
                            val removable = ArrowRules.getRemovableArrows(board)
                            if (board.arrows.isNotEmpty()) {
                                soundManager.playTap()
                                val toRemove = board.arrows.take(3)
                                var b = board
                                toRemove.forEach { b = ArrowRules.removeArrow(b, it.id) }
                                board = b
                                Toast.makeText(activity, "Star Blast: 3 arrows blasted!", Toast.LENGTH_SHORT).show()
                                if (ArrowRules.isBoardCleared(b)) {
                                    soundManager.playVictory()
                                    levelComplete = true
                                }
                            }
                        }) {
                            Text("⭐", fontSize = 18.sp)
                        }

                        // 2. Hammer
                        IconButton(onClick = {
                            isHammerActive = !isHammerActive
                            Toast.makeText(activity, if (isHammerActive) "Hammer active: Tap any arrow to smash!" else "Hammer cancelled", Toast.LENGTH_SHORT).show()
                        }) {
                            Text("🔨", fontSize = 18.sp)
                        }

                        // 3. Shuffle
                        IconButton(onClick = {
                            soundManager.playWoosh()
                            val shuffled = board.arrows.map { a ->
                                val dirs = Direction.values().filter { it != a.dir }
                                a.copy(dir = dirs.random())
                            }
                            board = board.copy(arrows = shuffled)
                            Toast.makeText(activity, "Arrows shuffled!", Toast.LENGTH_SHORT).show()
                        }) {
                            Text("🔀", fontSize = 18.sp)
                        }

                        // 4. Hint
                        IconButton(onClick = {
                            val removable = ArrowRules.getRemovableArrows(board)
                            if (removable.isNotEmpty()) {
                                soundManager.playTap()
                                highlightArrowId = removable.first().id
                                showLaserBeam = true
                                Toast.makeText(activity, "Clear arrow highlighted!", Toast.LENGTH_SHORT).show()
                            }
                        }) {
                            Text("💡", fontSize = 18.sp)
                        }
                    }
                }

                // Pause Dialog with 11-ad level skip
                if (isPaused) {
                    AlertDialog(
                        onDismissRequest = { isPaused = false },
                        title = { Text("Game Paused", fontWeight = FontWeight.Bold) },
                        text = {
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text("Rewarded Ad Level Skip: ${userProfile.skipAdsProgress}/11 Ads")
                                LinearProgressIndicator(
                                    progress = { userProfile.skipAdsProgress / 11f },
                                    modifier = Modifier.fillMaxWidth()
                                )
                                Button(
                                    onClick = {
                                        adMobManager.showRewardedAd(
                                            activity,
                                            onRewardEarned = { _, _ ->
                                                val next = minOf(11, userProfile.skipAdsProgress + 1)
                                                val updated = userProfile.copy(skipAdsProgress = next)
                                                userProfile = updated
                                                firebaseRepo.saveLocalProfile(updated)
                                                Toast.makeText(activity, "Skip progress: $next/11 Ads", Toast.LENGTH_SHORT).show()
                                            },
                                            onAdClosed = {}
                                        )
                                    },
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text("Watch Ad for Skip (+1)")
                                }
                            }
                        },
                        confirmButton = {
                            Button(onClick = { isPaused = false }) { Text("Resume") }
                        },
                        dismissButton = {
                            TextButton(onClick = {
                                isPaused = false
                                screen = "title"
                            }) { Text("Exit to Menu") }
                        }
                    )
                }

                // Level Complete Dialog with 2x Rewarded Ad
                if (levelComplete) {
                    AlertDialog(
                        onDismissRequest = {},
                        title = { Text("Puzzle Solved!", fontWeight = FontWeight.Bold, color = Color(0xFF34D399)) },
                        text = {
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text("Level ${currentLevel.id} Cleared in $movesMade moves!")
                                Button(
                                    onClick = {
                                        adMobManager.showRewardedAd(
                                            activity,
                                            onRewardEarned = { _, _ ->
                                                val bonus = ArrowRules.calculateCoinsReward(3, currentLevel.category)
                                                val updated = userProfile.copy(coins = userProfile.coins + bonus)
                                                userProfile = updated
                                                firebaseRepo.saveLocalProfile(updated)
                                                soundManager.playCoin()
                                                Toast.makeText(activity, "2x Rewards Granted! +$bonus Coins", Toast.LENGTH_SHORT).show()
                                            },
                                            onAdClosed = {}
                                        )
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B))
                                ) {
                                    Text("Watch Ad for 2× Coins!", fontWeight = FontWeight.Bold)
                                }
                            }
                        },
                        confirmButton = {
                            Button(onClick = { startLevel(currentLevel.id + 1) }) { Text("Next Puzzle") }
                        },
                        dismissButton = {
                            TextButton(onClick = { screen = "title" }) { Text("Menu") }
                        }
                    )
                }
            }

            "level_select" -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { screen = "title" }) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                        }
                        Text("105 Playable Levels", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color.White)
                        Spacer(Modifier.width(48.dp))
                    }

                    Spacer(Modifier.height(16.dp))

                    val all = LevelsRepository.getAllLevels(105)
                    androidx.compose.foundation.lazy.grid.LazyVerticalGrid(
                        columns = androidx.compose.foundation.lazy.grid.GridCells.Fixed(4),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(all.size) { idx ->
                            val lvl = all[idx]
                            val isCompleted = userProfile.completedLevels.containsKey(lvl.id.toString())
                            Button(
                                onClick = { startLevel(lvl.id) },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isCompleted) Color(0xFF047857) else Color(0xFF1E293B)
                                )
                            ) {
                                Text("${lvl.id}", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            "shop" -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { screen = "title" }) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                        }
                        Text("Native Coin Shop", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color.White)
                        Text("${userProfile.coins} Coins", color = Color(0xFFFBBF24), fontWeight = FontWeight.Bold)
                    }

                    Spacer(Modifier.height(16.dp))

                    androidx.compose.foundation.lazy.LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(ShopCatalog.items.size) { idx ->
                            val item = ShopCatalog.items[idx]
                            val owned = userProfile.inventory.containsKey(item.id)

                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B))
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(item.name, fontWeight = FontWeight.Bold, color = Color.White)
                                        Text(item.description, fontSize = 11.sp, color = Color(0xFF94A3B8))
                                    }

                                    if (owned && !item.consumable) {
                                        Text("Owned", color = Color(0xFF34D399), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    } else {
                                        Button(
                                            onClick = {
                                                if (userProfile.coins >= item.price) {
                                                    val updated = userProfile.copy(
                                                        coins = userProfile.coins - item.price,
                                                        inventory = userProfile.inventory + (item.id to (userProfile.inventory[item.id] ?: 0) + 1)
                                                    )
                                                    userProfile = updated
                                                    firebaseRepo.saveLocalProfile(updated)
                                                    soundManager.playCoin()
                                                    Toast.makeText(activity, "Purchased ${item.name}!", Toast.LENGTH_SHORT).show()
                                                } else {
                                                    soundManager.playBlocked()
                                                    Toast.makeText(activity, "Not enough coins!", Toast.LENGTH_SHORT).show()
                                                }
                                            },
                                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B))
                                        ) {
                                            Text("${item.price} C")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            "profile" -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    IconButton(onClick = { screen = "title" }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }

                    Text("Player Profile & Cloud Sync", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color.White)
                    Text("Firebase Project: arrow-game-4a2aa", fontSize = 12.sp, color = Color(0xFF38BDF8))
                    Text("Realtime Database: https://arrow-game-4a2aa-default-rtdb.firebaseio.com/", fontSize = 10.sp, color = Color(0xFF94A3B8))

                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
                    ) {
                        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("Name: ${userProfile.displayName}", fontWeight = FontWeight.Bold, color = Color.White)
                            Text("Status: ${if (userProfile.isGuest) "Guest (Local)" else "Synced to Cloud"}", color = Color(0xFF34D399))
                            Text("Total Levels Solved: ${userProfile.completedLevels.size}", color = Color.White)
                            Text("Coins Balance: ${userProfile.coins}", color = Color(0xFFFBBF24))
                        }
                    }

                    if (userProfile.isGuest) {
                        Button(
                            onClick = {
                                val updated = userProfile.copy(
                                    isGuest = false,
                                    displayName = "abirmahmudm11",
                                    email = "abirmahmudm11@gmail.com"
                                )
                                userProfile = updated
                                firebaseRepo.saveLocalProfile(updated)
                                soundManager.playVictory()
                                Toast.makeText(activity, "Account linked & progress synchronized!", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Link Google Account (abirmahmudm11@gmail.com)")
                        }
                    } else {
                        Button(
                            onClick = {
                                userProfile = firebaseRepo.signOut()
                                Toast.makeText(activity, "Signed out to Guest", Toast.LENGTH_SHORT).show()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Sign Out")
                        }
                    }
                }
            }
        }
    }
}
