package com.arrowpuzzle.game.ads

import android.app.Activity
import android.content.Context
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback

class AdMobManager(private val context: Context) {

    private var rewardedAd: RewardedAd? = null
    private var isLoading = false

    // Official Google AdMob sample test ad unit for Rewarded Ads
    private val testRewardedAdUnitId = "ca-app-pub-3940256099942544/5224354917"

    init {
        MobileAds.initialize(context) {}
        loadAd()
    }

    fun loadAd() {
        if (isLoading || rewardedAd != null) return
        isLoading = true

        val adRequest = AdRequest.Builder().build()
        RewardedAd.load(context, testRewardedAdUnitId, adRequest, object : RewardedAdLoadCallback() {
            override fun onAdLoaded(ad: RewardedAd) {
                rewardedAd = ad
                isLoading = false
            }

            override fun onAdFailedToLoad(error: LoadAdError) {
                rewardedAd = null
                isLoading = false
            }
        })
    }

    fun isAdAvailable(): Boolean {
        return rewardedAd != null
    }

    fun showRewardedAd(activity: Activity, onRewardEarned: (amount: Int, type: String) -> Unit, onAdClosed: () -> Unit) {
        val ad = rewardedAd
        if (ad != null) {
            ad.show(activity) { rewardItem ->
                onRewardEarned(rewardItem.amount, rewardItem.type)
            }
            rewardedAd = null
            loadAd()
        } else {
            // If ad is not ready, reload and notify
            loadAd()
            onAdClosed()
        }
    }
}
