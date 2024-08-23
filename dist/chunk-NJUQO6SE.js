import {
  ENCODING_MAP
} from "./chunk-IRUPSLVR.js";

// src/tts/utils.ts
import base64 from "base64-js";
function base64ToArray(b64, encoding) {
  const byteArrays = filterSentinel(b64).map((b) => base64.toByteArray(b));
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

export {
  base64ToArray,
  playAudioBuffer,
  createMessageHandlerForContextId,
  getSentinel,
  isSentinel,
  filterSentinel,
  isComplete,
  getEmitteryCallbacks
};
