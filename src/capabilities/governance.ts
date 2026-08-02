import type { CapabilityChange, CapabilityDefinition, CapabilityDelta, CapabilityManifestEntry, CapabilityParameter, Risk } from "./types";

export type CapabilityAuditIssue = { code: string; severity: "error" | "warning"; capabilityId?: string; message: string };
export type CapabilityAudit = { status: "pass" | "fail"; summary: { registered: number; errors: number; warnings: number }; issues: CapabilityAuditIssue[] };

const parameterTypes = new Set<CapabilityParameter["type"]>(["string", "number", "boolean", "enum"]);
const risks = new Set<Risk>(["read", "navigation", "write", "destructive"]);
const placeholder = (name: string) => `<${name}>`;

export function capabilityToManifestEntry(capability: CapabilityDefinition): CapabilityManifestEntry {
  return {
    id: capability.id,
    schemaVersion: capability.schemaVersion,
    description: capability.description,
    parameters: capability.params,
    cliCommand: capability.cli.enabled ? capability.cli.command || null : null,
    actionKeyTemplate: capability.actionKeys.enabled ? [...capability.actionKeys.sequence] : null,
    accessibleLabel: capability.accessibility.label || null,
    risk: capability.risk,
    navigatorEnabled: capability.navigator.enabled,
  };
}

export function generateCapabilityManifest(definitions: CapabilityDefinition[]) {
  return definitions.map(capabilityToManifestEntry);
}

const riskRank: Record<Risk, number> = { read: 0, navigation: 1, write: 2, destructive: 3 };
const stable = (value: unknown) => JSON.stringify(value);

export function getCapabilityDelta(current: CapabilityManifestEntry[], baseline: CapabilityManifestEntry[]): CapabilityDelta {
  const currentById = new Map(current.map(entry => [entry.id, entry]));
  const baselineById = new Map(baseline.map(entry => [entry.id, entry]));
  const added = current.filter(entry => !baselineById.has(entry.id));
  const removed = baseline.filter(entry => !currentById.has(entry.id));
  const changed: CapabilityChange[] = [];
  const unchanged: string[] = [];

  for (const after of current) {
    const before = baselineById.get(after.id);
    if (!before) continue;
    const fields = (Object.keys(after) as Array<keyof CapabilityManifestEntry>).filter(field => stable(after[field]) !== stable(before[field]));
    if (!fields.length) { unchanged.push(after.id); continue; }
    const breakingReasons: string[] = [];
    const oldParameters = new Map(before.parameters.map(parameter => [parameter.name, parameter]));
    const newParameters = new Map(after.parameters.map(parameter => [parameter.name, parameter]));
    for (const parameter of after.parameters) {
      const old = oldParameters.get(parameter.name);
      if (!old && parameter.required) breakingReasons.push(`Required parameter ${parameter.name} added.`);
      else if (old && old.type !== parameter.type) breakingReasons.push(`Parameter ${parameter.name} type changed from ${old.type} to ${parameter.type}.`);
    }
    for (const parameter of before.parameters) if (!newParameters.has(parameter.name)) breakingReasons.push(`Parameter ${parameter.name} removed.`);
    if (riskRank[after.risk] >= riskRank.write && riskRank[after.risk] > riskRank[before.risk]) breakingReasons.push(`Risk increased from ${before.risk} to ${after.risk}.`);
    if (before.cliCommand && !after.cliCommand) breakingReasons.push("CLI command removed.");
    if (before.actionKeyTemplate && !after.actionKeyTemplate) breakingReasons.push("Action Key mapping removed.");
    if (before.navigatorEnabled && !after.navigatorEnabled) breakingReasons.push("Navi exposure removed.");
    changed.push({ id: after.id, fields, before, after, breakingReasons });
  }

  const removedChanges: CapabilityChange[] = removed.map(before => ({ id: before.id, fields: ["id"], before, after: before, breakingReasons: ["Capability removed."] }));
  return { added, removed, changed, unchanged, breaking: [...removedChanges, ...changed.filter(change => change.breakingReasons.length)] };
}

