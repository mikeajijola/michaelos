import type { Article, Experience, Project, Skill } from "@/data/content";

export type Caller =
  "ui" | "terminal" | "agent" | "navigator" | "hotkey" | "accessibility";
export type ActorKind = "human" | "machine" | "agent" | "service" | "embodied" | "legacy";
export type InvocationProvenance = {
  actor: { id: string; kind: ActorKind };
  interface: Caller;
  modality: "visual" | "keyboard" | "text" | "voice" | "api" | "assistive" | "embodied" | "unknown";
  delegatedBy?: string;
};
export type Risk = "read" | "navigation" | "write" | "destructive";
export type AuthorityGrant = {
  schemaVersion: 1;
  grantId: string;
  subject: string;
  capabilityId: string;
  arguments: Record<string, unknown>;
  target?: string;
  risks: Risk[];
  issuedAt: string;
  expiresAt: string;
  parent?: AuthorityGrant;
  confirmation?: { confirmedAt: string; invocationDigest: string };
};
export type AuthorityDecision = {
  state: "allowed" | "denied";
  code: string;
  source: "local-policy" | "grant";
  grantId: string | null;
  grantDigest: string | null;
  parentGrantId: string | null;
};
export type RealisationStatus = "available" | "degraded" | "unavailable" | "indeterminate";
export type AvailabilityEvidence = {
  realisationId: string;
  status: RealisationStatus;
  reasonCode: string;
  observedAt: string;
  summary: string;
};
export type CapabilityParameter = {
  name: string;
  description: string;
  type: "string" | "number" | "boolean" | "enum";
  required: boolean;
  values?: string[];
  default?: unknown;
};
export type CapabilityExample = {
  description: string;
  params: Record<string, unknown>;
};
export type CapabilityEffectStatus = "observed" | "requested" | "indeterminate";
export type CapabilityEvidence = {
  kind: "return-value" | "postcondition" | "request" | "legacy";
  summary: string;
  details?: unknown;
};
export type CapabilityEvidenceResult = {
  effectStatus: CapabilityEffectStatus;
  evidence: CapabilityEvidence[];
};
export type CapabilityEvidenceContract = {
  mode: "return-value" | "postcondition" | "request";
  description: string;
  observe?: (
    result: unknown,
    params: Record<string, unknown>,
    context: CapabilityContext,
  ) => CapabilityEvidenceResult | Promise<CapabilityEvidenceResult>;
};
export type AppData = {
  projects: Project[];
  experience: Experience[];
  articles: Article[];
  skills: Skill[];
};
export type SurfaceTab = "lily" | "terminal" | "inspector" | "history";
export type SurfaceController = {
  open: (tab?: SurfaceTab) => void;
  close: () => void;
  minimise: () => void;
  restore: () => void;
  toggle: () => void;
  selectTab: (tab: SurfaceTab) => void;
  getState: () => { open: boolean; minimised: boolean; tab: SurfaceTab };
};
export type SelectedControl = {
  text: string;
  role: string;
  accessibleName: string;
  capabilityId: string;
  params: Record<string, unknown>;
  focused?: boolean;
};
export type CapabilityDatabase = {
  exec: (sql: string, bind?: unknown[]) => Promise<unknown>;
  query: <T>(sql: string, bind?: unknown[]) => Promise<T[]>;
  inspectRuntime: () => { state: "initialising" | "opfs" | "memory" | "unavailable"; reasonCode: string | null };
};
export type CapabilityContext = {
  caller: Caller;
  data: AppData;
  navigate: (path: string) => void;
  back: () => void;
  surface: SurfaceController;
  database: CapabilityDatabase;
  getHistory: () => CapabilityExecution[];
  getSelectedControl: () => SelectedControl | null;
  getLocation: () => string;
};
export type CapabilityDefinition<
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TResult = unknown,
> = {
  id: string;
  schemaVersion: number;
  title: string;
  description: string;
  aliases?: string[];
  params: CapabilityParameter[];
  examples: CapabilityExample[];
  cli: { enabled: boolean; command: string };
  keyboard: { template: readonly string[] };
  actionKeys: { enabled: boolean; sequence: readonly string[] };
  navigator: { enabled: boolean };
  accessibility: { label: string; description?: string };
  risk: Risk;
  realisation?: {
    id: string;
    inspect: (context: CapabilityContext) => AvailabilityEvidence | Promise<AvailabilityEvidence>;
  };
  evidence: CapabilityEvidenceContract;
  requiresConfirmation?: boolean;
  execute: (params: TParams, context: CapabilityContext) => Promise<TResult>;
};
export type CapabilityManifestEntry = {
  id: string;
  schemaVersion: number;
  description: string;
  parameters: CapabilityParameter[];
  cliCommand: string | null;
  actionKeyTemplate: string[] | null;
  accessibleLabel: string | null;
  risk: Risk;
  navigatorEnabled: boolean;
  evidence: Omit<CapabilityEvidenceContract, "observe">;
};
export type CapabilityFreshness = "current" | "stale" | "indeterminate";
export type CapabilityFreshnessReason =
  | "SUBJECT_REVISION_UNAVAILABLE"
  | "WORKTREE_DIRTY"
  | "CONFORMANCE_ARTIFACT_INVALID"
  | "SUBJECT_REVISION_MISMATCH"
  | "MANIFEST_DIGEST_MISMATCH";
