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

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Cartesia: () => Cartesia,
  Source: () => Source,
  WebPlayer: () => Player,
  WebSocket: () => WebSocket,
  default: () => Cartesia
});
module.exports = __toCommonJS(src_exports);

// src/lib/client.ts
var import_cross_fetch = __toESM(require("cross-fetch"), 1);

// src/lib/constants.ts
var BASE_URL = "https://api.cartesia.ai";
var CARTESIA_VERSION = "2024-06-10";
var constructApiUrl = (baseUrl, path, { websocket = false } = {}) => {
  const url = new URL(path, baseUrl);
  if (websocket) {
    url.protocol = baseUrl.replace(/^http/, "ws");
  }
  return url;
};

// src/lib/client.ts
var Client = class {
  apiKey;
  baseUrl;
  constructor(options = {}) {
    const apiKey = options.apiKey || process.env.CARTESIA_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Cartesia API key.");
    }
    this.apiKey = typeof apiKey === "function" ? apiKey : async () => apiKey;
    this.baseUrl = options.baseUrl || BASE_URL;
  }
  async _fetch(path, options = {}) {
    const url = constructApiUrl(this.baseUrl, path);
    const headers = new Headers(options.headers);
    headers.set("X-API-Key", await this.apiKey());
    headers.set("Cartesia-Version", CARTESIA_VERSION);
    return (0, import_cross_fetch.default)(url.toString(), {
      ...options,
      headers
    });
  }
};

// src/tts/websocket.ts
var import_emittery2 = __toESM(require("emittery"), 1);
var import_human_id = require("human-id");
var import_partysocket = require("partysocket");

// src/tts/source.ts
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

// src/tts/utils.ts
var import_base64_js = __toESM(require("base64-js"), 1);
function base64ToArray(b64, encoding) {
  const byteArrays = filterSentinel(b64).map((b) => import_base64_js.default.toByteArray(b));
  const { arrayType: ArrayType, bytesPerElement } = ENCODING_MAP[encoding];
  const totalLength = byteArrays.reduce(
    (acc, arr) => acc + arr.length / bytesPerElement,
    0
  );
  const result = new ArrayType(totalLength);
  let offset = 0;
  for (const arr of byteArrays) {
    const floats = new ArrayType(arr.buffer);
    result.set(floats, offset);
    offset += floats.length;
  }
  return result;
}
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
function createMessageHandlerForContextId(contextId, handler) {
  return (event) => {
    if (typeof event.data !== "string") {
      return;
    }
    const message = JSON.parse(event.data);
    if (message.context_id !== contextId) {
      return;
    }
    let chunk;
    if (message.done) {
      chunk = getSentinel();
    } else if (message.type === "chunk") {
      chunk = message.data;
    }
    handler({ chunk, message: event.data, data: message });
  };
}
function getSentinel() {
  return null;
}
function isSentinel(x) {
  return x === getSentinel();
}
function filterSentinel(collection) {
  return collection.filter(
    (x) => !isSentinel(x)
  );
}
function getEmitteryCallbacks(emitter) {
  return {
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    once: emitter.once.bind(emitter),
    events: emitter.events.bind(emitter)
  };
}

