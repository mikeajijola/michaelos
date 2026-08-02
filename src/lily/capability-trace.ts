import { resolveCanonicalInvocation } from "@/capabilities/invocation";
import type { CapabilityExecution } from "@/capabilities/types";
import type { CapabilityTraceEntry } from "./types";

export function capabilityTraceFromExecution(
  execution: CapabilityExecution,
): CapabilityTraceEntry {
  const invocation = resolveCanonicalInvocation(
    execution.capabilityId,
    execution.params,
  );
  return {
    executionId: execution.executionId,
    capabilityId: invocation.capabilityId,
    arguments: invocation.arguments,
    actionKeys: invocation.actionKeys,
    cliCommand: invocation.cliCommand,
    status: execution.status === "success" ? "success" : "error",
    durationMs: execution.durationMs,
    resultSummary: summariseResult(execution.result),
    errorMessage: execution.error?.message,
  };
}
function summariseResult(result: unknown) {
  if (!result || typeof result !== "object") return undefined;
  const value = result as Record<string, unknown>;
  if (typeof value.message === "string") return value.message;
  if (typeof value.count === "number")
    return `${value.count} result${value.count === 1 ? "" : "s"}`;
  return undefined;
}
export function canonicalInvocationJson(entry: CapabilityTraceEntry) {
  return JSON.stringify(
    { capability: entry.capabilityId, arguments: entry.arguments },
    null,
    2,
  );
}
