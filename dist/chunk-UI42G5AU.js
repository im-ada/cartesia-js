import {
  BASE_URL,
  CARTESIA_VERSION,
  constructApiUrl
} from "./chunk-2BFEKY3F.js";

// src/lib/client.ts
import fetch from "cross-fetch";
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
    return fetch(url.toString(), {
      ...options,
      headers
    });
  }
};

export {
  Client
};
