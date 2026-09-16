import type { CapabilityConformanceEnvelope } from "./types";

export type CapabilityConformancePresentation = {
  status: string;
  revision: string;
  digest: string;
  reason: string;
};

/** One projection shared by human surfaces; machine clients retain the envelope. */
export function presentCapabilityConformance(
  value: CapabilityConformanceEnvelope,
): CapabilityConformancePresentation {
  return {
    status: value.freshness.state,
    revision: value.subject.revision ?? "unavailable",
    digest: value.manifest.digest,
    reason: value.freshness.reason ?? "none",
  };
}

export function formatCapabilityConformance(
  value: CapabilityConformanceEnvelope,
): string {
  const view = presentCapabilityConformance(value);
  return `Capability conformance is ${view.status}. Subject revision: ${view.revision}. Manifest digest: ${view.digest}. Freshness reason: ${view.reason}.`;
}
