import {
  Client
} from "./chunk-UI42G5AU.js";

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

export {
  Voices
};
