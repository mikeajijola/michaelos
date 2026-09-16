import { presentCapabilityConformance } from "@/capabilities/presentation";
import type { CapabilityConformanceEnvelope } from "@/capabilities/types";

export function ConformanceStatus({
  conformance,
}: {
  conformance: CapabilityConformanceEnvelope | null;
}) {
  const view = conformance ? presentCapabilityConformance(conformance) : null;
  return (
    <div
      aria-live="polite"
      role="status"
      data-conformance-state={view?.status}
    >
      <h2>Current conformance</h2>
      <p>
        {view
          ? `${view.status}: revision ${view.revision} · manifest ${view.digest} · reason ${view.reason}`
          : "Verify the published manifest against this exact build revision."}
      </p>
    </div>
  );
}
