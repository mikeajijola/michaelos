import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createCapabilityConformance } from "./conformance";
import { auditCapabilities, generateCapabilityManifest } from "./governance";
import { formatCapabilityConformance } from "./presentation";
import { capabilities } from "./registry";
import { parseProtocol } from "./protocol";
import type { CapabilityExecution } from "./types";
import { ConformanceStatus } from "@/components/capabilities/ConformanceStatus";
import { ExecutionOutcome } from "@/components/common/ExecutionOutcome";
import { runCommand } from "@/terminal/commands";

describe("capability conformance surfaces", () => {
  it("keeps machine, CLI, Action Keys, Navi and rendered status aligned", async () => {
    const envelope = await createCapabilityConformance({
      revision: "0123456789abcdef",
      entries: generateCapabilityManifest(capabilities),
      audit: auditCapabilities(capabilities),
      timestamp: "2026-09-14T00:00:00.000Z",
    });
    const event = {
      executionId: "exec_surface",
      capabilityId: "system.getCapabilityConformance",
      caller: "terminal" as const,
      params: {}, status: "success" as const, executionStatus: "success" as const,
      effectStatus: "observed" as const,
      evidence: [{ kind: "return-value" as const, summary: "Conformance envelope returned." }],
      observedAt: "2026-09-14T00:00:01.000Z", result: envelope, error: null,
      durationMs: 1, timestamp: "2026-09-14T00:00:00.000Z",
      resolvedCli: "run system.getCapabilityConformance",
      resolvedActionKeys: "SYSTEM CAPABILITY CONFORMANCE ENTER",
      accessibilityLabel: "Get current capability conformance",
      confirmationStatus: "not-required" as const,
    } satisfies CapabilityExecution;

    const cli = JSON.parse(await runCommand(event.resolvedCli, {
      caller: "terminal", execute: async () => event, history: [], clear: () => {},
    }));
    expect(cli.data).toEqual(envelope);
    expect(cli).toMatchObject({
      executionStatus: event.executionStatus,
      effectStatus: event.effectStatus,
      evidence: event.evidence,
      observedAt: event.observedAt,
    });
    expect(parseProtocol(event.resolvedActionKeys, capabilities)).toMatchObject({
      capability: { id: event.capabilityId }, params: {},
    });
    const navi = formatCapabilityConformance(envelope);
    const page = renderToStaticMarkup(<ConformanceStatus conformance={envelope} />);
    for (const value of [envelope.freshness.state, envelope.subject.revision!, envelope.manifest.digest]) {
      expect(navi).toContain(value);
      expect(page).toContain(value);
    }
    expect(page).toContain('role="status"');
    expect(page).toContain('aria-live="polite"');
  });

  it("renders canonical outcome fields into the Inspector accessibility tree", () => {
    const execution = {
      executionStatus: "success", effectStatus: "observed",
      evidence: [{ kind: "postcondition", summary: "Exact state observed." }],
      observedAt: "2026-09-14T00:00:01.000Z",
    } as CapabilityExecution;
    const markup = renderToStaticMarkup(
      <dl><ExecutionOutcome execution={execution} /></dl>,
    );
    expect(markup).toContain("Execution status");
    expect(markup).toContain("Effect status");
    expect(markup).toContain("Exact state observed.");
    expect(markup).not.toContain("Not observed");
  });
});
