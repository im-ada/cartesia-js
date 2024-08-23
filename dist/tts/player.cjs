"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/tts/player.ts
var player_exports = {};
__export(player_exports, {
  default: () => Player
});
module.exports = __toCommonJS(player_exports);

// src/tts/utils.ts
var import_base64_js = __toESM(require("base64-js"), 1);

// src/tts/source.ts
var import_emittery = __toESM(require("emittery"), 1);

// src/tts/utils.ts
function playAudioBuffer(floats, context, startAt, sampleRate) {
  const source = context.createBufferSource();
  const buffer = context.createBuffer(1, floats.length, sampleRate);
  buffer.getChannelData(0).set(floats);
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(startAt);
  return new Promise((resolve) => {
    source.onended = () => {
      resolve();
    };
  });
}

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
