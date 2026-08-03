# Navi Voice Mode

Navi Voice Mode is another input client of the shared Navi controller. It does not execute capabilities inside a remote model. A realtime voice turn submits the visitor's complete request to the browser-owned controller, which validates and executes only registry-approved, read-only `navigator` capabilities. Text and voice therefore share the same conversation, structured references, execution history and Capability Trace.

## Provider boundary

The provider-neutral `NaviRealtimeAdapter` interface owns connection, capture, playback, mute, interruption and shutdown. Its first implementation uses Google Gemini Live with a short-lived token.

Vercel AI Gateway added beta realtime support through AI SDK 7 in June 2026, but its current official realtime quickstart and model pages document Gateway tokens for OpenAI realtime models rather than a supported Gemini Live tool flow. Until that combination is documented, MichaelOS uses Google's official browser-safe fallback boundary:

1. `/api/navi/realtime-token` reads the permanent Gemini credential only on the server.
2. The server provisions a single-use token constrained to the configured Gemini Live model and Navi tool configuration.
3. The token can start a session for 60 seconds and expires after the public 180-second session limit.
4. The browser connects directly to Gemini Live with the ephemeral token.
5. The only exposed realtime tool submits natural language back to the browser Navi controller. The existing controller and shared executor remain authoritative.

Official references:

- [Vercel AI Gateway realtime announcement](https://vercel.com/changelog/realtime-voice-speech-and-transcription-now-supported-on-ai-gateway)
- [Google Gemini Live ephemeral tokens](https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens)
- [Google Gemini Live tool use](https://ai.google.dev/gemini-api/docs/live-api/tools)

## Configuration and controls

- `NAVI_REALTIME_MODEL` selects the server-constrained model and defaults to `gemini-3.1-flash-live-preview`.
- `NAVI_REALTIME_VOICE` pins the Gemini Live voice and defaults to `Kore`, so the opening prompt and subsequent responses use one consistent voice.
- `NAVI_VOICE_ENABLED=false` disables token minting.
- `NAVI_VOICE_KILL_SWITCH=true` disables token minting immediately.
- `NEXT_PUBLIC_NAVI_VOICE_ENABLED=false` hides the browser control.
- `NEXT_PUBLIC_NAVI_VOICE_KILL_SWITCH=true` hides the browser control and blocks the server route.

Only one session can be active in a browser context. Sessions stop after 180 seconds, after 45 seconds of inactivity, when the Panel closes, or when the visitor ends Voice Mode. Microphone tracks, audio nodes, playback and the realtime connection are all closed together.

## Visible states

Voice Mode uses explicit `inactive`, `requesting-permission`, `connecting`, `listening`, `interpreting`, `executing`, `speaking`, `interrupted` and `error` states. The interface shows only human-facing status, a restrained transcript, canonical capability sequence and recovery copy. Raw transport and provider events remain out of the conversation UI.
