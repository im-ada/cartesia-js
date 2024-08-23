import {
  Client
} from "./chunk-UI42G5AU.js";
import {
  CARTESIA_VERSION,
  constructApiUrl
} from "./chunk-2BFEKY3F.js";
import {
  base64ToArray,
  createMessageHandlerForContextId,
  getEmitteryCallbacks,
  isSentinel
} from "./chunk-NJUQO6SE.js";
import {
  Source
} from "./chunk-IRUPSLVR.js";

// src/tts/websocket.ts
import Emittery from "emittery";
import { humanId } from "human-id";
import { WebSocket as PartySocketWebSocket } from "partysocket";
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
    const emitter = new Emittery();
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
    return humanId({
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
    const emitter = new Emittery();
    this.socket = new PartySocketWebSocket(async () => {
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

export {
  WebSocket
};
