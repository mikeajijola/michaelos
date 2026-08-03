"use client";

import { voiceStatusText, type NaviVoiceState } from "@/navi/voice/types";

export type NaviVoiceViewModel = {
  state: NaviVoiceState;
  transcript: string;
  inputLevel: number;
  muted: boolean;
  error?: string;
  capabilitySequence?: string;
  setMuted: (value: boolean) => void;
  interrupt: () => void;
  stop: () => void;
};

export function NaviVoiceSurface({ voice }: { voice: NaviVoiceViewModel }) {
  const glow = 0.7 + voice.inputLevel * 0.55;
  return (
    <div
      className={`navi-voice navi-voice-${voice.state}`}
      style={
        {
          "--navi-glow": `${Math.round(4 + glow * 7)}px`,
          "--navi-blur": `${Math.round(20 + glow * 16)}px`,
          "--navi-scale": 0.96 + glow * 0.04,
        } as React.CSSProperties
      }
      aria-live="polite"
    >
      <div className="navi-voice-orb" aria-hidden="true">
        <span>N</span>
      </div>
      <p className="navi-voice-status">
        {voiceStatusText(voice.state, voice.muted)}
      </p>
      <p className="navi-voice-transcript">
        {voice.error ?? (voice.transcript || "What do you need?")}
      </p>
      {voice.capabilitySequence && (
        <div className="navi-voice-capability" role="status">
          <span>Capability</span>
          <code>{voice.capabilitySequence}</code>
        </div>
      )}
      <div className="navi-voice-actions">
        <button onClick={() => voice.setMuted(!voice.muted)}>
          {voice.muted ? "Unmute" : "Mute"}
        </button>
        {(voice.state === "speaking" || voice.state === "executing") && (
          <button onClick={voice.interrupt}>Interrupt</button>
        )}
        <button onClick={voice.stop}>Return to text</button>
      </div>
    </div>
  );
}
