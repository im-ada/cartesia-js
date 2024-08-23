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

// src/tts/source.ts
var source_exports = {};
__export(source_exports, {
  ENCODING_MAP: () => ENCODING_MAP,
  default: () => Source
});
module.exports = __toCommonJS(source_exports);
var import_emittery = __toESM(require("emittery"), 1);
var ENCODING_MAP = {
  pcm_f32le: { arrayType: Float32Array, bytesPerElement: 4 },
  pcm_s16le: { arrayType: Int16Array, bytesPerElement: 2 },
  pcm_alaw: { arrayType: Uint8Array, bytesPerElement: 1 },
  pcm_mulaw: { arrayType: Uint8Array, bytesPerElement: 1 }
};
var Source = class {
  #emitter = new import_emittery.default();
  #buffer;
  #readIndex = 0;
  #writeIndex = 0;
  #closed = false;
  #sampleRate;
  #encoding;
  #container;
  on = this.#emitter.on.bind(this.#emitter);
  once = this.#emitter.once.bind(this.#emitter);
  events = this.#emitter.events.bind(this.#emitter);
  off = this.#emitter.off.bind(this.#emitter);
  /**
   * Create a new Source.
   *
   * @param options - Options for the Source.
   * @param options.sampleRate - The sample rate of the audio.
   */
  constructor({
    sampleRate,
    encoding,
    container
  }) {
    this.#sampleRate = sampleRate;
    this.#encoding = encoding;
    this.#container = container;
    this.#buffer = this.#createBuffer(1024);
  }
  get sampleRate() {
    return this.#sampleRate;
  }
  get encoding() {
    return this.#encoding;
  }
  get container() {
    return this.#container;
  }
  /**
   * Create a new buffer for the source.
   *
   * @param size - The size of the buffer to create.
   * @returns The new buffer as a TypedArray based on the encoding.
   */
  #createBuffer(size) {
    const { arrayType: ArrayType } = ENCODING_MAP[this.#encoding];
    return new ArrayType(size);
  }
  /**
   * Append audio to the buffer.
   *
   * @param src The audio to append.
   */
  async enqueue(src) {
    const requiredCapacity = this.#writeIndex + src.length;
    if (requiredCapacity > this.#buffer.length) {
      let newCapacity = this.#buffer.length;
      while (newCapacity < requiredCapacity) {
        newCapacity *= 2;
      }
      const newBuffer = this.#createBuffer(newCapacity);
      newBuffer.set(this.#buffer);
      this.#buffer = newBuffer;
    }
    this.#buffer.set(src, this.#writeIndex);
    this.#writeIndex += src.length;
    await this.#emitter.emit("enqueue");
  }
  /**
   * Read audio from the buffer.
   *
   * @param dst The buffer to read the audio into.
   * @returns The number of samples read. If the source is closed, this will be
   * less than the length of the provided buffer.
   */
  async read(dst) {
    const targetReadIndex = this.#readIndex + dst.length;
    while (!this.#closed && targetReadIndex > this.#writeIndex) {
      await this.#emitter.emit("wait");
      await Promise.race([
        this.#emitter.once("enqueue"),
        this.#emitter.once("close")
      ]);
      await this.#emitter.emit("read");
    }
    const read = Math.min(dst.length, this.#writeIndex - this.#readIndex);
    dst.set(this.#buffer.subarray(this.#readIndex, this.#readIndex + read));
    this.#readIndex += read;
    return read;
  }
  /**
   * Get the number of samples in a given duration.
   *
   * @param durationSecs The duration in seconds.
   * @returns The number of samples.
   */
  durationToSampleCount(durationSecs) {
    return Math.trunc(durationSecs * this.#sampleRate);
  }
  get buffer() {
    return this.#buffer;
  }
  get readIndex() {
    return this.#readIndex;
  }
  get writeIndex() {
    return this.#writeIndex;
  }
  /**
   * Close the source. This signals that no more audio will be enqueued.
   *
   * This will emit a "close" event.
   *
   * @returns A promise that resolves when the source is closed.
   */
  async close() {
    this.#closed = true;
    await this.#emitter.emit("close");
    this.#emitter.clearListeners();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ENCODING_MAP
});