export type CapabilityConformanceEnvelope = {
  schemaVersion: 1;
  tool: { name: "michaelos-capability-conformance"; version: "1.0.0" };
  repository: "mikeajijola/michaelos";
  subject: { revision: string | null };
  manifest: {
    schemaVersion: 1;
    algorithm: "sha256";
    digest: string;
    path: "capabilities/generated-manifest.json";
  };
  generatedAt: string;
  testedAt: string | null;
  audit: import("./governance").CapabilityAudit;
  evidence: { kind: "test" | "build" | "ci"; reference: string }[];
  freshness: { state: CapabilityFreshness; reason: CapabilityFreshnessReason | null };
};
export type CapabilityChange = {
  id: string;
  fields: string[];
  before: CapabilityManifestEntry;
  after: CapabilityManifestEntry;
  breakingReasons: string[];
};
export type CapabilityDelta = {
  added: CapabilityManifestEntry[];
  removed: CapabilityManifestEntry[];
  changed: CapabilityChange[];
  unchanged: string[];
  breaking: CapabilityChange[];
};
export type CapabilityErrorShape = {
  code: string;
  message: string;
  invalidValue?: unknown;
  suggestion?: string;
};
export type CapabilityExecution = {
  executionId: string;
  capabilityId: string;
  caller: Caller;
  /** Required on newly recorded v3 events; optional here so persisted v2 fixtures remain readable. */
  provenance?: InvocationProvenance;
  authority?: AuthorityDecision;
  availability?: AvailabilityEvidence;
  params: Record<string, unknown>;
  status: "success" | "failure";
  /** Compatibility alias remains `status`; this names handler completion explicitly. */
  executionStatus: "success" | "failure";
  effectStatus: CapabilityEffectStatus;
  evidence: CapabilityEvidence[];
  observedAt: string | null;
  result: unknown | null;
  error: CapabilityErrorShape | null;
  durationMs: number;
  timestamp: string;
  resolvedCli: string;
  resolvedActionKeys: string;
  /** Legacy persisted field retained for v2 history compatibility. */ resolvedProtocol?: string;
  accessibilityLabel: string;
  confirmationStatus: "not-required" | "confirmed" | "declined";
};
export type InvocationSecurity = {
  provenance?: InvocationProvenance;
  grant?: AuthorityGrant;
  target?: string;
  now?: Date;
};
export type CanonicalCapabilityInvocation = {
  capabilityId: string;
  arguments: Record<string, unknown>;
  actionKeys: string | null;
  cliCommand: string | null;
};

export class CapabilityError extends Error {
  constructor(
    public code: string,
    message: string,
    public invalidValue?: unknown,
    public suggestion?: string,
  ) {
    super(message);
  }
}
