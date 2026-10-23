package com.arrowpuzzle.game.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.media.MediaPlayer
import kotlin.concurrent.thread
import kotlin.math.sin

class NativeSoundManager(private val context: Context) {

    private var sfxVolume = 0.8f
    private var musicVolume = 0.4f
    private var isMuted = false

    private var mediaPlayer: MediaPlayer? = null

    fun setSfxVolume(vol: Float) {
        sfxVolume = vol.coerceIn(0f, 1f)
    }

    fun setMusicVolume(vol: Float) {
        musicVolume = vol.coerceIn(0f, 1f)
        mediaPlayer?.setVolume(if (isMuted) 0f else musicVolume, if (isMuted) 0f else musicVolume)
    }

    fun setMuted(muted: Boolean) {
        isMuted = muted
        mediaPlayer?.setVolume(if (isMuted) 0f else musicVolume, if (isMuted) 0f else musicVolume)
    }

    /**
     * Synthesizes audio tones using native AudioTrack for zero-dependency native audio.
     */
    private fun playTone(freqHz: Float, durationMs: Int, volume: Float = 0.5f) {
        if (isMuted || sfxVolume <= 0f) return

        thread(priority = Thread.MAX_PRIORITY) {
            val sampleRate = 22050
            val numSamples = (durationMs * sampleRate) / 1000
            val samples = ShortArray(numSamples)

            for (i in 0 until numSamples) {
                val t = i.toDouble() / sampleRate
                val angle = 2.0 * Math.PI * freqHz * t
                val envelope = 1.0 - (i.toDouble() / numSamples) // Linear fade out
                samples[i] = (sin(angle) * Short.MAX_VALUE * volume * sfxVolume * envelope).toInt().toShort()
            }

            val audioTrack = AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_GAME)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(sampleRate)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build()
                )
                .setBufferSizeInBytes(samples.size * 2)
                .setTransferMode(AudioTrack.MODE_STATIC)
                .build()

            audioTrack.write(samples, 0, samples.size)
            audioTrack.play()
            Thread.sleep(durationMs.toLong() + 50)
            audioTrack.release()
        }
    }

    fun playTap() {
        playTone(380f, 70, 0.4f)
    }

    fun playWoosh() {
        thread {
            playTone(280f, 60, 0.5f)
            Thread.sleep(50)
            playTone(560f, 90, 0.5f)
        }
    }

    fun playBlocked() {
        playTone(130f, 140, 0.6f)
    }

    fun playCoin() {
        thread {
            playTone(1318f, 90, 0.5f)
            Thread.sleep(60)
            playTone(1975f, 150, 0.5f)
        }
    }

    fun playStar() {
        thread {
            playTone(523f, 80, 0.6f)
            Thread.sleep(70)
            playTone(659f, 80, 0.6f)
            Thread.sleep(70)
            playTone(784f, 160, 0.6f)
        }
    }

    fun playVictory() {
        thread {
            val notes = floatArrayOf(523f, 659f, 784f, 1046f)
            for (n in notes) {
                playTone(n, 120, 0.6f)
                Thread.sleep(80)
            }
        }
    }

    fun release() {
        mediaPlayer?.release()
        mediaPlayer = null
    }
}
