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

// src/tts/utils.ts
var utils_exports = {};
__export(utils_exports, {
  base64ToArray: () => base64ToArray,
  createMessageHandlerForContextId: () => createMessageHandlerForContextId,
  filterSentinel: () => filterSentinel,
  getEmitteryCallbacks: () => getEmitteryCallbacks,
  getSentinel: () => getSentinel,
  isComplete: () => isComplete,
  isSentinel: () => isSentinel,
  playAudioBuffer: () => playAudioBuffer
});
module.exports = __toCommonJS(utils_exports);
var import_base64_js = __toESM(require("base64-js"), 1);

// src/tts/source.ts
var import_emittery = __toESM(require("emittery"), 1);
var ENCODING_MAP = {
  pcm_f32le: { arrayType: Float32Array, bytesPerElement: 4 },
  pcm_s16le: { arrayType: Int16Array, bytesPerElement: 2 },
  pcm_alaw: { arrayType: Uint8Array, bytesPerElement: 1 },
  pcm_mulaw: { arrayType: Uint8Array, bytesPerElement: 1 }
};

// src/tts/utils.ts
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
function isComplete(chunks) {
  return isSentinel(chunks[chunks.length - 1]);
}
function getEmitteryCallbacks(emitter) {
  return {
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    once: emitter.once.bind(emitter),
    events: emitter.events.bind(emitter)
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  base64ToArray,
  createMessageHandlerForContextId,
  filterSentinel,
  getEmitteryCallbacks,
  getSentinel,
  isComplete,
  isSentinel,
  playAudioBuffer
});
