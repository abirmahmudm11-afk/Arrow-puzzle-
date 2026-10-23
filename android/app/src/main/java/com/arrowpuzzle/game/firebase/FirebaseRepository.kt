package com.arrowpuzzle.game.firebase

import android.content.Context
import android.content.SharedPreferences
import com.arrowpuzzle.game.model.LevelResult
import com.arrowpuzzle.game.model.UserProfile
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.tasks.await
import org.json.JSONObject

class FirebaseRepository(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("arrow_puzzle_save", Context.MODE_PRIVATE)
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
    private val database: FirebaseDatabase by lazy {
        FirebaseDatabase.getInstance("https://arrow-game-4a2aa-default-rtdb.firebaseio.com/").apply {
            setPersistenceEnabled(true)
        }
    }

    val currentUser: FirebaseUser?
        get() = auth.currentUser

    /**
     * Loads user profile from local cache first, then syncs with Firebase RTDB if logged in.
     */
    fun loadLocalProfile(): UserProfile {
        val raw = prefs.getString("user_profile_json", null)
        if (raw != null) {
            try {
                val json = JSONObject(raw)
                return UserProfile(
                    id = json.optString("id", "guest_local"),
                    email = json.optString("email", null),
                    displayName = json.optString("displayName", "Guest Pathfinder"),
                    isGuest = json.optBoolean("isGuest", true),
                    coins = json.optInt("coins", 100),
                    equippedSkin = json.optString("equippedSkin", "skin_default"),
                    equippedTheme = json.optString("equippedTheme", "theme_default"),
                    equippedEffect = json.optString("equippedEffect", "effect_default"),
                    skipAdsProgress = json.optInt("skipAdsProgress", 0),
                    dailyStreak = json.optInt("dailyStreak", 1)
                )
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        val defaultGuest = UserProfile(id = "guest_${System.currentTimeMillis()}")
        saveLocalProfile(defaultGuest)
        return defaultGuest
    }

    fun saveLocalProfile(profile: UserProfile) {
        val json = JSONObject().apply {
            put("id", profile.id)
            put("email", profile.email)
            put("displayName", profile.displayName)
            put("isGuest", profile.isGuest)
            put("coins", profile.coins)
            put("equippedSkin", profile.equippedSkin)
            put("equippedTheme", profile.equippedTheme)
            put("equippedEffect", profile.equippedEffect)
            put("skipAdsProgress", profile.skipAdsProgress)
            put("dailyStreak", profile.dailyStreak)
        }
        prefs.edit().putString("user_profile_json", json.toString()).apply()

        // If authenticated, also push to Firebase RTDB
        syncToCloud(profile)
    }

    private fun syncToCloud(profile: UserProfile) {
        val uid = auth.currentUser?.uid ?: return
        database.getReference("users").child(uid).setValue(profile)
    }

    fun listenToCloudProfile(onUpdate: (UserProfile) -> Unit) {
        val uid = auth.currentUser?.uid ?: return
        database.getReference("users").child(uid).addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val cloudProfile = snapshot.getValue(UserProfile::class.java)
                if (cloudProfile != null) {
                    onUpdate(cloudProfile)
                }
            }

            override fun onCancelled(error: DatabaseError) {
                // Ignore or handle offline
            }
        })
    }

    suspend fun registerEmail(email: String, pass: String, name: String, guestProfile: UserProfile): Result<UserProfile> {
        return try {
            val res = auth.createUserWithEmailAndPassword(email, pass).await()
            val uid = res.user?.uid ?: throw IllegalStateException("User ID null")
            val mergedProfile = guestProfile.copy(
                id = uid,
                email = email,
                displayName = name.ifBlank { email.substringBefore("@") },
                isGuest = false,
                coins = guestProfile.coins + 100 // Registration bonus
            )
            saveLocalProfile(mergedProfile)
            Result.success(mergedProfile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun loginEmail(email: String, pass: String, guestProfile: UserProfile): Result<UserProfile> {
        return try {
            val res = auth.signInWithEmailAndPassword(email, pass).await()
            val uid = res.user?.uid ?: throw IllegalStateException("User ID null")
            val snapshot = database.getReference("users").child(uid).get().await()
            var cloudProfile = snapshot.getValue(UserProfile::class.java)
            if (cloudProfile == null) {
                cloudProfile = guestProfile.copy(id = uid, email = email, isGuest = false)
            } else {
                // Merge guest progress into cloud profile
                cloudProfile = cloudProfile.copy(
                    coins = cloudProfile.coins + (if (guestProfile.isGuest) guestProfile.coins else 0)
                )
            }
            saveLocalProfile(cloudProfile)
            Result.success(cloudProfile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun signOut(): UserProfile {
        auth.signOut()
        val freshGuest = UserProfile(id = "guest_${System.currentTimeMillis()}")
        saveLocalProfile(freshGuest)
        return freshGuest
    }
}
