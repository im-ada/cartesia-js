import emittery__default from 'emittery';

interface ClientOptions {
    apiKey?: string | (() => Promise<string>);
    baseUrl?: string;
}
type Sentinel = null;
type Chunk = string | Sentinel;
type ConnectionEventData = {
    open: never;
    close: never;
};
type VoiceSpecifier = {
    mode?: "id";
    id: string;
} | {
    mode?: "embedding";
    embedding: number[];
};
type Emotion = "anger" | "sadness" | "positivity" | "curiosity" | "surprise";
type Intensity = "lowest" | "low" | "high" | "highest";
type EmotionControl = Emotion | `${Emotion}:${Intensity}`;
type VoiceOptions = VoiceSpecifier & {
    __experimental_controls?: {
        speed?: "slowest" | "slow" | "normal" | "fast" | "fastest" | number;
        emotion?: EmotionControl[];
    };
};
type StreamRequest = {
    model_id: string;
    transcript: string;
    voice: VoiceOptions;
    output_format?: {
        container: string;
        encoding: string;
        sample_rate: number;
    };
    context_id?: string;
    continue?: boolean;
    duration?: number;
    language?: string;
    add_timestamps?: boolean;
};
type StreamOptions = {
    timeout?: number;
};
type WebSocketBaseResponse = {
    context_id: string;
    status_code: number;
    done: boolean;
};
type WordTimestamps = {
    words: string[];
    start: number[];
    end: number[];
};
type WebSocketTimestampsResponse = WebSocketBaseResponse & {
    type: "timestamps";
    word_timestamps: WordTimestamps;
};
type WebSocketChunkResponse = WebSocketBaseResponse & {
    type: "chunk";
    data: string;
    step_time: number;
};
type WebSocketErrorResponse = WebSocketBaseResponse & {
    type: "error";
    error: string;
};
type WebSocketResponse = WebSocketTimestampsResponse | WebSocketChunkResponse | WebSocketErrorResponse;
type EmitteryCallbacks<T> = {
    on: emittery__default<T>["on"];
    off: emittery__default<T>["off"];
    once: emittery__default<T>["once"];
    events: emittery__default<T>["events"];
};
type CloneOptions = {
    mode: "url";
    link: string;
    enhance?: boolean;
} | {
    mode: "clip";
    clip: Blob;
    enhance?: boolean;
};
interface VoiceToMix {
    id?: string;
    embedding?: number[];
    weight: number;
}
interface MixVoicesOptions {
    voices: VoiceToMix[];
}
type Voice = {
    id: string;
    name: string;
    description: string;
    embedding: number[];
    is_public: boolean;
    user_id: string;
    created_at: string;
    language: string;
};
type CreateVoice = Pick<Voice, "name" | "description" | "embedding"> & Partial<Omit<Voice, "name" | "description" | "embedding">>;
type UpdateVoice = Partial<Pick<Voice, "name" | "description" | "embedding">>;
type CloneResponse = {
    embedding: number[];
};
type MixVoicesResponse = {
    embedding: number[];
};
type WebSocketOptions = {
    container?: string;
    encoding?: string;
    sampleRate: number;
};
type SourceEventData = {
    enqueue: never;
    close: never;
    wait: never;
    read: never;
};
type TypedArray = Float32Array | Int16Array | Uint8Array;
type Encoding = "pcm_f32le" | "pcm_s16le" | "pcm_alaw" | "pcm_mulaw";

export type { Chunk, ClientOptions, CloneOptions, CloneResponse, ConnectionEventData, CreateVoice, EmitteryCallbacks, Emotion, EmotionControl, Encoding, Intensity, MixVoicesOptions, MixVoicesResponse, Sentinel, SourceEventData, StreamOptions, StreamRequest, TypedArray, UpdateVoice, Voice, VoiceOptions, VoiceSpecifier, VoiceToMix, WebSocketBaseResponse, WebSocketChunkResponse, WebSocketErrorResponse, WebSocketOptions, WebSocketResponse, WebSocketTimestampsResponse, WordTimestamps };
