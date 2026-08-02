import type { LilySession } from "./types";
export const LILY_SESSION_KEY = "michaelos:lily:session:v1";
export function loadLilySession(): LilySession | null {
  try {
    const value = JSON.parse(localStorage.getItem(LILY_SESSION_KEY) ?? "null");
    return value &&
      typeof value.id === "string" &&
      Array.isArray(value.messages) &&
      Array.isArray(value.previousResults)
      ? value
      : null;
  } catch {
    return null;
  }
}
export function saveLilySession(session: LilySession) {
  const bounded = {
    ...session,
    messages: session.messages
      .slice(-40)
      .map((message) => ({
        ...message,
        capabilityTrace: message.capabilityTrace?.slice(0, 8),
      })),
    previousResults: session.previousResults.slice(0, 12),
  };
  localStorage.setItem(LILY_SESSION_KEY, JSON.stringify(bounded));
}
