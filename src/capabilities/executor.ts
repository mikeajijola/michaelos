import { registry } from "./registry";
import { validateParams } from "./protocol";
import { resolveCanonicalInvocation } from "./invocation";
import { CapabilityError, type Caller, type CapabilityContext, type CapabilityExecution, type InvocationSecurity } from "./types";
import { evaluateAuthority, inspectAvailability, localAvailability, normaliseProvenance } from "./runtime-governance";
import { canonicalize } from "./conformance";

export const HISTORY_KEY = "michaelos.capability-history.v2";
export const TRANSCRIPT_KEY = "michaelos.terminal-transcript.v2";
const consumedGrantIds = new Set<string>();

export function normaliseExecutionHistory(value: unknown): CapabilityExecution[] {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === "object").map(item => {
    const event = item as Partial<CapabilityExecution>;
    const executionStatus = event.executionStatus ?? event.status ?? "failure";
    return {
      ...event,
      status: executionStatus,
      executionStatus,
      effectStatus: event.effectStatus ?? "indeterminate",
      evidence: event.evidence ?? [{ kind: "legacy", summary: "Legacy execution has no effect evidence." }],
      observedAt: event.observedAt ?? null,
      resolvedActionKeys: event.resolvedActionKeys ?? event.resolvedProtocol ?? "UNRESOLVED",
      provenance: event.provenance ?? normaliseProvenance(undefined, event.caller ?? "ui"),
      authority: event.authority ?? { state: "allowed", code: "LEGACY_AUTHORITY_UNKNOWN", source: "local-policy", grantId: null, grantDigest: null, parentGrantId: null },
      availability: event.availability ?? { ...localAvailability(event.capabilityId ?? "legacy"), status: "indeterminate", reasonCode: "LEGACY_AVAILABILITY_UNKNOWN", summary: "Legacy execution has no availability evidence." },
    } as CapabilityExecution;
  });
}

export async function executeCapability(id: string, input: Record<string, unknown>, caller: Caller, context: CapabilityContext, security: InvocationSecurity = {}): Promise<CapabilityExecution> {
  const capability = registry.get(id); const started = performance.now(); const timestamp = new Date().toISOString();
  let params = input; let result: unknown = null; let error: CapabilityExecution["error"] = null;
  let effectStatus: CapabilityExecution["effectStatus"] = "indeterminate";
  let evidence: CapabilityExecution["evidence"] = [];
  let observedAt: string | null = null;
  const provenance = normaliseProvenance(security.provenance, caller);
  let authority: NonNullable<CapabilityExecution["authority"]> = { state: "denied", code: "CAPABILITY_NOT_RESOLVED", source: "local-policy", grantId: null, grantDigest: null, parentGrantId: null };
  let availability: NonNullable<CapabilityExecution["availability"]> = { ...localAvailability(id), status: "indeterminate", reasonCode: "CAPABILITY_NOT_RESOLVED", summary: "The capability was not resolved." };
  try {
    if (!capability) throw new CapabilityError("CAPABILITY_NOT_FOUND", `Capability "${id}" is not registered.`, id, "Run capabilities to discover valid IDs.");
    try { params = validateParams(capability, input); } catch (cause) { throw new CapabilityError("INVALID_PARAMETERS", cause instanceof Error ? cause.message : String(cause), input, `Run describe ${id} to inspect its parameters.`); }
    const now = security.now ?? new Date();
    const invocationDigest = capability.requiresConfirmation ? await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonicalize({ capabilityId: capability.id, arguments: params, target: security.target ?? null }))).then(bytes => Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("")) : null;
    const browserGrant = !security.grant && provenance.actor.kind === "human" && ["ui", "terminal", "hotkey", "accessibility"].includes(provenance.interface) && (capability.risk === "write" || capability.risk === "destructive") && (!capability.requiresConfirmation || params.confirm === true) ? {
      schemaVersion: 1 as const, grantId: `browser_${crypto.randomUUID()}`, subject: provenance.actor.id,
      capabilityId: capability.id, arguments: params, ...(security.target ? { target: security.target } : {}), risks: [capability.risk],
      issuedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 60_000).toISOString(),
      ...(invocationDigest ? { confirmation: { confirmedAt: now.toISOString(), invocationDigest } } : {}),
    } : undefined;
    const effectiveGrant = security.grant ?? browserGrant;
    authority = await evaluateAuthority({ capability, params, provenance, grant: effectiveGrant, target: security.target, now, consumedGrantIds });
    if (authority.state !== "allowed") throw new CapabilityError(authority.code, "The exact invocation is not authorised.");
    if (effectiveGrant) consumedGrantIds.add(effectiveGrant.grantId);
    availability = await inspectAvailability(capability, context, security.now);
    if (availability.status === "unavailable" || availability.status === "indeterminate") throw new CapabilityError(`REALISATION_${availability.status.toUpperCase()}`, availability.summary);
    result = await capability.execute(params, context);
    try {
      if (capability.evidence.mode === "return-value") {
        effectStatus = "observed";
        evidence = [{ kind: "return-value", summary: capability.evidence.description, details: result }];
        observedAt = new Date().toISOString();
      } else if (capability.evidence.mode === "request") {
        effectStatus = "requested";
        evidence = [{ kind: "request", summary: capability.evidence.description, details: result }];
      } else {
        const observation = await capability.evidence.observe!(result, params, context);
        effectStatus = observation.effectStatus;
        evidence = observation.evidence;
        if (effectStatus === "observed") observedAt = new Date().toISOString();
      }
    } catch (cause) {
      effectStatus = "indeterminate";
      evidence = [{
        kind: "postcondition",
        summary: "The handler completed, but effect observation failed.",
        details: { error: cause instanceof Error ? cause.message : String(cause) },
      }];
    }
  } catch (cause) {
    const exception = cause as Error;
    error = cause instanceof CapabilityError ? { code: cause.code, message: cause.message, invalidValue: cause.invalidValue, suggestion: cause.suggestion } : { code: "EXECUTION_FAILED", message: exception.message };
  }
  const invocation = resolveCanonicalInvocation(id, params);
  const resolvedActionKeys = invocation.actionKeys ?? "UNRESOLVED";
  const execution: CapabilityExecution = {
    executionId: `exec_${crypto.randomUUID()}`, capabilityId: id, caller, provenance, authority, availability, params,
    status: error ? "failure" : "success", executionStatus: error ? "failure" : "success",
    effectStatus: error ? "indeterminate" : effectStatus, evidence, observedAt, result, error,
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
  const body = event.status === "success" ? `✓ Handler success · effect ${event.effectStatus}\n${JSON.stringify(event.result, null, 2)}\nEvidence: ${event.evidence.map(item => item.summary).join("; ")}` : `✗ ${event.error?.code}\n${event.error?.message}${event.error?.suggestion ? `\nNext: ${event.error.suggestion}` : ""}`;
  return `[${time}] ${event.caller.toUpperCase()}\n> ${event.capabilityId}\n  ${JSON.stringify(event.params)}\n${body}\n  Duration: ${event.durationMs} ms`;
}
