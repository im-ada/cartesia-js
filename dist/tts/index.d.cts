import { Client } from '../lib/client.cjs';
import { WebSocketOptions } from '../types/index.cjs';
import WebSocket from './websocket.cjs';
import 'emittery';
import 'partysocket';
import './source.cjs';

declare class TTS extends Client {
    /**
     * Get a WebSocket client for streaming audio from the TTS API.
     *
     * @returns {WebSocket} A Cartesia WebSocket client.
     */
    websocket(options: WebSocketOptions): WebSocket;
}

export { TTS as default };
