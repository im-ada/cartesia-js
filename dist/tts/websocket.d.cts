import * as emittery from 'emittery';
import { WebSocket as WebSocket$1 } from 'partysocket';
import { Client } from '../lib/client.cjs';
import { WebSocketOptions, StreamRequest, StreamOptions, WordTimestamps, EmitteryCallbacks, ConnectionEventData } from '../types/index.cjs';
import Source from './source.cjs';

declare class WebSocket extends Client {
    #private;
    socket?: WebSocket$1;
    /**
     * Create a new WebSocket client.
     *
     * @param args - Arguments to pass to the Client constructor.
     */
    constructor({ sampleRate, container, encoding }: WebSocketOptions, ...args: ConstructorParameters<typeof Client>);
    /**
     * Send a message over the WebSocket to start a stream.
     *
     * @param inputs - Stream options. Defined in the StreamRequest type.
     * @param options - Options for the stream.
     * @param options.timeout - The maximum time to wait for a chunk before cancelling the stream.
     *                          If set to `0`, the stream will not time out.
     * @returns A Source object that can be passed to a Player to play the audio.
     * @returns An Emittery instance that emits messages from the WebSocket.
     * @returns An abort function that can be called to cancel the stream.
     */
    send({ ...inputs }: StreamRequest, { timeout }?: StreamOptions): {
        stop: {
            (reason?: any): void;
            (reason?: any): void;
        };
        on: <Name extends "timestamps" | keyof emittery.OmnipresentEventData | "message">(eventName: Name | readonly Name[], listener: (eventData: ({
            message: string;
            timestamps: WordTimestamps;
        } & emittery.OmnipresentEventData)[Name]) => void | Promise<void>) => emittery.UnsubscribeFunction;
        off: <Name extends "timestamps" | keyof emittery.OmnipresentEventData | "message">(eventName: Name | readonly Name[], listener: (eventData: ({
            message: string;
            timestamps: WordTimestamps;
        } & emittery.OmnipresentEventData)[Name]) => void | Promise<void>) => void;
        once: <Name extends "timestamps" | keyof emittery.OmnipresentEventData | "message">(eventName: Name | readonly Name[]) => emittery.EmitteryOncePromise<({
            message: string;
            timestamps: WordTimestamps;
        } & emittery.OmnipresentEventData)[Name]>;
        events: <Name extends "timestamps" | "message">(eventName: Name | readonly Name[]) => AsyncIterableIterator<{
            message: string;
            timestamps: WordTimestamps;
        }[Name]>;
        source: Source;
    };
    /**
     * Authenticate and connect to a Cartesia streaming WebSocket.
     *
     * @returns A promise that resolves when the WebSocket is connected.
     * @throws {Error} If the WebSocket fails to connect.
     */
    connect(): Promise<EmitteryCallbacks<ConnectionEventData>>;
    /**
     * Disconnect from the Cartesia streaming WebSocket.
     */
    disconnect(): void;
}

export { WebSocket as default };
