"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createNaviRealtimeAdapter } from "./gemini-live-adapter";
import {
  naviVoiceEnabled,
  type NaviRealtimeAdapter,
  type NaviVoiceRequestResult,
  type NaviVoiceState,
} from "./types";

export function useNaviVoice(
  handleRequest: (request: string) => Promise<NaviVoiceRequestResult>,
  createAdapter: () => NaviRealtimeAdapter = createNaviRealtimeAdapter,
) {
  const adapter = useRef<NaviRealtimeAdapter | null>(null);
  const requestHandler = useRef(handleRequest);
  requestHandler.current = handleRequest;
  const [state, setState] = useState<NaviVoiceState>("inactive");
  const [transcript, setTranscript] = useState("");
  const [inputLevel, setInputLevel] = useState(0);
  const [muted, setMutedState] = useState(false);
  const [error, setError] = useState<string>();
  const [capabilitySequence, setCapabilitySequence] = useState<string>();
  const sequenceTimer = useRef<number | undefined>(undefined);
  const enabled = naviVoiceEnabled({
    NEXT_PUBLIC_NAVI_VOICE_ENABLED:
      process.env.NEXT_PUBLIC_NAVI_VOICE_ENABLED,
    NEXT_PUBLIC_NAVI_VOICE_KILL_SWITCH:
      process.env.NEXT_PUBLIC_NAVI_VOICE_KILL_SWITCH,
  });

  const stop = useCallback(
    (reason: "user" | "panel-close" | "timeout" | "inactivity" = "user") => {
      adapter.current?.stop(reason);
      adapter.current = null;
      setState("inactive");
      setInputLevel(0);
      setMutedState(false);
      if (sequenceTimer.current) clearTimeout(sequenceTimer.current);
    },
    [],
  );

  const start = useCallback(async () => {
    if (!enabled || state !== "inactive") return;
    setError(undefined);
    setTranscript("");
    const next = createAdapter();
    adapter.current = next;
    await next.start({
      onState: setState,
      onTranscript: (text) => setTranscript(text.slice(-180)),
      onInputLevel: setInputLevel,
      onCapabilityResult: (result) => {
        setTranscript(result.text.slice(-180));
        const sequence = result.trace
          .map((entry) => entry.actionKeys ?? entry.capabilityId)
          .join("  →  ");
        if (sequence) {
          setCapabilitySequence(sequence);
          if (sequenceTimer.current) clearTimeout(sequenceTimer.current);
          sequenceTimer.current = window.setTimeout(
            () => setCapabilitySequence(undefined),
            5_000,
          );
        }
      },
      onError: (message) => setError(message),
      handleRequest: (request) => requestHandler.current(request),
    });
  }, [createAdapter, enabled, state]);

  const setMuted = useCallback((value: boolean) => {
    adapter.current?.setMuted(value);
    setMutedState(value);
  }, []);

  const interrupt = useCallback(() => adapter.current?.interrupt(), []);

  useEffect(() => () => stop("panel-close"), [stop]);

  return useMemo(
    () => ({
      enabled,
      state,
      active: state !== "inactive" && state !== "error",
      transcript,
      inputLevel,
      muted,
      error,
      capabilitySequence,
      start,
      stop,
      setMuted,
      interrupt,
    }),
    [
      capabilitySequence,
      enabled,
      error,
      inputLevel,
      interrupt,
      muted,
      setMuted,
      start,
      state,
      stop,
      transcript,
    ],
  );
}
