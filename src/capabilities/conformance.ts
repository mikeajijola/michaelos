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
  indeterminateReason?: Extract<CapabilityFreshnessReason, "SUBJECT_REVISION_UNAVAILABLE" | "WORKTREE_DIRTY">;
  entries: CapabilityManifestEntry[];
  audit: CapabilityAudit;
  timestamp?: string;
  evidence?: CapabilityConformanceEnvelope["evidence"];
}): Promise<CapabilityConformanceEnvelope> {
  const timestamp = input.timestamp ?? new Date().toISOString();
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
    testedAt: timestamp,
    audit: input.audit,
    evidence: input.evidence ?? [],
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
    indeterminateReason?: Extract<CapabilityFreshnessReason, "SUBJECT_REVISION_UNAVAILABLE" | "WORKTREE_DIRTY">;
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
  return {
    ...artifact,
    freshness: reason
      ? { state: reason === "SUBJECT_REVISION_UNAVAILABLE" ? "indeterminate" : "stale", reason }
      : { state: "current", reason: null },
  };
}
