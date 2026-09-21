import { canonicalize } from "./conformance";
import { resolveCanonicalInvocation } from "./invocation";
import { parseProtocol, validateParams } from "./protocol";
import { parseCommand } from "@/terminal/parser";
import type { Caller, CapabilityDefinition } from "./types";

export type ParityAssertion = { interface: Caller; enabled: boolean; assertions: string[]; runtimeReason: string | null };
export type CapabilityParityEntry = {
  capabilityId: string; schemaVersion: number; risk: string; requiresConfirmation: boolean;
  parameterContract: string; interfaces: ParityAssertion[];
};

const runtimeReason = (name: Caller) => name === "agent" ? "Machine protocol shares the canonical CLI adapter; browser execution is not applicable." : null;
export function generateParityMatrix(capabilities: CapabilityDefinition[]): CapabilityParityEntry[] {
  return [...capabilities].sort((a, b) => a.id.localeCompare(b.id)).map(capability => ({
    capabilityId: capability.id, schemaVersion: capability.schemaVersion, risk: capability.risk,
    requiresConfirmation: Boolean(capability.requiresConfirmation), parameterContract: canonicalize(capability.params),
    interfaces: (["ui", "terminal", "agent", "navigator", "hotkey", "accessibility"] as Caller[]).map(name => {
      const enabled = name === "navigator" ? capability.navigator.enabled : name === "terminal" || name === "agent" ? capability.cli.enabled : name === "hotkey" ? capability.actionKeys.enabled : true;
      return { interface: name, enabled, assertions: enabled ? ["canonical-id", "parameters", "risk", "confirmation", "shared-executor", "distinct-provenance"] : [], runtimeReason: enabled ? runtimeReason(name) : `${name} is disabled by the canonical registry.` };
    }),
  }));
}

export function evaluateProtocolParity(capabilities: CapabilityDefinition[]) {
  return capabilities.map(capability => {
    const defaults = Object.fromEntries(capability.params.flatMap(param => {
      if (!param.required && param.default === undefined) return [];
      return [[param.name, param.default ?? param.values?.[0] ?? (param.type === "number" ? 1 : param.type === "boolean" ? true : `fixture-${param.name}`)]];
    }));
    const invocation = resolveCanonicalInvocation(capability.id, defaults);
    const failures: string[] = [];
    if (capability.cli.enabled && !invocation.cliCommand) failures.push("terminal:missing-cli");
    if (capability.actionKeys.enabled && !invocation.actionKeys) failures.push("hotkey:missing-action-keys");
    if (invocation.capabilityId !== capability.id) failures.push("canonical-id:drift");
    if (canonicalize(invocation.arguments) !== canonicalize(defaults)) failures.push("parameters:drift");
    if (invocation.actionKeys) {
      const parsed = parseProtocol(invocation.actionKeys, capabilities);
      if (parsed?.capability.id !== capability.id) failures.push("hotkey:capability-drift");
      else if (canonicalize(parsed.params) !== canonicalize(validateParams(capability, defaults))) failures.push("hotkey:parameters-drift");
    }
    if (invocation.cliCommand) {
      const parsed = parseCommand(invocation.cliCommand);
      const params = Object.fromEntries(Object.entries(parsed.flags).filter(([key]) => key !== "json"));
      if (parsed.command !== "run" || parsed.positional[0] !== capability.id) failures.push("terminal:capability-drift");
      else if (canonicalize(validateParams(capability, params)) !== canonicalize(validateParams(capability, defaults))) failures.push("terminal:parameters-drift");
    }
    return { capabilityId: capability.id, status: failures.length ? "fail" as const : "pass" as const, failures };
  });
}

export function assertNoParityDrift(expected: CapabilityParityEntry[], observed: CapabilityParityEntry[]) {
  const actual = new Map(observed.map(entry => [entry.capabilityId, entry]));
  for (const entry of expected) {
    const candidate = actual.get(entry.capabilityId);
    if (!candidate) throw new Error(`${entry.capabilityId}:registry:missing`);
    if (canonicalize(candidate) !== canonicalize(entry)) throw new Error(`${entry.capabilityId}:interface-contract:drift`);
  }
}
