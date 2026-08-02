import type { Article, Experience, Project, Skill } from "@/data/content";

export type Caller = "ui" | "terminal" | "agent" | "hotkey" | "accessibility";
export type Risk = "read" | "write" | "destructive";
export type Param = { name: string; description: string; type: "string" | "number" | "boolean" | "enum"; required: boolean; values?: string[]; default?: unknown };
export type Example = { description: string; params: Record<string, unknown>; cli: string };
export type AppData = { projects: Project[]; experience: Experience[]; articles: Article[]; skills: Skill[] };
export type CapabilityContext = { caller: Caller; data: AppData; navigate: (path: string) => void };
export type Capability = { id: string; title: string; description: string; hotkey: string; aliases?: string[]; params: Param[]; examples: Example[]; accessibility: { label: string; description?: string }; risk: Risk; requiresConfirmation?: boolean; execute: (params: Record<string, unknown>, context: CapabilityContext) => Promise<unknown> };
export type CapabilityErrorShape = { code: string; message: string; invalidValue?: unknown; suggestion?: string };
export type Execution = { id: string; capabilityId: string; caller: Caller; params: Record<string, unknown>; result: unknown | null; error: CapabilityErrorShape | null; success: boolean; durationMs: number; startedAt: string; endedAt: string; hotkey: string; accessibilityLabel: string; confirmationStatus: "not-required" | "confirmed" | "declined" };

export class CapabilityError extends Error {
  constructor(public code: string, message: string, public invalidValue?: unknown, public suggestion?: string) { super(message); }
}
