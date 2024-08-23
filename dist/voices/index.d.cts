import { Client } from '../lib/client.cjs';
import { Voice, CreateVoice, UpdateVoice, CloneOptions, CloneResponse, MixVoicesOptions, MixVoicesResponse } from '../types/index.cjs';
import 'emittery';

declare class Voices extends Client {
    list(): Promise<Voice[]>;
    get(voiceId: string): Promise<Voice>;
    create(voice: CreateVoice): Promise<Voice>;
    update(id: string, voice: UpdateVoice): Promise<Voice>;
    clone(options: CloneOptions): Promise<CloneResponse>;
    mix(options: MixVoicesOptions): Promise<MixVoicesResponse>;
}

export { Voices as default };
