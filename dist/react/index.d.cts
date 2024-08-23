import Source from '../tts/source.cjs';
import { StreamRequest } from '../types/index.cjs';
import 'emittery';

type UseTTSOptions = {
    apiKey: string | (() => Promise<string>) | null;
    baseUrl?: string;
    sampleRate: number;
    onError?: (error: Error) => void;
};
type PlaybackStatus = 'inactive' | 'playing' | 'paused' | 'finished';
type BufferStatus = 'inactive' | 'buffering' | 'buffered';
type Metrics = {
    modelLatency: number | null;
};
interface UseTTSReturn {
    buffer: (options: StreamRequest) => Promise<void>;
    play: (bufferDuration?: number) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    toggle: () => Promise<void>;
    source: Source | null;
    playbackStatus: PlaybackStatus;
    bufferStatus: BufferStatus;
    isWaiting: boolean;
    isConnected: boolean;
    metrics: Metrics;
}
/**
 * React hook to use the Cartesia audio API.
 */
declare function useTTS({ apiKey, baseUrl, sampleRate, onError, }: UseTTSOptions): UseTTSReturn;

export { type BufferStatus, type Metrics, type PlaybackStatus, type UseTTSOptions, type UseTTSReturn, useTTS };