// src/tts/websocket.ts
var WebSocket = class extends Client {
  socket;
  #isConnected = false;
  #sampleRate;
  #container;
  #encoding;
  /**
   * Create a new WebSocket client.
   *
   * @param args - Arguments to pass to the Client constructor.
   */
  constructor({ sampleRate, container, encoding }, ...args) {
    super(...args);
    this.#sampleRate = sampleRate;
    this.#container = container ?? "raw";
    this.#encoding = encoding ?? "pcm_f32le";
  }
  /**
   * Send a message over the WebSocket to start a stream.
   *
   * @param inputs - Stream options. Defined in the StreamRequest type.
   * @param options - Options for the stream.
   * @param options.timeout - The maximum time to wait for a chunk before cancelling the stream.
   *                          If set to `0`, the stream will not time out.
   * @returns A Source object that can be passed to a Player to play the audio.
   * @returns An Emittery instance that emits messages from the WebSocket.
   * @returns An abort function that can be called to cancel the stream.
   */
  send({ ...inputs }, { timeout = 0 } = {}) {
    if (!this.#isConnected) {
      throw new Error("Not connected to WebSocket. Call .connect() first.");
    }
    if (!inputs.context_id) {
      inputs.context_id = this.#generateId();
    }
    if (!inputs.output_format) {
      inputs.output_format = {
        container: this.#container,
        encoding: this.#encoding,
        sample_rate: this.#sampleRate
      };
    }
    this.socket?.send(
      JSON.stringify({
        ...inputs
      })
    );
    const emitter = new import_emittery2.default();
    const source = new Source({
      sampleRate: this.#sampleRate,
      encoding: this.#encoding,
      container: this.#container
    });
    const streamCompleteController = new AbortController();
    let timeoutId = null;
    if (timeout > 0) {
      timeoutId = setTimeout(streamCompleteController.abort, timeout);
    }
    const handleMessage = createMessageHandlerForContextId(
      inputs.context_id,
      async ({ chunk, message, data }) => {
        emitter.emit("message", message);
        if (data.type === "timestamps") {
          emitter.emit("timestamps", data.word_timestamps);
          return;
        }
        if (isSentinel(chunk)) {
          await source.close();
          streamCompleteController.abort();
          return;
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(streamCompleteController.abort, timeout);
        }
        if (!chunk) {
          return;
        }
        await source.enqueue(base64ToArray([chunk], this.#encoding));
      }
    );
    this.socket?.addEventListener("message", handleMessage, {
      signal: streamCompleteController.signal
    });
    this.socket?.addEventListener(
      "close",
      () => {
        streamCompleteController.abort();
      },
      {
        once: true
      }
    );
    this.socket?.addEventListener(
      "error",
      () => {
        streamCompleteController.abort();
      },
      {
        once: true
      }
    );
    streamCompleteController.signal.addEventListener("abort", () => {
      source.close();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
    return {
      source,
      ...getEmitteryCallbacks(emitter),
      stop: streamCompleteController.abort.bind(streamCompleteController)
    };
  }
  /**
   * Generate a unique ID suitable for a streaming context.
   *
   * Not suitable for security purposes or as a primary key, since
   * it lacks the amount of entropy required for those use cases.
   *
   * @returns A unique ID.
   */
  #generateId() {
    return (0, import_human_id.humanId)({
      separator: "-",
      capitalize: false
    });
  }
  /**
   * Authenticate and connect to a Cartesia streaming WebSocket.
   *
   * @returns A promise that resolves when the WebSocket is connected.
   * @throws {Error} If the WebSocket fails to connect.
   */
  async connect() {
    const emitter = new import_emittery2.default();
    this.socket = new import_partysocket.WebSocket(async () => {
      const url = constructApiUrl(this.baseUrl, "/tts/websocket", {
        websocket: true
      });
      url.searchParams.set("api_key", await this.apiKey());
      url.searchParams.set("cartesia_version", CARTESIA_VERSION);
      return url.toString();
    });
    this.socket.binaryType = "arraybuffer";
    this.socket.onopen = () => {
      this.#isConnected = true;
      emitter.emit("open");
    };
    this.socket.onclose = () => {
      this.#isConnected = false;
      emitter.emit("close");
    };
    return new Promise(
      (resolve, reject) => {
        this.socket?.addEventListener(
          "open",
          () => {
            resolve(getEmitteryCallbacks(emitter));
          },
          {
            once: true
          }
        );
        const aborter = new AbortController();
        this.socket?.addEventListener(
          "error",
          () => {
            aborter.abort();
            reject(new Error("WebSocket failed to connect."));
          },
          {
            signal: aborter.signal
          }
        );
        this.socket?.addEventListener(
          "close",
          () => {
            aborter.abort();
            reject(new Error("WebSocket closed before it could connect."));
          },
          {
            signal: aborter.signal
          }
        );
      }
    );
  }
  /**
   * Disconnect from the Cartesia streaming WebSocket.
   */
  disconnect() {
    this.socket?.close();
  }
};

// src/tts/index.ts
var TTS = class extends Client {
  /**
   * Get a WebSocket client for streaming audio from the TTS API.
   *
   * @returns {WebSocket} A Cartesia WebSocket client.
   */
  websocket(options) {
    return new WebSocket(options, {
      apiKey: this.apiKey,
      baseUrl: this.baseUrl
    });
  }
};

// src/voices/index.ts
var Voices = class extends Client {
  async list() {
    const response = await this._fetch("/voices");
    return response.json();
  }
  async get(voiceId) {
    const response = await this._fetch(`/voices/${voiceId}`);
    return response.json();
  }
  async create(voice) {
    const response = await this._fetch("/voices", {
      method: "POST",
      body: JSON.stringify(voice)
    });
    return response.json();
  }
  async update(id, voice) {
    const response = await this._fetch(`/voices/${id}`, {
      method: "PATCH",
      body: JSON.stringify(voice)
    });
    return response.json();
  }
  async clone(options) {
    if (options.mode === "clip") {
      const formData = new FormData();
      formData.append("clip", options.clip);
      if (options.enhance !== void 0) {
        formData.append("enhance", options.enhance.toString());
      }
      const response = await this._fetch("/voices/clone/clip", {
        method: "POST",
        body: formData
      });
      return response.json();
    }
    throw new Error("Invalid mode for clone()");
  }
  async mix(options) {
    const request = options;
    const response = await this._fetch("/voices/mix", {
      method: "POST",
      body: JSON.stringify(request)
    });
    return response.json();
  }
};

// src/lib/index.ts
var Cartesia = class extends Client {
  tts;
  voices;
  constructor(options = {}) {
    super(options);
    this.tts = new TTS(options);
    this.voices = new Voices(options);
  }
};

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Cartesia,
  Source,
  WebPlayer,
  WebSocket
});
