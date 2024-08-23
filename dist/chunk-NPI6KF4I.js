import {
  playAudioBuffer
} from "./chunk-NJUQO6SE.js";

// src/tts/player.ts
var Player = class {
  #context = null;
  #startNextPlaybackAt = 0;
  #bufferDuration;
  /**
   * Create a new Player.
   *
   * @param options - Options for the Player.
   * @param options.bufferDuration - The duration of the audio buffer to play.
   */
  constructor({ bufferDuration }) {
    this.#bufferDuration = bufferDuration;
  }
  async #playBuffer(buf, sampleRate) {
    if (!this.#context) {
      throw new Error("AudioContext not initialized.");
    }
    if (buf.length === 0) {
      return;
    }
    const startAt = this.#startNextPlaybackAt;
    const duration = buf.length / sampleRate;
    this.#startNextPlaybackAt = duration + Math.max(this.#context.currentTime, this.#startNextPlaybackAt);
    await playAudioBuffer(buf, this.#context, startAt, sampleRate);
  }
  /**
   * Play audio from a source.
   *
   * @param source The source to play audio from.
   * @returns A promise that resolves when the audio has finished playing.
   */
  async play(source) {
    this.#startNextPlaybackAt = 0;
    this.#context = new AudioContext({ sampleRate: source.sampleRate });
    const buffer = new Float32Array(
      source.durationToSampleCount(this.#bufferDuration)
    );
    const plays = [];
    while (true) {
      const read = await source.read(buffer);
      const playableAudio = buffer.subarray(0, read);
      plays.push(this.#playBuffer(playableAudio, source.sampleRate));
      if (read < buffer.length) {
        break;
      }
    }
    await Promise.all(plays);
  }
  /**
   * Pause the audio.
   *
   * @returns A promise that resolves when the audio has been paused.
   */
  async pause() {
    if (!this.#context) {
      throw new Error("AudioContext not initialized.");
    }
    await this.#context.suspend();
  }
  /**
   * Resume the audio.
   *
   * @returns A promise that resolves when the audio has been resumed.
   */
  async resume() {
    if (!this.#context) {
      throw new Error("AudioContext not initialized.");
    }
    await this.#context.resume();
  }
  /**
   * Toggle the audio.
   *
   * @returns A promise that resolves when the audio has been toggled.
   */
  async toggle() {
    if (!this.#context) {
      throw new Error("AudioContext not initialized.");
    }
    if (this.#context.state === "running") {
      await this.pause();
    } else {
      await this.resume();
    }
  }
  /**
   * Stop the audio.
   *
   * @returns A promise that resolves when the audio has been stopped.
   */
  async stop() {
    if (!this.#context) {
      throw new Error("AudioContext not initialized.");
    }
    await this.#context?.close();
  }
};

export {
  Player
};
