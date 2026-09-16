import type { CapabilityExecution } from "@/capabilities/types";

/** Shared, semantic projection used by Inspector and its accessibility tree. */
export function ExecutionOutcome({ execution }: { execution: CapabilityExecution }) {
  return (
    <>
      <dt>Execution status</dt>
      <dd className={execution.executionStatus}>{execution.executionStatus}</dd>
      <dt>Effect status</dt>
      <dd>{execution.effectStatus}</dd>
      <dt>Evidence</dt>
      <dd>
        {execution.evidence.map((item) => item.summary).join("; ")
          || "No effect evidence captured"}
      </dd>
      <dt>Observed</dt>
      <dd>
        {execution.observedAt
          ? new Date(execution.observedAt).toLocaleString()
          : "Not observed"}
      </dd>
    </>
  );
}
