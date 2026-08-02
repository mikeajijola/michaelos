import { registry } from "./registry";
import { resolveCli, resolveTemplate, validateParams } from "./protocol";
import type { CanonicalCapabilityInvocation } from "./types";

export function resolveCanonicalInvocation(capabilityId: string, args: Record<string, unknown>): CanonicalCapabilityInvocation {
  const capability = registry.get(capabilityId);
  if (!capability) return { capabilityId, arguments: args, actionKeys: null, cliCommand: null };
  let parameters = args;
  try { parameters = validateParams(capability, args); } catch { /* Error traces retain the attempted arguments. */ }
  return {
    capabilityId,
    arguments: parameters,
    actionKeys: capability.actionKeys.enabled ? resolveTemplate(capability.actionKeys.sequence, parameters) : null,
    cliCommand: capability.cli.enabled ? resolveCli(capability, parameters) : null,
  };
}
