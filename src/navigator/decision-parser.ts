import type { NavigatorDecision, NavigatorTool } from "./types";

export type DecisionParseResult = { ok: true; decision: NavigatorDecision } | { ok: false; error: string };

function unwrap(raw: string) {
  const trimmed = raw.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const text = (fence?.[1] ?? trimmed).trim();
  const start = text.indexOf("{"); const end = text.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  const outer = text.slice(start, end + 1);
  if (text.slice(0, start).trim() || text.slice(end + 1).trim()) return null;
  return outer;
}

export function parseNavigatorDecision(raw: string, tools: NavigatorTool[]): DecisionParseResult {
  const object = unwrap(raw); if (!object) return { ok: false, error: "Output must contain exactly one JSON object." };
  let value: unknown; try { value = JSON.parse(object); } catch { return { ok: false, error: "Output is not valid JSON." }; }
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, error: "Decision must be an object." };
  const decision = value as Record<string, unknown>;
  if (decision.type === "final_answer") return typeof decision.message === "string" && Object.keys(decision).every(key => ["type", "message"].includes(key)) ? { ok: true, decision: decision as NavigatorDecision } : { ok: false, error: "Invalid final_answer." };
  if (decision.type === "clarification") return typeof decision.question === "string" && Object.keys(decision).every(key => ["type", "question"].includes(key)) ? { ok: true, decision: decision as NavigatorDecision } : { ok: false, error: "Invalid clarification." };
  if (decision.type !== "tool_call" || typeof decision.tool !== "string" || !decision.arguments || typeof decision.arguments !== "object" || Array.isArray(decision.arguments)) return { ok: false, error: "Invalid tool_call." };
  const tool = tools.find(item => item.id === decision.tool); if (!tool) return { ok: false, error: `Tool ${decision.tool} was not supplied.` };
  const args = decision.arguments as Record<string, unknown>; const declared = new Set(tool.parameters.map(parameter => parameter.name));
  if (Object.keys(args).some(name => !declared.has(name))) return { ok: false, error: "Arguments contain an undeclared parameter." };
  for (const parameter of tool.parameters) {
    if (parameter.required && !(parameter.name in args)) return { ok: false, error: `Required argument ${parameter.name} is missing.` };
    if (parameter.name in args && typeof args[parameter.name] !== parameter.type) return { ok: false, error: `Argument ${parameter.name} must be ${parameter.type}.` };
  }
  return { ok: true, decision: decision as NavigatorDecision };
}
