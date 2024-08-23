import Source from './source.js';
import 'emittery';
import '../types/index.js';

declare class Player {
    #private;
    /**
     * Create a new Player.
     *
     * @param options - Options for the Player.
     * @param options.bufferDuration - The duration of the audio buffer to play.
     */
    constructor({ bufferDuration }: {
        bufferDuration: number;
    });
    /**
     * Play audio from a source.
     *
     * @param source The source to play audio from.
     * @returns A promise that resolves when the audio has finished playing.
     */
    play(source: Source): Promise<void>;
    /**
     * Pause the audio.
     *
     * @returns A promise that resolves when the audio has been paused.
     */
    pause(): Promise<void>;
    /**
     * Resume the audio.
     *
     * @returns A promise that resolves when the audio has been resumed.
     */
    resume(): Promise<void>;
    /**
     * Toggle the audio.
     *
     * @returns A promise that resolves when the audio has been toggled.
     */
    toggle(): Promise<void>;
    /**
     * Stop the audio.
     *
     * @returns A promise that resolves when the audio has been stopped.
     */
    stop(): Promise<void>;
}

export { Player as default };
