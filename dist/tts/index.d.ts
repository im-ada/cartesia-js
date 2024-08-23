import { Client } from '../lib/client.js';
import { WebSocketOptions } from '../types/index.js';
import WebSocket from './websocket.js';
import 'emittery';
import 'partysocket';
import './source.js';

declare class TTS extends Client {
    /**
     * Get a WebSocket client for streaming audio from the TTS API.
     *
     * @returns {WebSocket} A Cartesia WebSocket client.
     */
    websocket(options: WebSocketOptions): WebSocket;
}

export { TTS as default };
