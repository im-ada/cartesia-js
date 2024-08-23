import TTS from '../tts/index.js';
import { ClientOptions } from '../types/index.js';
import Voices from '../voices/index.js';
import { Client } from './client.js';
import '../tts/websocket.js';
import 'emittery';
import 'partysocket';
import '../tts/source.js';

declare class Cartesia extends Client {
    tts: TTS;
    voices: Voices;
    constructor(options?: ClientOptions);
}

export { Cartesia };
