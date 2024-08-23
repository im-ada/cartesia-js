import {
  WebSocket
} from "./chunk-3WFDUVYX.js";
import {
  Client
} from "./chunk-UI42G5AU.js";

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

export {
  TTS
};
