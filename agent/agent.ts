import { google } from "@ai-sdk/google";
import { defineAgent } from "eve";

export default defineAgent({
  model: google("gemini-3.6-flash"),
  reasoning: "low",
  limits: {
    maxOutputTokensPerSession: 12_000,
    sessionTimeoutMs: 24 * 60 * 60 * 1_000,
  },
});
