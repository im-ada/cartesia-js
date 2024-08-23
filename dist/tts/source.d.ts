import * as emittery from 'emittery';
import { Encoding, SourceEventData, TypedArray } from '../types/index.js';

type EncodingInfo = {
    arrayType: Float32ArrayConstructor | Int16ArrayConstructor | Uint8ArrayConstructor;
    bytesPerElement: number;
};
declare const ENCODING_MAP: Record<Encoding, EncodingInfo>;
declare class Source {
    #private;
    on: <Name extends keyof SourceEventData | keyof emittery.OmnipresentEventData>(eventName: Name | readonly Name[], listener: (eventData: (SourceEventData & emittery.OmnipresentEventData)[Name]) => void | Promise<void>) => emittery.UnsubscribeFunction;
    once: <Name extends keyof SourceEventData | keyof emittery.OmnipresentEventData>(eventName: Name | readonly Name[]) => emittery.EmitteryOncePromise<(SourceEventData & emittery.OmnipresentEventData)[Name]>;
    events: <Name extends keyof SourceEventData>(eventName: Name | readonly Name[]) => AsyncIterableIterator<SourceEventData[Name]>;
    off: <Name extends keyof SourceEventData | keyof emittery.OmnipresentEventData>(eventName: Name | readonly Name[], listener: (eventData: (SourceEventData & emittery.OmnipresentEventData)[Name]) => void | Promise<void>) => void;
    /**
     * Create a new Source.
     *
     * @param options - Options for the Source.
     * @param options.sampleRate - The sample rate of the audio.
     */
    constructor({ sampleRate, encoding, container, }: {
        sampleRate: number;
        encoding: string;
        container: string;
    });
    get sampleRate(): number;
    get encoding(): Encoding;
    get container(): string;
    /**
     * Append audio to the buffer.
     *
     * @param src The audio to append.
     */
    enqueue(src: TypedArray): Promise<void>;
    /**
     * Read audio from the buffer.
     *
     * @param dst The buffer to read the audio into.
     * @returns The number of samples read. If the source is closed, this will be
     * less than the length of the provided buffer.
     */
    read(dst: TypedArray): Promise<number>;
    /**
     * Get the number of samples in a given duration.
     *
     * @param durationSecs The duration in seconds.
     * @returns The number of samples.
     */
    durationToSampleCount(durationSecs: number): number;
    get buffer(): TypedArray;
    get readIndex(): number;
    get writeIndex(): number;
    /**
     * Close the source. This signals that no more audio will be enqueued.
     *
     * This will emit a "close" event.
     *
     * @returns A promise that resolves when the source is closed.
     */
    close(): Promise<void>;
}

export { ENCODING_MAP, Source as default };
