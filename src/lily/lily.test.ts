import { describe, expect, it } from "vitest";
import { resolveCanonicalInvocation } from "@/capabilities/invocation";
import { capabilities } from "@/capabilities/registry";
import { capabilityTraceFromExecution } from "./capability-trace";
import {
  LILY_CAPABILITY_IDS,
  compactReferences,
  recoverLilyProposal,
  validateLilyProposal,
} from "./proposals";
import type { CapabilityExecution } from "@/capabilities/types";

describe("Lily proposal boundary", () => {
  it("derives the shortlist from navigator-enabled, non-mutating registry entries", () => {
    expect(LILY_CAPABILITY_IDS.has("project.search")).toBe(true);
    expect(LILY_CAPABILITY_IDS.has("system.reportCapabilityIssue")).toBe(false);
    expect(
      [...LILY_CAPABILITY_IDS].every(
        (id) => capabilities.find((item) => item.id === id)?.navigator.enabled,
      ),
    ).toBe(true);
  });
  it("rejects invented capabilities and ungrounded entity slugs", () => {
    expect(() =>
      validateLilyProposal(
        {
          kind: "capability",
          capabilityId: "project.destroy",
          arguments: {},
          message: "",
        },
        [],
      ),
    ).toThrow(/outside/);
    expect(() =>
      validateLilyProposal(
        {
          kind: "capability",
          capabilityId: "project.view",
          arguments: { slug: "invented" },
          message: "",
        },
        [],
      ),
    ).toThrow(/not returned/);
  });
  it("accepts a returned entity reference", () => {
    const refs = compactReferences({
      projects: [
        { slug: "atlas-platform", name: "Atlas Platform", summary: "Platform" },
      ],
    });
    expect(
      validateLilyProposal(
        {
          kind: "capability",
          capabilityId: "project.view",
          arguments: { slug: "atlas-platform" },
          message: "Open it",
        },
        refs,
      ),
    ).toMatchObject({
      capabilityId: "project.view",
      arguments: { slug: "atlas-platform" },
    });
  });
  it.each([
    "Where I get Michael's cv",
    "Where can I find Michael's CV?",
    "Can you show me the resume?",
  ])("recovers conversational CV navigation: %s", (request) => {
    expect(recoverLilyProposal(request, [])).toMatchObject({
      kind: "capability",
      capabilityId: "cv.view",
      arguments: {},
    });
  });
  it("lists writing before selecting an interesting real article", () => {
    expect(
      recoverLilyProposal("Show me an interesting article from Michael", []),
    ).toMatchObject({ capabilityId: "article.list" });
    const references = compactReferences({
      articles: [
        {
          slug: "local-first",
          title: "Local-first systems",
          summary: "Resilient software",
        },
      ],
    });
    const proposal = recoverLilyProposal(
      "Show me an interesting article from Michael",
      references,
    );
    expect(validateLilyProposal(proposal, references)).toMatchObject({
      capabilityId: "article.view",
      arguments: { slug: "local-first" },
    });
    expect(
      recoverLilyProposal("Show me an interesting article", references, [
        "article.list",
        "article.view",
      ]),
    ).toEqual({ kind: "final", message: "I opened Local-first systems." });
  });
  it.each([
    "What type of things can I see on this website?",
    "What can I explore on this site?",
    "Show me around",
  ])("recovers a website discovery question: %s", (request) => {
    expect(recoverLilyProposal(request, [])).toMatchObject({
      kind: "final",
      message: expect.stringContaining("projects"),
    });
  });
});

describe("Lily Capability Trace", () => {
  it("uses the same canonical quoted CLI and Action Keys as the registry", () => {
    const invocation = resolveCanonicalInvocation("project.search", {
      query: "platform engineering",
    });
    expect(invocation.cliCommand).toBe(
      'run project.search --query "platform engineering"',
    );
    expect(invocation.actionKeys).toBe(
      "PROJECT SEARCH platform engineering ENTER",
    );
    const execution = {
      executionId: "exec_1",
      capabilityId: "project.search",
      caller: "navigator",
      params: { query: "platform engineering" },
      status: "success",
      result: { count: 1 },
      error: null,
      durationMs: 8,
      timestamp: new Date(0).toISOString(),
      resolvedCli: invocation.cliCommand!,
      resolvedActionKeys: invocation.actionKeys!,
      accessibilityLabel: "Search portfolio projects",
      confirmationStatus: "not-required",
    } satisfies CapabilityExecution;
    expect(capabilityTraceFromExecution(execution)).toMatchObject({
      capabilityId: invocation.capabilityId,
      arguments: invocation.arguments,
      cliCommand: invocation.cliCommand,
      actionKeys: invocation.actionKeys,
      status: "success",
    });
  });
  it("constructs an honest error trace from executor metadata", () => {
    const execution = {
      executionId: "exec_2",
      capabilityId: "project.view",
      caller: "navigator",
      params: { slug: "missing" },
      status: "failure",
      result: null,
      error: { code: "PROJECT_NOT_FOUND", message: "Not found" },
      durationMs: 3,
      timestamp: new Date(0).toISOString(),
      resolvedCli: "run project.view --slug missing",
      resolvedActionKeys: "PROJECT VIEW missing ENTER",
      accessibilityLabel: "Open project details",
      confirmationStatus: "not-required",
    } satisfies CapabilityExecution;
    expect(capabilityTraceFromExecution(execution)).toMatchObject({
      status: "error",
      errorMessage: "Not found",
    });
  });
});
