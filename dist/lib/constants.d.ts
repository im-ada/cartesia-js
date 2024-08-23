declare const BASE_URL = "https://api.cartesia.ai";
declare const CARTESIA_VERSION = "2024-06-10";
/**
 * Construct a URL for the Cartesia API.
 *
 * @param baseUrl The base URL for the API.
 * @param path The path to append to the base URL.
 * @param options Options for the URL.
 * @param options.websocket Whether to use the WebSocket protocol.
 * @returns A URL object.
 */
declare const constructApiUrl: (baseUrl: string, path: string, { websocket }?: {
    websocket?: boolean | undefined;
}) => URL;

export { BASE_URL, CARTESIA_VERSION, constructApiUrl };