export function auditCapabilities(definitions: CapabilityDefinition[], uiCapabilityReferences: string[] = []): CapabilityAudit {
  const issues: CapabilityAuditIssue[] = [];
  const report = (code: string, severity: CapabilityAuditIssue["severity"], message: string, capabilityId?: string) => issues.push({ code, severity, capabilityId, message });
  const ids = new Set<string>();
  const sequences = new Map<string, string>();

  for (const capability of definitions) {
    if (ids.has(capability.id)) report("DUPLICATE_ID", "error", `Capability ID ${capability.id} is registered more than once.`, capability.id);
    ids.add(capability.id);
    if (!capability.description.trim()) report("MISSING_DESCRIPTION", "error", "Description is required.", capability.id);
    if (typeof capability.execute !== "function") report("MISSING_EXECUTOR", "error", "Executor is required.", capability.id);
    if (!Number.isInteger(capability.schemaVersion) || capability.schemaVersion < 1) report("INVALID_SCHEMA_VERSION", "error", "schemaVersion must be a positive integer.", capability.id);
    if (!risks.has(capability.risk)) report("INVALID_RISK", "error", `Risk ${String(capability.risk)} is unsupported.`, capability.id);
    if (!capability.accessibility.label.trim()) report("MISSING_ACCESSIBLE_LABEL", "error", "Accessible label is required.", capability.id);
    if (capability.cli.enabled && !capability.cli.command.trim()) report("MISSING_CLI_MAPPING", "error", "CLI is enabled without a command.", capability.id);
    if (capability.actionKeys.enabled && !capability.actionKeys.sequence.length) report("MISSING_ACTION_KEYS", "error", "Action Keys are enabled without a sequence.", capability.id);
    if (capability.navigator.enabled && capability.risk === "destructive" && !capability.requiresConfirmation) report("NAVIGATOR_CONFIRMATION_REQUIRED", "error", "Destructive Navi capabilities require confirmation metadata.", capability.id);

    const parameterNames = new Set<string>();
    for (const parameter of capability.params) {
      if (!parameter.name.trim() || !parameter.description.trim() || typeof parameter.required !== "boolean") report("INVALID_PARAMETER", "error", "Parameters require a name, description, and required flag.", capability.id);
      if (parameterNames.has(parameter.name)) report("DUPLICATE_PARAMETER", "error", `Parameter ${parameter.name} is declared more than once.`, capability.id);
      parameterNames.add(parameter.name);
      if (!parameterTypes.has(parameter.type)) report("UNSUPPORTED_PARAMETER_TYPE", "error", `Parameter ${parameter.name} uses unsupported type ${String(parameter.type)}.`, capability.id);
      if (parameter.type === "enum" && (!parameter.values || parameter.values.length === 0)) report("INVALID_ENUM", "error", `Enum parameter ${parameter.name} has no values.`, capability.id);
      if (parameter.required && capability.cli.enabled && !capability.cli.command.includes(placeholder(parameter.name))) report("CLI_REQUIRED_PARAMETER_MISSING", "error", `CLI command omits required parameter ${parameter.name}.`, capability.id);
      if (parameter.required && capability.actionKeys.enabled && !capability.actionKeys.sequence.includes(placeholder(parameter.name))) report("ACTION_KEYS_REQUIRED_PARAMETER_MISSING", "error", `Action Key sequence omits required parameter ${parameter.name}.`, capability.id);
    }

    if (capability.actionKeys.enabled) {
      const key = capability.actionKeys.sequence.map(token => token.toUpperCase()).join(" ");
      const duplicate = sequences.get(key);
      if (duplicate) report("DUPLICATE_ACTION_KEYS", "error", `Action Key sequence duplicates ${duplicate}.`, capability.id);
      else sequences.set(key, capability.id);
    }
  }

  for (const reference of uiCapabilityReferences) if (!ids.has(reference)) report("UNKNOWN_UI_CAPABILITY", "error", `UI references unknown capability ${reference}.`, reference);
  const errors = issues.filter(issue => issue.severity === "error").length;
  const warnings = issues.length - errors;
  return { status: errors ? "fail" : "pass", summary: { registered: definitions.length, errors, warnings }, issues };
}
