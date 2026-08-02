import type { Article, Experience, Project, Skill } from "@/data/content";

export type Caller = "ui" | "terminal" | "agent" | "hotkey" | "accessibility";
export type Risk = "read" | "navigation" | "write" | "destructive";
export type CapabilityParameter = { name: string; description: string; type: "string" | "number" | "boolean" | "enum"; required: boolean; values?: string[]; default?: unknown };
export type CapabilityExample = { description: string; params: Record<string, unknown> };
export type AppData = { projects: Project[]; experience: Experience[]; articles: Article[]; skills: Skill[] };
export type SurfaceTab = "terminal" | "agent" | "inspector";
export type SurfaceController = { open: (tab?: SurfaceTab) => void; close: () => void; minimise: () => void; restore: () => void; toggle: () => void; selectTab: (tab: SurfaceTab) => void };
export type SelectedControl = { text: string; role: string; accessibleName: string; capabilityId: string; params: Record<string, unknown>; focused?: boolean };
export type CapabilityDatabase = { exec: (sql: string, bind?: unknown[]) => Promise<unknown>; query: <T>(sql: string, bind?: unknown[]) => Promise<T[]> };
export type CapabilityContext = { caller: Caller; data: AppData; navigate: (path: string) => void; back: () => void; surface: SurfaceController; database: CapabilityDatabase; getHistory: () => CapabilityExecution[]; getSelectedControl: () => SelectedControl | null };
export type CapabilityDefinition<TParams extends Record<string, unknown> = Record<string, unknown>, TResult = unknown> = { id: string; schemaVersion: number; title: string; description: string; aliases?: string[]; params: CapabilityParameter[]; examples: CapabilityExample[]; cli: { enabled: boolean; command: string }; keyboard: { template: readonly string[] }; actionKeys: { enabled: boolean; sequence: readonly string[] }; navigator: { enabled: boolean }; accessibility: { label: string; description?: string }; risk: Risk; requiresConfirmation?: boolean; execute: (params: TParams, context: CapabilityContext) => Promise<TResult> };
export type CapabilityManifestEntry = { id: string; schemaVersion: number; description: string; parameters: CapabilityParameter[]; cliCommand: string | null; actionKeyTemplate: string[] | null; accessibleLabel: string | null; risk: Risk; navigatorEnabled: boolean };
export type CapabilityChange = { id: string; fields: string[]; before: CapabilityManifestEntry; after: CapabilityManifestEntry; breakingReasons: string[] };
export type CapabilityDelta = { added: CapabilityManifestEntry[]; removed: CapabilityManifestEntry[]; changed: CapabilityChange[]; unchanged: string[]; breaking: CapabilityChange[] };
export type CapabilityErrorShape = { code: string; message: string; invalidValue?: unknown; suggestion?: string };
export type CapabilityExecution = { executionId: string; capabilityId: string; caller: Caller; params: Record<string, unknown>; status: "success" | "failure"; result: unknown | null; error: CapabilityErrorShape | null; durationMs: number; timestamp: string; resolvedCli: string; resolvedActionKeys: string; /** Legacy persisted field retained for v2 history compatibility. */ resolvedProtocol?: string; accessibilityLabel: string; confirmationStatus: "not-required" | "confirmed" | "declined" };

export class CapabilityError extends Error {
  constructor(public code: string, message: string, public invalidValue?: unknown, public suggestion?: string) { super(message); }
}
