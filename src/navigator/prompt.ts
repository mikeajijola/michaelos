import type { NavigatorTool } from "./types";

export function buildNavigatorPrompt(request: string, tools: NavigatorTool[], error?: string) {
  return `You are Navi, the capability navigator for MichaelOS.
Choose only from the capabilities supplied in this request. Return valid JSON only.
Allowed responses:
{"type":"tool_call","tool":"<supplied capability ID>","arguments":{}}
{"type":"clarification","question":"..."}
{"type":"final_answer","message":"..."}
Rules: Never invent a capability. Supply only declared parameters. Make one tool call. Do not claim success. Return no markdown or text outside JSON.
AVAILABLE CAPABILITIES:
${JSON.stringify(tools)}
${error ? `YOUR PREVIOUS OUTPUT WAS INVALID: ${error}. Return one corrected JSON object.` : ""}
USER REQUEST: ${request}`;
}
