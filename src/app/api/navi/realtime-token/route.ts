import { GoogleGenAI, Modality } from "@google/genai";
import {
  DEFAULT_NAVI_REALTIME_MODEL,
  DEFAULT_NAVI_REALTIME_VOICE,
  NAVI_REALTIME_SYSTEM_INSTRUCTION,
  NAVI_REALTIME_TOOL,
} from "@/navi/voice/config";
import { NAVI_VOICE_MAX_SESSION_MS } from "@/navi/voice/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function disabled() {
  return (
    process.env.NAVI_VOICE_ENABLED === "false" ||
    process.env.NAVI_VOICE_KILL_SWITCH === "true" ||
    process.env.NEXT_PUBLIC_NAVI_VOICE_KILL_SWITCH === "true"
  );
}

export async function POST() {
  if (disabled())
    return Response.json(
      { error: "Voice mode is temporarily unavailable." },
      { status: 503 },
    );

  const apiKey =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GOOGLE_API_KEY;
  if (!apiKey)
    return Response.json(
      { error: "Voice mode is not configured." },
      { status: 503 },
    );

  const model =
    process.env.NAVI_REALTIME_MODEL ?? DEFAULT_NAVI_REALTIME_MODEL;
  const voice =
    process.env.NAVI_REALTIME_VOICE ?? DEFAULT_NAVI_REALTIME_VOICE;
  const now = Date.now();
  const config = {
    responseModalities: [Modality.AUDIO],
    speechConfig: {
      voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
    },
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    systemInstruction: NAVI_REALTIME_SYSTEM_INSTRUCTION,
    tools: [{ functionDeclarations: [NAVI_REALTIME_TOOL] }],
  };
  try {
    const client = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: "v1alpha" },
    });
    const token = await client.authTokens.create({
      config: {
        uses: 1,
        newSessionExpireTime: new Date(now + 60_000).toISOString(),
        expireTime: new Date(now + NAVI_VOICE_MAX_SESSION_MS).toISOString(),
        liveConnectConstraints: { model, config },
        httpOptions: { apiVersion: "v1alpha" },
      },
    });
    if (!token.name) throw new Error("Token provisioning returned no token.");
    return Response.json(
      {
        token: token.name,
        model,
        voice,
        expiresAt: new Date(now + NAVI_VOICE_MAX_SESSION_MS).toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Navi realtime token provisioning failed", error);
    return Response.json(
      { error: "Voice mode could not connect. Please try again." },
      { status: 502 },
    );
  }
}
