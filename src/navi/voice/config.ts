export const DEFAULT_NAVI_REALTIME_MODEL =
  "gemini-3.1-flash-live-preview";
export const DEFAULT_NAVI_REALTIME_VOICE = "Kore";

export const NAVI_REALTIME_SYSTEM_INSTRUCTION = `You are Navi's realtime voice input layer for MichaelOS.
Listen for a visitor's navigation or retrieval request, then call submit_navigation_request with their complete wording.
Do not claim navigation or capability success before the browser returns a tool result.
After a successful tool result, confirm it briefly and naturally. Never mention transport, channels, providers, structured proposals, or raw events.
You cannot manipulate the browser, DOM, SQLite, routes, or capability code.`;

export const NAVI_REALTIME_TOOL = {
  name: "submit_navigation_request",
  description:
    "Submit the visitor's complete request to the browser-owned Navi controller for validation and read-only capability execution.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      request: {
        type: "string",
        description: "The visitor's complete navigation or retrieval request.",
      },
    },
    required: ["request"],
    additionalProperties: false,
  },
} as const;
