import type { NaviVoiceState } from "./types";

let current: NaviVoiceState = "inactive";
const listeners = new Set<() => void>();

export function publishNaviVoiceState(state: NaviVoiceState) {
  if (current === state) return;
  current = state;
  for (const listener of listeners) listener();
}

export function subscribeNaviVoiceState(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNaviVoiceState() {
  return current;
}

export function getServerNaviVoiceState(): NaviVoiceState {
  return "inactive";
}
