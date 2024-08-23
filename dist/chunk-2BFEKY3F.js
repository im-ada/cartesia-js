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

export {
  BASE_URL,
  CARTESIA_VERSION,
  constructApiUrl
};
