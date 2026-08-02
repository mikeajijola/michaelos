import { articles, experience, projects, skills } from "@/data/content";
import { CapabilityError, Caller, Execution } from "./types";
import { registry } from "./registry";

export const HISTORY_KEY = "michaelos.capability-history.v1";
export async function executeCapability(id: string, params: Record<string, unknown>, caller: Caller, navigate: (path: string) => void): Promise<Execution> {
  const capability = registry.get(id); const started = performance.now(); const startedAt = new Date().toISOString();
  let result: unknown = null; let error: Execution["error"] = null;
  if (!capability) error = { code: "CAPABILITY_NOT_FOUND", message: `Capability “${id}” is not registered.`, invalidValue: id, suggestion: "Run capabilities to discover valid IDs." };
  else try { result = await capability.execute(params, { caller, data: { projects, experience, articles, skills }, navigate }); } catch (cause) { const e = cause as Error; error = cause instanceof CapabilityError ? { code: cause.code, message: cause.message, invalidValue: cause.invalidValue, suggestion: cause.suggestion } : { code: "EXECUTION_FAILED", message: e.message }; }
  const execution: Execution = { id: crypto.randomUUID(), capabilityId: id, caller, params, result, error, success: !error, durationMs: Math.max(1, Math.round(performance.now() - started)), startedAt, endedAt: new Date().toISOString(), hotkey: capability?.hotkey ?? "—", accessibilityLabel: capability?.accessibility.label ?? "Unknown capability", confirmationStatus: capability?.requiresConfirmation ? (params.confirm === true || params.confirm === "true" ? "confirmed" : "declined") : "not-required" };
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as Execution[]; localStorage.setItem(HISTORY_KEY, JSON.stringify([execution, ...history].slice(0, 100)));
  window.dispatchEvent(new CustomEvent("capability-executed", { detail: execution })); return execution;
}
