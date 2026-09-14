import type {
  CapabilityConformanceEnvelope,
  CapabilityFreshnessReason,
  CapabilityManifestEntry,
} from "./types";
import type { CapabilityAudit } from "./governance";

export const CONFORMANCE_TOOL = {
  name: "michaelos-capability-conformance" as const,
  version: "1.0.0" as const,
};

const freshnessReasons = new Set<CapabilityFreshnessReason>([
  "SUBJECT_REVISION_UNAVAILABLE",
  "WORKTREE_DIRTY",
  "CONFORMANCE_ARTIFACT_INVALID",
  "SUBJECT_REVISION_MISMATCH",
  "MANIFEST_DIGEST_MISMATCH",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Validate the serialized build artifact before it crosses into runtime. */
export function isCapabilityConformanceEnvelope(
  value: unknown,
): value is CapabilityConformanceEnvelope {
  if (!isRecord(value) || value.schemaVersion !== 1) return false;
  const { tool, subject, manifest, audit, freshness } = value;
  if (
    value.repository !== "mikeajijola/michaelos" ||
    !isRecord(tool) ||
    tool.name !== CONFORMANCE_TOOL.name ||
    tool.version !== CONFORMANCE_TOOL.version ||
    !isRecord(subject) ||
    !(subject.revision === null ||
      (typeof subject.revision === "string" && subject.revision.length > 0)) ||
    !isRecord(manifest) ||
    manifest.schemaVersion !== 1 ||
    manifest.algorithm !== "sha256" ||
    typeof manifest.digest !== "string" ||
    !/^[0-9a-f]{64}$/.test(manifest.digest) ||
    manifest.path !== "capabilities/generated-manifest.json" ||
    typeof value.generatedAt !== "string" ||
    Number.isNaN(Date.parse(value.generatedAt)) ||
    !(value.testedAt === null ||
      (typeof value.testedAt === "string" && !Number.isNaN(Date.parse(value.testedAt)))) ||
    !Array.isArray(value.evidence) ||
    !isRecord(audit) ||
    (audit.status !== "pass" && audit.status !== "fail") ||
    !isRecord(audit.summary) ||
    !Number.isInteger(audit.summary.registered) ||
    !Number.isInteger(audit.summary.errors) ||
    !Number.isInteger(audit.summary.warnings) ||
    !Array.isArray(audit.issues) ||
    !isRecord(freshness) ||
    !["current", "stale", "indeterminate"].includes(String(freshness.state)) ||
    !(freshness.reason === null ||
      (typeof freshness.reason === "string" &&
        freshnessReasons.has(freshness.reason as CapabilityFreshnessReason)))
  ) return false;

  if (!value.evidence.every((item) =>
    isRecord(item) &&
    ["test", "build", "ci"].includes(String(item.kind)) &&
    typeof item.reference === "string" && item.reference.length > 0
  )) return false;
  if (!audit.issues.every((issue) =>
    isRecord(issue) &&
    typeof issue.code === "string" &&
    (issue.severity === "error" || issue.severity === "warning") &&
    typeof issue.message === "string" &&
    (issue.capabilityId === undefined || typeof issue.capabilityId === "string")
  )) return false;
  const errors = audit.issues.filter((issue) => issue.severity === "error").length;
  const warnings = audit.issues.length - errors;
  if (audit.summary.errors !== errors || audit.summary.warnings !== warnings ||
      audit.status !== (errors === 0 ? "pass" : "fail")) return false;
  if ((value.testedAt !== null && value.evidence.length === 0) ||
      (freshness.state === "current" && freshness.reason !== null) ||
      (freshness.state !== "current" && freshness.reason === null)) return false;
  return true;
}

export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object")
    return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`)
    .join(",")}}`;
}

export async function digestCapabilityManifest(entries: CapabilityManifestEntry[]) {
  const bytes = new TextEncoder().encode(canonicalize(entries));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function createCapabilityConformance(input: {
  revision?: string | null;
  indeterminateReason?: Extract<CapabilityFreshnessReason, "SUBJECT_REVISION_UNAVAILABLE" | "WORKTREE_DIRTY" | "CONFORMANCE_ARTIFACT_INVALID">;
  entries: CapabilityManifestEntry[];
  audit: CapabilityAudit;
  timestamp?: string;
  testedAt?: string | null;
  evidence?: CapabilityConformanceEnvelope["evidence"];
}): Promise<CapabilityConformanceEnvelope> {
  const timestamp = input.timestamp ?? new Date().toISOString();
  const evidence = input.evidence ?? [];
  if (input.testedAt && evidence.length === 0)
    throw new Error("testedAt requires a test, build, or CI evidence reference");
  const envelope: CapabilityConformanceEnvelope = {
    schemaVersion: 1,
    tool: CONFORMANCE_TOOL,
    repository: "mikeajijola/michaelos",
    subject: { revision: input.revision ?? null },
    manifest: {
      schemaVersion: 1,
      algorithm: "sha256",
      digest: await digestCapabilityManifest(input.entries),
      path: "capabilities/generated-manifest.json",
    },
    generatedAt: timestamp,
    testedAt: input.testedAt ?? null,
    audit: input.audit,
    evidence,
    freshness: input.revision
      ? { state: "current", reason: null }
      : {
          state: "indeterminate",
          reason: input.indeterminateReason ?? "SUBJECT_REVISION_UNAVAILABLE",
        },
  };
  return envelope;
}

export async function evaluateCapabilityConformance(
  artifact: CapabilityConformanceEnvelope,
  observed: {
    revision?: string | null;
    entries: CapabilityManifestEntry[];
    audit?: CapabilityAudit;
    indeterminateReason?: Extract<CapabilityFreshnessReason, "SUBJECT_REVISION_UNAVAILABLE" | "WORKTREE_DIRTY" | "CONFORMANCE_ARTIFACT_INVALID">;
  },
): Promise<CapabilityConformanceEnvelope> {
  let reason: CapabilityFreshnessReason | null = null;
  if (!observed.revision)
    reason =
      observed.indeterminateReason ??
      (artifact.freshness.state === "indeterminate"
        ? artifact.freshness.reason
        : null) ??
      "SUBJECT_REVISION_UNAVAILABLE";
  else if (observed.revision !== artifact.subject.revision) reason = "SUBJECT_REVISION_MISMATCH";
  else if (
    (await digestCapabilityManifest(observed.entries)) !==
    artifact.manifest.digest
  )
    reason = "MANIFEST_DIGEST_MISMATCH";
  else if (observed.audit && canonicalize(observed.audit) !== canonicalize(artifact.audit))
    reason = "CONFORMANCE_ARTIFACT_INVALID";
  return {
    ...artifact,
    freshness: reason
      ? {
          state:
            reason === "SUBJECT_REVISION_UNAVAILABLE" || reason === "WORKTREE_DIRTY" || reason === "CONFORMANCE_ARTIFACT_INVALID"
              ? "indeterminate"
              : "stale",
          reason,
        }
      : { state: "current", reason: null },
  };
}
