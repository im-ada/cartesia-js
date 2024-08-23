import {
  Voices
} from "./chunk-QGHHUNOG.js";
import {
  TTS
} from "./chunk-P3CNDKIS.js";
import {
  Client
} from "./chunk-UI42G5AU.js";

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

export {
  Cartesia
};
