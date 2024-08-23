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

// src/lib/client.ts
var client_exports = {};
__export(client_exports, {
  Client: () => Client
});
module.exports = __toCommonJS(client_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Client
});
