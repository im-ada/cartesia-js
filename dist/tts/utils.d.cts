import emittery__default from 'emittery';
import { Chunk, TypedArray, WebSocketResponse, Sentinel, EmitteryCallbacks } from '../types/index.cjs';

/**
 * Convert base64-encoded audio buffer(s) to a TypedArray.
 *
 * @param b64 The base64-encoded audio buffer, or an array of base64-encoded
 * audio buffers.
 * @param encoding The encoding of the audio buffer(s).
 * @returns The audio buffer(s) as a TypedArray.
 */
declare function base64ToArray(b64: Chunk[], encoding: string): TypedArray;
/**
 * Schedule an audio buffer to play at a given time in the passed context.
 *
 * @param floats The audio buffer to play.
 * @param context The audio context to play the buffer in.
 * @param startAt The time to start playing the buffer at.
 * @param sampleRate The sample rate of the audio.
 * @returns A promise that resolves when the audio has finished playing.
 */
declare function playAudioBuffer(floats: Float32Array, context: AudioContext, startAt: number, sampleRate: number): Promise<void>;
/**
 * Unwraps a chunk of audio data from a message event and calls the
 * handler with it if the context ID matches.
 *
 * @param contextId The context ID to listen for.
 * @param handler The handler to call with the chunk of audio data.
 * @returns A message event handler.
 */
declare function createMessageHandlerForContextId(contextId: string, handler: ({ chunk, message, }: {
    chunk?: Chunk;
    message: string;
    data: WebSocketResponse;
}) => void): (event: MessageEvent) => void;
/**
 * Get a sentinel value that indicates the end of a stream.
 * @returns A sentinel value to indicate the end of a stream.
 */
declare function getSentinel(): Sentinel;
/**
 * Check if a chunk is a sentinel value (i.e. null).
 *
 * @param chunk
 * @returns Whether the chunk is a sentinel value.
 */
declare function isSentinel(x: unknown): x is Sentinel;
/**
 * Filter out null values from a collection.
 *
 * @param collection The collection to filter.
 * @returns The collection with null values removed.
 */
declare function filterSentinel<T>(collection: T[]): Exclude<T, Sentinel>[];
/**
 * Check if an array of chunks is complete by testing if the last chunk is a sentinel
 * value (i.e. null).
 * @param chunk
 * @returns Whether the array of chunks is complete.
 */
declare function isComplete(chunks: Chunk[]): boolean;
/**
 * Get user-facing emitter callbacks for an Emittery instance.
 * @param emitter The Emittery instance to get callbacks for.
 * @returns User-facing emitter callbacks.
 */
declare function getEmitteryCallbacks<T>(emitter: emittery__default<T>): EmitteryCallbacks<T>;

export { base64ToArray, createMessageHandlerForContextId, filterSentinel, getEmitteryCallbacks, getSentinel, isComplete, isSentinel, playAudioBuffer };
