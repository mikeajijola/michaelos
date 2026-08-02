import type { CapabilityDefinition, CapabilityParameter } from "./types";

export const AGENT_GATEWAY = [
  ["Control", "Alt", "Shift", "F9"], ["Control", "Alt", "Shift", "F10"],
  ["Control", "Alt", "Shift", "F11"], ["Control", "Alt", "Shift", "F12"],
  ["Control", "Alt", "Shift", "Home"], ["Control", "Alt", "Shift", "End"],
] as const;
export const AGENT_GATEWAY_CODES = ["F9", "F10", "F11", "F12", "Home", "End"] as const;
export const GATEWAY_STEP_TIMEOUT_MS = 3000;
export const PROTOCOL_TIMEOUT_MS = 10000;
export type GatewayProgress = { step: number; lastAt: number };
export type GatewayInput = { code: string; ctrlKey: boolean; altKey: boolean; shiftKey: boolean; repeat: boolean };
export function advanceGateway(progress: GatewayProgress, input: GatewayInput, now: number) {
  let state = progress;
  if (state.step > 0 && now - state.lastAt > GATEWAY_STEP_TIMEOUT_MS) state = { step: 0, lastAt: 0 };
  const chord = input.ctrlKey && input.altKey && input.shiftKey;
  if (chord && input.code === AGENT_GATEWAY_CODES[state.step]) {
    if (input.repeat) return { progress: state, consume: true, activated: false };
    const next = state.step + 1; return { progress: { step: next === AGENT_GATEWAY_CODES.length ? 0 : next, lastAt: now }, consume: true, activated: next === AGENT_GATEWAY_CODES.length };
  }
  if (state.step > 0) return { progress: { step: 0, lastAt: 0 }, consume: true, activated: false };
  return { progress: state, consume: false, activated: false };
}

export function resolveTemplate(template: readonly string[], params: Record<string, unknown>) {
  return template.map(token => token.replace(/^<(.+)>$/, (_, key) => String(params[key] ?? `<${key}>`))).join(" ");
}
export function resolveCli(capability: CapabilityDefinition, params: Record<string, unknown>) {
  let command = capability.cli.command;
  for (const param of capability.params) command = command.replace(`<${param.name}>`, String(params[param.name] ?? `<${param.name}>`));
  return command;
}
function coerce(value: unknown, param: CapabilityParameter) {
  if (value === undefined || value === "") { if (param.required) throw new Error(`Missing required parameter “${param.name}”.`); return param.default; }
  if (param.type === "boolean") { if (value === true || value === "true") return true; if (value === false || value === "false") return false; throw new Error(`Parameter “${param.name}” must be true or false.`); }
  if (param.type === "number") { const number = Number(value); if (!Number.isFinite(number)) throw new Error(`Parameter “${param.name}” must be a number.`); return number; }
  if (param.type === "enum" && param.values && !param.values.includes(String(value))) throw new Error(`Parameter “${param.name}” must be one of: ${param.values.join(", ")}.`);
  return String(value);
}
export function validateParams(capability: CapabilityDefinition, input: Record<string, unknown>) {
  const output: Record<string, unknown> = {};
  for (const param of capability.params) { const value = coerce(input[param.name], param); if (value !== undefined) output[param.name] = value; }
  return output;
}
export function parseProtocol(input: string, definitions: CapabilityDefinition[]) {
  const tokens = (input.match(/(?:[^\s"]+|"[^"]*")+/g) ?? []).map(x => x.replace(/^"|"$/g, ""));
  const normalized = tokens.at(-1)?.toUpperCase() === "ENTER" ? tokens : [...tokens, "ENTER"];
  for (const capability of definitions) {
    const template = capability.keyboard.template;
    if (template.length !== normalized.length) continue;
    const params: Record<string, unknown> = {}; let matches = true;
    template.forEach((token, index) => {
      const parameter = token.match(/^<(.+)>$/)?.[1];
      if (parameter) params[parameter] = normalized[index];
      else if (token.toUpperCase() !== normalized[index]?.toUpperCase()) matches = false;
    });
    if (matches) return { capability, params: validateParams(capability, params) };
  }
  return null;
}
