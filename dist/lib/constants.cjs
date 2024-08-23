"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lib/constants.ts
var constants_exports = {};
__export(constants_exports, {
  BASE_URL: () => BASE_URL,
  CARTESIA_VERSION: () => CARTESIA_VERSION,
  constructApiUrl: () => constructApiUrl
});
module.exports = __toCommonJS(constants_exports);
var BASE_URL = "https://api.cartesia.ai";
var CARTESIA_VERSION = "2024-06-10";
var constructApiUrl = (baseUrl, path, { websocket = false } = {}) => {
  const url = new URL(path, baseUrl);
  if (websocket) {
    url.protocol = baseUrl.replace(/^http/, "ws");
  }
  return url;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BASE_URL,
  CARTESIA_VERSION,
  constructApiUrl
});
