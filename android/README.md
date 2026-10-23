# Arrow Puzzle — Native Android Project (Kotlin & Jetpack Compose)

This is a complete, production-grade native Android project built with **Kotlin**, **Jetpack Compose**, **Firebase Authentication**, **Firebase Realtime Database**, and **Google Mobile Ads (AdMob)**.

---

## 1. Project Specifications

- **Target OS**: Android 8.0 (API Level 26) through Android 14 (API Level 34)
- **Language**: Kotlin 1.9.24
- **UI Toolkit**: Jetpack Compose (BOM 2024.06.00) with Material 3
- **Package Name**: `com.arrowpuzzle.game`
- **Architecture**:
  - `com.arrowpuzzle.game.model`: Data models (Arrow, Board, Direction, Level, UserProfile, ShopItem)
  - `com.arrowpuzzle.game.engine`: Vector mechanics, collinear clearance rules, greedy solver, and 105 level generation across 5 tiers
  - `com.arrowpuzzle.game.firebase`: Realtime Database sync with `https://arrow-game-4a2aa-default-rtdb.firebaseio.com/` and Auth
  - `com.arrowpuzzle.game.ads`: Google AdMob RewardedAd integration (2× rewards, 11-ad level skip, clues)
  - `com.arrowpuzzle.game.audio`: Native SoundPool / AudioTrack synthesis for zero-latency audio
  - `com.arrowpuzzle.game.ui.components`: Native Compose Canvas puzzle board rendering and HUDs

---

## 2. Opening in Android Studio

1. Open **Android Studio** (Hedgehog, Iguana, or Koala).
2. Choose **File > Open** and select the `/android` directory.
3. Allow Gradle to sync dependencies.

---

## 3. How to Build Installable APKs

### Building Debug APK
Run in terminal from the `android/` directory:
```bash
./gradlew assembleDebug
```
The output APK is generated at:
```
app/build/outputs/apk/debug/app-debug.apk
```
Install directly on any connected Android phone or emulator:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Building Signed Release APK
Run in terminal:
```bash
./gradlew assembleRelease
```
The output APK is generated at:
```
app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 4. Firebase Configuration (`arrow-game-4a2aa`)

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **`arrow-game-4a2aa`**.
3. Under **Project Settings**, register an Android app with package name:
   `com.arrowpuzzle.game`
4. Add your debug / release SHA-1 certificate fingerprint.
5. Download `google-services.json` and place it in the `app/` directory (`android/app/google-services.json`).
6. Deploy the Realtime Database rules provided in `database.rules.json` to secure player data.

---

## 5. Google Mobile Ads (AdMob)

- Configured with official Google test ad units for Rewarded Ads:
  - App ID: `ca-app-pub-3940256099942544~3347511713`
  - Rewarded Ad Unit: `ca-app-pub-3940256099942544/5224354917`
- For production, replace these IDs in `AndroidManifest.xml` and `AdMobManager.kt` with your verified AdMob account IDs.
