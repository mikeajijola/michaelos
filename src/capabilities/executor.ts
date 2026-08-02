import { registry } from "./registry";
import { validateParams } from "./protocol";
import { resolveCanonicalInvocation } from "./invocation";
import { CapabilityError, type Caller, type CapabilityContext, type CapabilityExecution } from "./types";

export const HISTORY_KEY = "michaelos.capability-history.v2";
export const TRANSCRIPT_KEY = "michaelos.terminal-transcript.v2";

export function normaliseExecutionHistory(value: unknown): CapabilityExecution[] {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === "object").map(item => {
    const event = item as Partial<CapabilityExecution>;
    return { ...event, resolvedActionKeys: event.resolvedActionKeys ?? event.resolvedProtocol ?? "UNRESOLVED" } as CapabilityExecution;
  });
}

export async function executeCapability(id: string, input: Record<string, unknown>, caller: Caller, context: CapabilityContext): Promise<CapabilityExecution> {
  const capability = registry.get(id); const started = performance.now(); const timestamp = new Date().toISOString();
  let params = input; let result: unknown = null; let error: CapabilityExecution["error"] = null;
  try {
    if (!capability) throw new CapabilityError("CAPABILITY_NOT_FOUND", `Capability "${id}" is not registered.`, id, "Run capabilities to discover valid IDs.");
    try { params = validateParams(capability, input); } catch (cause) { throw new CapabilityError("INVALID_PARAMETERS", cause instanceof Error ? cause.message : String(cause), input, `Run describe ${id} to inspect its parameters.`); }
    result = await capability.execute(params, context);
  } catch (cause) {
    const exception = cause as Error;
    error = cause instanceof CapabilityError ? { code: cause.code, message: cause.message, invalidValue: cause.invalidValue, suggestion: cause.suggestion } : { code: "EXECUTION_FAILED", message: exception.message };
  }
  const invocation = resolveCanonicalInvocation(id, params);
  const resolvedActionKeys = invocation.actionKeys ?? "UNRESOLVED";
  const execution: CapabilityExecution = {
    executionId: `exec_${crypto.randomUUID()}`, capabilityId: id, caller, params,
    status: error ? "failure" : "success", result, error,
    durationMs: Math.max(1, Math.round(performance.now() - started)), timestamp,
    resolvedCli: invocation.cliCommand ?? `run ${id}`,
    resolvedActionKeys,
    resolvedProtocol: resolvedActionKeys,
    accessibilityLabel: capability?.accessibility.label ?? "Unknown capability",
    confirmationStatus: capability?.requiresConfirmation ? (params.confirm === true ? "confirmed" : "declined") : "not-required",
  };
  const history = readHistory(); localStorage.setItem(HISTORY_KEY, JSON.stringify([execution, ...history].slice(0, 250)));
  window.dispatchEvent(new CustomEvent("capability-executed", { detail: execution }));
  return execution;
}

export function readHistory(): CapabilityExecution[] { try { return normaliseExecutionHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]")); } catch { return []; } }
export function formatExecution(event: CapabilityExecution) {
  const time = new Date(event.timestamp).toLocaleTimeString([], { hour12: false });
  const body = event.status === "success" ? `✓ Success\n${JSON.stringify(event.result, null, 2)}` : `✗ ${event.error?.code}\n${event.error?.message}${event.error?.suggestion ? `\nNext: ${event.error.suggestion}` : ""}`;
  return `[${time}] ${event.caller.toUpperCase()}\n> ${event.capabilityId}\n  ${JSON.stringify(event.params)}\n${body}\n  Duration: ${event.durationMs} ms`;
}
