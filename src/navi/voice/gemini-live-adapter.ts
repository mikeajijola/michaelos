import type { LiveServerMessage, Session } from "@google/genai";
import {
  DEFAULT_NAVI_REALTIME_VOICE,
  NAVI_REALTIME_SYSTEM_INSTRUCTION,
  NAVI_REALTIME_TOOL,
} from "./config";
import {
  friendlyVoiceError,
  NAVI_VOICE_INACTIVITY_MS,
  NAVI_VOICE_MAX_SESSION_MS,
  type NaviRealtimeAdapter,
  type NaviRealtimeCallbacks,
  type NaviVoiceState,
} from "./types";

let activeAdapter: GeminiLiveNaviAdapter | null = null;

type TokenResponse = {
  token: string;
  model: string;
  voice?: string;
  expiresAt: string;
};

function floatToBase64(input: Float32Array) {
  const bytes = new Uint8Array(input.length * 2);
  const view = new DataView(bytes.buffer);
  for (let index = 0; index < input.length; index++) {
    const sample = Math.max(-1, Math.min(1, input[index]));
    view.setInt16(
      index * 2,
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true,
    );
  }
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToFloat(value: string) {
  const binary = atob(value);
  const view = new DataView(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index++)
    view.setUint8(index, binary.charCodeAt(index));
  const result = new Float32Array(Math.floor(binary.length / 2));
  for (let index = 0; index < result.length; index++)
    result[index] = view.getInt16(index * 2, true) / 0x8000;
  return result;
}

export class GeminiLiveNaviAdapter implements NaviRealtimeAdapter {
  readonly provider = "google-gemini-live" as const;
  model = "configurable-gemini-live";
  private callbacks?: NaviRealtimeCallbacks;
  private session?: Session;
  private stream?: MediaStream;
  private inputContext?: AudioContext;
  private outputContext?: AudioContext;
  private processor?: ScriptProcessorNode;
  private inputSource?: MediaStreamAudioSourceNode;
  private silentGain?: GainNode;
  private playing = new Set<AudioBufferSourceNode>();
  private muted = false;
  private stopped = true;
  private smoothedLevel = 0;
  private sessionTimer?: number;
  private inactivityTimer?: number;
  private state: NaviVoiceState = "inactive";
  private playbackTime = 0;
  private awaitingOpening = false;
  private openingTurnComplete = false;
  private openingTimer?: number;

  private setState(state: NaviVoiceState) {
    this.state = state;
    this.callbacks?.onState(state);
  }

  async start(callbacks: NaviRealtimeCallbacks) {
    if (activeAdapter && activeAdapter !== this)
      activeAdapter.stop("user");
    activeAdapter = this;
    this.callbacks = callbacks;
    this.stopped = false;
    this.setState("requesting-permission");
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (this.stopped) return;
      this.setState("connecting");
      const response = await fetch("/api/navi/realtime-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const payload = (await response.json()) as TokenResponse & {
        error?: string;
      };
      if (!response.ok || !payload.token)
        throw new Error(payload.error ?? "Realtime token unavailable.");
      this.model = payload.model;
      const { GoogleGenAI, Modality } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: payload.token,
        httpOptions: { apiVersion: "v1alpha" },
      });
      this.session = await ai.live.connect({
        model: payload.model,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: payload.voice ?? DEFAULT_NAVI_REALTIME_VOICE,
              },
            },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: NAVI_REALTIME_SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: [NAVI_REALTIME_TOOL] }],
        },
        callbacks: {
          onopen: () => undefined,
          onmessage: (message) => this.receive(message),
          onerror: (event) => this.fail(event.error ?? event),
          onclose: () => {
            if (!this.stopped)
              this.fail(new Error("Realtime connection closed."));
          },
        },
      });
      if (this.stopped) return this.session.close();
      this.sessionTimer = window.setTimeout(
        () => this.stop("timeout"),
        NAVI_VOICE_MAX_SESSION_MS,
      );
      this.requestOpening();
    } catch (error) {
      this.fail(error);
    }
  }

  private requestOpening() {
    if (!this.session) return;
    this.awaitingOpening = true;
    this.openingTurnComplete = false;
    this.setState("speaking");
    this.callbacks?.onTranscript("How can I help?", true);
    this.session.sendClientContent({
      turns: [
        {
          role: "user",
          parts: [{ text: 'Say exactly: "How can I help?"' }],
        },
      ],
      turnComplete: true,
    });
    this.openingTimer = window.setTimeout(() => {
      this.awaitingOpening = false;
      if (!this.stopped) this.startCapture();
    }, 8_000);
  }

  private finishOpening() {
    if (
      !this.awaitingOpening ||
      !this.openingTurnComplete ||
      this.playing.size
    )
      return;
    this.awaitingOpening = false;
    if (this.openingTimer) clearTimeout(this.openingTimer);
    if (!this.stopped) this.startCapture();
  }

  private startCapture() {
    if (!this.stream || !this.session || this.muted || this.processor) return;
    this.inputContext = new AudioContext({ sampleRate: 16_000 });
    this.inputSource = this.inputContext.createMediaStreamSource(this.stream);
    this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);
    this.silentGain = this.inputContext.createGain();
    this.silentGain.gain.value = 0;
    this.inputSource.connect(this.processor);
    this.processor.connect(this.silentGain);
    this.silentGain.connect(this.inputContext.destination);
    this.processor.onaudioprocess = (event) => {
      if (this.muted || this.stopped || !this.session) return;
      const values = event.inputBuffer.getChannelData(0);
      let sum = 0;
      for (const value of values) sum += value * value;
      const rms = Math.sqrt(sum / values.length);
      this.smoothedLevel = this.smoothedLevel * 0.82 + rms * 0.18;
      this.callbacks?.onInputLevel(Math.min(1, this.smoothedLevel * 7));
      if (this.smoothedLevel > 0.012) this.resetInactivity();
      this.session.sendRealtimeInput({
        audio: {
          data: floatToBase64(values),
          mimeType: `audio/pcm;rate=${this.inputContext?.sampleRate ?? 16000}`,
        },
      });
    };
    this.setState("listening");
    this.resetInactivity();
  }

  private stopCapture() {
    if (this.processor) this.processor.onaudioprocess = null;
    this.processor?.disconnect();
    this.inputSource?.disconnect();
    this.silentGain?.disconnect();
    void this.inputContext?.close();
    this.processor = undefined;
    this.inputSource = undefined;
    this.silentGain = undefined;
    this.inputContext = undefined;
    this.callbacks?.onInputLevel(0);
  }

  private resetInactivity() {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    this.inactivityTimer = window.setTimeout(
      () => this.stop("inactivity"),
      NAVI_VOICE_INACTIVITY_MS,
    );
  }

  private receive(message: LiveServerMessage) {
    if (this.stopped) return;
    const content = message.serverContent;
    const interim = content?.interimInputTranscription?.text;
    const final = content?.inputTranscription?.text;
    const output = content?.outputTranscription?.text;
    if (interim) {
      this.callbacks?.onTranscript(interim, false);
      this.resetInactivity();
    }
    if (final) {
      this.callbacks?.onTranscript(final, true);
      this.setState("interpreting");
      this.resetInactivity();
    }
    if (output) {
      this.callbacks?.onTranscript(output, content?.turnComplete ?? false);
      this.setState("speaking");
    }
    if (content?.interrupted) {
      this.stopPlayback();
      this.setState("interrupted");
      window.setTimeout(() => {
        if (!this.stopped) this.setState("listening");
      }, 180);
    }
    for (const part of content?.modelTurn?.parts ?? []) {
      const audio = part.inlineData;
      if (audio?.data && audio.mimeType?.startsWith("audio/"))
        this.playAudio(audio.data, audio.mimeType);
    }
    if (content?.turnComplete && this.awaitingOpening) {
      this.openingTurnComplete = true;
      this.finishOpening();
    } else if (content?.turnComplete && !this.playing.size) {
      this.setState("listening");
    }
    for (const call of message.toolCall?.functionCalls ?? [])
      void this.handleToolCall(call.id, call.name, call.args);
  }

  private async handleToolCall(
    id?: string,
    name?: string,
    args: Record<string, unknown> = {},
  ) {
    if (
      name !== "submit_navigation_request" ||
      typeof args.request !== "string" ||
      !args.request.trim()
    ) {
      this.session?.sendToolResponse({
        functionResponses: {
          id,
          name: name ?? "unknown",
          response: { error: "Request not available." },
        },
      });
      return;
    }
    this.setState("executing");
    try {
      const result = await this.callbacks!.handleRequest(args.request.trim());
      this.callbacks?.onCapabilityResult(result);
      this.session?.sendToolResponse({
        functionResponses: {
          id,
          name,
          response: {
            output: result.text,
            status: result.failed ? "error" : "success",
          },
        },
      });
      this.setState("speaking");
    } catch (error) {
      this.session?.sendToolResponse({
        functionResponses: {
          id,
          name,
          response: { error: "The browser could not complete that request." },
        },
      });
      this.fail(error);
    }
  }

  private playAudio(data: string, mimeType: string) {
    this.setState("speaking");
    this.outputContext ??= new AudioContext();
    const values = base64ToFloat(data);
    const rate = Number(/rate=(\d+)/.exec(mimeType)?.[1] ?? 24_000);
    const buffer = this.outputContext.createBuffer(1, values.length, rate);
    buffer.copyToChannel(values, 0);
    const source = this.outputContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputContext.destination);
    this.playing.add(source);
    source.onended = () => {
      this.playing.delete(source);
      if (this.awaitingOpening) this.finishOpening();
      else if (!this.playing.size && !this.stopped) this.setState("listening");
    };
    const startAt = Math.max(this.outputContext.currentTime, this.playbackTime);
    source.start(startAt);
    this.playbackTime = startAt + buffer.duration;
  }

  private stopPlayback() {
    for (const source of this.playing) {
      try {
        source.stop();
      } catch {}
    }
    this.playing.clear();
    this.playbackTime = 0;
    window.speechSynthesis?.cancel();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    for (const track of this.stream?.getAudioTracks() ?? [])
      track.enabled = !muted;
    if (muted) {
      this.session?.sendRealtimeInput({ audioStreamEnd: true });
      this.stopCapture();
    } else if (!this.stopped) this.startCapture();
  }

  interrupt() {
    if (this.stopped) return;
    this.stopPlayback();
    this.session?.sendRealtimeInput({ activityStart: {} });
    this.setState("interrupted");
    window.setTimeout(() => {
      if (!this.stopped) this.setState("listening");
    }, 180);
  }

  stop(_reason: "user" | "panel-close" | "timeout" | "inactivity" = "user") {
    if (this.stopped) return;
    this.stopped = true;
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    if (this.openingTimer) clearTimeout(this.openingTimer);
    this.stopCapture();
    this.stopPlayback();
    for (const track of this.stream?.getTracks() ?? []) track.stop();
    this.stream = undefined;
    this.session?.close();
    this.session = undefined;
    void this.outputContext?.close();
    this.outputContext = undefined;
    if (activeAdapter === this) activeAdapter = null;
    this.setState("inactive");
  }

  private fail(error: unknown) {
    if (this.stopped) return;
    console.error("Navi voice session error", error);
    this.stop("user");
    this.setState("error");
    this.callbacks?.onError(friendlyVoiceError(error), error);
  }
}

export function createNaviRealtimeAdapter(): NaviRealtimeAdapter {
  return new GeminiLiveNaviAdapter();
}
