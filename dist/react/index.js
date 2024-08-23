import {
  Cartesia
} from "../chunk-XY6CKS6T.js";
import "../chunk-QGHHUNOG.js";
import {
  pingServer
} from "../chunk-VTXODD7H.js";
import "../chunk-P3CNDKIS.js";
import "../chunk-3WFDUVYX.js";
import "../chunk-UI42G5AU.js";
import "../chunk-2BFEKY3F.js";
import {
  Player
} from "../chunk-NPI6KF4I.js";
import "../chunk-NJUQO6SE.js";
import "../chunk-IRUPSLVR.js";

// src/react/index.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
var PING_INTERVAL = 5e3;
var DEFAULT_BUFFER_DURATION = 0.01;
function useTTS({
  apiKey,
  baseUrl,
  sampleRate,
  onError
}) {
  if (typeof window === "undefined") {
    return {
      buffer: async () => {
      },
      play: async () => {
      },
      pause: async () => {
      },
      resume: async () => {
      },
      toggle: async () => {
      },
      playbackStatus: "inactive",
      bufferStatus: "inactive",
      isWaiting: false,
      source: null,
      isConnected: false,
      metrics: {
        modelLatency: null
      }
    };
  }
  const websocket = useMemo(() => {
    if (!apiKey) {
      return null;
    }
    const cartesia = new Cartesia({ apiKey, baseUrl });
    baseUrl = baseUrl ?? cartesia.baseUrl;
    return cartesia.tts.websocket({
      container: "raw",
      encoding: "pcm_f32le",
      sampleRate
    });
  }, [apiKey, baseUrl, sampleRate]);
  const websocketReturn = useRef(null);
  const player = useRef(null);
  const [playbackStatus, setPlaybackStatus] = useState("inactive");
  const [bufferStatus, setBufferStatus] = useState("inactive");
  const [isWaiting, setIsWaiting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [bufferDuration, setBufferDuration] = useState(null);
  const [messages, setMessages] = useState([]);
  const buffer = useCallback(
    async (options) => {
      websocketReturn.current?.stop();
      try {
        setMessages([]);
        setBufferStatus("buffering");
        websocketReturn.current = websocket?.send(options) ?? null;
        if (!websocketReturn.current) {
          return;
        }
        const unsubscribe = websocketReturn.current.on("message", (message) => {
          const parsedMessage = JSON.parse(message);
          setMessages((messages2) => [...messages2, parsedMessage]);
          if (parsedMessage.error) {
            onError?.(new Error(parsedMessage.error));
          }
        });
        await websocketReturn.current.source.once("close");
        setBufferStatus("buffered");
        unsubscribe();
      } catch (error) {
        if (error instanceof Error) {
          onError?.(error);
        } else {
          console.error(error);
        }
      }
    },
    [websocket, onError]
  );
  const metrics = useMemo(() => {
    if (messages.length === 0) {
      return {
        modelLatency: null
      };
    }
    const modelLatency = messages[0]?.step_time ?? null;
    return {
      modelLatency: Math.trunc(modelLatency ?? 0)
    };
  }, [messages]);
  useEffect(() => {
    let cleanup = () => {
    };
    async function setupConnection() {
      try {
        const connection = await websocket?.connect();
        if (!connection) {
          return;
        }
        const unsubscribes = [];
        setIsConnected(true);
        unsubscribes.push(
          connection.on("open", () => {
            setIsConnected(true);
          })
        );
        unsubscribes.push(
          connection.on("close", () => {
            setIsConnected(false);
          })
        );
        const intervalId = setInterval(() => {
          if (baseUrl) {
            pingServer(new URL(baseUrl).origin).then((ping) => {
              let bufferDuration2;
              if (ping < 300) {
                bufferDuration2 = 0.01;
              } else if (ping > 1500) {
                bufferDuration2 = 6;
              } else {
                bufferDuration2 = ping / 1e3 * 4;
              }
              setBufferDuration(bufferDuration2);
            });
          }
        }, PING_INTERVAL);
        return () => {
          for (const unsubscribe of unsubscribes) {
            unsubscribe();
          }
          clearInterval(intervalId);
          websocket?.disconnect();
        };
      } catch (e) {
        console.error(e);
      }
    }
    setupConnection().then((cleanupConnection) => {
      cleanup = cleanupConnection;
    });
    return () => cleanup?.();
  }, [websocket, baseUrl]);
  const play = useCallback(async () => {
    try {
      if (playbackStatus === "playing" || !websocketReturn.current) {
        return;
      }
      if (player.current) {
        await player.current.stop();
      }
      setPlaybackStatus("playing");
      const unsubscribes = [];
      unsubscribes.push(
        websocketReturn.current.source.on("wait", () => {
          setIsWaiting(true);
        })
      );
      unsubscribes.push(
        websocketReturn.current.source.on("read", () => {
          setIsWaiting(false);
        })
      );
      player.current = new Player({
        bufferDuration: bufferDuration ?? DEFAULT_BUFFER_DURATION
      });
      await player.current.play(websocketReturn.current.source);
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
      setPlaybackStatus("finished");
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      } else {
        console.error(error);
      }
    }
  }, [playbackStatus, bufferDuration, onError]);
  const pause = useCallback(async () => {
    try {
      await player.current?.pause();
      setPlaybackStatus("paused");
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      } else {
        console.error(error);
      }
    }
  }, [onError]);
  const resume = useCallback(async () => {
    try {
      await player.current?.resume();
      setPlaybackStatus("playing");
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      } else {
        console.error(error);
      }
    }
  }, [onError]);
  const toggle = useCallback(async () => {
    try {
      await player.current?.toggle();
      setPlaybackStatus((status) => {
        if (status === "playing") {
          return "paused";
        }
        if (status === "paused") {
          return "playing";
        }
        return status;
      });
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      } else {
        console.error(error);
      }
    }
  }, [onError]);
  return {
    buffer,
    play,
    pause,
    source: websocketReturn.current?.source ?? null,
    resume,
    toggle,
    playbackStatus,
    bufferStatus,
    isWaiting,
    isConnected,
    metrics
  };
}
export {
  useTTS
};
