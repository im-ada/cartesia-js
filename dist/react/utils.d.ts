/**
 * Ping the server to calculate the round-trip time. This is useful for buffering audio in high-latency environments.
 * @param url The URL to ping.
 */
declare function pingServer(url: string): Promise<number>;

export { pingServer };
