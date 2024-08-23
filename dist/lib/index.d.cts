import TTS from '../tts/index.cjs';
import { ClientOptions } from '../types/index.cjs';
import Voices from '../voices/index.cjs';
import { Client } from './client.cjs';
import '../tts/websocket.cjs';
import 'emittery';
import 'partysocket';
import '../tts/source.cjs';

declare class Cartesia extends Client {
    tts: TTS;
    voices: Voices;
    constructor(options?: ClientOptions);
}

export { Cartesia };
